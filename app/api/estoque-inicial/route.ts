import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const item = z.object({
  generoId: z.string(),
  localId: z.string(),
  quantidade: z.number().positive(),
  lote: z.string().optional().nullable(),
  validade: z.string().optional().nullable(),
  valorUnitario: z.number().nonnegative().optional().nullable(),
});

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;

  const p = item.safeParse(await req.json());

  if (!p.success) {
    return Response.json(
      { error: 'Informe gênero, local e quantidade válida.' },
      { status: 400 }
    );
  }

  const gen = await prisma.genero.findUnique({
    where: { id: p.data.generoId },
  });

  if (!gen) {
    return Response.json(
      { error: 'Gênero não encontrado.' },
      { status: 404 }
    );
  }

  if (gen.controlaLote && !p.data.lote) {
    return Response.json(
      {
        error:
          'Este gênero possui controle por lote. Informe o lote para prosseguir.',
      },
      { status: 400 }
    );
  }

  if (gen.controlaValidade && !p.data.validade) {
    return Response.json(
      {
        error:
          'Este gênero possui controle de validade. Informe a validade para prosseguir.',
      },
      { status: 400 }
    );
  }

  const r = await prisma.$transaction(async (tx) => {
    let loteId: string | undefined;

    if (gen.controlaLote && p.data.lote) {
      const numeroLote = p.data.lote;

      const l = await tx.lote.upsert({
        where: {
          generoId_numero: {
            generoId: gen.id,
            numero: numeroLote,
          },
        },
        update: {
          validade: p.data.validade
            ? new Date(p.data.validade)
            : undefined,
        },
        create: {
          generoId: gen.id,
          numero: numeroLote,
          validade: p.data.validade
            ? new Date(p.data.validade)
            : undefined,
        },
      });

      loteId = l.id;
    }

    if (loteId) {
      await tx.estoqueLocal.upsert({
        where: {
          generoId_localId_loteId: {
            generoId: gen.id,
            localId: p.data.localId,
            loteId,
          },
        },
        update: {
          quantidade: {
            increment: p.data.quantidade,
          },
        },
        create: {
          generoId: gen.id,
          localId: p.data.localId,
          loteId,
          quantidade: p.data.quantidade,
        },
      });
    } else {
      const estoqueSemLote = await tx.estoqueLocal.findFirst({
        where: {
          generoId: gen.id,
          localId: p.data.localId,
          loteId: null,
        },
        select: {
          id: true,
        },
      });

      if (estoqueSemLote) {
        await tx.estoqueLocal.update({
          where: {
            id: estoqueSemLote.id,
          },
          data: {
            quantidade: {
              increment: p.data.quantidade,
            },
          },
        });
      } else {
        await tx.estoqueLocal.create({
          data: {
            generoId: gen.id,
            localId: p.data.localId,
            loteId: null,
            quantidade: p.data.quantidade,
          },
        });
      }
    }

    const m = await tx.movimentacaoEstoque.create({
      data: {
        tipo: 'SALDO_INICIAL',
        classe: gen.classe,
        generoId: gen.id,
        loteId,
        localDestinoId: p.data.localId,
        quantidade: p.data.quantidade,
        valorUnitario: p.data.valorUnitario ?? undefined,
        usuarioId: g.user!.id,
        observacao: 'Saldo inicial de implantação',
      },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: g.user!.id,
        acao: 'SALDO_INICIAL',
        entidade: 'Genero',
        entidadeId: gen.id,
        dadosNovos: {
          quantidade: p.data.quantidade,
          localId: p.data.localId,
          lote: p.data.lote,
        },
      },
    });

    return m;
  });

  return Response.json(r);
}

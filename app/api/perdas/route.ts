import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  estoqueId: z.string(),
  quantidade: z.number().positive(),
  motivo: z.string().min(3),
});

export async function POST(req: Request) {
  const g = await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  const p = body.safeParse(
    await req.json()
  );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe quantidade e motivo da perda/descarte.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const r =
          await tx.estoqueLocal.findUnique({
            where: {
              id: p.data.estoqueId,
            },

            include: {
              genero: true,
            },
          });

        if (!r) {
          throw new Error('NAO');
        }

        if (
          Number(r.quantidade) <
          p.data.quantidade
        ) {
          throw new Error('SALDO');
        }

        await tx.estoqueLocal.update({
          where: {
            id: r.id,
          },

          data: {
            quantidade: {
              decrement:
                p.data.quantidade,
            },
          },
        });

        await tx.movimentacaoEstoque.create({
          data: {
            tipo: 'PERDA',

            classe:
              r.genero.classe,

            generoId:
              r.generoId,

            loteId:
              r.loteId,

            localOrigemId:
              r.localId,

            quantidade:
              p.data.quantidade,

            observacao:
              p.data.motivo,

            usuarioId:
              g.user!.id,
          },
        });
      }
    );

    return Response.json({
      ok: true,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error &&
          error.message === 'SALDO'
            ? 'Quantidade superior ao saldo disponível.'
            : 'Não foi possível registrar a perda/descarte.',
      },
      {
        status: 409,
      }
    );
  }
}

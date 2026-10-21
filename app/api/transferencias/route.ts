import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  estoqueId: z.string(),
  localDestinoId: z.string(),
  quantidade: z.number().positive(),
  observacao: z.string().optional(),
});

export async function POST(req: Request) {
  const g =
    await requireOperacaoEstoque();

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
          'Informe item, destino e quantidade para a transferência.',
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
          r.localId ===
          p.data.localDestinoId
        ) {
          throw new Error('MESMO');
        }

        if (
          Number(r.quantidade) <
          p.data.quantidade
        ) {
          throw new Error(
            `SALDO:${Number(
              r.quantidade
            )}`
          );
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

        const dest =
          await tx.estoqueLocal.findFirst({
            where: {
              generoId:
                r.generoId,

              localId:
                p.data.localDestinoId,

              loteId:
                r.loteId,
            },
          });

        if (dest) {
          await tx.estoqueLocal.update({
            where: {
              id: dest.id,
            },

            data: {
              quantidade: {
                increment:
                  p.data.quantidade,
              },
            },
          });
        } else {
          await tx.estoqueLocal.create({
            data: {
              generoId:
                r.generoId,

              localId:
                p.data.localDestinoId,

              loteId:
                r.loteId,

              quantidade:
                p.data.quantidade,
            },
          });
        }

        await tx.movimentacaoEstoque.create({
          data: {
            tipo:
              'TRANSFERENCIA',

            classe:
              r.genero.classe,

            generoId:
              r.generoId,

            loteId:
              r.loteId,

            localOrigemId:
              r.localId,

            localDestinoId:
              p.data.localDestinoId,

            quantidade:
              p.data.quantidade,

            observacao:
              p.data.observacao,

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
    const mensagem =
      error instanceof Error
        ? error.message
        : '';

    if (
      mensagem === 'MESMO'
    ) {
      return Response.json(
        {
          error:
            'O local de destino deve ser diferente do local de origem.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      mensagem.startsWith(
        'SALDO:'
      )
    ) {
      return Response.json(
        {
          error:
            `Quantidade superior ao saldo disponível (${mensagem.split(':')[1]}).`,
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          'Não foi possível concluir a transferência.',
      },
      {
        status: 500,
      }
    );
  }
}

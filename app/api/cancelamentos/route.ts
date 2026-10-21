import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  saidaId: z.string(),
  motivo: z.string().min(3),
});

export async function POST(
  req: Request
) {
  const g =
    await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  const p =
    body.safeParse(
      await req.json()
    );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe a saída e o motivo do cancelamento.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const s =
          await tx.saida.findUnique({
            where: {
              id:
                p.data.saidaId,
            },
          });

        if (
          !s ||
          s.canceladaEm
        ) {
          throw new Error(
            'INV'
          );
        }

        /*
         * Uma saída que já possui
         * devolução não pode ser
         * cancelada diretamente.
         *
         * Isso evita duplicidade na
         * recomposição do estoque.
         */
        const dev =
          await tx.movimentacaoEstoque.count({
            where: {
              referenciaTipo:
                'DevolucaoSaida',

              referenciaId:
                s.id,

              tipo:
                'DEVOLUCAO',
            },
          });

        if (dev) {
          throw new Error(
            'DEV'
          );
        }

        /*
         * Recupera exatamente as
         * movimentações físicas
         * realizadas pela saída.
         */
        const movs =
          await tx.movimentacaoEstoque.findMany({
            where: {
              referenciaTipo:
                'Saida',

              referenciaId:
                s.id,

              tipo:
                'SAIDA',
            },
          });

        /*
         * Recompõe cada lote no
         * mesmo local de origem
         * utilizado na saída.
         */
        for (
          const m of movs
        ) {
          const row =
            await tx.estoqueLocal.findFirst({
              where: {
                generoId:
                  m.generoId,

                localId:
                  m.localOrigemId!,

                loteId:
                  m.loteId,
              },
            });

          if (row) {
            await tx.estoqueLocal.update({
              where: {
                id:
                  row.id,
              },

              data: {
                quantidade: {
                  increment:
                    m.quantidade,
                },
              },
            });
          } else {
            await tx.estoqueLocal.create({
              data: {
                generoId:
                  m.generoId,

                localId:
                  m.localOrigemId!,

                loteId:
                  m.loteId,

                quantidade:
                  m.quantidade,
              },
            });
          }

          /*
           * A recomposição fica
           * registrada como CORRECAO
           * vinculada ao cancelamento.
           *
           * Essa referência também
           * permite aos relatórios
           * desconsiderarem corretamente
           * a saída cancelada.
           */
          await tx.movimentacaoEstoque.create({
            data: {
              tipo:
                'CORRECAO',

              classe:
                s.classe,

              generoId:
                m.generoId,

              loteId:
                m.loteId,

              localDestinoId:
                m.localOrigemId,

              quantidade:
                m.quantidade,

              referenciaTipo:
                'CancelamentoSaida',

              referenciaId:
                s.id,

              observacao:
                `Cancelamento: ${p.data.motivo}`,

              usuarioId:
                g.user!.id,
            },
          });
        }

        await tx.saida.update({
          where: {
            id:
              s.id,
          },

          data: {
            canceladaEm:
              new Date(),

            motivoCancelamento:
              p.data.motivo,
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

    return Response.json(
      {
        error:
          mensagem === 'DEV'
            ? 'Esta saída já possui devolução. Faça a regularização por correção, preservando o histórico.'
            : 'A saída não pode ser cancelada ou já foi cancelada.',
      },
      {
        status: 409,
      }
    );
  }
}

import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const body = z.object({
  saidaId: z.string().min(1),
  generoId: z.string().min(1),
  quantidade: z.number().positive(),
  motivo: z
    .string()
    .trim()
    .optional(),
});

const EPSILON = 1e-9;

export async function POST(
  req: Request
) {
  const guard =
    await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const parsed =
    body.safeParse(
      await req.json()
    );

  if (!parsed.success) {
    return Response.json(
      {
        error:
          'Informe a saída, o gênero e a quantidade devolvida.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const saida =
          await tx.saida.findUnique({
            where: {
              id: parsed.data.saidaId,
            },

            include: {
              itens: true,
            },
          });

        if (
          !saida ||
          saida.canceladaEm
        ) {
          throw new Error(
            'SAIDA'
          );
        }

        const itemSaida =
          saida.itens.find(
            (item) =>
              item.generoId ===
              parsed.data.generoId
          );

        if (!itemSaida) {
          throw new Error(
            'ITEM'
          );
        }

        /*
         * Movimentações físicas que
         * compuseram a saída.
         *
         * A ordem original é mantida
         * para que a devolução respeite
         * os lotes/localizações realmente
         * utilizados.
         */
        const movimentosSaida =
          await tx.movimentacaoEstoque.findMany(
            {
              where: {
                referenciaTipo:
                  'Saida',

                referenciaId:
                  saida.id,

                generoId:
                  parsed.data
                    .generoId,

                tipo: 'SAIDA',
              },

              orderBy: [
                {
                  criadoEm:
                    'asc',
                },
                {
                  id: 'asc',
                },
              ],
            }
          );

        if (
          movimentosSaida.length ===
          0
        ) {
          throw new Error(
            'MOVIMENTACAO'
          );
        }

        /*
         * Recupera todas as devoluções
         * anteriores deste gênero para
         * esta saída.
         */
        const devolucoesAnteriores =
          await tx.movimentacaoEstoque.findMany(
            {
              where: {
                referenciaTipo:
                  'DevolucaoSaida',

                referenciaId:
                  saida.id,

                generoId:
                  parsed.data
                    .generoId,

                tipo:
                  'DEVOLUCAO',
              },

              select: {
                quantidade:
                  true,

                loteId:
                  true,

                localDestinoId:
                  true,
              },

              orderBy: [
                {
                  criadoEm:
                    'asc',
                },
                {
                  id: 'asc',
                },
              ],
            }
          );

        const totalJaDevolvido =
          devolucoesAnteriores.reduce(
            (
              total,
              movimento
            ) =>
              total +
              Number(
                movimento.quantidade
              ),
            0
          );

        const quantidadeSaida =
          Number(
            itemSaida.quantidade
          );

        const maximoDevolvivel =
          Math.max(
            0,
            quantidadeSaida -
              totalJaDevolvido
          );

        if (
          parsed.data.quantidade >
          maximoDevolvivel +
            EPSILON
        ) {
          throw new Error(
            `MAX:${maximoDevolvivel}`
          );
        }

        /*
         * Quanto já foi devolvido
         * para cada combinação física
         * lote + local.
         */
        const devolvidoPorOrigem =
          new Map<
            string,
            number
          >();

        for (
          const devolucao of
            devolucoesAnteriores
        ) {
          const chave =
            `${
              devolucao.loteId ??
              'SEM_LOTE'
            }|${
              devolucao.localDestinoId ??
              'SEM_LOCAL'
            }`;

          devolvidoPorOrigem.set(
            chave,
            (devolvidoPorOrigem.get(
              chave
            ) || 0) +
              Number(
                devolucao.quantidade
              )
          );
        }

        let restante =
          parsed.data.quantidade;

        for (
          const movimento of
            movimentosSaida
        ) {
          if (
            restante <=
            EPSILON
          ) {
            break;
          }

          if (
            !movimento.localOrigemId
          ) {
            throw new Error(
              'LOCAL'
            );
          }

          const chave =
            `${
              movimento.loteId ??
              'SEM_LOTE'
            }|${
              movimento.localOrigemId
            }`;

          const jaDevolvido =
            devolvidoPorOrigem.get(
              chave
            ) || 0;

          const quantidadeMovimento =
            Number(
              movimento.quantidade
            );

          const aindaDevolvivel =
            Math.max(
              0,
              quantidadeMovimento -
                jaDevolvido
            );

          if (
            aindaDevolvivel <=
            EPSILON
          ) {
            continue;
          }

          const quantidadeDevolver =
            Math.min(
              aindaDevolvivel,
              restante
            );

          const estoqueExistente =
            await tx.estoqueLocal.findFirst(
              {
                where: {
                  generoId:
                    movimento.generoId,

                  localId:
                    movimento.localOrigemId,

                  loteId:
                    movimento.loteId,
                },
              }
            );

          if (
            estoqueExistente
          ) {
            await tx.estoqueLocal.update(
              {
                where: {
                  id:
                    estoqueExistente.id,
                },

                data: {
                  quantidade: {
                    increment:
                      quantidadeDevolver,
                  },
                },
              }
            );
          } else {
            await tx.estoqueLocal.create(
              {
                data: {
                  generoId:
                    movimento.generoId,

                  localId:
                    movimento.localOrigemId,

                  loteId:
                    movimento.loteId,

                  quantidade:
                    quantidadeDevolver,
                },
              }
            );
          }

          await tx.movimentacaoEstoque.create(
            {
              data: {
                tipo:
                  'DEVOLUCAO',

                classe:
                  saida.classe,

                generoId:
                  movimento.generoId,

                loteId:
                  movimento.loteId,

                localDestinoId:
                  movimento.localOrigemId,

                quantidade:
                  quantidadeDevolver,

                referenciaTipo:
                  'DevolucaoSaida',

                referenciaId:
                  saida.id,

                observacao:
                  parsed.data
                    .motivo ||
                  null,

                usuarioId:
                  guard.user!.id,
              },
            }
          );

          devolvidoPorOrigem.set(
            chave,
            jaDevolvido +
              quantidadeDevolver
          );

          restante -=
            quantidadeDevolver;
        }

        /*
         * Proteção de consistência.
         *
         * Se por qualquer motivo não
         * conseguirmos reconstruir toda
         * a devolução pelos movimentos
         * físicos originais, a transação
         * inteira é desfeita.
         */
        if (
          restante >
          EPSILON
        ) {
          throw new Error(
            'SALDO_FISICO'
          );
        }
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
      mensagem.startsWith(
        'MAX:'
      )
    ) {
      const maximo =
        Number(
          mensagem.split(
            ':'
          )[1] || 0
        );

      return Response.json(
        {
          error:
            `A devolução excede o saldo devolvível. Máximo: ${maximo.toLocaleString(
              'pt-BR',
              {
                maximumFractionDigits:
                  3,
              }
            )}.`,
        },
        {
          status: 409,
        }
      );
    }

    if (
      mensagem ===
      'SALDO_FISICO'
    ) {
      return Response.json(
        {
          error:
            'Não foi possível identificar saldo físico suficiente nos lotes da saída para registrar a devolução.',
        },
        {
          status: 409,
        }
      );
    }

    return Response.json(
      {
        error:
          'Não foi possível registrar a devolução. Verifique a saída selecionada.',
      },
      {
        status: 409,
      }
    );
  }
}

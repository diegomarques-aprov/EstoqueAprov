import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  saidaId: z
    .string()
    .min(1),

  motivo: z
    .string()
    .trim()
    .min(3),
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
          'Informe a saída e descreva o motivo do cancelamento.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        /*
         * Localiza a saída que será
         * cancelada.
         */
        const saida =
          await tx.saida.findUnique({
            where: {
              id:
                p.data.saidaId,
            },
          });

        if (!saida) {
          throw new Error(
            'NAO_ENCONTRADA'
          );
        }

        if (
          saida.canceladaEm
        ) {
          throw new Error(
            'JA_CANCELADA'
          );
        }

        /*
         * Uma saída que já possui
         * devolução não pode ser
         * cancelada diretamente.
         *
         * Isso evita recomposição
         * duplicada do estoque.
         */
        const devolucoes =
          await tx.movimentacaoEstoque.count({
            where: {
              referenciaTipo:
                'DevolucaoSaida',

              referenciaId:
                saida.id,

              tipo:
                'DEVOLUCAO',
            },
          });

        if (
          devolucoes > 0
        ) {
          throw new Error(
            'DEVOLUCAO_EXISTENTE'
          );
        }

        /*
         * Recupera exatamente as
         * movimentações físicas que
         * foram produzidas pela saída.
         */
        const movimentos =
          await tx.movimentacaoEstoque.findMany({
            where: {
              referenciaTipo:
                'Saida',

              referenciaId:
                saida.id,

              tipo:
                'SAIDA',
            },

            orderBy: [
              {
                criadoEm:
                  'asc',
              },
              {
                id:
                  'asc',
              },
            ],
          });

        if (
          movimentos.length === 0
        ) {
          throw new Error(
            'SEM_MOVIMENTACAO'
          );
        }

        /*
         * Antes de alterar qualquer
         * saldo, valida todas as
         * movimentações físicas.
         *
         * Toda SAÍDA precisa possuir
         * um local de origem.
         */
        for (
          const movimento of
            movimentos
        ) {
          if (
            !movimento.localOrigemId
          ) {
            throw new Error(
              'ORIGEM_INVALIDA'
            );
          }
        }

        /*
         * Recompõe cada quantidade
         * exatamente no mesmo:
         *
         * gênero + lote + local
         *
         * utilizados originalmente.
         */
        for (
          const movimento of
            movimentos
        ) {
          const localOrigemId =
            movimento.localOrigemId;

          /*
           * Já foi validado acima,
           * mas esta proteção mantém
           * o TypeScript e a regra
           * operacional alinhados.
           */
          if (!localOrigemId) {
            throw new Error(
              'ORIGEM_INVALIDA'
            );
          }

          const estoque =
            await tx.estoqueLocal.findFirst({
              where: {
                generoId:
                  movimento.generoId,

                localId:
                  localOrigemId,

                loteId:
                  movimento.loteId,
              },
            });

          if (estoque) {
            await tx.estoqueLocal.update({
              where: {
                id:
                  estoque.id,
              },

              data: {
                quantidade: {
                  increment:
                    movimento.quantidade,
                },
              },
            });
          } else {
            await tx.estoqueLocal.create({
              data: {
                generoId:
                  movimento.generoId,

                localId:
                  localOrigemId,

                loteId:
                  movimento.loteId,

                quantidade:
                  movimento.quantidade,
              },
            });
          }

          /*
           * Registra fisicamente
           * a recomposição produzida
           * pelo cancelamento.
           */
          await tx.movimentacaoEstoque.create({
            data: {
              tipo:
                'CORRECAO',

              classe:
                saida.classe,

              generoId:
                movimento.generoId,

              loteId:
                movimento.loteId,

              localDestinoId:
                localOrigemId,

              quantidade:
                movimento.quantidade,

              referenciaTipo:
                'CancelamentoSaida',

              referenciaId:
                saida.id,

              observacao:
                `Cancelamento: ${p.data.motivo.trim()}`,

              usuarioId:
                g.user!.id,
            },
          });
        }

        const canceladaEm =
          new Date();

        /*
         * Marca documentalmente
         * a saída como cancelada.
         */
        await tx.saida.update({
          where: {
            id:
              saida.id,
          },

          data: {
            canceladaEm,

            motivoCancelamento:
              p.data.motivo.trim(),
          },
        });

        /*
         * Auditoria administrativa
         * do cancelamento.
         *
         * A movimentação acima registra
         * o efeito físico no estoque.
         *
         * Esta auditoria registra o ato
         * administrativo de cancelar.
         */
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao:
              'CANCELAMENTO_SAIDA',

            entidade:
              'Saida',

            entidadeId:
              saida.id,

            dadosAnteriores: {
              numero:
                saida.numero,

              classe:
                saida.classe,

              destino:
                saida.destino,

              data:
                saida.data,

              canceladaEm:
                saida.canceladaEm,

              motivoCancelamento:
                saida.motivoCancelamento,
            },

            dadosNovos: {
              numero:
                saida.numero,

              canceladaEm,

              motivo:
                p.data.motivo.trim(),

              movimentacoesEstornadas:
                movimentos.length,
            },
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
      mensagem ===
      'DEVOLUCAO_EXISTENTE'
    ) {
      return Response.json(
        {
          error:
            'Esta saída já possui devolução. Faça a regularização por correção, preservando o histórico.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      mensagem ===
      'JA_CANCELADA'
    ) {
      return Response.json(
        {
          error:
            'Esta saída já foi cancelada anteriormente.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      mensagem ===
      'NAO_ENCONTRADA'
    ) {
      return Response.json(
        {
          error:
            'A saída informada não foi encontrada.',
        },
        {
          status: 404,
        }
      );
    }

    if (
      mensagem ===
        'SEM_MOVIMENTACAO' ||
      mensagem ===
        'ORIGEM_INVALIDA'
    ) {
      return Response.json(
        {
          error:
            'A saída possui inconsistência na movimentação física e não pode ser cancelada automaticamente. Faça a regularização por correção para preservar o histórico.',
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      error
    );

    return Response.json(
      {
        error:
          'Não foi possível cancelar a saída. Nenhuma alteração foi efetivada.',
      },
      {
        status: 500,
      }
    );
  }
}

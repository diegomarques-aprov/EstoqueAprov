import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireEstoqueInicial } from '@/lib/guard';

const item = z.object({
  generoId: z
    .string()
    .min(1),

  localId: z
    .string()
    .min(1),

  quantidade: z
    .number()
    .positive(),

  lote: z
    .string()
    .trim()
    .optional()
    .nullable(),

  validade: z
    .string()
    .optional()
    .nullable(),

  valorUnitario: z
    .number()
    .nonnegative()
    .optional()
    .nullable(),
});

export async function POST(
  req: Request
) {
  const g =
    await requireEstoqueInicial();

  if (g.error) {
    return g.error;
  }

  const p =
    item.safeParse(
      await req.json()
    );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe gênero, local e quantidade válida.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Somente gêneros ativos podem
   * receber saldo inicial.
   */
  const genero =
    await prisma.genero.findFirst({
      where: {
        id:
          p.data.generoId,

        situacao:
          'ATIVO',
      },
    });

  if (!genero) {
    return Response.json(
      {
        error:
          'O gênero informado não existe ou está inativo.',
      },
      {
        status: 404,
      }
    );
  }

  /*
   * O local também precisa existir
   * e estar ativo.
   */
  const local =
    await prisma.localArmazenamento.findFirst({
      where: {
        id:
          p.data.localId,

        situacao:
          'ATIVO',
      },

      select: {
        id: true,
        nome: true,
      },
    });

  if (!local) {
    return Response.json(
      {
        error:
          'O local de armazenamento informado não existe ou está inativo.',
      },
      {
        status: 400,
      }
    );
  }

  const numeroLote =
    p.data.lote?.trim() ||
    null;

  if (
    genero.controlaLote &&
    !numeroLote
  ) {
    return Response.json(
      {
        error:
          `${genero.nome}: informe o lote para prosseguir.`,
      },
      {
        status: 400,
      }
    );
  }

  if (
    genero.controlaValidade &&
    !p.data.validade
  ) {
    return Response.json(
      {
        error:
          `${genero.nome}: informe a validade para prosseguir.`,
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Se houver validade informada,
   * ela precisa representar uma
   * data válida.
   */
  if (
    p.data.validade &&
    Number.isNaN(
      new Date(
        p.data.validade
      ).getTime()
    )
  ) {
    return Response.json(
      {
        error:
          `${genero.nome}: a validade informada é inválida.`,
      },
      {
        status: 400,
      }
    );
  }

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          let loteId:
            | string
            | undefined;

          /*
           * Localiza ou cria o lote
           * quando o gênero possui
           * controle por lote.
           */
          if (
            genero.controlaLote &&
            numeroLote
          ) {
            const lote =
              await tx.lote.upsert({
                where: {
                  generoId_numero: {
                    generoId:
                      genero.id,

                    numero:
                      numeroLote,
                  },
                },

                update: {
                  validade:
                    p.data.validade
                      ? new Date(
                          p.data.validade
                        )
                      : undefined,
                },

                create: {
                  generoId:
                    genero.id,

                  numero:
                    numeroLote,

                  validade:
                    p.data.validade
                      ? new Date(
                          p.data.validade
                        )
                      : undefined,
                },
              });

            loteId =
              lote.id;
          }

          /*
           * Proteção contra lançamento
           * duplicado do estoque inicial.
           *
           * A combinação física é:
           *
           * gênero + local + lote.
           *
           * Para gênero sem lote:
           * gênero + local.
           */
          const saldoInicialAnterior =
            await tx.movimentacaoEstoque.findFirst({
              where: {
                tipo:
                  'SALDO_INICIAL',

                generoId:
                  genero.id,

                localDestinoId:
                  local.id,

                loteId:
                  loteId ?? null,
              },

              select: {
                id: true,
              },
            });

          if (
            saldoInicialAnterior
          ) {
            throw new Error(
              'SALDO_INICIAL_DUPLICADO'
            );
          }

          /*
           * Localiza o saldo físico
           * correspondente.
           */
          const estoqueExistente =
            await tx.estoqueLocal.findFirst({
              where: {
                generoId:
                  genero.id,

                localId:
                  local.id,

                loteId:
                  loteId ?? null,
              },
            });

          /*
           * Durante a implantação,
           * se já existir saldo físico
           * nessa mesma combinação sem
           * um SALDO_INICIAL correspondente,
           * não somamos silenciosamente.
           *
           * Isso evita misturar estoque
           * anterior com inventário inicial.
           */
          if (
            estoqueExistente &&
            Number(
              estoqueExistente.quantidade
            ) > 0
          ) {
            throw new Error(
              'SALDO_EXISTENTE'
            );
          }

          let estoqueId:
            string;

          if (
            estoqueExistente
          ) {
            const atualizado =
              await tx.estoqueLocal.update({
                where: {
                  id:
                    estoqueExistente.id,
                },

                data: {
                  quantidade:
                    p.data.quantidade,
                },

                select: {
                  id: true,
                },
              });

            estoqueId =
              atualizado.id;
          } else {
            const criado =
              await tx.estoqueLocal.create({
                data: {
                  generoId:
                    genero.id,

                  localId:
                    local.id,

                  loteId:
                    loteId ?? null,

                  quantidade:
                    p.data.quantidade,
                },

                select: {
                  id: true,
                },
              });

            estoqueId =
              criado.id;
          }

          /*
           * Movimentação oficial de
           * implantação do estoque.
           */
          const movimento =
            await tx.movimentacaoEstoque.create({
              data: {
                tipo:
                  'SALDO_INICIAL',

                classe:
                  genero.classe,

                generoId:
                  genero.id,

                loteId,

                localDestinoId:
                  local.id,

                quantidade:
                  p.data.quantidade,

                valorUnitario:
                  p.data.valorUnitario ??
                  undefined,

                usuarioId:
                  g.user!.id,

                observacao:
                  'Saldo inicial de implantação',
              },
            });

          /*
           * Auditoria do lançamento
           * inicial.
           */
          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                'SALDO_INICIAL',

              entidade:
                'EstoqueLocal',

              entidadeId:
                estoqueId,

              dadosNovos: {
                generoId:
                  genero.id,

                genero:
                  genero.nome,

                quantidade:
                  p.data.quantidade,

                localId:
                  local.id,

                local:
                  local.nome,

                lote:
                  numeroLote,

                loteId:
                  loteId ?? null,

                validade:
                  p.data.validade ??
                  null,

                valorUnitario:
                  p.data.valorUnitario ??
                  null,
              },
            },
          });

          return movimento;
        }
      );

    return Response.json(
      resultado
    );
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : '';

    if (
      mensagem ===
      'SALDO_INICIAL_DUPLICADO'
    ) {
      return Response.json(
        {
          error:
            'Já existe saldo inicial lançado para este gênero, local e lote. Para corrigir uma quantidade já lançada, utilize a função de correção de estoque.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      mensagem ===
      'SALDO_EXISTENTE'
    ) {
      return Response.json(
        {
          error:
            'Já existe saldo físico para este gênero, local e lote. Verifique o estoque antes de registrar o saldo inicial.',
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
          'Não foi possível registrar o saldo inicial. Nenhuma alteração foi efetivada.',
      },
      {
        status: 500,
      }
    );
  }
}

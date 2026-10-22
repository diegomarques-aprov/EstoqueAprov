import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  classe: z.enum(['QS', 'QR']),

  data: z.string(),

  origem: z
    .string()
    .optional(),

  documento: z
    .string()
    .optional(),

  observacao: z
    .string()
    .optional(),

  itens: z
    .array(
      z.object({
        generoId: z.string(),

        localId: z.string(),

        quantidade:
          z.number().positive(),

        valorUnitario:
          z
            .number()
            .nonnegative()
            .optional()
            .nullable(),

        lote: z
          .string()
          .optional()
          .nullable(),

        validade: z
          .string()
          .optional()
          .nullable(),
      })
    )
    .min(1),
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
          'Revise os dados do recebimento e os itens informados.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Gêneros utilizados no recebimento.
   *
   * Somente gêneros ATIVOS podem receber
   * novas entradas de estoque.
   */
  const generosIds = [
    ...new Set(
      p.data.itens.map(
        (item) =>
          item.generoId
      )
    ),
  ];

  const gens =
    await prisma.genero.findMany({
      where: {
        id: {
          in: generosIds,
        },

        situacao:
          'ATIVO',
      },
    });

  /*
   * Locais utilizados no recebimento.
   *
   * Somente locais existentes e ATIVOS
   * podem receber novas entradas.
   */
  const locaisIds = [
    ...new Set(
      p.data.itens.map(
        (item) =>
          item.localId
      )
    ),
  ];

  const locais =
    await prisma.localArmazenamento.findMany({
      where: {
        id: {
          in: locaisIds,
        },

        situacao:
          'ATIVO',
      },

      select: {
        id: true,
        nome: true,
      },
    });

  for (const i of p.data.itens) {
    const ge =
      gens.find(
        (x) =>
          x.id ===
          i.generoId
      );

    if (!ge) {
      return Response.json(
        {
          error:
            'Há gênero inexistente ou inativo no recebimento. Verifique o cadastro para prosseguir.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      ge.classe !==
      p.data.classe
    ) {
      return Response.json(
        {
          error:
            `${ge.nome}: o gênero não pertence à classificação ${p.data.classe} informada para este recebimento.`,
        },
        {
          status: 400,
        }
      );
    }

    const local =
      locais.find(
        (registro) =>
          registro.id ===
          i.localId
      );

    if (!local) {
      return Response.json(
        {
          error:
            `${ge.nome}: o local de armazenamento informado não existe ou está inativo. Selecione um local ativo para prosseguir.`,
        },
        {
          status: 400,
        }
      );
    }

    if (
      ge.controlaLote &&
      !i.lote?.trim()
    ) {
      return Response.json(
        {
          error:
            `${ge.nome}: informe o lote para prosseguir.`,
        },
        {
          status: 400,
        }
      );
    }

    if (
      ge.controlaValidade &&
      !i.validade
    ) {
      return Response.json(
        {
          error:
            `${ge.nome}: informe a validade para prosseguir.`,
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Quando o gênero controla validade,
     * impede o recebimento com data de
     * validade inválida.
     */
    if (
      i.validade &&
      Number.isNaN(
        new Date(
          i.validade
        ).getTime()
      )
    ) {
      return Response.json(
        {
          error:
            `${ge.nome}: a validade informada é inválida.`,
        },
        {
          status: 400,
        }
      );
    }
  }

  try {
    const r =
      await prisma.$transaction(
        async (tx) => {
          const rec =
            await tx.recebimento.create({
              data: {
                classe:
                  p.data.classe,

                data:
                  new Date(
                    p.data.data
                  ),

                origem:
                  p.data.origem,

                documento:
                  p.data.documento,

                observacao:
                  p.data.observacao,

                criadoPorId:
                  g.user!.id,
              },
            });

          for (
            const i of p.data.itens
          ) {
            const ge =
              gens.find(
                (x) =>
                  x.id ===
                  i.generoId
              )!;

            let loteId:
              | string
              | undefined;

            /*
             * Para gêneros com controle
             * de lote, localiza ou cria
             * o lote correspondente.
             */
            if (
              ge.controlaLote &&
              i.lote
            ) {
              const numeroLote =
                i.lote.trim();

              const l =
                await tx.lote.upsert({
                  where: {
                    generoId_numero: {
                      generoId:
                        ge.id,

                      numero:
                        numeroLote,
                    },
                  },

                  update: {
                    validade:
                      i.validade
                        ? new Date(
                            i.validade
                          )
                        : undefined,
                  },

                  create: {
                    generoId:
                      ge.id,

                    numero:
                      numeroLote,

                    validade:
                      i.validade
                        ? new Date(
                            i.validade
                          )
                        : undefined,
                  },
                });

              loteId = l.id;
            }

            /*
             * Registra o item documental
             * do recebimento.
             */
            await tx.itemRecebimento.create({
              data: {
                recebimentoId:
                  rec.id,

                generoId:
                  ge.id,

                localId:
                  i.localId,

                loteId,

                quantidade:
                  i.quantidade,

                valorUnitario:
                  i.valorUnitario ??
                  undefined,
              },
            });

            /*
             * Atualiza o saldo físico.
             */
            if (loteId) {
              await tx.estoqueLocal.upsert({
                where: {
                  generoId_localId_loteId:
                    {
                      generoId:
                        ge.id,

                      localId:
                        i.localId,

                      loteId,
                    },
                },

                update: {
                  quantidade: {
                    increment:
                      i.quantidade,
                  },
                },

                create: {
                  generoId:
                    ge.id,

                  localId:
                    i.localId,

                  loteId,

                  quantidade:
                    i.quantidade,
                },
              });
            } else {
              const estoqueSemLote =
                await tx.estoqueLocal.findFirst({
                  where: {
                    generoId:
                      ge.id,

                    localId:
                      i.localId,

                    loteId:
                      null,
                  },

                  select: {
                    id: true,
                  },
                });

              if (estoqueSemLote) {
                await tx.estoqueLocal.update({
                  where: {
                    id:
                      estoqueSemLote.id,
                  },

                  data: {
                    quantidade: {
                      increment:
                        i.quantidade,
                    },
                  },
                });
              } else {
                await tx.estoqueLocal.create({
                  data: {
                    generoId:
                      ge.id,

                    localId:
                      i.localId,

                    loteId:
                      null,

                    quantidade:
                      i.quantidade,
                  },
                });
              }
            }

            /*
             * Rastreabilidade da entrada.
             */
            await tx.movimentacaoEstoque.create({
              data: {
                tipo:
                  'RECEBIMENTO',

                classe:
                  p.data.classe,

                generoId:
                  ge.id,

                loteId,

                localDestinoId:
                  i.localId,

                quantidade:
                  i.quantidade,

                valorUnitario:
                  i.valorUnitario ??
                  undefined,

                referenciaTipo:
                  'Recebimento',

                referenciaId:
                  rec.id,

                usuarioId:
                  g.user!.id,
              },
            });
          }

          return rec;
        }
      );

    return Response.json(r);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível concluir o recebimento. Nenhuma entrada foi efetivada.',
      },
      {
        status: 500,
      }
    );
  }
}

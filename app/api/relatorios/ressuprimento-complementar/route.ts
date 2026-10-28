import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  generoId: z
    .string()
    .min(1),

  quantidade: z
    .number()
    .positive(),
});

const bodySchema = z.object({
  planejamentoId: z
    .string()
    .min(1),

  justificativa: z
    .string()
    .trim()
    .min(
      3,
      'Informe a justificativa do Ressuprimento Complementar.'
    )
    .max(1000),

  itens: z
    .array(itemSchema)
    .min(
      1,
      'Informe pelo menos um gênero para o Ressuprimento Complementar.'
    ),
});

function numero(
  valor: unknown
) {
  return Number(
    valor || 0
  );
}

/*
 * =====================================================
 * GET
 * =====================================================
 *
 * Consulta os Ressuprimentos Complementares QS.
 *
 * Se planejamentoId for informado, retorna somente
 * os complementares vinculados àquele planejamento
 * bimestral.
 *
 * Se não for informado, retorna os complementares
 * mais recentes.
 */

export async function GET(
  req: Request
) {
  const g =
    await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q =
    new URL(
      req.url
    ).searchParams;

  const planejamentoId =
    q.get(
      'planejamentoId'
    );

  try {
    const complementares =
      await prisma.ressuprimentoComplementarQS.findMany({
        where:
          planejamentoId
            ? {
                planejamentoId,
              }
            : undefined,

        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              postoGraduacao: true,
              funcao: true,
            },
          },

          planejamento: {
            select: {
              id: true,
              dataReferencia: true,
              mesesCiclo: true,
              status: true,
              finalizadoEm: true,
            },
          },

          itens: {
            include: {
              genero: {
                include: {
                  unidade: true,
                },
              },
            },

            orderBy: {
              genero: {
                nome: 'asc',
              },
            },
          },
        },

        orderBy: {
          criadoEm: 'desc',
        },

        take:
          planejamentoId
            ? undefined
            : 100,
      });

    return Response.json(
      complementares.map(
        (complementar) => ({
          id:
            complementar.id,

          planejamentoId:
            complementar.planejamentoId,

          justificativa:
            complementar.justificativa,

          criadoEm:
            complementar.criadoEm,

          planejamento: {
            id:
              complementar
                .planejamento
                .id,

            dataReferencia:
              complementar
                .planejamento
                .dataReferencia,

            mesesCiclo:
              complementar
                .planejamento
                .mesesCiclo,

            status:
              complementar
                .planejamento
                .status,

            finalizadoEm:
              complementar
                .planejamento
                .finalizadoEm,
          },

          responsavel: {
            id:
              complementar
                .usuario
                .id,

            nome:
              complementar
                .usuario
                .nome,

            postoGraduacao:
              complementar
                .usuario
                .postoGraduacao,

            funcao:
              complementar
                .usuario
                .funcao,
          },

          itens:
            complementar.itens.map(
              (item) => ({
                id:
                  item.id,

                generoId:
                  item.generoId,

                genero:
                  item.genero.nome,

                unidade:
                  item.genero
                    .unidade
                    .sigla,

                quantidade:
                  numero(
                    item.quantidade
                  ),
              })
            ),
        })
      )
    );
  } catch (error) {
    console.error(
      error
    );

    return Response.json(
      {
        error:
          'Não foi possível consultar os Ressuprimentos Complementares QS.',
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =====================================================
 * POST
 * =====================================================
 *
 * Registra uma necessidade complementar dentro
 * de um planejamento normal bimestral.
 *
 * Regras:
 *
 * - exige perfil Administrador;
 * - exige planejamento normal existente;
 * - o planejamento precisa estar FINALIZADO;
 * - o planejamento normal precisa ser bimestral;
 * - somente gêneros QS pertencentes ao planejamento
 *   original podem ser incluídos;
 * - exige justificativa;
 * - exige quantidade positiva;
 * - permite vários gêneros;
 * - permite vários complementares no mesmo ciclo;
 * - não altera o planejamento original;
 * - não movimenta estoque;
 * - não cria Recebimento;
 * - registra Auditoria.
 */

export async function POST(
  req: Request
) {
  const g =
    await requireAdmin();

  if (g.error) {
    return g.error;
  }

  let json: unknown;

  try {
    json =
      await req.json();
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível interpretar os dados do Ressuprimento Complementar.',
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    bodySchema.safeParse(
      json
    );

  if (
    !parsed.success
  ) {
    return Response.json(
      {
        error:
          parsed.error
            .issues[0]
            ?.message ||
          'Revise os dados do Ressuprimento Complementar QS.',
      },
      {
        status: 400,
      }
    );
  }

  const {
    planejamentoId,
    justificativa,
    itens,
  } = parsed.data;

  /*
   * Não permitimos o mesmo gênero repetido
   * dentro de um único complementar.
   */
  const idsGeneros =
    itens.map(
      (item) =>
        item.generoId
    );

  const idsUnicos =
    new Set(
      idsGeneros
    );

  if (
    idsUnicos.size !==
    idsGeneros.length
  ) {
    return Response.json(
      {
        error:
          'Existe gênero QS repetido no Ressuprimento Complementar.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Carrega o planejamento original.
   *
   * Os itens originais são necessários para garantir
   * que o complementar não introduza um gênero que
   * não fazia parte daquele planejamento bimestral.
   */
  const planejamento =
    await prisma.planejamentoRessuprimentoQS.findUnique({
      where: {
        id:
          planejamentoId,
      },

      include: {
        itens: {
          select: {
            generoId: true,
            quantidadePlanejada: true,
          },
        },
      },
    });

  if (
    !planejamento
  ) {
    return Response.json(
      {
        error:
          'Planejamento bimestral de Ressuprimento QS não encontrado.',
      },
      {
        status: 404,
      }
    );
  }

  /*
   * Complementação somente após o planejamento
   * normal estar efetivamente finalizado.
   */
  if (
    planejamento.status !==
    'FINALIZADO'
  ) {
    return Response.json(
      {
        error:
          'Para registrar um Ressuprimento Complementar, finalize primeiro o planejamento normal bimestral.',
      },
      {
        status: 409,
      }
    );
  }

  /*
   * Proteção adicional da regra operacional:
   * o planejamento normal vinculado deve possuir
   * ciclo de exatamente 2 meses.
   */
  if (
    planejamento.mesesCiclo !==
    2
  ) {
    return Response.json(
      {
        error:
          'O Ressuprimento Complementar somente pode ser vinculado a um planejamento normal bimestral de 2 meses.',
      },
      {
        status: 409,
      }
    );
  }

  /*
   * Garante que todos os gêneros solicitados
   * pertenciam ao planejamento original.
   */
  const generosPlanejados =
    new Set(
      planejamento.itens.map(
        (item) =>
          item.generoId
      )
    );

  const generoForaPlanejamento =
    idsGeneros.find(
      (generoId) =>
        !generosPlanejados.has(
          generoId
        )
    );

  if (
    generoForaPlanejamento
  ) {
    return Response.json(
      {
        error:
          'O Ressuprimento Complementar só pode conter gêneros presentes no planejamento bimestral original.',

        generoId:
          generoForaPlanejamento,
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Confirma também que os gêneros continuam
   * cadastrados como QS.
   *
   * Não exigimos situação ATIVO aqui porque o
   * histórico do planejamento precisa permanecer
   * consistente mesmo se um gênero tiver sido
   * posteriormente inativado.
   */
  const generos =
    await prisma.genero.findMany({
      where: {
        id: {
          in:
            idsGeneros,
        },

        classe:
          'QS',
      },

      select: {
        id: true,
        nome: true,

        unidade: {
          select: {
            sigla: true,
          },
        },
      },
    });

  if (
    generos.length !==
    idsGeneros.length
  ) {
    return Response.json(
      {
        error:
          'Um ou mais gêneros informados não pertencem à classe QS.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * =====================================================
   * REGISTRO
   * =====================================================
   *
   * A transação cria:
   *
   * 1. Ressuprimento Complementar;
   * 2. itens complementares;
   * 3. Auditoria.
   *
   * Nenhuma MovimentacaoEstoque é criada.
   * Nenhum Recebimento é criado.
   */

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const novo =
            await tx.ressuprimentoComplementarQS.create({
              data: {
                planejamentoId,

                justificativa:
                  justificativa.trim(),

                usuarioId:
                  g.user!.id,

                itens: {
                  create:
                    itens.map(
                      (
                        item
                      ) => ({
                        generoId:
                          item.generoId,

                        quantidade:
                          item.quantidade,
                      })
                    ),
                },
              },

              include: {
                usuario: {
                  select: {
                    nome: true,
                    postoGraduacao: true,
                    funcao: true,
                  },
                },

                itens: {
                  include: {
                    genero: {
                      include: {
                        unidade:
                          true,
                      },
                    },
                  },

                  orderBy: {
                    genero: {
                      nome:
                        'asc',
                    },
                  },
                },
              },
            });

          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                'CADASTRO_RESSUPRIMENTO_COMPLEMENTAR_QS',

              entidade:
                'RessuprimentoComplementarQS',

              entidadeId:
                novo.id,

              dadosNovos: {
                planejamentoId,

                cicloMeses:
                  planejamento.mesesCiclo,

                justificativa:
                  justificativa.trim(),

                itens:
                  itens.map(
                    (
                      item
                    ) => ({
                      generoId:
                        item.generoId,

                      quantidade:
                        item.quantidade,
                    })
                  ),
              },
            },
          });

          return novo;
        }
      );

    return Response.json(
      {
        sucesso: true,

        ressuprimentoComplementarId:
          resultado.id,

        planejamentoId:
          resultado.planejamentoId,

        justificativa:
          resultado.justificativa,

        criadoEm:
          resultado.criadoEm,

        responsavel: {
          nome:
            resultado
              .usuario
              .nome,

          postoGraduacao:
            resultado
              .usuario
              .postoGraduacao,

          funcao:
            resultado
              .usuario
              .funcao,
        },

        itens:
          resultado.itens.map(
            (item) => ({
              generoId:
                item.generoId,

              genero:
                item.genero
                  .nome,

              unidade:
                item.genero
                  .unidade
                  .sigla,

              quantidade:
                numero(
                  item.quantidade
                ),
            })
          ),

        mensagem:
          'Ressuprimento Complementar QS registrado e vinculado ao planejamento bimestral. O recebimento físico deverá ser lançado separadamente no módulo Recebimentos.',
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      error
    );

    return Response.json(
      {
        error:
          'Não foi possível registrar o Ressuprimento Complementar QS.',
      },
      {
        status: 500,
      }
    );
  }
}

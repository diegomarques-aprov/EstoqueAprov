import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  generoId: z.string().min(1),

  origemMedia: z.string().min(1),

  mediaMensalUtilizada:
    z.number().nonnegative(),

  consumoProjetado:
    z.number().nonnegative(),

  estoqueSeguranca:
    z.number().nonnegative(),

  estoqueDisponivel:
    z.number().nonnegative(),

  previstoReceber:
    z.number().nonnegative(),

  quantidadeSugerida:
    z.number().nonnegative(),

  quantidadePlanejada:
    z.number().nonnegative(),

  justificativaAlteracao:
    z.string()
      .trim()
      .max(1000)
      .optional()
      .nullable(),
});

const bodySchema = z.object({
  planejamentoId:
    z.string().min(1).optional().nullable(),

  mesesHistorico:
    z.number().int().min(1).max(12),

  mesesCiclo:
    z.number().int().min(1).max(12),

  margemSegurancaPercent:
    z.number().min(0).max(100),

  observacao:
    z.string()
      .trim()
      .max(1000)
      .optional()
      .nullable(),

  finalizar:
    z.boolean().default(false),

  itens:
    z.array(itemSchema).min(1),
});

function numero(valor: unknown) {
  return Number(valor || 0);
}

function diferente(
  a: number,
  b: number
) {
  return Math.abs(a - b) > 0.0005;
}

function dataReferenciaHoje() {
  const agora = new Date();

  return new Date(
    Date.UTC(
      agora.getUTCFullYear(),
      agora.getUTCMonth(),
      agora.getUTCDate(),
      12,
      0,
      0
    )
  );
}

/*
 * =====================================================
 * GET
 * =====================================================
 *
 * Retorna os planejamentos já registrados.
 */

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q =
    new URL(req.url).searchParams;

  const id = q.get('id');

  /*
   * Consulta de um planejamento específico.
   */
  if (id) {
    const planejamento =
      await prisma.planejamentoRessuprimentoQS.findUnique({
        where: {
          id,
        },

        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              postoGraduacao: true,
              funcao: true,
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
      });

    if (!planejamento) {
      return Response.json(
        {
          error:
            'Planejamento de ressuprimento não encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      id: planejamento.id,

      dataReferencia:
        planejamento.dataReferencia,

      mesesHistorico:
        planejamento.mesesHistorico,

      mesesCiclo:
        planejamento.mesesCiclo,

      margemSegurancaPercent:
        numero(
          planejamento.margemSegurancaPercent
        ),

      status:
        planejamento.status,

      observacao:
        planejamento.observacao,

      criadoEm:
        planejamento.criadoEm,

      atualizadoEm:
        planejamento.atualizadoEm,

      finalizadoEm:
        planejamento.finalizadoEm,

      responsavel: {
        id:
          planejamento.usuario.id,

        nome:
          planejamento.usuario.nome,

        postoGraduacao:
          planejamento.usuario.postoGraduacao,

        funcao:
          planejamento.usuario.funcao,
      },

      itens:
        planejamento.itens.map(
          (item) => ({
            id: item.id,

            generoId:
              item.generoId,

            genero:
              item.genero.nome,

            unidade:
              item.genero.unidade.sigla,

            origemMedia:
              item.origemMedia,

            mediaMensalUtilizada:
              numero(
                item.mediaMensalUtilizada
              ),

            consumoProjetado:
              numero(
                item.consumoProjetado
              ),

            estoqueSeguranca:
              numero(
                item.estoqueSeguranca
              ),

            estoqueDisponivel:
              numero(
                item.estoqueDisponivel
              ),

            previstoReceber:
              numero(
                item.previstoReceber
              ),

            quantidadeSugerida:
              numero(
                item.quantidadeSugerida
              ),

            quantidadePlanejada:
              numero(
                item.quantidadePlanejada
              ),

            justificativaAlteracao:
              item.justificativaAlteracao,
          })
        ),
    });
  }

  /*
   * Lista dos planejamentos.
   */
  const planejamentos =
    await prisma.planejamentoRessuprimentoQS.findMany({
      include: {
        usuario: {
          select: {
            nome: true,
            postoGraduacao: true,
            funcao: true,
          },
        },

        _count: {
          select: {
            itens: true,
          },
        },
      },

      orderBy: {
        criadoEm: 'desc',
      },

      take: 50,
    });

  return Response.json(
    planejamentos.map(
      (item) => ({
        id: item.id,

        dataReferencia:
          item.dataReferencia,

        mesesHistorico:
          item.mesesHistorico,

        mesesCiclo:
          item.mesesCiclo,

        margemSegurancaPercent:
          numero(
            item.margemSegurancaPercent
          ),

        status:
          item.status,

        observacao:
          item.observacao,

        quantidadeGeneros:
          item._count.itens,

        criadoEm:
          item.criadoEm,

        atualizadoEm:
          item.atualizadoEm,

        finalizadoEm:
          item.finalizadoEm,

        responsavel: {
          nome:
            item.usuario.nome,

          postoGraduacao:
            item.usuario.postoGraduacao,

          funcao:
            item.usuario.funcao,
        },
      })
    )
  );
}

/*
 * =====================================================
 * POST
 * =====================================================
 *
 * Cria um planejamento ou atualiza um RASCUNHO.
 *
 * Um planejamento FINALIZADO não pode ser
 * silenciosamente alterado.
 */

export async function POST(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível interpretar os dados do planejamento.',
      },
      {
        status: 400,
      }
    );
  }

  const parsed =
    bodySchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error:
          'Revise os dados do planejamento de ressuprimento QS.',
      },
      {
        status: 400,
      }
    );
  }

  const {
    planejamentoId,
    mesesHistorico,
    mesesCiclo,
    margemSegurancaPercent,
    observacao,
    finalizar,
    itens,
  } = parsed.data;

  /*
   * =====================================================
   * VALIDAÇÕES
   * =====================================================
   */

  const idsGeneros =
    itens.map(
      (item) => item.generoId
    );

  const idsUnicos =
    new Set(idsGeneros);

  if (
    idsUnicos.size !==
    idsGeneros.length
  ) {
    return Response.json(
      {
        error:
          'Existe gênero QS repetido no planejamento.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Se o Administrador alterar a quantidade
   * sugerida pelo EstoqueAprov, a justificativa
   * passa a ser obrigatória.
   */
  for (const item of itens) {
    if (
      diferente(
        item.quantidadePlanejada,
        item.quantidadeSugerida
      ) &&
      !item.justificativaAlteracao?.trim()
    ) {
      return Response.json(
        {
          error:
            'Para alterar a quantidade sugerida pelo EstoqueAprov, informe a justificativa da alteração.',

          generoId:
            item.generoId,
        },
        {
          status: 400,
        }
      );
    }
  }

  /*
   * Confirma que todos os gêneros enviados
   * continuam sendo QS e estão ativos.
   */
  const generos =
    await prisma.genero.findMany({
      where: {
        id: {
          in: idsGeneros,
        },

        classe: 'QS',
        situacao: 'ATIVO',
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
          'Um ou mais gêneros do planejamento não são QS ativos.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * =====================================================
   * EDIÇÃO DE RASCUNHO EXISTENTE
   * =====================================================
   */

  if (planejamentoId) {
    const existente =
      await prisma.planejamentoRessuprimentoQS.findUnique({
        where: {
          id: planejamentoId,
        },

        include: {
          itens: true,
        },
      });

    if (!existente) {
      return Response.json(
        {
          error:
            'Planejamento de ressuprimento não encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    if (
      existente.status ===
      'FINALIZADO'
    ) {
      return Response.json(
        {
          error:
            'Este planejamento já foi finalizado e não pode ser alterado. O histórico deve ser preservado.',
        },
        {
          status: 409,
        }
      );
    }

    try {
      const resultado =
        await prisma.$transaction(
          async (tx) => {
            /*
             * Guardamos o estado anterior para
             * auditoria antes de substituir os
             * itens do rascunho.
             */
            const dadosAnteriores = {
              mesesHistorico:
                existente.mesesHistorico,

              mesesCiclo:
                existente.mesesCiclo,

              margemSegurancaPercent:
                numero(
                  existente.margemSegurancaPercent
                ),

              observacao:
                existente.observacao,

              status:
                existente.status,

              itens:
                existente.itens.map(
                  (item) => ({
                    generoId:
                      item.generoId,

                    quantidadeSugerida:
                      numero(
                        item.quantidadeSugerida
                      ),

                    quantidadePlanejada:
                      numero(
                        item.quantidadePlanejada
                      ),

                    justificativaAlteracao:
                      item.justificativaAlteracao,
                  })
                ),
            };

            /*
             * Como ainda é RASCUNHO, os itens
             * podem ser recalculados/substituídos.
             *
             * A alteração fica registrada na
             * Auditoria.
             */
            await tx.itemPlanejamentoRessuprimentoQS.deleteMany({
              where: {
                planejamentoId,
              },
            });

            const atualizado =
              await tx.planejamentoRessuprimentoQS.update({
                where: {
                  id: planejamentoId,
                },

                data: {
                  mesesHistorico,

                  mesesCiclo,

                  margemSegurancaPercent,

                  observacao:
                    observacao || null,

                  status:
                    finalizar
                      ? 'FINALIZADO'
                      : 'RASCUNHO',

                  finalizadoEm:
                    finalizar
                      ? new Date()
                      : null,

                  usuarioId:
                    g.user!.id,

                  itens: {
                    create:
                      itens.map(
                        (item) => ({
                          generoId:
                            item.generoId,

                          origemMedia:
                            item.origemMedia,

                          mediaMensalUtilizada:
                            item.mediaMensalUtilizada,

                          consumoProjetado:
                            item.consumoProjetado,

                          estoqueSeguranca:
                            item.estoqueSeguranca,

                          estoqueDisponivel:
                            item.estoqueDisponivel,

                          previstoReceber:
                            item.previstoReceber,

                          quantidadeSugerida:
                            item.quantidadeSugerida,

                          quantidadePlanejada:
                            item.quantidadePlanejada,

                          justificativaAlteracao:
                            item.justificativaAlteracao?.trim() ||
                            null,
                        })
                      ),
                  },
                },

                include: {
                  itens: true,
                },
              });

            await tx.auditoria.create({
              data: {
                usuarioId:
                  g.user!.id,

                acao:
                  finalizar
                    ? 'FINALIZACAO_PLANEJAMENTO_RESSUPRIMENTO_QS'
                    : 'ALTERACAO_RASCUNHO_RESSUPRIMENTO_QS',

                entidade:
                  'PlanejamentoRessuprimentoQS',

                entidadeId:
                  atualizado.id,

                dadosAnteriores,

                dadosNovos: {
                  mesesHistorico,

                  mesesCiclo,

                  margemSegurancaPercent,

                  observacao:
                    observacao || null,

                  status:
                    atualizado.status,

                  quantidadeItens:
                    atualizado.itens.length,

                  itens:
                    itens.map(
                      (item) => ({
                        generoId:
                          item.generoId,

                        quantidadeSugerida:
                          item.quantidadeSugerida,

                        quantidadePlanejada:
                          item.quantidadePlanejada,

                        justificativaAlteracao:
                          item.justificativaAlteracao ||
                          null,
                      })
                    ),
                },
              },
            });

            return atualizado;
          }
        );

      return Response.json({
        sucesso: true,

        planejamentoId:
          resultado.id,

        status:
          resultado.status,

        mensagem:
          resultado.status ===
          'FINALIZADO'
            ? 'Planejamento de Ressuprimento QS finalizado e registrado.'
            : 'Rascunho do Ressuprimento QS atualizado.',
      });
    } catch (error) {
      console.error(error);

      return Response.json(
        {
          error:
            'Não foi possível atualizar o planejamento de Ressuprimento QS.',
        },
        {
          status: 500,
        }
      );
    }
  }

  /*
   * =====================================================
   * NOVO PLANEJAMENTO
   * =====================================================
   */

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const novo =
            await tx.planejamentoRessuprimentoQS.create({
              data: {
                dataReferencia:
                  dataReferenciaHoje(),

                mesesHistorico,

                mesesCiclo,

                margemSegurancaPercent,

                observacao:
                  observacao || null,

                status:
                  finalizar
                    ? 'FINALIZADO'
                    : 'RASCUNHO',

                finalizadoEm:
                  finalizar
                    ? new Date()
                    : null,

                usuarioId:
                  g.user!.id,

                itens: {
                  create:
                    itens.map(
                      (item) => ({
                        generoId:
                          item.generoId,

                        origemMedia:
                          item.origemMedia,

                        mediaMensalUtilizada:
                          item.mediaMensalUtilizada,

                        consumoProjetado:
                          item.consumoProjetado,

                        estoqueSeguranca:
                          item.estoqueSeguranca,

                        estoqueDisponivel:
                          item.estoqueDisponivel,

                        previstoReceber:
                          item.previstoReceber,

                        quantidadeSugerida:
                          item.quantidadeSugerida,

                        quantidadePlanejada:
                          item.quantidadePlanejada,

                        justificativaAlteracao:
                          item.justificativaAlteracao?.trim() ||
                          null,
                      })
                    ),
                },
              },

              include: {
                itens: true,
              },
            });

          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                finalizar
                  ? 'CADASTRO_E_FINALIZACAO_RESSUPRIMENTO_QS'
                  : 'CADASTRO_RASCUNHO_RESSUPRIMENTO_QS',

              entidade:
                'PlanejamentoRessuprimentoQS',

              entidadeId:
                novo.id,

              dadosNovos: {
                dataReferencia:
                  novo.dataReferencia,

                mesesHistorico,

                mesesCiclo,

                margemSegurancaPercent,

                observacao:
                  observacao || null,

                status:
                  novo.status,

                quantidadeItens:
                  novo.itens.length,

                itens:
                  itens.map(
                    (item) => ({
                      generoId:
                        item.generoId,

                      origemMedia:
                        item.origemMedia,

                      mediaMensalUtilizada:
                        item.mediaMensalUtilizada,

                      consumoProjetado:
                        item.consumoProjetado,

                      estoqueSeguranca:
                        item.estoqueSeguranca,

                      estoqueDisponivel:
                        item.estoqueDisponivel,

                      previstoReceber:
                        item.previstoReceber,

                      quantidadeSugerida:
                        item.quantidadeSugerida,

                      quantidadePlanejada:
                        item.quantidadePlanejada,

                      justificativaAlteracao:
                        item.justificativaAlteracao ||
                        null,
                    })
                  ),
              },
            },
          });

          return novo;
        }
      );

    return Response.json({
      sucesso: true,

      planejamentoId:
        resultado.id,

      status:
        resultado.status,

      mensagem:
        resultado.status ===
        'FINALIZADO'
          ? 'Planejamento de Ressuprimento QS finalizado e registrado.'
          : 'Rascunho do Ressuprimento QS salvo.',
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível registrar o planejamento de Ressuprimento QS.',
      },
      {
        status: 500,
      }
    );
  }
}

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  generoId: z.string().min(1),
  tipo: z.enum(['MENSAL', 'BIMESTRAL']),
  quantidade: z.number().positive(),
  observacao: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),
});

function numero(valor: unknown) {
  return Number(valor || 0);
}

/*
 * =====================================================
 * GET
 * =====================================================
 *
 * Retorna as referências iniciais ATIVAS dos gêneros QS.
 */

export async function GET() {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const referencias =
    await prisma.referenciaConsumoQS.findMany({
      where: {
        ativo: true,

        genero: {
          classe: 'QS',
        },
      },

      include: {
        genero: {
          include: {
            unidade: true,
          },
        },

        usuario: {
          select: {
            id: true,
            nome: true,
            postoGraduacao: true,
            funcao: true,
          },
        },
      },

      orderBy: {
        genero: {
          nome: 'asc',
        },
      },
    });

  return Response.json(
    referencias.map((item) => ({
      id: item.id,

      generoId: item.generoId,
      genero: item.genero.nome,
      unidade: item.genero.unidade.sigla,

      tipo: item.tipo,

      quantidade: numero(
        item.quantidade
      ),

      mediaMensal: numero(
        item.mediaMensal
      ),

      observacao: item.observacao,

      responsavel: {
        id: item.usuario.id,
        nome: item.usuario.nome,
        postoGraduacao:
          item.usuario.postoGraduacao,
        funcao: item.usuario.funcao,
      },

      criadoEm: item.criadoEm,
      atualizadoEm: item.atualizadoEm,
    }))
  );
}

/*
 * =====================================================
 * POST
 * =====================================================
 *
 * Registra uma referência inicial de consumo QS.
 *
 * MENSAL:
 * quantidade = média mensal.
 *
 * BIMESTRAL:
 * média mensal = quantidade / 2.
 *
 * Quando já existir referência ativa para o gênero:
 *
 * - a referência anterior é INATIVADA;
 * - uma nova referência é criada;
 * - o histórico anterior permanece preservado;
 * - a alteração fica registrada na Auditoria.
 */

export async function POST(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const parsed = bodySchema.safeParse(
    await req.json()
  );

  if (!parsed.success) {
    return Response.json(
      {
        error:
          'Revise o gênero, o tipo e a quantidade da referência de consumo.',
      },
      {
        status: 400,
      }
    );
  }

  const {
    generoId,
    tipo,
    quantidade,
    observacao,
  } = parsed.data;

  /*
   * Somente gêneros QS ativos podem receber
   * referência de consumo.
   */
  const genero =
    await prisma.genero.findFirst({
      where: {
        id: generoId,
        classe: 'QS',
        situacao: 'ATIVO',
      },

      include: {
        unidade: true,
      },
    });

  if (!genero) {
    return Response.json(
      {
        error:
          'Para registrar a referência, selecione um gênero QS ativo.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Conversão para média mensal padronizada.
   */
  const mediaMensal =
    tipo === 'BIMESTRAL'
      ? quantidade / 2
      : quantidade;

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Pode existir uma referência ativa
           * anterior para este gênero.
           */
          const anteriores =
            await tx.referenciaConsumoQS.findMany(
              {
                where: {
                  generoId,
                  ativo: true,
                },

                orderBy: {
                  criadoEm: 'desc',
                },
              }
            );

          /*
           * Preservamos as referências antigas,
           * apenas marcando-as como inativas.
           */
          if (anteriores.length > 0) {
            await tx.referenciaConsumoQS.updateMany(
              {
                where: {
                  generoId,
                  ativo: true,
                },

                data: {
                  ativo: false,
                },
              }
            );
          }

          /*
           * Nova referência.
           */
          const nova =
            await tx.referenciaConsumoQS.create({
              data: {
                generoId,

                tipo,

                quantidade,

                mediaMensal,

                observacao:
                  observacao || null,

                usuarioId: g.user!.id,

                ativo: true,
              },
            });

          /*
           * Auditoria.
           *
           * Se havia referência anterior,
           * registramos alteração.
           *
           * Caso contrário, registramos o
           * primeiro lançamento.
           */
          await tx.auditoria.create({
            data: {
              usuarioId: g.user!.id,

              acao:
                anteriores.length > 0
                  ? 'ALTERACAO_REFERENCIA_CONSUMO_QS'
                  : 'CADASTRO_REFERENCIA_CONSUMO_QS',

              entidade:
                'ReferenciaConsumoQS',

              entidadeId: nova.id,

              dadosAnteriores:
                anteriores.length > 0
                  ? {
                      referencias:
                        anteriores.map(
                          (item) => ({
                            id: item.id,

                            tipo:
                              item.tipo,

                            quantidade:
                              numero(
                                item.quantidade
                              ),

                            mediaMensal:
                              numero(
                                item.mediaMensal
                              ),

                            observacao:
                              item.observacao,

                            criadoEm:
                              item.criadoEm,
                          })
                        ),
                    }
                  : undefined,

              dadosNovos: {
                generoId:
                  genero.id,

                genero:
                  genero.nome,

                unidade:
                  genero.unidade.sigla,

                tipo,

                quantidade,

                mediaMensal,

                observacao:
                  observacao || null,
              },
            },
          });

          return nova;
        }
      );

    return Response.json({
      sucesso: true,

      mensagem:
        tipo === 'BIMESTRAL'
          ? `Referência registrada. ${quantidade.toLocaleString(
              'pt-BR'
            )} ${
              genero.unidade.sigla
            } por bimestre correspondem a ${mediaMensal.toLocaleString(
              'pt-BR'
            )} ${
              genero.unidade.sigla
            } por mês.`
          : `Referência mensal de ${quantidade.toLocaleString(
              'pt-BR'
            )} ${
              genero.unidade.sigla
            } registrada.`,

      referencia: {
        id: resultado.id,

        generoId:
          genero.id,

        genero:
          genero.nome,

        unidade:
          genero.unidade.sigla,

        tipo,

        quantidade,

        mediaMensal,

        observacao:
          resultado.observacao,

        criadoEm:
          resultado.criadoEm,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível registrar a referência inicial de consumo QS.',
      },
      {
        status: 500,
      }
    );
  }
}

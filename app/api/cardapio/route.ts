import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  requireAdmin,
  requireOperacaoEstoque,
} from '@/lib/guard';

const body = z.object({
  data: z
    .string()
    .trim()
    .min(10),

  cafe: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable(),

  almoco: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable(),

  jantar: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable(),

  ceia: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable(),

  observacao: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable(),
});

function dataUTC(data: string) {
  const partes =
    data.split('-').map(Number);

  if (
    partes.length !== 3 ||
    !partes[0] ||
    !partes[1] ||
    !partes[2]
  ) {
    return null;
  }

  const [ano, mes, dia] = partes;

  const resultado = new Date(
    Date.UTC(
      ano,
      mes - 1,
      dia,
      0,
      0,
      0,
      0
    )
  );

  if (
    resultado.getUTCFullYear() !== ano ||
    resultado.getUTCMonth() !==
      mes - 1 ||
    resultado.getUTCDate() !== dia
  ) {
    return null;
  }

  return resultado;
}

function textoOuNull(
  valor:
    | string
    | null
    | undefined
) {
  const texto = valor?.trim();

  return texto
    ? texto
    : null;
}

/*
 * CONSULTAR CARDÁPIO POR DATA
 *
 * Exemplo:
 * /api/cardapio?data=2026-10-23
 *
 * Todos os perfis operacionais podem
 * consultar o cardápio.
 */

export async function GET(
  req: Request
) {
  const g =
    await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  const url =
    new URL(req.url);

  const dataInformada =
    url.searchParams.get('data');

  if (!dataInformada) {
    return Response.json(
      {
        error:
          'Informe a data do cardápio.',
      },
      {
        status: 400,
      }
    );
  }

  const data =
    dataUTC(dataInformada);

  if (!data) {
    return Response.json(
      {
        error:
          'A data informada é inválida.',
      },
      {
        status: 400,
      }
    );
  }

  const cardapio =
    await prisma.cardapio.findUnique({
      where: {
        data,
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
      },
    });

  return Response.json({
    encontrado:
      Boolean(cardapio),

    cardapio,
  });
}

/*
 * CADASTRAR OU ALTERAR CARDÁPIO
 *
 * Somente Administradores.
 *
 * Se a data ainda não possuir
 * cardápio, cria.
 *
 * Se já possuir, atualiza o mesmo
 * registro.
 */

export async function POST(
  req: Request
) {
  const g =
    await requireAdmin();

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
          'Revise os dados do cardápio.',
      },
      {
        status: 400,
      }
    );
  }

  const data =
    dataUTC(p.data.data);

  if (!data) {
    return Response.json(
      {
        error:
          'A data informada é inválida.',
      },
      {
        status: 400,
      }
    );
  }

  const cafe =
    textoOuNull(p.data.cafe);

  const almoco =
    textoOuNull(p.data.almoco);

  const jantar =
    textoOuNull(p.data.jantar);

  const ceia =
    textoOuNull(p.data.ceia);

  const observacao =
    textoOuNull(
      p.data.observacao
    );

  /*
   * Pelo menos uma refeição precisa
   * possuir informação.
   */

  if (
    !cafe &&
    !almoco &&
    !jantar &&
    !ceia
  ) {
    return Response.json(
      {
        error:
          'Para cadastrar o cardápio, informe pelo menos uma refeição.',
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
          const existente =
            await tx.cardapio.findUnique({
              where: {
                data,
              },
            });

          /*
           * ALTERAÇÃO
           */

          if (existente) {
            const cardapio =
              await tx.cardapio.update({
                where: {
                  id: existente.id,
                },

                data: {
                  cafe,
                  almoco,
                  jantar,
                  ceia,
                  observacao,

                  /*
                   * Guarda o usuário
                   * responsável pela
                   * última alteração.
                   */
                  usuarioId:
                    g.user!.id,
                },

                include: {
                  usuario: {
                    select: {
                      id: true,
                      nome: true,
                      postoGraduacao:
                        true,
                      funcao: true,
                    },
                  },
                },
              });

            await tx.auditoria.create({
              data: {
                usuarioId:
                  g.user!.id,

                acao:
                  'ALTERACAO_CARDAPIO',

                entidade:
                  'Cardapio',

                entidadeId:
                  cardapio.id,

                dadosAnteriores: {
                  data:
                    existente.data.toISOString(),

                  cafe:
                    existente.cafe,

                  almoco:
                    existente.almoco,

                  jantar:
                    existente.jantar,

                  ceia:
                    existente.ceia,

                  observacao:
                    existente.observacao,

                  usuarioId:
                    existente.usuarioId,
                },

                dadosNovos: {
                  data:
                    cardapio.data.toISOString(),

                  cafe:
                    cardapio.cafe,

                  almoco:
                    cardapio.almoco,

                  jantar:
                    cardapio.jantar,

                  ceia:
                    cardapio.ceia,

                  observacao:
                    cardapio.observacao,

                  usuarioId:
                    g.user!.id,
                },
              },
            });

            return {
              criado: false,
              cardapio,
            };
          }

          /*
           * NOVO CARDÁPIO
           */

          const cardapio =
            await tx.cardapio.create({
              data: {
                data,
                cafe,
                almoco,
                jantar,
                ceia,
                observacao,

                usuarioId:
                  g.user!.id,
              },

              include: {
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    postoGraduacao:
                      true,
                    funcao: true,
                  },
                },
              },
            });

          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                'CADASTRO_CARDAPIO',

              entidade:
                'Cardapio',

              entidadeId:
                cardapio.id,

              dadosNovos: {
                data:
                  cardapio.data.toISOString(),

                cafe:
                  cardapio.cafe,

                almoco:
                  cardapio.almoco,

                jantar:
                  cardapio.jantar,

                ceia:
                  cardapio.ceia,

                observacao:
                  cardapio.observacao,

                usuarioId:
                  g.user!.id,
              },
            },
          });

          return {
            criado: true,
            cardapio,
          };
        }
      );

    return Response.json({
      sucesso: true,

      criado:
        resultado.criado,

      cardapio:
        resultado.cardapio,

      mensagem:
        resultado.criado
          ? 'Cardápio cadastrado com sucesso.'
          : 'Cardápio atualizado com sucesso.',
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível salvar o cardápio.',
      },
      {
        status: 500,
      }
    );
  }
}

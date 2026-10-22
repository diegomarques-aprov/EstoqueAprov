import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  observacao: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable(),
});

function inicioDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      0,
      0,
      0,
      0
    )
  );
}

function fimDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      23,
      59,
      59,
      999
    )
  );
}

/*
 * CONSULTA DA CONFERÊNCIA FLV DO DIA
 */

export async function GET() {
  const g =
    await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  const hoje = new Date();

  const inicio =
    inicioDoDiaUTC(hoje);

  const fim =
    fimDoDiaUTC(hoje);

  const conferencia =
    await prisma.conferenciaFLV.findFirst({
      where: {
        data: {
          gte: inicio,
          lte: fim,
        },
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
    conferido: Boolean(conferencia),
    conferencia,
  });
}

/*
 * REGISTRO DA CONFERÊNCIA FLV DO DIA
 */

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
          'Revise os dados da conferência FLV.',
      },
      {
        status: 400,
      }
    );
  }

  const hoje = new Date();

  const dataConferencia =
    inicioDoDiaUTC(hoje);

  try {
    const resultado =
      await prisma.$transaction(
        async (tx) => {
          const existente =
            await tx.conferenciaFLV.findUnique({
              where: {
                data:
                  dataConferencia,
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

          /*
           * A conferência diária já foi
           * realizada. Não cria duplicidade.
           */
          if (existente) {
            return {
              jaExistia: true,
              conferencia:
                existente,
            };
          }

          const conferencia =
            await tx.conferenciaFLV.create({
              data: {
                data:
                  dataConferencia,

                observacao:
                  p.data.observacao
                    ?.trim() ||
                  null,

                usuarioId:
                  g.user!.id,
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

          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                'CONFERENCIA_FLV',

              entidade:
                'ConferenciaFLV',

              entidadeId:
                conferencia.id,

              dadosNovos: {
                data:
                  dataConferencia.toISOString(),

                observacao:
                  conferencia.observacao,

                usuarioId:
                  g.user!.id,
              },
            },
          });

          return {
            jaExistia: false,
            conferencia,
          };
        }
      );

    return Response.json({
      conferido: true,

      jaExistia:
        resultado.jaExistia,

      conferencia:
        resultado.conferencia,

      mensagem:
        resultado.jaExistia
          ? 'A conferência FLV de hoje já havia sido registrada.'
          : 'Conferência FLV registrada com sucesso.',
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível registrar a conferência FLV.',
      },
      {
        status: 500,
      }
    );
  }
}

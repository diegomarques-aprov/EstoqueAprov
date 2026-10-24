import { prisma } from '@/lib/prisma';
import { requireEfetivo } from '@/lib/guard';
import { z } from 'zod';

const ItemFechamentoSchema = z.object({
  id: z.string().min(1),

  arranchadosCompareceram: z.coerce
    .number()
    .int()
    .min(0),

  faltas: z.coerce
    .number()
    .int()
    .min(0),

  naoArranchadosAtendidos: z.coerce
    .number()
    .int()
    .min(0),
});

const FechamentoSchema = z.object({
  data: z.string().min(10),

  // Sobra total do serviço diário.
  // É registrada uma única vez para todo o dia.
  sobraKg: z.coerce
    .number()
    .min(0),

  observacao: z
    .string()
    .max(1000)
    .optional()
    .nullable(),

  itens: z
    .array(ItemFechamentoSchema)
    .min(1),
});

function dia(s: string) {
  return new Date(
    s.slice(0, 10) + 'T12:00:00.000Z'
  );
}

/*
 * Consulta o fechamento diário já registrado.
 *
 * Permite recuperar a sobra total e a observação
 * quando o usuário consultar ou corrigir um dia
 * anteriormente fechado.
 */
export async function GET(req: Request) {
  const g = await requireEfetivo();

  if (g.error) {
    return g.error;
  }

  const { searchParams } =
    new URL(req.url);

  const data =
    searchParams.get('data');

  if (!data || data.length < 10) {
    return Response.json(
      {
        error:
          'Informe a data do serviço para consultar o fechamento diário.',
      },
      {
        status: 400,
      }
    );
  }

  const dataServico =
    dia(data);

  const fechamento =
    await prisma.fechamentoDiario.findUnique({
      where: {
        data: dataServico,
      },
    });

  if (!fechamento) {
    return Response.json({
      fechamento: null,
    });
  }

  return Response.json({
    fechamento: {
      id:
        fechamento.id,

      data:
        fechamento.data,

      sobraKg:
        Number(
          fechamento.sobraKg
        ),

      observacao:
        fechamento.observacao,

      criadoEm:
        fechamento.criadoEm,

      atualizadoEm:
        fechamento.atualizadoEm,
    },
  });
}

/*
 * Registra ou corrige o fechamento diário.
 */
export async function POST(req: Request) {
  const g = await requireEfetivo();

  if (g.error) {
    return g.error;
  }

  const body =
    await req.json();

  const validacao =
    FechamentoSchema.safeParse(
      body
    );

  if (!validacao.success) {
    return Response.json(
      {
        error:
          'Para concluir o fechamento, informe corretamente o efetivo das refeições e a sobra total do serviço diário.',
      },
      {
        status: 400,
      }
    );
  }

  const dados =
    validacao.data;

  const dataServico =
    dia(dados.data);

  const registros =
    await prisma.arranchamento.findMany({
      where: {
        data:
          dataServico,

        id: {
          in: dados.itens.map(
            (item) => item.id
          ),
        },
      },
    });

  if (
    registros.length !==
    dados.itens.length
  ) {
    return Response.json(
      {
        error:
          'Um ou mais registros de arranchamento não pertencem à data de serviço informada.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * O efetivo alimentado pode ultrapassar
   * o efetivo inicialmente previsto.
   *
   * O previsto é apenas referência de
   * planejamento e não representa limite
   * para o atendimento real.
   */
  const resultado =
    await prisma.$transaction(
      async (tx) => {
        const atualizados = [];

        for (
          const item of dados.itens
        ) {
          const anterior =
            registros.find(
              (registro) =>
                registro.id ===
                item.id
            );

          if (!anterior) {
            throw new Error(
              'Registro de arranchamento não encontrado.'
            );
          }

          /*
           * Total atendido na refeição:
           *
           * efetivo alimentado
           * +
           * militares de fora.
           */
          const totalAtendido =
            item.arranchadosCompareceram +
            item.naoArranchadosAtendidos;

          const atualizado =
            await tx.arranchamento.update({
              where: {
                id:
                  item.id,
              },

              data: {
                arranchadosCompareceram:
                  item.arranchadosCompareceram,

                faltas:
                  item.faltas,

                naoArranchadosAtendidos:
                  item.naoArranchadosAtendidos,

                totalAtendido,

                fechamentoRealizadoEm:
                  new Date(),

                /*
                 * O campo antigo permanece no banco
                 * apenas por compatibilidade histórica.
                 *
                 * A sobra agora pertence ao
                 * FechamentoDiario.
                 */
                sobraKg:
                  null,
              },
            });

          await tx.auditoria.create({
            data: {
              usuarioId:
                g.user!.id,

              acao:
                anterior.fechamentoRealizadoEm
                  ? 'CORRECAO_FECHAMENTO_REFEICAO'
                  : 'FECHAMENTO_REFEICAO',

              entidade:
                'Arranchamento',

              entidadeId:
                item.id,

              dadosAnteriores: {
                dataServico:
                  dados.data,

                refeicao:
                  anterior.refeicao,

                efetivoPrevisto:
                  anterior.totalPrevisto,

                efetivoAlimentado:
                  anterior.arranchadosCompareceram,

                faltas:
                  anterior.faltas,

                militaresDeFora:
                  anterior.naoArranchadosAtendidos,

                totalAtendido:
                  anterior.totalAtendido,

                fechamentoRealizadoEm:
                  anterior.fechamentoRealizadoEm,
              },

              dadosNovos: {
                dataServico:
                  dados.data,

                refeicao:
                  anterior.refeicao,

                efetivoPrevisto:
                  anterior.totalPrevisto,

                efetivoAlimentado:
                  item.arranchadosCompareceram,

                faltas:
                  item.faltas,

                militaresDeFora:
                  item.naoArranchadosAtendidos,

                totalAtendido,

                fechamentoRealizadoEm:
                  atualizado.fechamentoRealizadoEm,
              },
            },
          });

          atualizados.push(
            atualizado
          );
        }

        /*
         * Consulta se já existe um fechamento
         * para esta data.
         */
        const fechamentoAnterior =
          await tx.fechamentoDiario.findUnique({
            where: {
              data:
                dataServico,
            },
          });

        /*
         * Uma data possui somente um
         * fechamento diário.
         *
         * Se já existir, será corrigido.
         * Se não existir, será criado.
         */
        const fechamentoDiario =
          await tx.fechamentoDiario.upsert({
            where: {
              data:
                dataServico,
            },

            create: {
              data:
                dataServico,

              sobraKg:
                dados.sobraKg,

              observacao:
                dados.observacao?.trim() ||
                null,

              usuarioId:
                g.user!.id,
            },

            update: {
              sobraKg:
                dados.sobraKg,

              observacao:
                dados.observacao?.trim() ||
                null,

              usuarioId:
                g.user!.id,
            },
          });

        /*
         * Auditoria específica do
         * fechamento diário.
         */
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao:
              fechamentoAnterior
                ? 'CORRECAO_FECHAMENTO_DIARIO'
                : 'FECHAMENTO_DIARIO',

            entidade:
              'FechamentoDiario',

            entidadeId:
              fechamentoDiario.id,

            dadosAnteriores:
              fechamentoAnterior
                ? {
                    dataServico:
                      dados.data,

                    sobraKg:
                      fechamentoAnterior.sobraKg.toString(),

                    observacao:
                      fechamentoAnterior.observacao,
                  }
                : undefined,

            dadosNovos: {
              dataServico:
                dados.data,

              sobraKg:
                dados.sobraKg,

              observacao:
                fechamentoDiario.observacao,
            },
          },
        });

        return {
          arranchamentos:
            atualizados,

          fechamentoDiario,
        };
      }
    );

  /*
   * Consolidação do fechamento.
   */
  const totalEfetivoAlimentado =
    resultado.arranchamentos.reduce(
      (total, item) =>
        total +
        (
          item.arranchadosCompareceram ??
          0
        ),
      0
    );

  const totalFaltas =
    resultado.arranchamentos.reduce(
      (total, item) =>
        total +
        (
          item.faltas ??
          0
        ),
      0
    );

  const totalMilitaresDeFora =
    resultado.arranchamentos.reduce(
      (total, item) =>
        total +
        item.naoArranchadosAtendidos,
      0
    );

  const totalAtendido =
    resultado.arranchamentos.reduce(
      (total, item) =>
        total +
        (
          item.totalAtendido ??
          0
        ),
      0
    );

  return Response.json({
    ok: true,

    dataServico:
      dados.data,

    fechamentoRegistradoEm:
      new Date().toISOString(),

    quantidadeRefeicoes:
      resultado.arranchamentos.length,

    resumo: {
      efetivoAlimentado:
        totalEfetivoAlimentado,

      faltas:
        totalFaltas,

      militaresDeFora:
        totalMilitaresDeFora,

      totalAtendido,

      sobraKg:
        Number(
          resultado
            .fechamentoDiario
            .sobraKg
        ),
    },

    mensagem:
      'Fechamento diário registrado com sucesso.',
  });
}

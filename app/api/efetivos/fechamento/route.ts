import { prisma } from '@/lib/prisma';
import { requireEfetivo } from '@/lib/guard';
import { z } from 'zod';

const ItemFechamentoSchema = z.object({
  id: z.string().min(1),

  // Arranchados que realmente fizeram a refeição.
  arranchadosCompareceram: z.coerce
    .number()
    .int()
    .min(0),

  // Arranchados previstos que faltaram à refeição.
  faltas: z.coerce
    .number()
    .int()
    .min(0),

  // Pessoas atendidas que não estavam no efetivo previsto.
  naoArranchadosAtendidos: z.coerce
    .number()
    .int()
    .min(0),

  // Sobras registradas separadamente do efetivo.
  sobraKg: z.coerce
    .number()
    .min(0),
});

const FechamentoSchema = z.object({
  data: z.string().min(10),

  itens: z
    .array(ItemFechamentoSchema)
    .min(1),
});

function dia(s: string) {
  return new Date(
    s.slice(0, 10) + 'T12:00:00.000Z'
  );
}

export async function POST(req: Request) {
  const g = await requireEfetivo();

  if (g.error) {
    return g.error;
  }

  const body = await req.json();

  const validacao =
    FechamentoSchema.safeParse(body);

  if (!validacao.success) {
    return Response.json(
      {
        error:
          'Para concluir o fechamento, informe a data do serviço, o efetivo alimentado, as faltas, os militares de fora atendidos e a sobra pesada de todas as refeições.',
      },
      {
        status: 400,
      }
    );
  }

  const dados = validacao.data;
  const dataServico = dia(dados.data);

  /*
   * Confere se todos os registros enviados
   * pertencem à data de serviço selecionada.
   */
  const registros =
    await prisma.arranchamento.findMany({
      where: {
        data: dataServico,

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
   * Validação de consistência do efetivo.
   *
   * Arranchados que compareceram + faltas
   * não podem ultrapassar o efetivo previsto.
   *
   * Militares de fora não entram nessa conta,
   * pois não pertenciam ao efetivo previsto.
   */
  for (const item of dados.itens) {
    const registro =
      registros.find(
        (r) => r.id === item.id
      );

    if (!registro) {
      return Response.json(
        {
          error:
            'Registro de arranchamento não encontrado.',
        },
        {
          status: 400,
        }
      );
    }

    const totalDoEfetivoPrevisto =
      item.arranchadosCompareceram +
      item.faltas;

    if (
      totalDoEfetivoPrevisto >
      registro.totalPrevisto
    ) {
      return Response.json(
        {
          error:
            `Na refeição ${registro.refeicao}, a soma do efetivo alimentado (${item.arranchadosCompareceram}) com as faltas (${item.faltas}) ultrapassa o efetivo previsto (${registro.totalPrevisto}). Corrija os valores para prosseguir.`,
        },
        {
          status: 400,
        }
      );
    }
  }

  /*
   * Todos os fechamentos são realizados
   * em uma única transação.
   *
   * Se algum deles falhar, nenhum
   * fechamento será confirmado.
   */
  const resultado =
    await prisma.$transaction(
      async (tx) => {
        const atualizados = [];

        for (const item of dados.itens) {
          const anterior =
            registros.find(
              (r) => r.id === item.id
            );

          if (!anterior) {
            throw new Error(
              'Registro de arranchamento não encontrado.'
            );
          }

          /*
           * Total realmente atendido:
           *
           * arranchados que compareceram
           * +
           * militares de fora atendidos.
           *
           * As faltas não entram nessa soma.
           */
          const totalAtendido =
            item.arranchadosCompareceram +
            item.naoArranchadosAtendidos;

          const atualizado =
            await tx.arranchamento.update({
              where: {
                id: item.id,
              },

              data: {
                arranchadosCompareceram:
                  item.arranchadosCompareceram,

                faltas:
                  item.faltas,

                naoArranchadosAtendidos:
                  item.naoArranchadosAtendidos,

                totalAtendido,

                sobraKg:
                  item.sobraKg,

                /*
                 * Momento real em que o fechamento
                 * foi registrado.
                 *
                 * A data operacional permanece em
                 * Arranchamento.data.
                 */
                fechamentoRealizadoEm:
                  new Date(),
              },
            });

          /*
           * Auditoria:
           *
           * primeiro lançamento =
           * FECHAMENTO_REFEICAO
           *
           * alteração posterior =
           * CORRECAO_FECHAMENTO
           */
          await tx.auditoria.create({
            data: {
              usuarioId: g.user!.id,

              acao:
                anterior.fechamentoRealizadoEm
                  ? 'CORRECAO_FECHAMENTO'
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

                sobraKg:
                  anterior.sobraKg?.toString() ??
                  null,

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

                sobraKg:
                  item.sobraKg,

                fechamentoRealizadoEm:
                  atualizado.fechamentoRealizadoEm,
              },
            },
          });

          atualizados.push(
            atualizado
          );
        }

        return atualizados;
      }
    );

  /*
   * Consolidação diária.
   *
   * Uma mesma pessoa pode aparecer
   * em mais de uma refeição.
   */
  const totalEfetivoAlimentado =
    resultado.reduce(
      (total, item) =>
        total +
        (item.arranchadosCompareceram ??
          0),
      0
    );

  const totalFaltas =
    resultado.reduce(
      (total, item) =>
        total +
        (item.faltas ?? 0),
      0
    );

  const totalMilitaresDeFora =
    resultado.reduce(
      (total, item) =>
        total +
        item.naoArranchadosAtendidos,
      0
    );

  const totalAtendido =
    resultado.reduce(
      (total, item) =>
        total +
        (item.totalAtendido ?? 0),
      0
    );

  const totalSobraKg =
    resultado.reduce(
      (total, item) =>
        total +
        Number(item.sobraKg ?? 0),
      0
    );

  return Response.json({
    ok: true,

    dataServico:
      dados.data,

    fechamentoRegistradoEm:
      new Date().toISOString(),

    quantidadeRefeicoes:
      resultado.length,

    resumo: {
      efetivoAlimentado:
        totalEfetivoAlimentado,

      faltas:
        totalFaltas,

      militaresDeFora:
        totalMilitaresDeFora,

      totalAtendido,

      sobraKg:
        totalSobraKg,
    },

    mensagem:
      'Efetivo diário registrado com sucesso.',
  });
}

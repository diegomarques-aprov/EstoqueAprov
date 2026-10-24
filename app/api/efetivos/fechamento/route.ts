import { prisma } from '@/lib/prisma';
import { requireEfetivo } from '@/lib/guard';
import { z } from 'zod';

const ItemFechamentoSchema = z.object({
  id: z.string().min(1),

  // Quantidade efetivamente alimentada na refeição.
  // Pode ser superior ao efetivo inicialmente previsto.
  arranchadosCompareceram: z.coerce
    .number()
    .int()
    .min(0),

  // Arranchados previstos que não compareceram.
  faltas: z.coerce
    .number()
    .int()
    .min(0),

  // Pessoas atendidas que não estavam arranchadas.
  naoArranchadosAtendidos: z.coerce
    .number()
    .int()
    .min(0),

  // Mantido temporariamente nesta etapa.
  // Será transformado em sobra única diária
  // na próxima correção.
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
          'Para concluir o fechamento, informe corretamente os dados do serviço diário.',
      },
      {
        status: 400,
      }
    );
  }

  const dados = validacao.data;
  const dataServico = dia(dados.data);

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
   * O efetivo realmente alimentado pode ser
   * superior ao efetivo previsto.
   *
   * Isso pode ocorrer quando militares não
   * inicialmente arranchados comparecem à
   * refeição.
   *
   * Portanto, o efetivo previsto serve como
   * referência de planejamento e não como
   * limite para o fechamento do serviço.
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
           * Total de atendimentos registrados:
           *
           * efetivo alimentado
           * +
           * militares de fora informados.
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

                fechamentoRealizadoEm:
                  new Date(),
              },
            });

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

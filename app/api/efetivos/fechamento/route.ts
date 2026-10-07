import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import { z } from 'zod';

const ItemFechamentoSchema = z.object({
  id: z.string().min(1),

  // Obrigatório:
  // quantidade de arranchados que realmente compareceram
  arranchadosCompareceram: z.coerce
    .number()
    .int()
    .min(0),

  // Obrigatório, podendo ser zero
  naoArranchadosAtendidos: z.coerce
    .number()
    .int()
    .min(0),

  // Obrigatório.
  // Se não houve sobra, deve ser informado 0.
  sobraKg: z.coerce
    .number()
    .min(0),
});

const FechamentoSchema = z.object({
  // Data real do serviço (Dia D),
  // independentemente da data em que o lançamento for feito
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
  const g = await requireAdmin();

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
          'Para concluir o fechamento, informe a data do serviço, o comparecimento dos arranchados, os não arranchados atendidos e a sobra pesada em kg de todas as refeições.',
      },
      {
        status: 400,
      }
    );
  }

  const dados = validacao.data;
  const dataServico = dia(dados.data);

  /*
   * Confere se todos os registros enviados realmente
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
   * Todos os fechamentos são realizados em uma única
   * transação. Se algum deles falhar, nenhum é confirmado.
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
           * não arranchados atendidos
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

                naoArranchadosAtendidos:
                  item.naoArranchadosAtendidos,

                totalAtendido,

                // Pesagem obrigatória.
                // Zero significa que não houve sobra.
                sobraKg: item.sobraKg,

                /*
                 * Esta é a data/hora em que o usuário
                 * efetivamente realizou o lançamento.
                 *
                 * A data do serviço continua sendo
                 * Arranchamento.data.
                 */
                fechamentoRealizadoEm:
                  new Date(),
              },
            });

          /*
           * Auditoria.
           *
           * Se ainda não havia fechamento, registra
           * FECHAMENTO_REFEICAO.
           *
           * Se já havia fechamento, trata como correção
           * e preserva os valores anteriores.
           */
          await tx.auditoria.create({
            data: {
              usuarioId: g.user!.id,

              acao:
                anterior.fechamentoRealizadoEm
                  ? 'CORRECAO_FECHAMENTO'
                  : 'FECHAMENTO_REFEICAO',

              entidade: 'Arranchamento',

              entidadeId: item.id,

              dadosAnteriores: {
                dataServico:
                  dados.data,

                refeicao:
                  anterior.refeicao,

                arranchadosCompareceram:
                  anterior.arranchadosCompareceram,

                naoArranchadosAtendidos:
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

                arranchadosCompareceram:
                  item.arranchadosCompareceram,

                naoArranchadosAtendidos:
                  item.naoArranchadosAtendidos,

                totalAtendido,

                sobraKg:
                  item.sobraKg,

                fechamentoRealizadoEm:
                  atualizado.fechamentoRealizadoEm,
              },
            },
          });

          atualizados.push(atualizado);
        }

        return atualizados;
      }
    );

  /*
   * Soma dos resultados do fechamento diário.
   * Isso já deixa a API preparada para a tela e
   * posteriormente para os relatórios.
   */
  const totalArranchadosCompareceram =
    resultado.reduce(
      (total, item) =>
        total +
        (item.arranchadosCompareceram ?? 0),
      0
    );

  const totalNaoArranchados =
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

    /*
     * Data/hora real do lançamento.
     * Portanto, um serviço do dia 08 poderá perfeitamente
     * ser lançado no dia 09, 10, 12 etc.
     */
    fechamentoRegistradoEm:
      new Date().toISOString(),

    refeicoesFechadas:
      resultado.length,

    resumo: {
      arranchadosCompareceram:
        totalArranchadosCompareceram,

      naoArranchadosAtendidos:
        totalNaoArranchados,

      totalAtendido,

      sobraKg:
        totalSobraKg,
    },

    mensagem:
      'Fechamento diário registrado com sucesso.',
  });
}

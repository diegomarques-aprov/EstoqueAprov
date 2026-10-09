import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function primeiroDiaMesUTC(data: Date) {
  return new Date(
    Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      1
    )
  );
}

function adicionarMesesUTC(
  data: Date,
  meses: number
) {
  return new Date(
    Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth() + meses,
      1
    )
  );
}

function numero(valor: unknown) {
  return Number(valor || 0);
}

function arredondar(
  valor: number,
  casas = 3
) {
  const fator = 10 ** casas;

  return (
    Math.round(
      (valor + Number.EPSILON) * fator
    ) / fator
  );
}

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q =
    new URL(req.url).searchParams;

  const mesesHistorico = Number(
    q.get('historico') || 2
  );

  const mesesCiclo = Number(
    q.get('ciclo') || 2
  );

  const margemSeguranca = Number(
    q.get('margem') || 10
  );

  if (
    !Number.isInteger(mesesHistorico) ||
    mesesHistorico < 1 ||
    mesesHistorico > 12
  ) {
    return Response.json(
      {
        error:
          'O histórico deve possuir entre 1 e 12 meses.',
      },
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isInteger(mesesCiclo) ||
    mesesCiclo < 1 ||
    mesesCiclo > 12
  ) {
    return Response.json(
      {
        error:
          'O ciclo deve possuir entre 1 e 12 meses.',
      },
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isFinite(margemSeguranca) ||
    margemSeguranca < 0 ||
    margemSeguranca > 100
  ) {
    return Response.json(
      {
        error:
          'A margem de segurança deve estar entre 0% e 100%.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * =====================================================
   * PERÍODO HISTÓRICO
   * =====================================================
   *
   * Trabalhamos com meses COMPLETOS.
   *
   * Exemplo:
   *
   * Data atual: outubro
   * Histórico: 2 meses
   *
   * Período utilizado:
   * 01/08 até 30/09.
   *
   * O mês atual não entra na média enquanto
   * ainda estiver incompleto.
   */

  const agora = new Date();

  const inicioMesAtual =
    primeiroDiaMesUTC(agora);

  const inicioHistorico =
    adicionarMesesUTC(
      inicioMesAtual,
      -mesesHistorico
    );

  const fimHistoricoExclusivo =
    inicioMesAtual;

  /*
   * =====================================================
   * GÊNEROS QS
   * =====================================================
   */

  const generos =
    await prisma.genero.findMany({
      where: {
        classe: 'QS',
        situacao: 'ATIVO',
      },

      include: {
        unidade: true,
      },

      orderBy: {
        nome: 'asc',
      },
    });

  /*
   * =====================================================
   * CONSUMO HISTÓRICO
   * =====================================================
   *
   * Usamos ItemSaida + Saida.data.
   *
   * Portanto, o consumo pertence ao mês
   * operacional da saída, independentemente
   * da data em que ela foi digitada.
   *
   * Saídas canceladas são desconsideradas.
   */

  const consumos =
    await prisma.itemSaida.findMany({
      where: {
        saida: {
          classe: 'QS',

          canceladaEm: null,

          data: {
            gte: inicioHistorico,
            lt: fimHistoricoExclusivo,
          },
        },
      },

      select: {
        generoId: true,
        quantidade: true,
      },
    });

  /*
   * =====================================================
   * ESTOQUE FÍSICO ATUAL
   * =====================================================
   */

  const estoque =
    await prisma.estoqueLocal.findMany({
      where: {
        genero: {
          classe: 'QS',
          situacao: 'ATIVO',
        },
      },

      select: {
        generoId: true,
        quantidade: true,
      },
    });

  /*
   * =====================================================
   * REFERÊNCIAS INICIAIS
   * =====================================================
   *
   * Utilizadas quando ainda não existe histórico
   * suficiente no EstoqueAprov.
   *
   * A referência ativa já possui a média mensal
   * normalizada, independentemente de ter sido
   * informada originalmente como mensal ou
   * bimestral.
   */

  const referencias =
    await prisma.referenciaConsumoQS.findMany({
      where: {
        ativo: true,

        genero: {
          classe: 'QS',
          situacao: 'ATIVO',
        },
      },

      orderBy: {
        criadoEm: 'desc',
      },
    });

  /*
   * =====================================================
   * CONSUMO POR GÊNERO
   * =====================================================
   */

  const consumoPorGenero =
    new Map<string, number>();

  for (const item of consumos) {
    consumoPorGenero.set(
      item.generoId,

      (consumoPorGenero.get(
        item.generoId
      ) || 0) +
        numero(item.quantidade)
    );
  }

  /*
   * =====================================================
   * ESTOQUE POR GÊNERO
   * =====================================================
   */

  const estoquePorGenero =
    new Map<string, number>();

  for (const item of estoque) {
    estoquePorGenero.set(
      item.generoId,

      (estoquePorGenero.get(
        item.generoId
      ) || 0) +
        numero(item.quantidade)
    );
  }

  /*
   * =====================================================
   * REFERÊNCIA ATIVA POR GÊNERO
   * =====================================================
   */

  const referenciaPorGenero =
    new Map<
      string,
      (typeof referencias)[number]
    >();

  for (const referencia of referencias) {
    /*
     * Como ordenamos da mais recente para
     * a mais antiga, mantemos a primeira.
     */
    if (
      !referenciaPorGenero.has(
        referencia.generoId
      )
    ) {
      referenciaPorGenero.set(
        referencia.generoId,
        referencia
      );
    }
  }

  /*
   * =====================================================
   * CÁLCULO DO PLANEJAMENTO
   * =====================================================
   */

  const itens = generos.map((genero) => {
    const consumoHistorico =
      consumoPorGenero.get(
        genero.id
      ) || 0;

    const referencia =
      referenciaPorGenero.get(
        genero.id
      );

    /*
     * IMPORTANTE:
     *
     * Consumo zero não significa automaticamente
     * que o gênero não é utilizado.
     *
     * Na implantação do sistema pode simplesmente
     * não existir histórico suficiente.
     */

    const possuiHistoricoConsumo =
      consumoHistorico > 0;

    const possuiReferenciaInicial =
      Boolean(referencia);

    /*
     * Média observada no EstoqueAprov.
     *
     * Só é considerada válida quando houve
     * consumo no período.
     */
    const mediaHistorica =
      possuiHistoricoConsumo
        ? consumoHistorico /
          mesesHistorico
        : null;

    /*
     * Média mensal efetivamente utilizada
     * para a projeção.
     *
     * PRIORIDADE:
     *
     * 1. histórico real do EstoqueAprov;
     * 2. referência inicial manual;
     * 3. sem base de cálculo.
     */

    let mediaMensalUtilizada:
      | number
      | null = null;

    let origemMedia:
      | 'HISTORICO_ESTOQUEAPROV'
      | 'REFERENCIA_INICIAL'
      | 'SEM_BASE_CALCULO';

    if (mediaHistorica != null) {
      mediaMensalUtilizada =
        mediaHistorica;

      origemMedia =
        'HISTORICO_ESTOQUEAPROV';
    } else if (referencia) {
      mediaMensalUtilizada =
        numero(
          referencia.mediaMensal
        );

      origemMedia =
        'REFERENCIA_INICIAL';
    } else {
      origemMedia =
        'SEM_BASE_CALCULO';
    }

    /*
     * Se não houver nenhuma base confiável,
     * NÃO transformamos ausência de dados
     * em consumo zero.
     *
     * Os campos de projeção ficam nulos.
     */

    const consumoProjetado =
      mediaMensalUtilizada == null
        ? null
        : mediaMensalUtilizada *
          mesesCiclo;

    const estoqueSeguranca =
      consumoProjetado == null
        ? null
        : consumoProjetado *
          (margemSeguranca / 100);

    const estoqueDisponivel =
      estoquePorGenero.get(
        genero.id
      ) || 0;

    /*
     * Futuramente este valor poderá vir
     * de pedidos QS já programados.
     */
    const previstoReceber = 0;

    const necessidadeBruta =
      consumoProjetado == null ||
      estoqueSeguranca == null
        ? null
        : consumoProjetado +
          estoqueSeguranca -
          estoqueDisponivel -
          previstoReceber;

    const quantidadeSugerida =
      necessidadeBruta == null
        ? null
        : Math.max(
            0,
            necessidadeBruta
          );

    const coberturaAtualMeses =
      mediaMensalUtilizada != null &&
      mediaMensalUtilizada > 0
        ? estoqueDisponivel /
          mediaMensalUtilizada
        : null;

    return {
      generoId: genero.id,

      genero: genero.nome,

      unidade:
        genero.unidade.sigla,

      /*
       * Histórico real.
       */
      consumoHistorico:
        arredondar(
          consumoHistorico
        ),

      mesesHistorico,

      mediaHistorica:
        mediaHistorica == null
          ? null
          : arredondar(
              mediaHistorica
            ),

      possuiHistoricoConsumo,

      /*
       * Referência inicial.
       */
      possuiReferenciaInicial,

      referenciaInicial:
        referencia
          ? {
              id:
                referencia.id,

              tipo:
                referencia.tipo,

              quantidade:
                arredondar(
                  numero(
                    referencia.quantidade
                  )
                ),

              mediaMensal:
                arredondar(
                  numero(
                    referencia.mediaMensal
                  )
                ),

              observacao:
                referencia.observacao,

              criadoEm:
                referencia.criadoEm,
            }
          : null,

      /*
       * Base realmente utilizada.
       */
      origemMedia,

      mediaMensalUtilizada:
        mediaMensalUtilizada == null
          ? null
          : arredondar(
              mediaMensalUtilizada
            ),

      /*
       * Projeção.
       */
      mesesCiclo,

      consumoProjetado:
        consumoProjetado == null
          ? null
          : arredondar(
              consumoProjetado
            ),

      margemSegurancaPercent:
        margemSeguranca,

      estoqueSeguranca:
        estoqueSeguranca == null
          ? null
          : arredondar(
              estoqueSeguranca
            ),

      estoqueDisponivel:
        arredondar(
          estoqueDisponivel
        ),

      previstoReceber:
        arredondar(
          previstoReceber
        ),

      necessidadeBruta:
        necessidadeBruta == null
          ? null
          : arredondar(
              necessidadeBruta
            ),

      quantidadeSugerida:
        quantidadeSugerida == null
          ? null
          : arredondar(
              quantidadeSugerida
            ),

      coberturaAtualMeses:
        coberturaAtualMeses == null
          ? null
          : arredondar(
              coberturaAtualMeses,
              2
            ),

      /*
       * Estado para a interface.
       */
      requerReferencia:
        mediaMensalUtilizada == null,
    };
  });

  /*
   * =====================================================
   * TOTAIS POR UNIDADE
   * =====================================================
   *
   * Somente gêneros com base de cálculo entram
   * nos totais projetados.
   *
   * Gêneros sem histórico e sem referência
   * permanecem explicitamente pendentes.
   */

  const totaisPorUnidade = new Map<
    string,
    {
      unidade: string;
      consumoHistorico: number;
      consumoProjetado: number;
      estoqueSeguranca: number;
      estoqueDisponivel: number;
      quantidadeSugerida: number;
      generosCalculados: number;
      generosSemBase: number;
    }
  >();

  for (const item of itens) {
    let total =
      totaisPorUnidade.get(
        item.unidade
      );

    if (!total) {
      total = {
        unidade: item.unidade,

        consumoHistorico: 0,
        consumoProjetado: 0,
        estoqueSeguranca: 0,
        estoqueDisponivel: 0,
        quantidadeSugerida: 0,

        generosCalculados: 0,
        generosSemBase: 0,
      };

      totaisPorUnidade.set(
        item.unidade,
        total
      );
    }

    total.consumoHistorico +=
      item.consumoHistorico;

    total.estoqueDisponivel +=
      item.estoqueDisponivel;

    if (
      item.quantidadeSugerida ==
      null
    ) {
      total.generosSemBase += 1;

      continue;
    }

    total.generosCalculados += 1;

    total.consumoProjetado +=
      item.consumoProjetado || 0;

    total.estoqueSeguranca +=
      item.estoqueSeguranca || 0;

    total.quantidadeSugerida +=
      item.quantidadeSugerida;
  }

  const totais =
    Array.from(
      totaisPorUnidade.values()
    ).map((item) => ({
      ...item,

      consumoHistorico:
        arredondar(
          item.consumoHistorico
        ),

      consumoProjetado:
        arredondar(
          item.consumoProjetado
        ),

      estoqueSeguranca:
        arredondar(
          item.estoqueSeguranca
        ),

      estoqueDisponivel:
        arredondar(
          item.estoqueDisponivel
        ),

      quantidadeSugerida:
        arredondar(
          item.quantidadeSugerida
        ),

      /*
       * Se houver algum gênero sem base,
       * o total daquela unidade ainda é
       * PARCIAL.
       */
      totalCompleto:
        item.generosSemBase === 0,
    }));

  /*
   * =====================================================
   * ESTATÍSTICAS
   * =====================================================
   */

  const comHistorico =
    itens.filter(
      (item) =>
        item.origemMedia ===
        'HISTORICO_ESTOQUEAPROV'
    ).length;

  const usandoReferencia =
    itens.filter(
      (item) =>
        item.origemMedia ===
        'REFERENCIA_INICIAL'
    ).length;

  const semBase =
    itens.filter(
      (item) =>
        item.origemMedia ===
        'SEM_BASE_CALCULO'
    ).length;

  /*
   * =====================================================
   * RESPOSTA
   * =====================================================
   */

  return Response.json({
    relatorio:
      'PLANEJAMENTO_RESSUPRIMENTO_QS',

    descricao:
      'Estimativa de necessidade de gêneros QS para o próximo ciclo de ressuprimento.',

    classe: 'QS',

    parametros: {
      mesesHistorico,

      mesesCiclo,

      margemSegurancaPercent:
        margemSeguranca,

      criterioHistorico:
        'MESES_COMPLETOS',

      inicioHistorico:
        inicioHistorico
          .toISOString()
          .slice(0, 10),

      fimHistorico: new Date(
        fimHistoricoExclusivo.getTime() -
          1
      )
        .toISOString()
        .slice(0, 10),
    },

    estatisticas: {
      generosQS:
        itens.length,

      usandoHistoricoEstoqueAprov:
        comHistorico,

      usandoReferenciaInicial:
        usandoReferencia,

      semBaseCalculo:
        semBase,
    },

    formula: {
      expressao:
        'Consumo projetado + estoque de segurança - estoque disponível - quantidade prevista para receber',

      observacao:
        'Quando o resultado for negativo, a quantidade sugerida é zero. Quando não houver histórico nem referência inicial, nenhuma quantidade é sugerida.',
    },

    itens,

    totaisPorUnidade:
      totais,

    avisos: [
      'O histórico automático utiliza meses completos e a data operacional das saídas.',
      'Saídas canceladas não são consideradas consumo.',
      'Na ausência de histórico, pode ser utilizada uma referência inicial de consumo informada pelo Administrador.',
      'Ausência de histórico não é interpretada como consumo zero.',
      'Totais que possuam gêneros sem base de cálculo são identificados como parciais.',
      'A quantidade sugerida é apoio à decisão e não constitui pedido automático à cadeia de suprimento.',
      'Situações extraordinárias, missões, aumento de efetivo e outras necessidades operacionais devem ser avaliadas pelo responsável.',
      'QR não participa deste cálculo.',
    ],
  });
}

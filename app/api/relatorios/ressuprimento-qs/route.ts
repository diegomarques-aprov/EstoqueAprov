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
   * SAÍDAS DO PERÍODO
   * =====================================================
   *
   * A base oficial do planejamento é o
   * CONSUMO REAL LÍQUIDO:
   *
   * SAÍDAS - DEVOLUÇÕES
   *
   * Saídas canceladas não participam.
   *
   * A data considerada é a data operacional
   * da saída.
   */

  const saidas =
    await prisma.saida.findMany({
      where: {
        classe: 'QS',

        canceladaEm: null,

        data: {
          gte: inicioHistorico,
          lt: fimHistoricoExclusivo,
        },
      },

      select: {
        id: true,

        itens: {
          select: {
            generoId: true,
            quantidade: true,
          },
        },
      },
    });

  /*
   * =====================================================
   * DEVOLUÇÕES DAS SAÍDAS DO PERÍODO
   * =====================================================
   */

  const idsSaidas =
    saidas.map(
      (saida) => saida.id
    );

  const devolucoes =
    idsSaidas.length > 0
      ? await prisma.movimentacaoEstoque.findMany(
          {
            where: {
              tipo: 'DEVOLUCAO',

              referenciaTipo:
                'DevolucaoSaida',

              referenciaId: {
                in: idsSaidas,
              },
            },

            select: {
              referenciaId: true,
              generoId: true,
              quantidade: true,
            },
          }
        )
      : [];

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
   * SAÍDAS POR GÊNERO
   * =====================================================
   */

  const saidaPorGenero =
    new Map<string, number>();

  for (const saida of saidas) {
    for (const item of saida.itens) {
      saidaPorGenero.set(
        item.generoId,

        (saidaPorGenero.get(
          item.generoId
        ) || 0) +
          numero(item.quantidade)
      );
    }
  }

  /*
   * =====================================================
   * DEVOLUÇÕES POR GÊNERO
   * =====================================================
   */

  const devolucaoPorGenero =
    new Map<string, number>();

  for (const item of devolucoes) {
    devolucaoPorGenero.set(
      item.generoId,

      (devolucaoPorGenero.get(
        item.generoId
      ) || 0) +
        numero(item.quantidade)
    );
  }

  /*
   * =====================================================
   * CONSUMO LÍQUIDO POR GÊNERO
   * =====================================================
   */

  const consumoPorGenero =
    new Map<string, number>();

  for (const genero of generos) {
    const quantidadeSaida =
      saidaPorGenero.get(
        genero.id
      ) || 0;

    const quantidadeDevolvida =
      devolucaoPorGenero.get(
        genero.id
      ) || 0;

    consumoPorGenero.set(
      genero.id,

      Math.max(
        0,
        quantidadeSaida -
          quantidadeDevolvida
      )
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

    const possuiHistoricoConsumo =
      consumoHistorico > 0;

    const possuiReferenciaInicial =
      Boolean(referencia);

    const mediaHistorica =
      possuiHistoricoConsumo
        ? consumoHistorico /
          mesesHistorico
        : null;

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
     * Na versão atual ainda não há
     * recebimentos QS futuros programados.
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

    /*
     * Valor unitário de referência.
     *
     * Este valor NÃO representa crédito,
     * empenho ou saldo financeiro.
     *
     * Ele é disponibilizado apenas para
     * eventual consulta de orçamento
     * estimado pelo usuário.
     */
    const valorUnitarioReferencia =
      genero.valorUnitarioReferencia ==
      null
        ? null
        : Number(
            genero.valorUnitarioReferencia
          );

    return {
      generoId: genero.id,

      genero: genero.nome,

      unidade:
        genero.unidade.sigla,

      valorUnitarioReferencia,

      /*
       * Histórico líquido real.
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

      requerReferencia:
        mediaMensalUtilizada == null,
    };
  });

  /*
   * =====================================================
   * TOTAIS POR UNIDADE
   * =====================================================
   *
   * Nunca somamos unidades diferentes.
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
       * o total daquela unidade permanece
       * parcial.
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
        'CONSUMO_LIQUIDO_MESES_COMPLETOS',

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
      base:
        'Consumo líquido real = saídas - devoluções',

      expressao:
        'Consumo projetado + estoque de segurança - estoque disponível - quantidade prevista para receber',

      observacao:
        'O histórico real do EstoqueAprov é a base automática do cálculo. A referência inicial somente é utilizada quando ainda não existe histórico real para o gênero.',
    },

    itens,

    totaisPorUnidade:
      totais,

    avisos: [
      'O histórico automático utiliza o consumo líquido real dos meses completos.',
      'As devoluções são descontadas das saídas antes do cálculo do consumo histórico.',
      'Saídas canceladas não são consideradas consumo.',
      'Quando existir histórico real, ele é a única base automática utilizada no cálculo.',
      'A referência inicial é utilizada somente enquanto não existir histórico real para o gênero.',
      'Ausência de histórico não é interpretada como consumo zero.',
      'Totais que possuam gêneros sem base de cálculo são identificados como parciais.',
      'A quantidade sugerida é apoio à decisão e não constitui pedido automático à cadeia de suprimento.',
      'O valor unitário de referência é opcional e serve somente para eventual consulta de orçamento estimado.',
      'QR não participa deste cálculo.',
    ],
  });
}

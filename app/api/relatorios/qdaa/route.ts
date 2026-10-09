import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function inicioDoMes(ano: number, mes: number) {
  return new Date(
    `${ano}-${String(mes).padStart(2, '0')}-01T00:00:00.000Z`
  );
}

function inicioDoMesSeguinte(
  ano: number,
  mes: number
) {
  if (mes === 12) {
    return new Date(
      `${ano + 1}-01-01T00:00:00.000Z`
    );
  }

  return new Date(
    `${ano}-${String(mes + 1).padStart(
      2,
      '0'
    )}-01T00:00:00.000Z`
  );
}

function numero(valor: unknown) {
  return Number(valor || 0);
}

type MovimentoQDAA = {
  generoId: string;
  tipo: string;
  quantidade: number;
  dataOperacional: Date;
};

type ConsolidadoGenero = {
  generoId: string;
  genero: string;
  unidade: string;

  estoqueInicial: number;

  saldoInicialLancado: number;
  recebimentos: number;
  devolucoes: number;

  consumo: number;
  perdas: number;
  correcoes: number;

  estoqueFinalCalculado: number;
  estoqueAtual: number;

  movimentacoesNoMes: number;
};

function impactoEstoque(
  tipo: string,
  quantidade: number
) {
  switch (tipo) {
    case 'SALDO_INICIAL':
    case 'RECEBIMENTO':
    case 'DEVOLUCAO':
      return quantidade;

    case 'SAIDA':
    case 'PERDA':
      return -quantidade;

    case 'CORRECAO':
      /*
       * A correção já é gravada com sinal:
       *
       * positivo = acréscimo;
       * negativo = redução.
       */
      return quantidade;

    case 'TRANSFERENCIA':
      return 0;

    default:
      return 0;
  }
}

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q = new URL(req.url).searchParams;

  const agora = new Date();

  const ano = Number(
    q.get('ano') || agora.getUTCFullYear()
  );

  const mes = Number(
    q.get('mes') || agora.getUTCMonth() + 1
  );

  if (
    !Number.isInteger(ano) ||
    ano < 2000 ||
    ano > 2100
  ) {
    return Response.json(
      {
        error: 'Ano inválido.',
      },
      {
        status: 400,
      }
    );
  }

  if (
    !Number.isInteger(mes) ||
    mes < 1 ||
    mes > 12
  ) {
    return Response.json(
      {
        error: 'Mês inválido.',
      },
      {
        status: 400,
      }
    );
  }

  const inicio = inicioDoMes(ano, mes);

  const fimExclusivo =
    inicioDoMesSeguinte(ano, mes);

  /*
   * =====================================================
   * GÊNEROS QS
   * =====================================================
   */

  const generos =
    await prisma.genero.findMany({
      where: {
        classe: 'QS',
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
   * MOVIMENTAÇÕES GERAIS
   * =====================================================
   *
   * SALDO_INICIAL
   * DEVOLUCAO
   * PERDA
   * CORRECAO
   * TRANSFERENCIA
   *
   * Esses movimentos ainda não possuem campo próprio
   * de data operacional.
   *
   * Portanto, enquanto o modelo não for ampliado,
   * usamos criadoEm.
   *
   * RECEBIMENTO e SAIDA serão tratados separadamente
   * usando as datas operacionais das respectivas
   * entidades.
   */

  const movimentosGerais =
    await prisma.movimentacaoEstoque.findMany({
      where: {
        classe: 'QS',

        tipo: {
          in: [
            'SALDO_INICIAL',
            'DEVOLUCAO',
            'PERDA',
            'CORRECAO',
            'TRANSFERENCIA',
          ],
        },

        criadoEm: {
          lt: fimExclusivo,
        },
      },

      select: {
        generoId: true,
        tipo: true,
        quantidade: true,
        criadoEm: true,
      },

      orderBy: {
        criadoEm: 'asc',
      },
    });

  /*
   * =====================================================
   * RECEBIMENTOS QS
   * =====================================================
   *
   * Aqui usamos Recebimento.data.
   *
   * Exemplo:
   *
   * Recebido em 30/09
   * Digitado em 01/10
   *
   * O movimento pertence a SETEMBRO.
   */

  const recebimentos =
    await prisma.itemRecebimento.findMany({
      where: {
        recebimento: {
          classe: 'QS',

          data: {
            lt: fimExclusivo,
          },
        },
      },

      select: {
        generoId: true,
        quantidade: true,

        recebimento: {
          select: {
            data: true,
          },
        },
      },
    });

  /*
   * =====================================================
   * SAÍDAS QS
   * =====================================================
   *
   * Utilizamos Saida.data, que representa a data
   * operacional do saque/consumo.
   *
   * Saídas canceladas não representam consumo efetivo
   * e são desconsideradas.
   */

  const saidas =
    await prisma.itemSaida.findMany({
      where: {
        saida: {
          classe: 'QS',

          canceladaEm: null,

          data: {
            lt: fimExclusivo,
          },
        },
      },

      select: {
        generoId: true,
        quantidade: true,

        saida: {
          select: {
            data: true,
          },
        },
      },
    });

  /*
   * =====================================================
   * UNIFICAÇÃO DOS MOVIMENTOS
   * =====================================================
   */

  const movimentos: MovimentoQDAA[] = [];

  for (const movimento of movimentosGerais) {
    movimentos.push({
      generoId: movimento.generoId,
      tipo: movimento.tipo,
      quantidade: numero(
        movimento.quantidade
      ),
      dataOperacional:
        movimento.criadoEm,
    });
  }

  for (const item of recebimentos) {
    movimentos.push({
      generoId: item.generoId,
      tipo: 'RECEBIMENTO',
      quantidade: numero(
        item.quantidade
      ),
      dataOperacional:
        item.recebimento.data,
    });
  }

  for (const item of saidas) {
    movimentos.push({
      generoId: item.generoId,
      tipo: 'SAIDA',
      quantidade: numero(
        item.quantidade
      ),
      dataOperacional:
        item.saida.data,
    });
  }

  /*
   * =====================================================
   * SEPARAÇÃO DO HISTÓRICO
   * =====================================================
   */

  const movimentosAnteriores =
    movimentos.filter(
      (movimento) =>
        movimento.dataOperacional < inicio
    );

  const movimentosMes =
    movimentos.filter(
      (movimento) =>
        movimento.dataOperacional >= inicio &&
        movimento.dataOperacional <
          fimExclusivo
    );

  /*
   * =====================================================
   * ESTOQUE FÍSICO ATUAL
   * =====================================================
   */

  const estoqueAtualRegistros =
    await prisma.estoqueLocal.findMany({
      where: {
        genero: {
          classe: 'QS',
        },
      },

      select: {
        generoId: true,
        quantidade: true,
      },
    });

  const estoqueAtualPorGenero =
    new Map<string, number>();

  for (const item of estoqueAtualRegistros) {
    estoqueAtualPorGenero.set(
      item.generoId,

      (estoqueAtualPorGenero.get(
        item.generoId
      ) || 0) +
        numero(item.quantidade)
    );
  }

  /*
   * =====================================================
   * ESTOQUE INICIAL DO MÊS
   * =====================================================
   */

  const estoqueInicialPorGenero =
    new Map<string, number>();

  for (const movimento of movimentosAnteriores) {
    const atual =
      estoqueInicialPorGenero.get(
        movimento.generoId
      ) || 0;

    const impacto =
      impactoEstoque(
        movimento.tipo,
        movimento.quantidade
      );

    estoqueInicialPorGenero.set(
      movimento.generoId,
      atual + impacto
    );
  }

  /*
   * =====================================================
   * CONSOLIDAÇÃO POR GÊNERO
   * =====================================================
   */

  const consolidado = new Map<
    string,
    ConsolidadoGenero
  >();

  for (const genero of generos) {
    const estoqueInicial =
      estoqueInicialPorGenero.get(
        genero.id
      ) || 0;

    consolidado.set(genero.id, {
      generoId: genero.id,
      genero: genero.nome,
      unidade: genero.unidade.sigla,

      estoqueInicial,

      saldoInicialLancado: 0,
      recebimentos: 0,
      devolucoes: 0,

      consumo: 0,
      perdas: 0,
      correcoes: 0,

      estoqueFinalCalculado:
        estoqueInicial,

      estoqueAtual:
        estoqueAtualPorGenero.get(
          genero.id
        ) || 0,

      movimentacoesNoMes: 0,
    });
  }

  /*
   * =====================================================
   * MOVIMENTOS DO MÊS
   * =====================================================
   */

  for (const movimento of movimentosMes) {
    const item =
      consolidado.get(
        movimento.generoId
      );

    if (!item) {
      continue;
    }

    const quantidade =
      movimento.quantidade;

    /*
     * Transferência muda somente o local físico.
     * Não é considerada movimentação de consumo
     * ou entrada no QDAA.
     */
    if (
      movimento.tipo !==
      'TRANSFERENCIA'
    ) {
      item.movimentacoesNoMes += 1;
    }

    switch (movimento.tipo) {
      case 'SALDO_INICIAL':
        item.saldoInicialLancado +=
          quantidade;
        break;

      case 'RECEBIMENTO':
        item.recebimentos +=
          quantidade;
        break;

      case 'SAIDA':
        item.consumo +=
          quantidade;
        break;

      case 'DEVOLUCAO':
        item.devolucoes +=
          quantidade;
        break;

      case 'PERDA':
        item.perdas +=
          quantidade;
        break;

      case 'CORRECAO':
        item.correcoes +=
          quantidade;
        break;
    }

    item.estoqueFinalCalculado +=
      impactoEstoque(
        movimento.tipo,
        quantidade
      );
  }

  const itens =
    Array.from(
      consolidado.values()
    );

  /*
   * =====================================================
   * TOTAIS POR UNIDADE
   * =====================================================
   *
   * Nunca somamos kg + L + un.
   */

  const totaisPorUnidade = new Map<
    string,
    {
      unidade: string;
      estoqueInicial: number;
      saldoInicialLancado: number;
      recebimentos: number;
      devolucoes: number;
      consumo: number;
      perdas: number;
      correcoes: number;
      estoqueFinalCalculado: number;
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

        estoqueInicial: 0,
        saldoInicialLancado: 0,
        recebimentos: 0,
        devolucoes: 0,
        consumo: 0,
        perdas: 0,
        correcoes: 0,
        estoqueFinalCalculado: 0,
      };

      totaisPorUnidade.set(
        item.unidade,
        total
      );
    }

    total.estoqueInicial +=
      item.estoqueInicial;

    total.saldoInicialLancado +=
      item.saldoInicialLancado;

    total.recebimentos +=
      item.recebimentos;

    total.devolucoes +=
      item.devolucoes;

    total.consumo +=
      item.consumo;

    total.perdas +=
      item.perdas;

    total.correcoes +=
      item.correcoes;

    total.estoqueFinalCalculado +=
      item.estoqueFinalCalculado;
  }

  /*
   * =====================================================
   * ESTATÍSTICAS
   * =====================================================
   */

  const generosComMovimento =
    itens.filter(
      (item) =>
        item.movimentacoesNoMes > 0
    ).length;

  const generosSemMovimento =
    itens.length -
    generosComMovimento;

  /*
   * =====================================================
   * RESPOSTA
   * =====================================================
   */

  return Response.json({
    relatorio:
      'APOIO_QDAA_QS',

    descricao:
      'Consolidação mensal de gêneros QS da cadeia de suprimento.',

    periodo: {
      ano,
      mes,

      inicio:
        inicio
          .toISOString()
          .slice(0, 10),

      fim: new Date(
        fimExclusivo.getTime() - 1
      )
        .toISOString()
        .slice(0, 10),
    },

    classe: 'QS',

    estatisticas: {
      generosCadastrados:
        itens.length,

      generosComMovimento,

      generosSemMovimento,
    },

    itens,

    totaisPorUnidade:
      Array.from(
        totaisPorUnidade.values()
      ),

    formula: {
      descricao:
        'Estoque final = estoque inicial + saldo inicial lançado no período + recebimentos + devoluções - consumo - perdas ± correções.',
    },

    criterioDatas: {
      recebimentos:
        'Data operacional do recebimento.',

      saidas:
        'Data operacional da saída.',

      demaisMovimentos:
        'Data do lançamento enquanto não houver data operacional específica.',
    },

    observacoes: [
      'Somente gêneros classificados como QS são considerados.',
      'Gêneros QR não participam desta consolidação.',
      'Recebimentos são apropriados ao mês pela data operacional do recebimento.',
      'Saídas são apropriadas ao mês pela data operacional da saída.',
      'Saídas canceladas não são consideradas consumo.',
      'Transferências entre locais não alteram o estoque total do gênero.',
      'Correções positivas acrescentam estoque e correções negativas reduzem estoque.',
      'Os totais são separados por unidade de medida para evitar soma entre kg, litros e unidades.',
      'O relatório serve como apoio à conferência e elaboração do QDAA.',
    ],
  });
}

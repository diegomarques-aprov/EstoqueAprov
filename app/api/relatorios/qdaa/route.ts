import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function inicioDoMes(ano: number, mes: number) {
  return new Date(
    `${ano}-${String(mes).padStart(2, '0')}-01T00:00:00.000Z`
  );
}

function inicioDoMesSeguinte(ano: number, mes: number) {
  if (mes === 12) {
    return new Date(`${ano + 1}-01-01T00:00:00.000Z`);
  }

  return new Date(
    `${ano}-${String(mes + 1).padStart(2, '0')}-01T00:00:00.000Z`
  );
}

function numero(valor: unknown) {
  return Number(valor || 0);
}

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
  const fimExclusivo = inicioDoMesSeguinte(
    ano,
    mes
  );

  /*
   * Gêneros QS cadastrados.
   *
   * O QDAA trabalha exclusivamente com gêneros
   * provenientes da cadeia de suprimento.
   */
  const generos = await prisma.genero.findMany({
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
   * Todo o histórico QS anterior ao mês.
   *
   * É esse histórico que permite reconstruir o
   * estoque existente na abertura do período.
   */
  const movimentosAnteriores =
    await prisma.movimentacaoEstoque.findMany({
      where: {
        classe: 'QS',
        criadoEm: {
          lt: inicio,
        },
      },
      select: {
        generoId: true,
        tipo: true,
        quantidade: true,
      },
    });

  /*
   * Movimentações QS ocorridas dentro do mês.
   */
  const movimentosMes =
    await prisma.movimentacaoEstoque.findMany({
      where: {
        classe: 'QS',
        criadoEm: {
          gte: inicio,
          lt: fimExclusivo,
        },
      },
      select: {
        id: true,
        generoId: true,
        tipo: true,
        quantidade: true,
        criadoEm: true,
        referenciaTipo: true,
        referenciaId: true,
        observacao: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    });

  /*
   * Estoque físico atualmente registrado.
   *
   * Serve para conferência. O estoque final do
   * mês histórico é reconstruído pelas
   * movimentações, e não pelo saldo atual.
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
      ) || 0) + numero(item.quantidade)
    );
  }

  /*
   * Regra de impacto físico das movimentações.
   *
   * TRANSFERENCIA não altera o total do gênero,
   * apenas muda sua localização.
   *
   * CORRECAO depende do sinal registrado no
   * movimento. Portanto o valor é preservado.
   */
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
        return quantidade;

      case 'TRANSFERENCIA':
        return 0;

      default:
        return 0;
    }
  }

  /*
   * Reconstrução do estoque na abertura do mês.
   */
  const estoqueInicialPorGenero =
    new Map<string, number>();

  for (const movimento of movimentosAnteriores) {
    const atual =
      estoqueInicialPorGenero.get(
        movimento.generoId
      ) || 0;

    const impacto = impactoEstoque(
      movimento.tipo,
      numero(movimento.quantidade)
    );

    estoqueInicialPorGenero.set(
      movimento.generoId,
      atual + impacto
    );
  }

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
   * Consolidação das movimentações do mês,
   * gênero por gênero.
   */
  for (const movimento of movimentosMes) {
    const item = consolidado.get(
      movimento.generoId
    );

    if (!item) {
      continue;
    }

    const quantidade = numero(
      movimento.quantidade
    );

    item.movimentacoesNoMes += 1;

    switch (movimento.tipo) {
      case 'SALDO_INICIAL':
        item.saldoInicialLancado +=
          quantidade;
        break;

      case 'RECEBIMENTO':
        item.recebimentos += quantidade;
        break;

      case 'SAIDA':
        item.consumo += quantidade;
        break;

      case 'DEVOLUCAO':
        item.devolucoes += quantidade;
        break;

      case 'PERDA':
        item.perdas += quantidade;
        break;

      case 'CORRECAO':
        item.correcoes += quantidade;
        break;
    }

    item.estoqueFinalCalculado +=
      impactoEstoque(
        movimento.tipo,
        quantidade
      );
  }

  const itens = Array.from(
    consolidado.values()
  );

  /*
   * Não somamos gêneros de unidades diferentes.
   *
   * Os totais são agrupados por unidade de
   * medida: kg com kg, L com L, un com un.
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
    let total = totaisPorUnidade.get(
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
   * Estatísticas úteis para validação do
   * fechamento mensal.
   */
  const generosComMovimento = itens.filter(
    (item) => item.movimentacoesNoMes > 0
  ).length;

  const generosSemMovimento =
    itens.length - generosComMovimento;

  return Response.json({
    relatorio:
      'APOIO_QDAA_QS',

    descricao:
      'Consolidação mensal de gêneros QS da cadeia de suprimento.',

    periodo: {
      ano,
      mes,
      inicio:
        inicio.toISOString().slice(0, 10),
      fim: new Date(
        fimExclusivo.getTime() - 1
      )
        .toISOString()
        .slice(0, 10),
    },

    classe: 'QS',

    estatisticas: {
      generosCadastrados: itens.length,
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

    observacoes: [
      'Somente gêneros classificados como QS são considerados.',
      'Gêneros QR não participam desta consolidação.',
      'Transferências entre locais não alteram o estoque total do gênero.',
      'Os totais são separados por unidade de medida para evitar soma entre kg, litros e unidades.',
      'O relatório serve como apoio à conferência e elaboração do QDAA.',
    ],
  });
}

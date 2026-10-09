import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function inicioDia(data: Date) {
  const d = new Date(data);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function adicionarMeses(data: Date, meses: number) {
  const d = new Date(data);
  d.setUTCMonth(d.getUTCMonth() + meses);
  return d;
}

function numero(valor: unknown) {
  return Number(valor || 0);
}

function arredondar(valor: number, casas = 3) {
  const fator = 10 ** casas;
  return Math.round((valor + Number.EPSILON) * fator) / fator;
}

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

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q = new URL(req.url).searchParams;

  /*
   * Por enquanto:
   *
   * - histórico padrão: últimos 2 meses;
   * - ciclo projetado: 2 meses;
   * - segurança padrão: 10%.
   *
   * Os três parâmetros podem ser alterados
   * pela futura interface.
   */
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
   * O cálculo considera o momento atual como
   * data-base da previsão.
   */
  const agora = new Date();

  const fimHistorico = inicioDia(agora);

  /*
   * Exemplo:
   * histórico = 2 meses.
   *
   * Se estivermos em outubro, buscamos desde
   * aproximadamente o mesmo ponto de agosto
   * até a data atual.
   */
  const inicioHistorico = adicionarMeses(
    fimHistorico,
    -mesesHistorico
  );

  /*
   * Gêneros cadastrados como QS.
   */
  const generos = await prisma.genero.findMany({
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
   * Consumo QS do período histórico.
   *
   * Para previsão de ressuprimento, somente
   * SAÍDAS são consideradas consumo.
   */
  const consumos =
    await prisma.movimentacaoEstoque.findMany({
      where: {
        classe: 'QS',
        tipo: 'SAIDA',

        criadoEm: {
          gte: inicioHistorico,
          lte: agora,
        },
      },

      select: {
        generoId: true,
        quantidade: true,
      },
    });

  /*
   * Estoque físico atual QS.
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
   * Quantidade consumida por gênero durante
   * o período histórico.
   */
  const consumoPorGenero =
    new Map<string, number>();

  for (const movimento of consumos) {
    consumoPorGenero.set(
      movimento.generoId,

      (consumoPorGenero.get(
        movimento.generoId
      ) || 0) +
        numero(movimento.quantidade)
    );
  }

  /*
   * Saldo físico disponível atualmente.
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
   * Verificação complementar do histórico
   * completo do estoque.
   *
   * Não usamos esse valor como saldo principal,
   * porque EstoqueLocal representa o saldo
   * físico corrente do sistema.
   */
  const movimentosAteAgora =
    await prisma.movimentacaoEstoque.findMany({
      where: {
        classe: 'QS',
        criadoEm: {
          lte: agora,
        },
      },

      select: {
        generoId: true,
        tipo: true,
        quantidade: true,
      },
    });

  const saldoHistorico =
    new Map<string, number>();

  for (const movimento of movimentosAteAgora) {
    const atual =
      saldoHistorico.get(
        movimento.generoId
      ) || 0;

    saldoHistorico.set(
      movimento.generoId,

      atual +
        impactoEstoque(
          movimento.tipo,
          numero(movimento.quantidade)
        )
    );
  }

  const itens = generos.map((genero) => {
    const consumoHistorico =
      consumoPorGenero.get(genero.id) || 0;

    /*
     * Média mensal observada.
     */
    const mediaMensal =
      consumoHistorico / mesesHistorico;

    /*
     * Projeção para todo o próximo ciclo.
     *
     * Por padrão, dois meses.
     */
    const consumoProjetado =
      mediaMensal * mesesCiclo;

    /*
     * Reserva operacional.
     *
     * Por padrão, 10% sobre o consumo
     * projetado.
     */
    const estoqueSeguranca =
      consumoProjetado *
      (margemSeguranca / 100);

    const estoqueDisponivel =
      estoquePorGenero.get(genero.id) || 0;

    /*
     * Quantidade já prevista para receber.
     *
     * Nesta primeira versão consultiva ainda
     * não temos uma entidade específica de
     * pedido QS futuro.
     *
     * Portanto fica zero até criarmos o módulo
     * de planejamento/solicitação.
     */
    const previstoReceber = 0;

    /*
     * Fórmula:
     *
     * necessidade =
     * consumo projetado
     * + segurança
     * - estoque disponível
     * - quantidade já prevista para receber
     */
    const necessidadeBruta =
      consumoProjetado +
      estoqueSeguranca -
      estoqueDisponivel -
      previstoReceber;

    /*
     * Nunca sugerimos quantidade negativa.
     */
    const quantidadeSugerida =
      Math.max(0, necessidadeBruta);

    const coberturaAtualMeses =
      mediaMensal > 0
        ? estoqueDisponivel / mediaMensal
        : null;

    return {
      generoId: genero.id,
      genero: genero.nome,
      unidade: genero.unidade.sigla,

      consumoHistorico:
        arredondar(consumoHistorico),

      mesesHistorico,

      mediaMensal:
        arredondar(mediaMensal),

      mesesCiclo,

      consumoProjetado:
        arredondar(consumoProjetado),

      margemSegurancaPercent:
        margemSeguranca,

      estoqueSeguranca:
        arredondar(estoqueSeguranca),

      estoqueDisponivel:
        arredondar(estoqueDisponivel),

      previstoReceber:
        arredondar(previstoReceber),

      necessidadeBruta:
        arredondar(necessidadeBruta),

      quantidadeSugerida:
        arredondar(quantidadeSugerida),

      coberturaAtualMeses:
        coberturaAtualMeses == null
          ? null
          : arredondar(
              coberturaAtualMeses,
              2
            ),

      saldoHistoricoCalculado:
        arredondar(
          saldoHistorico.get(
            genero.id
          ) || 0
        ),

      possuiHistoricoConsumo:
        consumoHistorico > 0,
    };
  });

  /*
   * Não criamos um "total geral solicitado",
   * porque não podemos somar kg + litros +
   * unidades.
   *
   * Consolidamos por unidade de medida.
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
      };

      totaisPorUnidade.set(
        item.unidade,
        total
      );
    }

    total.consumoHistorico +=
      item.consumoHistorico;

    total.consumoProjetado +=
      item.consumoProjetado;

    total.estoqueSeguranca +=
      item.estoqueSeguranca;

    total.estoqueDisponivel +=
      item.estoqueDisponivel;

    total.quantidadeSugerida +=
      item.quantidadeSugerida;
  }

  const totais = Array.from(
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
  }));

  const semHistorico =
    itens.filter(
      (item) =>
        !item.possuiHistoricoConsumo
    ).length;

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

      inicioHistorico:
        inicioHistorico
          .toISOString()
          .slice(0, 10),

      fimHistorico:
        agora
          .toISOString()
          .slice(0, 10),
    },

    estatisticas: {
      generosQS:
        itens.length,

      generosComHistorico:
        itens.length -
        semHistorico,

      generosSemHistorico:
        semHistorico,
    },

    formula: {
      expressao:
        'Consumo projetado + estoque de segurança - estoque disponível - quantidade prevista para receber',

      observacao:
        'Quando o resultado for negativo, a quantidade sugerida é zero.',
    },

    itens,

    totaisPorUnidade:
      totais,

    avisos: [
      'A quantidade sugerida é apoio à decisão e não constitui pedido automático à cadeia de suprimento.',
      'Gêneros sem histórico de consumo precisam de avaliação manual.',
      'Situações extraordinárias, missões, aumento de efetivo e outras necessidades operacionais devem ser consideradas pelo responsável.',
      'QR não participa deste cálculo.',
    ],
  });
}

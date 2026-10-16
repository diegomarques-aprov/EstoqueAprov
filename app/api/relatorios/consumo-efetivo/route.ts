import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Campo_Grande';

const REFEICOES = [
  'CAFE_DA_MANHA',
  'ALMOCO',
  'JANTAR',
  'CEIA',
] as const;

const nomesRefeicoes: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE: 'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

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

function dataLocalISO(data: Date) {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(data);

  const ano =
    partes.find(
      (parte) => parte.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (parte) => parte.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (parte) => parte.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function adicionarDias(
  data: string,
  dias: number
) {
  const base = new Date(
    `${data}T12:00:00.000Z`
  );

  base.setUTCDate(
    base.getUTCDate() + dias
  );

  return base
    .toISOString()
    .slice(0, 10);
}

function inicioDiaLocal(
  data: string
) {
  return new Date(
    `${data}T04:00:00.000Z`
  );
}

function fimDiaLocal(
  data: string
) {
  return new Date(
    `${data}T03:59:59.999Z`
  );
}

export async function GET(
  req: Request
) {
  const g =
    await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q =
    new URL(req.url)
      .searchParams;

  const hoje =
    dataLocalISO(
      new Date()
    );

  const inicio =
    q.get('inicio') ||
    adicionarDias(
      hoje,
      -30
    );

  const fim =
    q.get('fim') ||
    hoje;

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      inicio
    ) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(
      fim
    )
  ) {
    return Response.json(
      {
        error:
          'Informe o período no formato AAAA-MM-DD.',
      },
      {
        status: 400,
      }
    );
  }

  if (inicio > fim) {
    return Response.json(
      {
        error:
          'A data inicial não pode ser posterior à data final.',
      },
      {
        status: 400,
      }
    );
  }

  /*
   * Para o Serviço do dia seguinte,
   * precisamos consultar também as
   * saídas do dia anterior ao início
   * do período.
   *
   * Exemplo:
   *
   * alimentação: 17/10
   * saque principal: 16/10
   */
  const inicioSaidas =
    adicionarDias(
      inicio,
      -1
    );

  const [
    saidas,
    arranchamentos,
    devolucoes,
  ] = await Promise.all([
    prisma.saida.findMany({
      where: {
        classe: 'QS',

        canceladaEm: null,

        data: {
          gte:
            inicioDiaLocal(
              inicioSaidas
            ),

          lt:
            fimDiaLocal(
              adicionarDias(
                fim,
                1
              )
            ),
        },
      },

      include: {
        itens: {
          include: {
            genero: {
              include: {
                unidade: true,
                categoria: {
                  include: {
                    grupo: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: [
        {
          data: 'asc',
        },
        {
          numero: 'asc',
        },
      ],
    }),

    prisma.arranchamento.findMany({
      where: {
        data: {
          gte:
            inicioDiaLocal(
              inicio
            ),

          lt:
            fimDiaLocal(
              adicionarDias(
                fim,
                1
              )
            ),
        },

        refeicao: {
          in: [
            'CAFE_DA_MANHA',
            'ALMOCO',
            'JANTAR',
            'CEIA',
          ],
        },
      },

      orderBy: [
        {
          data: 'asc',
        },
        {
          refeicao: 'asc',
        },
      ],
    }),

    prisma.movimentacaoEstoque.findMany({
      where: {
        tipo: 'DEVOLUCAO',

        classe: 'QS',

        referenciaTipo:
          'DevolucaoSaida',

        criadoEm: {
          gte:
            inicioDiaLocal(
              inicioSaidas
            ),

          lt:
            fimDiaLocal(
              adicionarDias(
                fim,
                2
              )
            ),
        },
      },

      select: {
        generoId: true,
        quantidade: true,
        referenciaId: true,
      },
    }),
  ]);

  /*
   * =====================================================
   * EFETIVO REAL POR DIA
   * =====================================================
   */

  type EfetivoDia = {
    data: string;
    refeicoesFechadas: number;
    totalAtendido: number;
    completo: boolean;
    detalhes: Array<{
      refeicao: string;
      refeicaoNome: string;
      totalAtendido: number | null;
      fechada: boolean;
    }>;
  };

  const efetivoPorDia =
    new Map<
      string,
      EfetivoDia
    >();

  for (
    let data = inicio;
    data <= fim;
    data =
      adicionarDias(
        data,
        1
      )
  ) {
    efetivoPorDia.set(
      data,
      {
        data,
        refeicoesFechadas: 0,
        totalAtendido: 0,
        completo: false,
        detalhes: [],
      }
    );
  }

  for (
    const arranchamento of
      arranchamentos
  ) {
    const data =
      dataLocalISO(
        arranchamento.data
      );

    const dia =
      efetivoPorDia.get(
        data
      );

    if (!dia) {
      continue;
    }

    const fechada =
      Boolean(
        arranchamento
          .fechamentoRealizadoEm
      );

    const totalAtendido =
      arranchamento
        .totalAtendido == null
        ? null
        : Number(
            arranchamento
              .totalAtendido
          );

    if (
      fechada &&
      totalAtendido != null
    ) {
      dia.refeicoesFechadas +=
        1;

      dia.totalAtendido +=
        totalAtendido;
    }

    dia.detalhes.push({
      refeicao:
        arranchamento.refeicao,

      refeicaoNome:
        nomesRefeicoes[
          arranchamento.refeicao
        ] ||
        arranchamento.refeicao,

      totalAtendido,

      fechada,
    });
  }

  for (
    const dia of
      efetivoPorDia.values()
  ) {
    /*
     * Consideramos o dia completo
     * quando as quatro refeições
     * principais possuem fechamento.
     */
    dia.completo =
      REFEICOES.every(
        (refeicao) =>
          dia.detalhes.some(
            (item) =>
              item.refeicao ===
                refeicao &&
              item.fechada
          )
      );
  }

  /*
   * =====================================================
   * DEVOLUÇÕES POR SAÍDA E GÊNERO
   * =====================================================
   */

  const devolvidoPorSaidaGenero =
    new Map<string, number>();

  for (
    const devolucao of
      devolucoes
  ) {
    if (
      !devolucao.referenciaId
    ) {
      continue;
    }

    const chave =
      `${devolucao.referenciaId}:` +
      `${devolucao.generoId}`;

    devolvidoPorSaidaGenero.set(
      chave,

      (
        devolvidoPorSaidaGenero.get(
          chave
        ) || 0
      ) +
        numero(
          devolucao.quantidade
        )
    );
  }

  /*
   * =====================================================
   * CONSUMO RELACIONADO
   * =====================================================
   *
   * SERVICO_DIA_SEGUINTE:
   * saída operacional do dia anterior,
   * relacionada ao efetivo do dia seguinte.
   *
   * CAFE / ALMOCO / JANTAR / CEIA:
   * saída complementar relacionada
   * diretamente àquela refeição.
   */

  const registros: Array<{
    saidaId: string;
    numeroSaida: number;
    dataSaque: string;
    dataAlimentacao: string;
    tipo: 'PRINCIPAL' | 'COMPLEMENTAR';
    destino: string;
    destinoNome: string;
    generoId: string;
    genero: string;
    grupo: string;
    categoria: string;
    unidade: string;
    quantidadeSaida: number;
    quantidadeDevolvida: number;
    quantidadeLiquida: number;
    totalAtendido: number | null;
    consumoPorAtendimento: number | null;
    efetivoFechado: boolean;
  }> = [];

  for (const saida of saidas) {
    const dataSaque =
      dataLocalISO(
        saida.data
      );

    let dataAlimentacao =
      dataSaque;

    let tipo:
      | 'PRINCIPAL'
      | 'COMPLEMENTAR';

    if (
      saida.destino ===
      'SERVICO_DIA_SEGUINTE'
    ) {
      dataAlimentacao =
        adicionarDias(
          dataSaque,
          1
        );

      tipo = 'PRINCIPAL';
    } else if (
      REFEICOES.includes(
        saida.destino as
          (typeof REFEICOES)[number]
      )
    ) {
      tipo =
        'COMPLEMENTAR';
    } else {
      /*
       * OUTRO não entra no cálculo
       * de consumo por atendimento,
       * pois não sabemos a qual
       * alimentação pertence.
       */
      continue;
    }

    if (
      dataAlimentacao <
        inicio ||
      dataAlimentacao >
        fim
    ) {
      continue;
    }

    const efetivoDia =
      efetivoPorDia.get(
        dataAlimentacao
      );

    for (
      const item of
        saida.itens
    ) {
      const chaveDevolucao =
        `${saida.id}:` +
        `${item.generoId}`;

      const quantidadeSaida =
        numero(
          item.quantidade
        );

      const quantidadeDevolvida =
        devolvidoPorSaidaGenero.get(
          chaveDevolucao
        ) || 0;

      const quantidadeLiquida =
        Math.max(
          0,
          quantidadeSaida -
            quantidadeDevolvida
        );

      let totalAtendido:
        | number
        | null = null;

      let efetivoFechado =
        false;

      if (
        tipo === 'PRINCIPAL'
      ) {
        /*
         * O saque principal atende o
         * conjunto das refeições do dia.
         */
        if (
          efetivoDia?.completo
        ) {
          totalAtendido =
            efetivoDia.totalAtendido;

          efetivoFechado =
            true;
        }
      } else {
        /*
         * Saque complementar:
         * utiliza apenas o efetivo da
         * refeição correspondente.
         */
        const refeicao =
          efetivoDia
            ?.detalhes.find(
              (registro) =>
                registro.refeicao ===
                saida.destino
            );

        if (
          refeicao?.fechada &&
          refeicao.totalAtendido !=
            null
        ) {
          totalAtendido =
            refeicao.totalAtendido;

          efetivoFechado =
            true;
        }
      }

      const consumoPorAtendimento =
        totalAtendido != null &&
        totalAtendido > 0
          ? quantidadeLiquida /
            totalAtendido
          : null;

      registros.push({
        saidaId:
          saida.id,

        numeroSaida:
          saida.numero,

        dataSaque,

        dataAlimentacao,

        tipo,

        destino:
          saida.destino,

        destinoNome:
          nomesRefeicoes[
            saida.destino
          ] ||
          saida.destino,

        generoId:
          item.generoId,

        genero:
          item.genero.nome,

        grupo:
          item.genero
            .categoria
            ?.grupo
            ?.nome ||
          'Sem grupo',

        categoria:
          item.genero
            .categoria
            ?.nome ||
          'Sem categoria',

        unidade:
          item.genero
            .unidade.sigla,

        quantidadeSaida:
          arredondar(
            quantidadeSaida
          ),

        quantidadeDevolvida:
          arredondar(
            quantidadeDevolvida
          ),

        quantidadeLiquida:
          arredondar(
            quantidadeLiquida
          ),

        totalAtendido,

        consumoPorAtendimento:
          consumoPorAtendimento ==
          null
            ? null
            : arredondar(
                consumoPorAtendimento,
                6
              ),

        efetivoFechado,
      });
    }
  }

  /*
   * =====================================================
   * CONSOLIDAÇÃO POR GÊNERO
   * =====================================================
   *
   * Aqui NÃO fazemos média simples
   * das médias diárias.
   *
   * Somamos consumo e atendimentos
   * para evitar distorção estatística.
   */

  const consolidado =
    new Map<
      string,
      {
        generoId: string;
        genero: string;
        grupo: string;
        categoria: string;
        unidade: string;
        quantidadeLiquida: number;
        atendimentosRelacionados: number;
        registrosValidos: number;
      }
    >();

  for (
    const registro of
      registros
  ) {
    if (
      !registro.efetivoFechado ||
      registro.totalAtendido ==
        null ||
      registro.totalAtendido <= 0
    ) {
      continue;
    }

    let item =
      consolidado.get(
        registro.generoId
      );

    if (!item) {
      item = {
        generoId:
          registro.generoId,

        genero:
          registro.genero,

        grupo:
          registro.grupo,

        categoria:
          registro.categoria,

        unidade:
          registro.unidade,

        quantidadeLiquida: 0,

        atendimentosRelacionados: 0,

        registrosValidos: 0,
      };

      consolidado.set(
        registro.generoId,
        item
      );
    }

    item.quantidadeLiquida +=
      registro.quantidadeLiquida;

    item.atendimentosRelacionados +=
      registro.totalAtendido;

    item.registrosValidos += 1;
  }

  const consumoPorGenero =
    Array.from(
      consolidado.values()
    )
      .map((item) => ({
        ...item,

        quantidadeLiquida:
          arredondar(
            item.quantidadeLiquida
          ),

        consumoMedioPorAtendimento:
          item.atendimentosRelacionados >
          0
            ? arredondar(
                item.quantidadeLiquida /
                  item.atendimentosRelacionados,
                6
              )
            : null,
      }))
      .sort((a, b) =>
        a.genero.localeCompare(
          b.genero,
          'pt-BR'
        )
      );

  /*
   * =====================================================
   * RESUMO DOS DIAS
   * =====================================================
   */

  const dias =
    Array.from(
      efetivoPorDia.values()
    ).map((dia) => ({
      data: dia.data,

      refeicoesFechadas:
        dia.refeicoesFechadas,

      totalAtendido:
        dia.totalAtendido,

      completo:
        dia.completo,

      detalhes:
        dia.detalhes,
    }));

  const diasCompletos =
    dias.filter(
      (dia) => dia.completo
    ).length;

  const registrosSemEfetivo =
    registros.filter(
      (item) =>
        !item.efetivoFechado
    ).length;

  return Response.json({
    relatorio:
      'CONSUMO_POR_EFETIVO',

    periodo: {
      inicio,
      fim,
    },

    criterio: {
      saquePrincipal:
        'SERVICO_DIA_SEGUINTE',

      regraSaquePrincipal:
        'O saque principal realizado no dia anterior é relacionado à soma dos atendimentos de Café da manhã, Almoço, Jantar e Ceia do dia seguinte.',

      saquesComplementares: [
        'CAFE_DA_MANHA',
        'ALMOCO',
        'JANTAR',
        'CEIA',
      ],

      regraComplementar:
        'O saque complementar é relacionado somente ao efetivo atendido da refeição correspondente.',

      devolucoes:
        'As devoluções registradas para a saída são abatidas da quantidade utilizada na análise.',

      observacao:
        'A análise representa consumo operacional relacionado ao efetivo. Ela não substitui a conferência física nem a decisão administrativa do Aprovisionamento.',
    },

    resumo: {
      diasAnalisados:
        dias.length,

      diasCompletos,

      diasIncompletos:
        dias.length -
        diasCompletos,

      registrosRelacionados:
        registros.length,

      registrosSemEfetivoFechado:
        registrosSemEfetivo,
    },

    dias,

    registros,

    consumoPorGenero,
  });
}

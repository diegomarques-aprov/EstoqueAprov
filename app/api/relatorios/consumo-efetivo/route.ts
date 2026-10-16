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
      (parte) =>
        parte.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (parte) =>
        parte.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (parte) =>
        parte.type === 'day'
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
   * O Serviço do dia seguinte é
   * retirado fisicamente no dia
   * anterior.
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
   *
   * IMPORTANTE:
   *
   * Não exigimos mais obrigatoriamente
   * Café + Almoço + Jantar + Ceia.
   *
   * Um dia é considerado fechado quando
   * existe pelo menos uma refeição
   * cadastrada para aquele dia e TODAS
   * as refeições cadastradas estão
   * fechadas.
   *
   * Assim:
   *
   * 1 refeição realizada e fechada = dia fechado
   * 2 refeições realizadas e fechadas = dia fechado
   * 4 refeições realizadas e fechadas = dia fechado
   *
   * Se existir refeição cadastrada ainda
   * sem fechamento, o dia permanece
   * pendente.
   */

  type EfetivoDia = {
    data: string;

    refeicoesPrevistas: number;

    refeicoesFechadas: number;

    totalAtendido: number;

    completo: boolean;

    detalhes: Array<{
      refeicao: string;
      refeicaoNome: string;

      totalAtendido:
        | number
        | null;

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

        refeicoesPrevistas: 0,

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

    /*
     * A existência do registro de
     * Arranchamento representa uma
     * refeição prevista/realizada
     * naquele dia.
     */
    dia.refeicoesPrevistas +=
      1;

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

  /*
   * O dia fica completo quando:
   *
   * - existe ao menos uma refeição;
   * - todas as refeições cadastradas
   *   para aquele dia foram fechadas.
   */
  for (
    const dia of
      efetivoPorDia.values()
  ) {
    dia.completo =
      dia.refeicoesPrevistas >
        0 &&
      dia.refeicoesFechadas ===
        dia.refeicoesPrevistas;
  }

  /*
   * =====================================================
   * DEVOLUÇÕES
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
   * REGISTROS INDIVIDUAIS
   * =====================================================
   */

  type Registro = {
    saidaId: string;

    numeroSaida: number;

    dataSaque: string;

    dataAlimentacao: string;

    tipo:
      | 'PRINCIPAL'
      | 'COMPLEMENTAR';

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

    totalAtendido:
      | number
      | null;

    consumoPorAtendimento:
      | number
      | null;

    efetivoFechado: boolean;
  };

  const registros:
    Registro[] = [];

  for (
    const saida of
      saidas
  ) {
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

      tipo =
        'PRINCIPAL';
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
       * OUTRO não entra no consumo
       * por efetivo porque não existe
       * relação segura com uma
       * refeição.
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

      /*
       * Se não houve devolução,
       * será zero.
       */
      const quantidadeDevolvida =
        devolvidoPorSaidaGenero.get(
          chaveDevolucao
        ) || 0;

      /*
       * Consumo líquido:
       *
       * saída - devolução
       */
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

      /*
       * =========================================
       * SAQUE PRINCIPAL
       * =========================================
       *
       * Serviço do dia seguinte:
       * utiliza a soma das refeições
       * realizadas e fechadas daquele dia.
       */
      if (
        tipo === 'PRINCIPAL'
      ) {
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
         * =======================================
         * SAQUE COMPLEMENTAR
         * =======================================
         *
         * Utiliza somente o efetivo da
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
   * CONSUMO POR GÊNERO + DIA
   * =====================================================
   *
   * Principal + complementações
   * - devoluções, quando houver.
   *
   * O efetivo daquele serviço entra
   * somente uma vez para o gênero.
   */

  type ConsumoDiaGenero = {
    generoId: string;

    genero: string;

    grupo: string;

    categoria: string;

    unidade: string;

    dataAlimentacao: string;

    quantidadeLiquida: number;

    totalAtendido:
      | number
      | null;

    efetivoFechado: boolean;
  };

  const consumoPorDiaGenero =
    new Map<
      string,
      ConsumoDiaGenero
    >();

  for (
    const registro of
      registros
  ) {
    const chave =
      `${registro.dataAlimentacao}:` +
      `${registro.generoId}`;

    let item =
      consumoPorDiaGenero.get(
        chave
      );

    if (!item) {
      const efetivoDia =
        efetivoPorDia.get(
          registro.dataAlimentacao
        );

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

        dataAlimentacao:
          registro.dataAlimentacao,

        quantidadeLiquida: 0,

        totalAtendido:
          efetivoDia?.completo
            ? efetivoDia.totalAtendido
            : null,

        efetivoFechado:
          Boolean(
            efetivoDia?.completo
          ),
      };

      consumoPorDiaGenero.set(
        chave,
        item
      );
    }

    /*
     * Soma principal e
     * complementações.
     *
     * As devoluções já foram
     * descontadas anteriormente.
     */
    item.quantidadeLiquida +=
      registro.quantidadeLiquida;
  }

  /*
   * =====================================================
   * CONSOLIDAÇÃO HISTÓRICA POR GÊNERO
   * =====================================================
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

        atendimentosRelacionados:
          number;

        registrosValidos: number;
      }
    >();

  for (
    const registro of
      consumoPorDiaGenero.values()
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

        atendimentosRelacionados:
          0,

        registrosValidos: 0,
      };

      consolidado.set(
        registro.generoId,
        item
      );
    }

    item.quantidadeLiquida +=
      registro.quantidadeLiquida;

    /*
     * Uma vez por gênero por
     * serviço/dia.
     */
    item.atendimentosRelacionados +=
      registro.totalAtendido;

    item.registrosValidos +=
      1;
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
      data:
        dia.data,

      refeicoesPrevistas:
        dia.refeicoesPrevistas,

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
      (dia) =>
        dia.completo
    ).length;

  const diasComMovimento =
    dias.filter(
      (dia) =>
        dia.refeicoesPrevistas >
        0
    ).length;

  const diasPendentes =
    dias.filter(
      (dia) =>
        dia.refeicoesPrevistas >
          0 &&
        !dia.completo
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
        'O saque principal realizado no dia anterior é relacionado à soma dos atendimentos das refeições efetivamente registradas e fechadas no dia seguinte.',

      regraFechamento:
        'O dia é considerado fechado quando existe ao menos uma refeição cadastrada e todas as refeições cadastradas para aquele dia possuem fechamento.',

      saquesComplementares: [
        'CAFE_DA_MANHA',
        'ALMOCO',
        'JANTAR',
        'CEIA',
      ],

      regraComplementar:
        'Os saques complementares são somados ao consumo do gênero no respectivo dia de alimentação.',

      devolucoes:
        'Quando houver devolução registrada, a quantidade devolvida é abatida do consumo.',

      consolidacao:
        'Para cada gênero e dia de alimentação, o consumo líquido dos saques é somado e o efetivo do serviço é contabilizado uma única vez.',

      observacao:
        'A análise representa consumo operacional relacionado ao efetivo. Ela não substitui a conferência física nem a decisão administrativa do Aprovisionamento.',
    },

    resumo: {
      diasAnalisados:
        dias.length,

      diasComMovimento,

      diasCompletos,

      diasPendentes,

      /*
       * Mantido para compatibilidade
       * com o componente atual.
       */
      diasIncompletos:
        diasPendentes,

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

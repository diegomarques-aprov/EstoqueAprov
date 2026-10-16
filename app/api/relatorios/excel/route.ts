import {
  ClasseOperacao,
  DestinoSaida,
} from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE = 'America/Campo_Grande';

const nomesRefeicao: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE:
    'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

function inicioDiaLocal(data: string) {
  return new Date(
    `${data.slice(0, 10)}T04:00:00.000Z`
  );
}

function fimDiaLocal(data: string) {
  const inicio = inicioDiaLocal(data);

  return new Date(
    inicio.getTime() +
      24 * 60 * 60 * 1000 -
      1
  );
}

function hojeLocal() {
  const partes =
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

  const ano =
    partes.find(
      (p) => p.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (p) => p.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (p) => p.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function dataLocalISO(data: Date) {
  const partes =
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(data);

  const ano =
    partes.find(
      (p) => p.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (p) => p.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (p) => p.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function formatarData(
  data: Date | string
) {
  const valor =
    typeof data === 'string'
      ? data.slice(0, 10)
      : dataLocalISO(data);

  const [ano, mes, dia] =
    valor.split('-');

  if (!ano || !mes || !dia) {
    return valor;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(
  data: Date | string
) {
  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  ).format(new Date(data));
}

function referenciaDestino(
  destino: DestinoSaida
) {
  return destino ===
    DestinoSaida.SERVICO_DIA_SEGUINTE
    ? 'dia seguinte'
    : 'mesmo dia';
}

function opcaoAtiva(
  parametros: URLSearchParams,
  nome: string
) {
  const valor =
    parametros.get(nome);

  if (valor === null) {
    return true;
  }

  return (
    valor === '1' ||
    valor === 'true'
  );
}

function ajustarColunas(
  planilha: ExcelJS.Worksheet,
  larguras: number[]
) {
  larguras.forEach(
    (largura, indice) => {
      planilha.getColumn(
        indice + 1
      ).width = largura;
    }
  );
}

function formatarCabecalho(
  linha: ExcelJS.Row
) {
  linha.font = {
    bold: true,
  };

  linha.alignment = {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true,
  };
}

function prepararPlanilha(
  planilha: ExcelJS.Worksheet
) {
  planilha.eachRow(
    (linha) => {
      linha.alignment = {
        ...linha.alignment,
        vertical: 'middle',
        wrapText: true,
      };
    }
  );
}

export async function GET(
  req: Request
) {
  const guard =
    await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const parametros =
    new URL(
      req.url
    ).searchParams;

  const hoje = hojeLocal();

  const inicio =
    parametros.get('inicio') ||
    hoje;

  const fim =
    parametros.get('fim') ||
    inicio;

  const classeParametro =
    parametros.get('classe');

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

  if (
    classeParametro &&
    ![
      'TODOS',
      'QS',
      'QR',
    ].includes(
      classeParametro
    )
  ) {
    return Response.json(
      {
        error:
          'Classe inválida para o relatório.',
      },
      {
        status: 400,
      }
    );
  }

  const classe:
    | ClasseOperacao
    | null =
    classeParametro === 'QS' ||
    classeParametro === 'QR'
      ? classeParametro
      : null;

  const incluirEfetivo =
    opcaoAtiva(
      parametros,
      'efetivo'
    );

  const incluirRefeicoes =
    opcaoAtiva(
      parametros,
      'refeicoes'
    );

  const incluirEntradas =
    opcaoAtiva(
      parametros,
      'entradas'
    );

  const incluirSaidas =
    opcaoAtiva(
      parametros,
      'saidas'
    );

  const incluirDevolucoes =
    opcaoAtiva(
      parametros,
      'devolucoes'
    );

  const incluirEstoque =
    opcaoAtiva(
      parametros,
      'estoque'
    );

  const inicioPeriodo =
    inicioDiaLocal(inicio);

  const fimPeriodo =
    fimDiaLocal(fim);

  const [
    arranchamentos,
    movimentacoes,
    estoque,
    generosAtivos,
    saidasFisicas,
  ] = await Promise.all([
    prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioPeriodo,
          lte: fimPeriodo,
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
        criadoEm: {
          gte: inicioPeriodo,
          lte: fimPeriodo,
        },

        ...(classe
          ? { classe }
          : {}),
      },

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

        lote: true,
        localOrigem: true,
        localDestino: true,
      },

      orderBy: {
        criadoEm: 'asc',
      },
    }),

    prisma.estoqueLocal.findMany({
      where: {
        genero: {
          situacao: 'ATIVO',

          ...(classe
            ? { classe }
            : {}),
        },
      },

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

        local: true,
        lote: true,
      },
    }),

    prisma.genero.findMany({
      where: {
        situacao: 'ATIVO',

        ...(classe
          ? { classe }
          : {}),
      },

      include: {
        unidade: true,

        categoria: {
          include: {
            grupo: true,
          },
        },
      },

      orderBy: {
        nome: 'asc',
      },
    }),

    prisma.saida.findMany({
      where: {
        criadoEm: {
          gte: inicioPeriodo,
          lte: fimPeriodo,
        },

        canceladaEm: null,

        ...(classe
          ? { classe }
          : {}),
      },

      select: {
        id: true,
        numero: true,
        destino: true,
        data: true,
        criadoEm: true,
        observacao: true,
      },

      orderBy: {
        criadoEm: 'asc',
      },
    }),
  ]);

  /*
   * MAPA DAS SAÍDAS
   *
   * Cada movimentação de saída possui
   * referenciaId apontando para Saida.id.
   *
   * Assim o Excel utiliza a finalidade
   * verdadeira da saída e não depende
   * mais do texto da observação.
   */
  const saidasPorId =
    new Map(
      saidasFisicas.map(
        (saida) => [
          saida.id,
          saida,
        ]
      )
    );

  /*
   * SALDO ATUAL POR GÊNERO
   */
  const saldoPorGenero =
    new Map<string, number>();

  for (const item of estoque) {
    saldoPorGenero.set(
      item.generoId,
      (saldoPorGenero.get(
        item.generoId
      ) || 0) +
        Number(
          item.quantidade
        )
    );
  }

  const posicaoEstoque =
    generosAtivos.map(
      (genero) => ({
        generoId:
          genero.id,

        nome:
          genero.nome,

        classe:
          genero.classe,

        unidade:
          genero.unidade.sigla,

        grupo:
          genero.categoria?.grupo
            ?.nome ||
          'Sem grupo',

        categoria:
          genero.categoria?.nome ||
          'Sem categoria',

        estoqueMinimo:
          genero.estoqueMinimo !=
          null
            ? Number(
                genero.estoqueMinimo
              )
            : null,

        quantidade:
          saldoPorGenero.get(
            genero.id
          ) || 0,
      })
    );

  /*
   * MOVIMENTAÇÕES
   */
  const movimentosDetalhados =
    movimentacoes.map(
      (item) => {
        const saidaRelacionada =
          item.tipo === 'SAIDA' &&
          item.referenciaTipo ===
            'Saida' &&
          item.referenciaId
            ? saidasPorId.get(
                item.referenciaId
              )
            : undefined;

        return {
          id:
            item.id,

          tipo:
            item.tipo,

          classe:
            item.classe,

          genero:
            item.genero.nome,

          grupo:
            item.genero.categoria
              ?.grupo?.nome ||
            'Sem grupo',

          categoria:
            item.genero.categoria
              ?.nome ||
            'Sem categoria',

          quantidade:
            Number(
              item.quantidade
            ),

          unidade:
            item.genero.unidade
              .sigla,

          dataHora:
            item.criadoEm,

          lote:
            item.lote?.numero ||
            null,

          localOrigem:
            item.localOrigem?.nome ||
            null,

          localDestino:
            item.localDestino?.nome ||
            null,

          observacao:
            item.observacao ||
            null,

          numeroSaida:
            saidaRelacionada
              ?.numero ??
            null,

          destino:
            saidaRelacionada
              ?.destino ??
            null,

          destinoNome:
            saidaRelacionada
              ? nomesRefeicao[
                  saidaRelacionada
                    .destino
                ] ||
                saidaRelacionada
                  .destino
              : null,

          referenciaServico:
            saidaRelacionada
              ? referenciaDestino(
                  saidaRelacionada
                    .destino
                )
              : null,

          dataOperacional:
            saidaRelacionada
              ? dataLocalISO(
                  saidaRelacionada
                    .data
                )
              : null,
        };
      }
    );

  const entradas =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo ===
        'RECEBIMENTO'
    );

  const saidas =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo ===
        'SAIDA'
    );

  const devolucoes =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo ===
        'DEVOLUCAO'
    );

  /*
   * REFEIÇÕES RELACIONADAS
   */
  const mapaRefeicoes =
    new Map<
      string,
      {
        data: string;
        destino: DestinoSaida;
        nome: string;
        referencia: string;
      }
    >();

  for (
    const saida of saidasFisicas
  ) {
    const data =
      dataLocalISO(
        saida.criadoEm
      );

    const chave =
      `${data}|${saida.destino}`;

    if (
      !mapaRefeicoes.has(
        chave
      )
    ) {
      mapaRefeicoes.set(
        chave,
        {
          data,

          destino:
            saida.destino,

          nome:
            nomesRefeicao[
              saida.destino
            ] ||
            saida.destino,

          referencia:
            referenciaDestino(
              saida.destino
            ),
        }
      );
    }
  }

  const refeicoesRelacionadas =
    Array.from(
      mapaRefeicoes.values()
    ).sort(
      (a, b) => {
        const data =
          a.data.localeCompare(
            b.data
          );

        if (data !== 0) {
          return data;
        }

        return a.nome.localeCompare(
          b.nome,
          'pt-BR'
        );
      }
    );

  /*
   * RESUMO DO EFETIVO
   */
  const resumoEfetivo = {
    refeicoes:
      arranchamentos.length,

    efetivoPrevisto:
      arranchamentos.reduce(
        (total, item) =>
          total +
          item.totalPrevisto,
        0
      ),

    efetivoAlimentado:
      arranchamentos.reduce(
        (total, item) =>
          total +
          Number(
            item
              .arranchadosCompareceram ??
              0
          ),
        0
      ),

    faltas:
      arranchamentos.reduce(
        (total, item) =>
          total +
          Number(
            item.faltas ?? 0
          ),
        0
      ),

    militaresDeFora:
      arranchamentos.reduce(
        (total, item) =>
          total +
          Number(
            item
              .naoArranchadosAtendidos ??
              0
          ),
        0
      ),

    totalAtendido:
      arranchamentos.reduce(
        (total, item) =>
          total +
          Number(
            item.totalAtendido ??
              0
          ),
        0
      ),

    sobraKg:
      arranchamentos.reduce(
        (total, item) =>
          total +
          Number(
            item.sobraKg ?? 0
          ),
        0
      ),
  };

  /*
   * ALERTAS
   */
  const estoqueBaixo =
    posicaoEstoque
      .filter(
        (item) =>
          item.estoqueMinimo !=
            null &&
          item.quantidade <
            item.estoqueMinimo
      )
      .map(
        (item) => ({
          ...item,

          zerado:
            item.quantidade <=
            0,
        })
      );

  const agora =
    new Date();

  const limiteValidade =
    new Date(
      agora.getTime() +
        30 *
          24 *
          60 *
          60 *
          1000
    );

  const validade =
    estoque
      .filter(
        (item) =>
          Number(
            item.quantidade
          ) > 0 &&
          item.lote?.validade &&
          item.lote.validade <=
            limiteValidade
      )
      .map(
        (item) => ({
          genero:
            item.genero.nome,

          lote:
            item.lote?.numero ||
            '',

          validade:
            item.lote
              ?.validade ||
            null,

          quantidade:
            Number(
              item.quantidade
            ),

          unidade:
            item.genero.unidade
              .sigla,

          vencido:
            Boolean(
              item.lote
                ?.validade &&
                item.lote
                  .validade <
                  agora
            ),
        })
      )
      .sort(
        (a, b) => {
          const dataA =
            a.validade
              ? new Date(
                  a.validade
                ).getTime()
              : 0;

          const dataB =
            b.validade
              ? new Date(
                  b.validade
                ).getTime()
              : 0;

          return dataA - dataB;
        }
      );

  /*
   * CRIAÇÃO DO EXCEL
   */
  const workbook =
    new ExcelJS.Workbook();

  workbook.creator =
    'EstoqueAprov';

  workbook.lastModifiedBy =
    'EstoqueAprov';

  workbook.created =
    new Date();

  workbook.modified =
    new Date();

  /*
   * RESUMO
   */
  const resumo =
    workbook.addWorksheet(
      'Resumo'
    );

  resumo.addRow([
    'EstoqueAprov — Relatório Operacional',
  ]);

  resumo.mergeCells(
    'A1:D1'
  );

  resumo.getCell(
    'A1'
  ).font = {
    bold: true,
    size: 16,
  };

  resumo.getCell(
    'A1'
  ).alignment = {
    horizontal: 'center',
  };

  resumo.addRow([]);

  resumo.addRow([
    'Período',
    `${formatarData(
      inicio
    )} a ${formatarData(
      fim
    )}`,
  ]);

  resumo.addRow([
    'Classe',
    classe
      ? classe
      : 'QS + QR',
  ]);

  resumo.addRow([
    'Relatório gerado em',
    formatarDataHora(
      new Date()
    ),
  ]);

  resumo.addRow([]);

  resumo.addRow([
    'Indicador',
    'Resultado',
  ]);

  formatarCabecalho(
    resumo.getRow(7)
  );

  if (incluirEfetivo) {
    resumo.addRow([
      'Refeições realizadas',
      resumoEfetivo.refeicoes,
    ]);

    resumo.addRow([
      'Efetivo previsto',
      resumoEfetivo.efetivoPrevisto,
    ]);

    resumo.addRow([
      'Efetivo alimentado',
      resumoEfetivo.efetivoAlimentado,
    ]);

    resumo.addRow([
      'Faltas',
      resumoEfetivo.faltas,
    ]);

    resumo.addRow([
      'Militares de fora',
      resumoEfetivo.militaresDeFora,
    ]);

    resumo.addRow([
      'Total de atendimentos',
      resumoEfetivo.totalAtendido,
    ]);

    resumo.addRow([
      'Sobras pesadas (kg)',
      resumoEfetivo.sobraKg,
    ]);
  }

  if (incluirRefeicoes) {
    resumo.addRow([
      'Refeições relacionadas',
      refeicoesRelacionadas.length,
    ]);
  }

  if (incluirEntradas) {
    resumo.addRow([
      'Registros de entrada',
      entradas.length,
    ]);
  }

  if (incluirSaidas) {
    resumo.addRow([
      'Registros de saída',
      saidas.length,
    ]);
  }

  if (incluirDevolucoes) {
    resumo.addRow([
      'Registros de devolução',
      devolucoes.length,
    ]);
  }

  if (incluirEstoque) {
    resumo.addRow([
      'Gêneros na posição de estoque',
      posicaoEstoque.length,
    ]);
  }

  resumo.addRow([
    'Alertas de estoque mínimo',
    estoqueBaixo.length,
  ]);

  resumo.addRow([
    'Alertas de validade',
    validade.length,
  ]);

  ajustarColunas(
    resumo,
    [
      34,
      32,
      18,
      18,
    ]
  );

  /*
   * EFETIVO POR REFEIÇÃO
   */
  if (incluirEfetivo) {
    const efetivo =
      workbook.addWorksheet(
        'Efetivo por refeição'
      );

    efetivo.addRow([
      'Data',
      'Refeição',
      'Efetivo previsto',
      'Efetivo alimentado',
      'Faltas',
      'Militares de fora',
      'Total atendido',
    ]);

    formatarCabecalho(
      efetivo.getRow(1)
    );

    for (
      const item of arranchamentos
    ) {
      efetivo.addRow([
        formatarData(
          item.data
        ),

        nomesRefeicao[
          item.refeicao
        ] ||
          item.refeicao,

        item.totalPrevisto,

        item
          .arranchadosCompareceram ??
          0,

        item.faltas ??
          0,

        item
          .naoArranchadosAtendidos ??
          0,

        item.totalAtendido ??
          0,
      ]);
    }

    efetivo.addRow([]);

    efetivo.addRow([
      'TOTAL',
      `${resumoEfetivo.refeicoes} refeição(ões)`,
      resumoEfetivo.efetivoPrevisto,
      resumoEfetivo.efetivoAlimentado,
      resumoEfetivo.faltas,
      resumoEfetivo.militaresDeFora,
      resumoEfetivo.totalAtendido,
    ]);

    efetivo.getRow(
      efetivo.rowCount
    ).font = {
      bold: true,
    };

    efetivo.addRow([]);

    efetivo.addRow([
      'Sobras',
      'Quantidade (kg)',
    ]);

    formatarCabecalho(
      efetivo.getRow(
        efetivo.rowCount
      )
    );

    for (
      const item of arranchamentos
    ) {
      if (
        item.sobraKg != null
      ) {
        efetivo.addRow([
          `${formatarData(
            item.data
          )} - ${
            nomesRefeicao[
              item.refeicao
            ] ||
            item.refeicao
          }`,

          Number(
            item.sobraKg
          ),
        ]);
      }
    }

    efetivo.addRow([
      'Sobra total no período',
      resumoEfetivo.sobraKg,
    ]);

    efetivo.getRow(
      efetivo.rowCount
    ).font = {
      bold: true,
    };

    ajustarColunas(
      efetivo,
      [
        15,
        27,
        18,
        20,
        12,
        20,
        18,
      ]
    );

    efetivo.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      efetivo
    );
  }

  /*
   * REFEIÇÕES RELACIONADAS
   */
  if (incluirRefeicoes) {
    const refeicoes =
      workbook.addWorksheet(
        'Refeições relacionadas'
      );

    refeicoes.addRow([
      'Data da saída',
      'Refeição / destino',
      'Referência',
    ]);

    formatarCabecalho(
      refeicoes.getRow(1)
    );

    for (
      const item of refeicoesRelacionadas
    ) {
      refeicoes.addRow([
        formatarData(
          item.data
        ),

        item.nome,

        item.referencia,
      ]);
    }

    ajustarColunas(
      refeicoes,
      [
        18,
        32,
        20,
      ]
    );

    refeicoes.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      refeicoes
    );
  }

  /*
   * ENTRADAS
   */
  if (incluirEntradas) {
    const planilhaEntradas =
      workbook.addWorksheet(
        'Entradas'
      );

    planilhaEntradas.addRow([
      'Data / hora',
      'Gênero',
      'Grupo',
      'Categoria',
      'Classe',
      'Quantidade',
      'Unidade',
      'Lote',
      'Local de destino',
      'Observação',
    ]);

    formatarCabecalho(
      planilhaEntradas.getRow(
        1
      )
    );

    for (
      const item of entradas
    ) {
      planilhaEntradas.addRow([
        formatarDataHora(
          item.dataHora
        ),

        item.genero,
        item.grupo,
        item.categoria,
        item.classe,
        item.quantidade,
        item.unidade,
        item.lote || '',
        item.localDestino || '',
        item.observacao || '',
      ]);
    }

    ajustarColunas(
      planilhaEntradas,
      [
        23,
        32,
        24,
        25,
        10,
        15,
        12,
        20,
        30,
        40,
      ]
    );

    planilhaEntradas.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      planilhaEntradas
    );
  }

  /*
   * SAÍDAS
   */
  if (incluirSaidas) {
    const planilhaSaidas =
      workbook.addWorksheet(
        'Saídas'
      );

    planilhaSaidas.addRow([
      'Data / hora',
      'Gênero',
      'Grupo',
      'Categoria',
      'Classe',
      'Quantidade',
      'Unidade',
      'Lote',
      'Local de origem',
      'Finalidade',
      'Referência',
      'Nº da saída',
    ]);

    formatarCabecalho(
      planilhaSaidas.getRow(
        1
      )
    );

    for (
      const item of saidas
    ) {
      planilhaSaidas.addRow([
        formatarDataHora(
          item.dataHora
        ),

        item.genero,
        item.grupo,
        item.categoria,
        item.classe,
        item.quantidade,
        item.unidade,
        item.lote || '',
        item.localOrigem || '',

        item.destinoNome ||
          '',

        item.referenciaServico ||
          '',

        item.numeroSaida ??
          '',
      ]);
    }

    ajustarColunas(
      planilhaSaidas,
      [
        23,
        32,
        24,
        25,
        10,
        15,
        12,
        20,
        30,
        30,
        18,
        15,
      ]
    );

    planilhaSaidas.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      planilhaSaidas
    );
  }

  /*
   * DEVOLUÇÕES
   */
  if (incluirDevolucoes) {
    const planilhaDevolucoes =
      workbook.addWorksheet(
        'Devoluções'
      );

    planilhaDevolucoes.addRow([
      'Data / hora',
      'Gênero',
      'Grupo',
      'Categoria',
      'Classe',
      'Quantidade',
      'Unidade',
      'Lote',
      'Local',
      'Observação',
    ]);

    formatarCabecalho(
      planilhaDevolucoes.getRow(
        1
      )
    );

    for (
      const item of devolucoes
    ) {
      planilhaDevolucoes.addRow([
        formatarDataHora(
          item.dataHora
        ),

        item.genero,
        item.grupo,
        item.categoria,
        item.classe,
        item.quantidade,
        item.unidade,
        item.lote || '',

        item.localDestino ||
          item.localOrigem ||
          '',

        item.observacao ||
          '',
      ]);
    }

    ajustarColunas(
      planilhaDevolucoes,
      [
        23,
        32,
        24,
        25,
        10,
        15,
        12,
        20,
        30,
        42,
      ]
    );

    planilhaDevolucoes.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      planilhaDevolucoes
    );
  }

  /*
   * POSIÇÃO DO ESTOQUE
   */
  if (incluirEstoque) {
    const planilhaEstoque =
      workbook.addWorksheet(
        'Posição do estoque'
      );

    planilhaEstoque.addRow([
      'Grupo',
      'Categoria',
      'Gênero',
      'Classe',
      'Quantidade',
      'Unidade',
      'Estoque mínimo',
      'Situação',
    ]);

    formatarCabecalho(
      planilhaEstoque.getRow(
        1
      )
    );

    const ordenado =
      [...posicaoEstoque].sort(
        (a, b) => {
          const grupo =
            a.grupo.localeCompare(
              b.grupo,
              'pt-BR'
            );

          if (grupo !== 0) {
            return grupo;
          }

          const categoria =
            a.categoria.localeCompare(
              b.categoria,
              'pt-BR'
            );

          if (
            categoria !==
            0
          ) {
            return categoria;
          }

          return a.nome.localeCompare(
            b.nome,
            'pt-BR'
          );
        }
      );

    let grupoAtual:
      | string
      | null = null;

    let categoriaAtual:
      | string
      | null = null;

    let itensCategoria:
      typeof posicaoEstoque =
      [];

    let itensGrupo:
      typeof posicaoEstoque =
      [];

    function adicionarSubtotalCategoria() {
      if (
        !categoriaAtual ||
        itensCategoria.length ===
          0
      ) {
        return;
      }

      const totais =
        new Map<
          string,
          number
        >();

      for (
        const item of itensCategoria
      ) {
        totais.set(
          item.unidade,

          (totais.get(
            item.unidade
          ) || 0) +
            item.quantidade
        );
      }

      for (
        const [
          unidade,
          total,
        ] of totais
      ) {
        const linha =
          planilhaEstoque.addRow([
            '',
            `Subtotal ${categoriaAtual}`,
            '',
            '',
            total,
            unidade,
            '',
            '',
          ]);

        linha.font = {
          bold: true,
        };
      }
    }

    function adicionarTotalGrupo() {
      if (
        !grupoAtual ||
        itensGrupo.length ===
          0
      ) {
        return;
      }

      const totais =
        new Map<
          string,
          number
        >();

      for (
        const item of itensGrupo
      ) {
        totais.set(
          item.unidade,

          (totais.get(
            item.unidade
          ) || 0) +
            item.quantidade
        );
      }

      for (
        const [
          unidade,
          total,
        ] of totais
      ) {
        const linha =
          planilhaEstoque.addRow([
            `Total ${grupoAtual}`,
            '',
            '',
            '',
            total,
            unidade,
            '',
            '',
          ]);

        linha.font = {
          bold: true,
        };
      }
    }

    for (
      const item of ordenado
    ) {
      if (
        grupoAtual !==
          null &&
        item.grupo !==
          grupoAtual
      ) {
        adicionarSubtotalCategoria();
        adicionarTotalGrupo();

        itensCategoria =
          [];

        itensGrupo =
          [];

        categoriaAtual =
          null;
      } else if (
        categoriaAtual !==
          null &&
        item.categoria !==
          categoriaAtual
      ) {
        adicionarSubtotalCategoria();

        itensCategoria =
          [];
      }

      grupoAtual =
        item.grupo;

      categoriaAtual =
        item.categoria;

      itensCategoria.push(
        item
      );

      itensGrupo.push(
        item
      );

      let situacao =
        'Normal';

      if (
        item.quantidade <=
        0
      ) {
        situacao =
          'Sem estoque';
      } else if (
        item.estoqueMinimo !=
          null &&
        item.quantidade <
          item.estoqueMinimo
      ) {
        situacao =
          'Abaixo do mínimo';
      }

      planilhaEstoque.addRow([
        item.grupo,
        item.categoria,
        item.nome,
        item.classe,
        item.quantidade,
        item.unidade,
        item.estoqueMinimo ??
          '',
        situacao,
      ]);
    }

    adicionarSubtotalCategoria();
    adicionarTotalGrupo();

    ajustarColunas(
      planilhaEstoque,
      [
        26,
        28,
        34,
        10,
        16,
        12,
        18,
        20,
      ]
    );

    planilhaEstoque.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    prepararPlanilha(
      planilhaEstoque
    );
  }

  /*
   * ALERTAS
   * SEMPRE INCLUÍDOS
   */
  const alertas =
    workbook.addWorksheet(
      'Alertas'
    );

  alertas.addRow([
    'Tipo de alerta',
    'Gênero',
    'Quantidade / saldo',
    'Unidade',
    'Estoque mínimo',
    'Lote',
    'Validade',
  ]);

  formatarCabecalho(
    alertas.getRow(1)
  );

  if (
    estoqueBaixo.length ===
      0 &&
    validade.length === 0
  ) {
    alertas.addRow([
      'Nenhum alerta',
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  } else {
    for (
      const item of estoqueBaixo
    ) {
      alertas.addRow([
        item.zerado
          ? 'ESTOQUE ZERADO'
          : 'ESTOQUE BAIXO',

        item.nome,

        item.quantidade,

        item.unidade,

        item.estoqueMinimo ??
          '',

        '',

        '',
      ]);
    }

    for (
      const item of validade
    ) {
      alertas.addRow([
        item.vencido
          ? 'LOTE VENCIDO'
          : 'VALIDADE PRÓXIMA',

        item.genero,

        item.quantidade,

        item.unidade,

        '',

        item.lote,

        item.validade
          ? formatarData(
              item.validade
            )
          : '',
      ]);
    }
  }

  ajustarColunas(
    alertas,
    [
      24,
      34,
      20,
      12,
      18,
      22,
      18,
    ]
  );

  alertas.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  prepararPlanilha(
    alertas
  );

  /*
   * FORMATAÇÃO DO RESUMO
   */
  prepararPlanilha(
    resumo
  );

  /*
   * GERAÇÃO DO ARQUIVO
   */
  const buffer =
    await workbook.xlsx.writeBuffer();

  const nomeArquivo =
    `EstoqueAprov_${inicio}_${fim}.xlsx`;

  return new Response(
    buffer as BodyInit,
    {
      status: 200,

      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

        'Content-Disposition':
          `attachment; filename="${nomeArquivo}"`,

        'Cache-Control':
          'no-store',
      },
    }
  );
}

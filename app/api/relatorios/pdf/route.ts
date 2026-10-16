import {
  ClasseOperacao,
  DestinoSaida,
} from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_ZONE =
  'America/Campo_Grande';

const nomesRefeicao: Record<
  string,
  string
> = {
  CAFE_DA_MANHA:
    'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE:
    'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

function inicioDiaLocal(
  data: string
) {
  return new Date(
    `${data.slice(
      0,
      10
    )}T04:00:00.000Z`
  );
}

function fimDiaLocal(
  data: string
) {
  const inicio =
    inicioDiaLocal(data);

  return new Date(
    inicio.getTime() +
      24 *
        60 *
        60 *
        1000 -
      1
  );
}

function hojeLocal() {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(
      new Date()
    );

  const ano =
    partes.find(
      (p) =>
        p.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (p) =>
        p.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (p) =>
        p.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function dataLocalISO(
  data: Date
) {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone:
          TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(
      data
    );

  const ano =
    partes.find(
      (p) =>
        p.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (p) =>
        p.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (p) =>
        p.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function formatarData(
  data: Date | string
) {
  const valor =
    typeof data ===
    'string'
      ? data.slice(
          0,
          10
        )
      : dataLocalISO(
          data
        );

  const [
    ano,
    mes,
    dia,
  ] =
    valor.split('-');

  if (
    !ano ||
    !mes ||
    !dia
  ) {
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
      timeZone:
        TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  ).format(
    new Date(data)
  );
}

function formatarNumero(
  valor: unknown
) {
  return Number(
    valor ?? 0
  ).toLocaleString(
    'pt-BR',
    {
      maximumFractionDigits:
        3,
    }
  );
}

function textoSeguro(
  valor: unknown
) {
  return String(
    valor ?? ''
  )
    .replace(
      /[–—]/g,
      '-'
    )
    .replace(
      /[“”]/g,
      '"'
    )
    .replace(
      /[‘’]/g,
      "'"
    )
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF]/g,
      ''
    );
}

function quebrarTexto(
  texto: string,
  fonte: PDFFont,
  tamanho: number,
  larguraMaxima: number
) {
  const palavras =
    textoSeguro(
      texto
    ).split(/\s+/);

  const linhas:
    string[] = [];

  let linha = '';

  for (
    const palavra of
      palavras
  ) {
    const teste =
      linha
        ? `${linha} ${palavra}`
        : palavra;

    const largura =
      fonte.widthOfTextAtSize(
        teste,
        tamanho
      );

    if (
      largura <=
        larguraMaxima ||
      !linha
    ) {
      linha = teste;
    } else {
      linhas.push(
        linha
      );

      linha =
        palavra;
    }
  }

  if (linha) {
    linhas.push(
      linha
    );
  }

  return linhas.length
    ? linhas
    : [''];
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
  parametros:
    URLSearchParams,
  nome: string
) {
  const valor =
    parametros.get(
      nome
    );

  if (
    valor === null
  ) {
    return true;
  }

  return (
    valor === '1' ||
    valor === 'true'
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

  const hoje =
    hojeLocal();

  const inicio =
    parametros.get(
      'inicio'
    ) || hoje;

  const fim =
    parametros.get(
      'fim'
    ) || inicio;

  const classeParametro =
    parametros.get(
      'classe'
    );

  if (
    inicio > fim
  ) {
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
    classeParametro ===
      'QS' ||
    classeParametro ===
      'QR'
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
    inicioDiaLocal(
      inicio
    );

  const fimPeriodo =
    fimDiaLocal(
      fim
    );

  const [
    arranchamentos,
    movimentacoes,
    estoque,
    generosAtivos,
    saidasFisicas,
  ] =
    await Promise.all([
      prisma.arranchamento.findMany(
        {
          where: {
            data: {
              gte:
                inicioPeriodo,

              lte:
                fimPeriodo,
            },
          },

          orderBy: [
            {
              data:
                'asc',
            },
            {
              refeicao:
                'asc',
            },
          ],
        }
      ),

      prisma.movimentacaoEstoque.findMany(
        {
          where: {
            criadoEm: {
              gte:
                inicioPeriodo,

              lte:
                fimPeriodo,
            },

            ...(classe
              ? {
                  classe,
                }
              : {}),
          },

          include: {
            genero: {
              include: {
                unidade:
                  true,

                categoria: {
                  include: {
                    grupo:
                      true,
                  },
                },
              },
            },

            lote:
              true,
          },

          orderBy: {
            criadoEm:
              'asc',
          },
        }
      ),

      prisma.estoqueLocal.findMany(
        {
          where: {
            genero: {
              situacao:
                'ATIVO',

              ...(classe
                ? {
                    classe,
                  }
                : {}),
            },
          },

          include: {
            genero: {
              include: {
                unidade:
                  true,

                categoria: {
                  include: {
                    grupo:
                      true,
                  },
                },
              },
            },

            local:
              true,

            lote:
              true,
          },
        }
      ),

      prisma.genero.findMany(
        {
          where: {
            situacao:
              'ATIVO',

            ...(classe
              ? {
                  classe,
                }
              : {}),
          },

          include: {
            unidade:
              true,

            categoria: {
              include: {
                grupo:
                  true,
              },
            },
          },

          orderBy: {
            nome:
              'asc',
          },
        }
      ),

      prisma.saida.findMany(
        {
          where: {
            criadoEm: {
              gte:
                inicioPeriodo,

              lte:
                fimPeriodo,
            },

            canceladaEm:
              null,

            ...(classe
              ? {
                  classe,
                }
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
            criadoEm:
              'asc',
          },
        }
      ),
    ]);

  /*
   * MAPA DAS SAÍDAS
   *
   * A finalidade da movimentação
   * passa a vir da Saida real,
   * usando referenciaId.
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
   * POSIÇÃO DO ESTOQUE
   */
  const saldoPorGenero =
    new Map<
      string,
      number
    >();

  for (
    const item of
      estoque
  ) {
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
          genero.unidade
            .sigla,

        categoria:
          genero.categoria
            ?.nome ||
          'Sem categoria',

        grupo:
          genero.categoria
            ?.grupo?.nome ||
          'Sem grupo',

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
          item.tipo ===
            'SAIDA' &&
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

          genero:
            item.genero
              .nome,

          grupo:
            item.genero
              .categoria
              ?.grupo?.nome ||
            'Sem grupo',

          categoria:
            item.genero
              .categoria
              ?.nome ||
            'Sem categoria',

          classe:
            item.classe,

          quantidade:
            Number(
              item.quantidade
            ),

          unidade:
            item.genero
              .unidade.sigla,

          dataHora:
            item.criadoEm,

          lote:
            item.lote
              ?.numero ||
            null,

          observacao:
            item.observacao ||
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
                  saidaRelacionada.destino
                )
              : null,

          numeroSaida:
            saidaRelacionada
              ?.numero ||
            null,
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
        destino:
          DestinoSaida;
        nome: string;
        referencia:
          string;
      }
    >();

  for (
    const saida of
      saidasFisicas
  ) {
    const data =
      dataLocalISO(
        saida.criadoEm
      );

    const chave =
      `${data}-${saida.destino}`;

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
        const comparacaoData =
          a.data.localeCompare(
            b.data
          );

        if (
          comparacaoData !==
          0
        ) {
          return comparacaoData;
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
        (
          total,
          item
        ) =>
          total +
          item.totalPrevisto,
        0
      ),

    efetivoAlimentado:
      arranchamentos.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.arranchadosCompareceram ??
              0
          ),
        0
      ),

    faltas:
      arranchamentos.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.faltas ??
              0
          ),
        0
      ),

    militaresDeFora:
      arranchamentos.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.naoArranchadosAtendidos ??
              0
          ),
        0
      ),

    totalAtendido:
      arranchamentos.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.totalAtendido ??
              0
          ),
        0
      ),

    sobraKg:
      arranchamentos.reduce(
        (
          total,
          item
        ) =>
          total +
          Number(
            item.sobraKg ??
              0
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
          item.lote
            ?.validade &&
          item.lote
            .validade <=
            limiteValidade
      )
      .map(
        (item) => ({
          genero:
            item.genero
              .nome,

          lote:
            item.lote
              ?.numero ||
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
            item.genero
              .unidade.sigla,

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

          return (
            dataA -
            dataB
          );
        }
      );

  /*
   * PDF
   */
  const pdf =
    await PDFDocument.create();

  pdf.setTitle(
    'EstoqueAprov - Relatório Operacional'
  );

  pdf.setAuthor(
    'EstoqueAprov'
  );

  pdf.setSubject(
    'Relatório operacional do Serviço de Aprovisionamento'
  );

  pdf.setCreator(
    'EstoqueAprov'
  );

  const fonte =
    await pdf.embedFont(
      StandardFonts.Helvetica
    );

  const negrito =
    await pdf.embedFont(
      StandardFonts.HelveticaBold
    );

  const larguraPagina =
    595.28;

  const alturaPagina =
    841.89;

  const margem = 42;

  const larguraUtil =
    larguraPagina -
    margem * 2;

  let pagina: PDFPage;
  let y = 0;

  function novaPagina() {
    pagina =
      pdf.addPage([
        larguraPagina,
        alturaPagina,
      ]);

    y =
      alturaPagina -
      45;

    return pagina;
  }

  function verificarEspaco(
    necessario = 40
  ) {
    if (
      y <
      margem +
        necessario
    ) {
      novaPagina();
    }
  }

  function escrever(
    texto: unknown,
    opcoes?: {
      tamanho?: number;
      bold?: boolean;
      indent?: number;
      espacoDepois?: number;
      cor?: ReturnType<
        typeof rgb
      >;
    }
  ) {
    const tamanho =
      opcoes?.tamanho ??
      10;

    const font =
      opcoes?.bold
        ? negrito
        : fonte;

    const indent =
      opcoes?.indent ??
      0;

    const espacoDepois =
      opcoes?.espacoDepois ??
      4;

    const linhas =
      quebrarTexto(
        textoSeguro(
          texto
        ),
        font,
        tamanho,
        larguraUtil -
          indent
      );

    const alturaLinha =
      tamanho + 3;

    verificarEspaco(
      linhas.length *
        alturaLinha +
        espacoDepois
    );

    for (
      const linha of
        linhas
    ) {
      pagina.drawText(
        linha,
        {
          x:
            margem +
            indent,

          y,

          size:
            tamanho,

          font,

          color:
            opcoes?.cor ??
            rgb(
              0.12,
              0.12,
              0.12
            ),
        }
      );

      y -=
        alturaLinha;
    }

    y -=
      espacoDepois;
  }

  function linhaHorizontal() {
    verificarEspaco(
      15
    );

    pagina.drawLine({
      start: {
        x: margem,
        y,
      },

      end: {
        x:
          larguraPagina -
          margem,
        y,
      },

      thickness:
        0.7,

      color: rgb(
        0.75,
        0.75,
        0.75
      ),
    });

    y -= 12;
  }

  function tituloSecao(
    titulo: string
  ) {
    verificarEspaco(
      35
    );

    y -= 5;

    escrever(
      titulo,
      {
        tamanho:
          14,

        bold:
          true,

        espacoDepois:
          7,

        cor: rgb(
          0.05,
          0.32,
          0.18
        ),
      }
    );

    linhaHorizontal();
  }

  function escreverMovimento(
    item: {
      genero: string;
      grupo: string;
      categoria: string;
      classe: string;
      quantidade: number;
      unidade: string;
      dataHora: Date;
      lote?:
        string | null;
      observacao?:
        string | null;
      destinoNome?:
        string | null;
      referenciaServico?:
        string | null;
      numeroSaida?:
        number | null;
    },
    mostrarFinalidade =
      false
  ) {
    verificarEspaco(
      mostrarFinalidade
        ? 120
        : 95
    );

    escrever(
      item.genero,
      {
        bold: true,
        tamanho: 11,
      }
    );

    escrever(
      `Grupo: ${item.grupo} | Categoria: ${item.categoria}`,
      {
        indent: 10,
      }
    );

    escrever(
      `Classe: ${item.classe}`,
      {
        indent: 10,
      }
    );

    escrever(
      `Quantidade: ${formatarNumero(
        item.quantidade
      )} ${item.unidade}`,
      {
        indent: 10,
      }
    );

    escrever(
      `Data/hora: ${formatarDataHora(
        item.dataHora
      )}`,
      {
        indent: 10,
      }
    );

    if (
      item.lote
    ) {
      escrever(
        `Lote: ${item.lote}`,
        {
          indent: 10,
        }
      );
    }

    if (
      mostrarFinalidade
    ) {
      escrever(
        `Finalidade: ${
          item.destinoNome ||
          '-'
        }`,
        {
          indent: 10,
          bold: true,
        }
      );

      escrever(
        `Referência: ${
          item.referenciaServico ||
          '-'
        }`,
        {
          indent: 10,
        }
      );

      if (
        item.numeroSaida
      ) {
        escrever(
          `Saída nº ${item.numeroSaida}`,
          {
            indent: 10,
          }
        );
      }
    } else if (
      item.observacao
    ) {
      escrever(
        `Observação: ${item.observacao}`,
        {
          indent: 10,
        }
      );
    }

    y -= 4;
  }

  /*
   * CABEÇALHO
   */
  novaPagina();

  escrever(
    'ESTOQUE APROV',
    {
      tamanho: 19,
      bold: true,
      espacoDepois: 3,

      cor: rgb(
        0.05,
        0.32,
        0.18
      ),
    }
  );

  escrever(
    'Relatório Operacional',
    {
      tamanho: 15,
      bold: true,
      espacoDepois: 10,
    }
  );

  escrever(
    `Período: ${formatarData(
      inicio
    )} a ${formatarData(
      fim
    )}`,
    {
      bold: true,
    }
  );

  escrever(
    `Classe: ${
      classe
        ? classe
        : 'QS + QR'
    }`
  );

  escrever(
    `Gerado em: ${formatarDataHora(
      new Date()
    )}`,
    {
      espacoDepois:
        10,
    }
  );

  linhaHorizontal();

  /*
   * EFETIVO
   */
  if (
    incluirEfetivo
  ) {
    tituloSecao(
      'Efetivo por refeição'
    );

    if (
      arranchamentos.length ===
      0
    ) {
      escrever(
        'Nenhum efetivo registrado no período.'
      );
    } else {
      for (
        const item of
          arranchamentos
      ) {
        verificarEspaco(
          110
        );

        escrever(
          `${formatarData(
            item.data
          )} - ${
            nomesRefeicao[
              item.refeicao
            ] ||
            item.refeicao
          }`,
          {
            tamanho:
              11,

            bold:
              true,
          }
        );

        escrever(
          `Efetivo previsto: ${item.totalPrevisto}`,
          {
            indent:
              10,
          }
        );

        escrever(
          `Efetivo alimentado: ${
            item.arranchadosCompareceram ??
            0
          }`,
          {
            indent:
              10,
          }
        );

        escrever(
          `Faltas: ${
            item.faltas ??
            0
          }`,
          {
            indent:
              10,
          }
        );

        escrever(
          `Militares de fora: ${
            item.naoArranchadosAtendidos ??
            0
          }`,
          {
            indent:
              10,
          }
        );

        escrever(
          `Total atendido: ${
            item.totalAtendido ??
            0
          }`,
          {
            indent:
              10,

            bold:
              true,
          }
        );

        y -= 5;
      }

      linhaHorizontal();

      escrever(
        `Refeições realizadas: ${resumoEfetivo.refeicoes}`,
        {
          bold:
            true,
        }
      );

      escrever(
        `Efetivo previsto: ${resumoEfetivo.efetivoPrevisto}`
      );

      escrever(
        `Efetivo alimentado: ${resumoEfetivo.efetivoAlimentado}`
      );

      escrever(
        `Faltas: ${resumoEfetivo.faltas}`
      );

      escrever(
        `Militares de fora: ${resumoEfetivo.militaresDeFora}`
      );

      escrever(
        `Total de atendimentos: ${resumoEfetivo.totalAtendido}`,
        {
          bold:
            true,
        }
      );

      escrever(
        'O total de atendimentos representa as refeições servidas no período. A mesma pessoa pode ter participado de mais de uma refeição.',
        {
          tamanho:
            8,

          espacoDepois:
            10,
        }
      );

      escrever(
        'Sobras',
        {
          tamanho:
            11,

          bold:
            true,
        }
      );

      escrever(
        `Sobra pesada total no período: ${formatarNumero(
          resumoEfetivo.sobraKg
        )} kg`,
        {
          indent:
            10,

          espacoDepois:
            10,
        }
      );
    }
  }

  /*
   * REFEIÇÕES RELACIONADAS
   */
  if (
    incluirRefeicoes
  ) {
    tituloSecao(
      'Refeições relacionadas'
    );

    escrever(
      'Refeições identificadas pelas saídas físicas de gêneros no período.',
      {
        tamanho:
          9,

        espacoDepois:
          8,
      }
    );

    if (
      refeicoesRelacionadas.length ===
      0
    ) {
      escrever(
        'Nenhuma refeição relacionada às saídas do período.'
      );
    } else {
      for (
        const item of
          refeicoesRelacionadas
      ) {
        escrever(
          `${formatarData(
            item.data
          )} - ${item.nome} (${item.referencia})`,
          {
            bold:
              true,
          }
        );
      }

      escrever(
        `Total de refeições relacionadas: ${refeicoesRelacionadas.length}`,
        {
          bold:
            true,

          espacoDepois:
            10,
        }
      );
    }
  }

  /*
   * ENTRADAS
   */
  if (
    incluirEntradas
  ) {
    tituloSecao(
      'Entradas'
    );

    if (
      entradas.length ===
      0
    ) {
      escrever(
        'Nenhuma entrada registrada no período.'
      );
    } else {
      for (
        const item of
          entradas
      ) {
        escreverMovimento(
          item
        );
      }
    }
  }

  /*
   * SAÍDAS
   */
  if (
    incluirSaidas
  ) {
    tituloSecao(
      'Saídas'
    );

    if (
      saidas.length ===
      0
    ) {
      escrever(
        'Nenhuma saída registrada no período.'
      );
    } else {
      for (
        const item of
          saidas
      ) {
        escreverMovimento(
          item,
          true
        );
      }
    }
  }

  /*
   * DEVOLUÇÕES
   */
  if (
    incluirDevolucoes
  ) {
    tituloSecao(
      'Devoluções'
    );

    if (
      devolucoes.length ===
      0
    ) {
      escrever(
        'Nenhuma devolução registrada no período.'
      );
    } else {
      for (
        const item of
          devolucoes
      ) {
        escreverMovimento(
          item
        );
      }
    }
  }

  /*
   * POSIÇÃO DO ESTOQUE
   */
  if (
    incluirEstoque
  ) {
    tituloSecao(
      'Posição do estoque'
    );

    escrever(
      'Saldo atual dos gêneros. Os totais são calculados separadamente por unidade de medida.',
      {
        tamanho:
          9,

        espacoDepois:
          8,
      }
    );

    if (
      posicaoEstoque.length ===
      0
    ) {
      escrever(
        'Nenhum gênero cadastrado para a classe selecionada.'
      );
    } else {
      const grupos =
        new Map<
          string,
          Map<
            string,
            typeof posicaoEstoque
          >
        >();

      for (
        const item of
          posicaoEstoque
      ) {
        if (
          !grupos.has(
            item.grupo
          )
        ) {
          grupos.set(
            item.grupo,
            new Map()
          );
        }

        const categorias =
          grupos.get(
            item.grupo
          )!;

        if (
          !categorias.has(
            item.categoria
          )
        ) {
          categorias.set(
            item.categoria,
            []
          );
        }

        categorias
          .get(
            item.categoria
          )!
          .push(
            item
          );
      }

      const gruposOrdenados =
        Array.from(
          grupos.entries()
        ).sort(
          ([a], [b]) =>
            a.localeCompare(
              b,
              'pt-BR'
            )
        );

      for (
        const [
          grupoNome,
          categorias,
        ] of
          gruposOrdenados
      ) {
        verificarEspaco(
          70
        );

        escrever(
          grupoNome,
          {
            tamanho:
              12,

            bold:
              true,

            cor: rgb(
              0.05,
              0.32,
              0.18
            ),
          }
        );

        const categoriasOrdenadas =
          Array.from(
            categorias.entries()
          ).sort(
            ([a], [b]) =>
              a.localeCompare(
                b,
                'pt-BR'
              )
          );

        for (
          const [
            categoriaNome,
            itens,
          ] of
            categoriasOrdenadas
        ) {
          verificarEspaco(
            55
          );

          escrever(
            categoriaNome,
            {
              tamanho:
                11,

              bold:
                true,

              indent:
                10,
            }
          );

          const itensOrdenados =
            [
              ...itens,
            ].sort(
              (
                a,
                b
              ) =>
                a.nome.localeCompare(
                  b.nome,
                  'pt-BR'
                )
            );

          for (
            const item of
              itensOrdenados
          ) {
            escrever(
              `${item.nome} - ${formatarNumero(
                item.quantidade
              )} ${item.unidade} - ${item.classe}`,
              {
                indent:
                  20,
              }
            );
          }

          const totaisCategoria =
            new Map<
              string,
              number
            >();

          for (
            const item of
              itens
          ) {
            totaisCategoria.set(
              item.unidade,

              (totaisCategoria.get(
                item.unidade
              ) || 0) +
                item.quantidade
            );
          }

          for (
            const [
              unidade,
              total,
            ] of
              totaisCategoria
          ) {
            escrever(
              `Subtotal ${categoriaNome}: ${formatarNumero(
                total
              )} ${unidade}`,
              {
                indent:
                  20,

                bold:
                  true,
              }
            );
          }

          y -= 4;
        }

        const totaisGrupo =
          new Map<
            string,
            number
          >();

        for (
          const itens of
            categorias.values()
        ) {
          for (
            const item of
              itens
          ) {
            totaisGrupo.set(
              item.unidade,

              (totaisGrupo.get(
                item.unidade
              ) || 0) +
                item.quantidade
            );
          }
        }

        for (
          const [
            unidade,
            total,
          ] of
            totaisGrupo
        ) {
          escrever(
            `Total ${grupoNome}: ${formatarNumero(
              total
            )} ${unidade}`,
            {
              bold:
                true,

              indent:
                10,
            }
          );
        }

        linhaHorizontal();
      }
    }
  }

  /*
   * ALERTAS
   * SEMPRE INCLUÍDOS
   */
  tituloSecao(
    'Alertas de estoque'
  );

  if (
    estoqueBaixo.length ===
      0 &&
    validade.length ===
      0
  ) {
    escrever(
      'Nenhum alerta de estoque.',
      {
        bold:
          true,

        cor: rgb(
          0.05,
          0.45,
          0.2
        ),
      }
    );
  } else {
    if (
      estoqueBaixo.length >
      0
    ) {
      escrever(
        'Estoque mínimo',
        {
          tamanho:
            11,

          bold:
            true,
        }
      );

      for (
        const item of
          estoqueBaixo
      ) {
        escrever(
          `${
            item.zerado
              ? 'ESTOQUE ZERADO'
              : 'ESTOQUE BAIXO'
          } - ${item.nome}`,
          {
            bold:
              true,

            cor:
              item.zerado
                ? rgb(
                    0.75,
                    0.1,
                    0.1
                  )
                : rgb(
                    0.75,
                    0.42,
                    0
                  ),
          }
        );

        escrever(
          `Saldo atual: ${formatarNumero(
            item.quantidade
          )} ${item.unidade} | Estoque mínimo: ${formatarNumero(
            item.estoqueMinimo
          )} ${item.unidade}`,
          {
            indent:
              10,
          }
        );
      }

      y -= 5;
    }

    if (
      validade.length >
      0
    ) {
      escrever(
        'Validade',
        {
          tamanho:
            11,

          bold:
            true,
        }
      );

      for (
        const item of
          validade
      ) {
        escrever(
          `${
            item.vencido
              ? 'LOTE VENCIDO'
              : 'VALIDADE PRÓXIMA'
          } - ${item.genero}`,
          {
            bold:
              true,

            cor:
              item.vencido
                ? rgb(
                    0.75,
                    0.1,
                    0.1
                  )
                : rgb(
                    0.75,
                    0.42,
                    0
                  ),
          }
        );

        escrever(
          `Lote: ${
            item.lote ||
            '-'
          } | Validade: ${
            item.validade
              ? formatarData(
                  item.validade
                )
              : '-'
          } | Saldo: ${formatarNumero(
            item.quantidade
          )} ${item.unidade}`,
          {
            indent:
              10,
          }
        );
      }
    }
  }

  /*
   * RODAPÉ
   */
  const paginas =
    pdf.getPages();

  paginas.forEach(
    (
      paginaAtual,
      indice
    ) => {
      paginaAtual.drawLine(
        {
          start: {
            x: margem,
            y: 28,
          },

          end: {
            x:
              larguraPagina -
              margem,
            y: 28,
          },

          thickness:
            0.5,

          color: rgb(
            0.75,
            0.75,
            0.75
          ),
        }
      );

      paginaAtual.drawText(
        textoSeguro(
          'EstoqueAprov - Serviço de Aprovisionamento'
        ),
        {
          x:
            margem,

          y:
            15,

          size:
            7,

          font:
            fonte,

          color: rgb(
            0.4,
            0.4,
            0.4
          ),
        }
      );

      const numeroPagina =
        `Página ${
          indice + 1
        } de ${
          paginas.length
        }`;

      const larguraNumero =
        fonte.widthOfTextAtSize(
          numeroPagina,
          7
        );

      paginaAtual.drawText(
        numeroPagina,
        {
          x:
            larguraPagina -
            margem -
            larguraNumero,

          y:
            15,

          size:
            7,

          font:
            fonte,

          color: rgb(
            0.4,
            0.4,
            0.4
          ),
        }
      );
    }
  );

  const bytes =
    await pdf.save();

  const nomeArquivo =
    `EstoqueAprov_${inicio}_${fim}.pdf`;

  return new Response(
    Buffer.from(
      bytes
    ),
    {
      status: 200,

      headers: {
        'Content-Type':
          'application/pdf',

        'Content-Disposition':
          `attachment; filename="${nomeArquivo}"`,

        'Cache-Control':
          'no-store',
      },
    }
  );
}

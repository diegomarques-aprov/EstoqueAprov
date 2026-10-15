import { ClasseOperacao } from '@prisma/client';
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

const TIME_ZONE = 'America/Campo_Grande';

const nomesRefeicao: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  OUTRO: 'Outro',
};

const nomesMovimentacao: Record<string, string> = {
  SALDO_INICIAL: 'Saldo inicial',
  RECEBIMENTO: 'Recebimento',
  SAIDA: 'Saída',
  DEVOLUCAO: 'Devolução',
  PERDA: 'Perda / descarte',
  CORRECAO: 'Correção',
  TRANSFERENCIA: 'Transferência',
};

function inicioDiaLocal(data: string) {
  return new Date(
    `${data.slice(0, 10)}T04:00:00.000Z`
  );
}

function fimDiaLocal(data: string) {
  const inicio =
    inicioDiaLocal(data);

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

function formatarData(
  data: Date | string
) {
  const valor =
    typeof data === 'string'
      ? data.slice(0, 10)
      : new Intl.DateTimeFormat(
          'en-CA',
          {
            timeZone: TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }
        ).format(data);

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
      second: '2-digit',
      hour12: false,
    }
  ).format(new Date(data));
}

function formatarNumero(
  valor: unknown
) {
  return Number(
    valor ?? 0
  ).toLocaleString(
    'pt-BR',
    {
      maximumFractionDigits: 3,
    }
  );
}

function gerarDias(
  inicio: string,
  fim: string
) {
  const resultado: string[] = [];

  const atual = new Date(
    `${inicio.slice(
      0,
      10
    )}T12:00:00.000Z`
  );

  const final = new Date(
    `${fim.slice(
      0,
      10
    )}T12:00:00.000Z`
  );

  while (atual <= final) {
    resultado.push(
      atual
        .toISOString()
        .slice(0, 10)
    );

    atual.setUTCDate(
      atual.getUTCDate() + 1
    );
  }

  return resultado;
}

function textoSeguro(
  valor: unknown
) {
  return String(valor ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
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

  const linhas: string[] = [];
  let linha = '';

  for (
    const palavra of palavras
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
      linhas.push(linha);
      linha = palavra;
    }
  }

  if (linha) {
    linhas.push(linha);
  }

  return linhas.length
    ? linhas
    : [''];
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

  const inicioPeriodo =
    inicioDiaLocal(inicio);

  const fimPeriodo =
    fimDiaLocal(fim);

  const [
    arranchamentos,
    movimentacoes,
  ] = await Promise.all([
    prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioPeriodo,
          lte: fimPeriodo,
        },
      },

      include: {
        usuario: {
          select: {
            nome: true,
            postoGraduacao: true,
          },
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
  ]);

  const registrosFechados =
    arranchamentos.filter(
      (item) =>
        item
          .fechamentoRealizadoEm !=
        null
    );

  const totalPrevisto =
    arranchamentos.reduce(
      (total, item) =>
        total +
        item.totalPrevisto,
      0
    );

  const totalPlanejamento =
    arranchamentos.reduce(
      (total, item) =>
        total +
        item
          .efetivoPlanejamento,
      0
    );

  const totalAtendido =
    registrosFechados.reduce(
      (total, item) =>
        total +
        Number(
          item.totalAtendido ??
            0
        ),
      0
    );

  const totalSobras =
    registrosFechados.reduce(
      (total, item) =>
        total +
        Number(
          item.sobraKg ?? 0
        ),
      0
    );

  const dias =
    gerarDias(
      inicio,
      fim
    );

  const diasSemLancamento =
    dias.filter((dia) => {
      return !arranchamentos.some(
        (item) =>
          item.data
            .toISOString()
            .slice(0, 10) ===
          dia
      );
    });

  const pendentes =
    arranchamentos.filter(
      (item) =>
        !item
          .fechamentoRealizadoEm
    );

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
      margem + necessario
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
      opcoes
        ?.espacoDepois ??
      4;

    const linhas =
      quebrarTexto(
        textoSeguro(texto),
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
      const linha of linhas
    ) {
      pagina.drawText(
        linha,
        {
          x:
            margem +
            indent,
          y,
          size: tamanho,
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

      y -= alturaLinha;
    }

    y -= espacoDepois;
  }

  function linhaHorizontal() {
    verificarEspaco(15);

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

      thickness: 0.7,

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
    verificarEspaco(35);

    y -= 5;

    escrever(
      titulo,
      {
        tamanho: 14,
        bold: true,
        espacoDepois: 7,
        cor: rgb(
          0.05,
          0.32,
          0.18
        ),
      }
    );

    linhaHorizontal();
  }

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
    )}`
  );

  escrever(
    'Horário de referência: Corumbá / Campo Grande',
    {
      espacoDepois: 10,
    }
  );

  linhaHorizontal();

  tituloSecao(
    'Resumo do período'
  );

  escrever(
    `Efetivo previsto: ${totalPrevisto}`,
    {
      bold: true,
    }
  );

  escrever(
    `Efetivo para planejamento: ${totalPlanejamento}`,
    {
      bold: true,
    }
  );

  escrever(
    `Total atendido: ${
      registrosFechados
        .length > 0
        ? totalAtendido
        : 'Pendente'
    }`
  );

  escrever(
    `Sobras pesadas: ${
      registrosFechados
        .length > 0
        ? `${formatarNumero(
            totalSobras
          )} kg`
        : 'Pendente'
    }`
  );

  escrever(
    `Refeições relacionadas: ${arranchamentos.length}`
  );

  escrever(
    `Refeições fechadas: ${registrosFechados.length}`
  );

  escrever(
    `Refeições pendentes: ${pendentes.length}`
  );

  escrever(
    `Dias sem lançamento: ${diasSemLancamento.length}`,
    {
      espacoDepois: 10,
    }
  );

  tituloSecao(
    'Arranchamento / Efetivo alimentado'
  );

  for (
    const dia of dias
  ) {
    const registrosDoDia =
      arranchamentos.filter(
        (item) =>
          item.data
            .toISOString()
            .slice(0, 10) ===
          dia
      );

    verificarEspaco(70);

    escrever(
      formatarData(dia),
      {
        tamanho: 12,
        bold: true,
        espacoDepois: 4,
      }
    );

    if (
      registrosDoDia.length ===
      0
    ) {
      escrever(
        'SEM LANÇAMENTO',
        {
          bold: true,
          cor: rgb(
            0.75,
            0.42,
            0
          ),
        }
      );

      escrever(
        'Não existe arranchamento registrado para esta data.',
        {
          indent: 10,
          espacoDepois: 10,
        }
      );

      linhaHorizontal();

      continue;
    }

    const diaFechado =
      registrosDoDia.every(
        (item) =>
          Boolean(
            item
              .fechamentoRealizadoEm
          )
      );

    escrever(
      diaFechado
        ? 'Situação do dia: FECHADO'
        : 'Situação do dia: PENDENTE',
      {
        bold: true,
        cor:
          diaFechado
            ? rgb(
                0.05,
                0.45,
                0.2
              )
            : rgb(
                0.75,
                0.42,
                0
              ),
        espacoDepois: 8,
      }
    );

    for (
      const item of registrosDoDia
    ) {
      verificarEspaco(130);

      const fechado =
        Boolean(
          item
            .fechamentoRealizadoEm
        );

      escrever(
        nomesRefeicao[
          item.refeicao
        ] ||
          item.refeicao,
        {
          tamanho: 11,
          bold: true,
          indent: 10,
        }
      );

      escrever(
        `Efetivo previsto: ${item.totalPrevisto}`,
        {
          indent: 20,
        }
      );

      escrever(
        `Margem de segurança: ${formatarNumero(
          item.margemSegurancaPercent
        )}%`,
        {
          indent: 20,
        }
      );

      escrever(
        `Efetivo para planejamento: ${item.efetivoPlanejamento}`,
        {
          indent: 20,
        }
      );

      if (fechado) {
        escrever(
          `Arranchados que compareceram: ${
            item
              .arranchadosCompareceram ??
            0
          }`,
          {
            indent: 20,
          }
        );

        escrever(
          `Não arranchados atendidos: ${
            item
              .naoArranchadosAtendidos ??
            0
          }`,
          {
            indent: 20,
          }
        );

        escrever(
          `Total atendido: ${
            item
              .totalAtendido ??
            0
          }`,
          {
            indent: 20,
          }
        );

        escrever(
          `Sobra pesada: ${formatarNumero(
            item.sobraKg
          )} kg`,
          {
            indent: 20,
          }
        );

        escrever(
          'Situação: Fechado',
          {
            indent: 20,
            bold: true,
            cor: rgb(
              0.05,
              0.45,
              0.2
            ),
          }
        );
      } else {
        escrever(
          'Situação: Fechamento pendente',
          {
            indent: 20,
            bold: true,
            cor: rgb(
              0.75,
              0.42,
              0
            ),
          }
        );
      }

      if (
        item.observacao
      ) {
        escrever(
          `Observação: ${item.observacao}`,
          {
            indent: 20,
            espacoDepois: 9,
          }
        );
      } else {
        y -= 5;
      }
    }

    linhaHorizontal();
  }

  tituloSecao(
    'Movimentações de estoque'
  );

  if (
    movimentacoes.length ===
    0
  ) {
    escrever(
      'Nenhuma movimentação registrada no período.'
    );
  } else {
    for (
      const item of movimentacoes
    ) {
      verificarEspaco(100);

      escrever(
        `${
          nomesMovimentacao[
            item.tipo
          ] ||
          item.tipo
        } - ${item.genero.nome}`,
        {
          bold: true,
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
        )} ${
          item.genero
            .unidade.sigla
        }`,
        {
          indent: 10,
        }
      );

      escrever(
        `Data/hora da movimentação: ${formatarDataHora(
          item.criadoEm
        )}`,
        {
          indent: 10,
        }
      );

      if (
        item.lote?.numero
      ) {
        escrever(
          `Lote: ${item.lote.numero}`,
          {
            indent: 10,
          }
        );
      }

      /*
       * Para SAÍDA/PERDA, o local relevante
       * é o local de onde o material saiu.
       */
      if (
        item.localOrigem?.nome
      ) {
        escrever(
          `Local de saída/origem: ${item.localOrigem.nome}`,
          {
            indent: 10,
          }
        );
      }

      /*
       * Para entrada/recebimento/saldo inicial,
       * o localDestino representa onde o gênero
       * foi armazenado.
       */
      if (
        item.localDestino?.nome
      ) {
        const rotuloDestino =
          item.tipo ===
            'SALDO_INICIAL' ||
          item.tipo ===
            'RECEBIMENTO' ||
          item.tipo ===
            'DEVOLUCAO'
            ? 'Local de armazenamento'
            : 'Local de destino';

        escrever(
          `${rotuloDestino}: ${item.localDestino.nome}`,
          {
            indent: 10,
          }
        );
      }

      if (
        item.observacao
      ) {
        escrever(
          `Observação: ${item.observacao}`,
          {
            indent: 10,
          }
        );
      }

      y -= 5;
    }
  }

  verificarEspaco(100);

  tituloSecao(
    'Observações do relatório'
  );

  if (
    pendentes.length >
    0
  ) {
    escrever(
      `Existem ${pendentes.length} refeição(ões) com fechamento pendente. Atendimento e sobras desses registros não devem ser interpretados como zero.`,
      {
        cor: rgb(
          0.75,
          0.42,
          0
        ),
      }
    );
  }

  if (
    diasSemLancamento
      .length > 0
  ) {
    escrever(
      `Existem ${diasSemLancamento.length} dia(s) sem lançamento de arranchamento no período. A ausência de lançamento não representa efetivo zero.`,
      {
        cor: rgb(
          0.75,
          0.42,
          0
        ),
      }
    );
  }

  if (
    pendentes.length ===
      0 &&
    diasSemLancamento
      .length === 0
  ) {
    escrever(
      'Não foram identificadas pendências de fechamento ou dias sem lançamento no período.'
    );
  }

  const paginas =
    pdf.getPages();

  paginas.forEach(
    (
      paginaAtual,
      indice
    ) => {
      paginaAtual.drawLine({
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

        thickness: 0.5,

        color: rgb(
          0.75,
          0.75,
          0.75
        ),
      });

      paginaAtual.drawText(
        textoSeguro(
          'EstoqueAprov - Serviço de Aprovisionamento'
        ),
        {
          x: margem,
          y: 15,
          size: 7,
          font: fonte,
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
          y: 15,
          size: 7,
          font: fonte,
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
    Buffer.from(bytes),
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

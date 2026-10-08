import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import ExcelJS from 'exceljs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  SAIDA: 'Saída / consumo',
  DEVOLUCAO: 'Devolução',
  PERDA: 'Perda / descarte',
  CORRECAO: 'Correção',
  TRANSFERENCIA: 'Transferência',
};

function inicioDia(data: string) {
  return new Date(
    `${data.slice(0, 10)}T00:00:00.000Z`
  );
}

function fimDia(data: string) {
  return new Date(
    `${data.slice(0, 10)}T23:59:59.999Z`
  );
}

function formatarData(data: Date | string) {
  return new Date(data).toLocaleDateString(
    'pt-BR',
    {
      timeZone: 'UTC',
    }
  );
}

function gerarDias(inicio: string, fim: string) {
  const resultado: string[] = [];

  const atual = new Date(
    `${inicio.slice(0, 10)}T12:00:00.000Z`
  );

  const final = new Date(
    `${fim.slice(0, 10)}T12:00:00.000Z`
  );

  while (atual <= final) {
    resultado.push(
      atual.toISOString().slice(0, 10)
    );

    atual.setUTCDate(atual.getUTCDate() + 1);
  }

  return resultado;
}

function ajustarColunas(
  planilha: ExcelJS.Worksheet,
  larguras: number[]
) {
  larguras.forEach((largura, indice) => {
    planilha.getColumn(indice + 1).width =
      largura;
  });
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
  };
}

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const parametros =
    new URL(req.url).searchParams;

  const hoje = new Date()
    .toISOString()
    .slice(0, 10);

  const inicio =
    parametros.get('inicio') || hoje;

  const fim =
    parametros.get('fim') || inicio;

  const classe =
    parametros.get('classe') || 'TODOS';

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
    !['TODOS', 'QS', 'QR'].includes(classe)
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

  /*
   * ARRANCHAMENTO / EFETIVO
   *
   * Usa a data real do serviço.
   */
  const arranchamentos =
    await prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioDia(inicio),
          lte: fimDia(fim),
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
    });

  /*
   * MOVIMENTAÇÕES
   *
   * O modelo atual ainda não possui uma data
   * operacional própria. Portanto, nesta versão,
   * o filtro utiliza criadoEm.
   */
  const whereMovimentacao: any = {
    criadoEm: {
      gte: inicioDia(inicio),
      lte: fimDia(fim),
    },
  };

  if (
    classe === 'QS' ||
    classe === 'QR'
  ) {
    whereMovimentacao.classe = classe;
  }

  const movimentacoes =
    await prisma.movimentacaoEstoque.findMany({
      where: whereMovimentacao,
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
    });

  const workbook =
    new ExcelJS.Workbook();

  workbook.creator = 'EstoqueAprov';
  workbook.lastModifiedBy = 'EstoqueAprov';
  workbook.created = new Date();
  workbook.modified = new Date();

  /*
   * ==================================================
   * PLANILHA 1 — RESUMO
   * ==================================================
   */
  const resumo =
    workbook.addWorksheet('Resumo');

  resumo.addRow([
    'EstoqueAprov — Relatório Operacional',
  ]);

  resumo.mergeCells('A1:D1');

  resumo.getCell('A1').font = {
    bold: true,
    size: 16,
  };

  resumo.getCell('A1').alignment = {
    horizontal: 'center',
  };

  resumo.addRow([]);

  resumo.addRow([
    'Período',
    `${formatarData(
      inicio
    )} a ${formatarData(fim)}`,
  ]);

  resumo.addRow([
    'Classe',
    classe === 'TODOS'
      ? 'QS + QR'
      : classe,
  ]);

  resumo.addRow([]);

  const fechados =
    arranchamentos.filter(
      (item) =>
        item.fechamentoRealizadoEm != null
    );

  const totalPrevisto =
    arranchamentos.reduce(
      (total, item) =>
        total + item.totalPrevisto,
      0
    );

  const totalPlanejamento =
    arranchamentos.reduce(
      (total, item) =>
        total + item.efetivoPlanejamento,
      0
    );

  const totalAtendido =
    fechados.reduce(
      (total, item) =>
        total +
        Number(item.totalAtendido ?? 0),
      0
    );

  const totalSobras =
    fechados.reduce(
      (total, item) =>
        total + Number(item.sobraKg ?? 0),
      0
    );

  resumo.addRow([
    'Indicador',
    'Resultado',
  ]);

  formatarCabecalho(resumo.getRow(6));

  resumo.addRow([
    'Efetivo previsto',
    totalPrevisto,
  ]);

  resumo.addRow([
    'Efetivo para planejamento',
    totalPlanejamento,
  ]);

  resumo.addRow([
    'Total atendido',
    fechados.length > 0
      ? totalAtendido
      : 'Pendente',
  ]);

  resumo.addRow([
    'Sobras pesadas (kg)',
    fechados.length > 0
      ? totalSobras
      : 'Pendente',
  ]);

  resumo.addRow([
    'Refeições relacionadas',
    arranchamentos.length,
  ]);

  resumo.addRow([
    'Refeições fechadas',
    fechados.length,
  ]);

  resumo.addRow([
    'Refeições pendentes',
    arranchamentos.length -
      fechados.length,
  ]);

  ajustarColunas(
    resumo,
    [32, 30, 18, 18]
  );

  /*
   * ==================================================
   * PLANILHA 2 — EFETIVO
   * ==================================================
   */
  const efetivo =
    workbook.addWorksheet(
      'Efetivo alimentado'
    );

  efetivo.addRow([
    'Data',
    'Situação',
    'Refeição',
    'Of / ST / Sgt',
    'Cb / Sd',
    'Outros',
    'Previsto',
    'Margem (%)',
    'Planejamento',
    'Arranchados presentes',
    'Não arranchados',
    'Total atendido',
    'Sobra (kg)',
    'Observação',
  ]);

  formatarCabecalho(
    efetivo.getRow(1)
  );

  const dias =
    gerarDias(inicio, fim);

  for (const dia of dias) {
    const registros =
      arranchamentos.filter(
        (item) =>
          item.data
            .toISOString()
            .slice(0, 10) === dia
      );

    /*
     * Dia sem qualquer arranchamento.
     * Não é transformado em zero.
     */
    if (registros.length === 0) {
      efetivo.addRow([
        formatarData(dia),
        'SEM LANÇAMENTO',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Não existe arranchamento registrado para esta data.',
      ]);

      continue;
    }

    for (const item of registros) {
      const fechado =
        item.fechamentoRealizadoEm != null;

      efetivo.addRow([
        formatarData(item.data),

        fechado
          ? 'FECHADO'
          : 'PENDENTE',

        nomesRefeicao[
          item.refeicao
        ] || item.refeicao,

        item.oficiaisStenSgt,

        item.cabosSoldados,

        item.outrosPrevistos,

        item.totalPrevisto,

        Number(
          item.margemSegurancaPercent
        ),

        item.efetivoPlanejamento,

        fechado
          ? item.arranchadosCompareceram
          : '',

        fechado
          ? item.naoArranchadosAtendidos
          : '',

        fechado
          ? item.totalAtendido
          : '',

        fechado &&
        item.sobraKg != null
          ? Number(item.sobraKg)
          : '',

        item.observacao || '',
      ]);
    }
  }

  ajustarColunas(efetivo, [
    14,
    18,
    20,
    14,
    14,
    12,
    12,
    13,
    16,
    22,
    20,
    16,
    14,
    45,
  ]);

  efetivo.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  efetivo.autoFilter = {
    from: 'A1',
    to: 'N1',
  };

  /*
   * ==================================================
   * PLANILHA 3 — MOVIMENTAÇÕES
   * ==================================================
   */
  const movimentos =
    workbook.addWorksheet(
      'Movimentações'
    );

  movimentos.addRow([
    'Data / hora do lançamento',
    'Tipo',
    'Classe',
    'Gênero',
    'Quantidade',
    'Unidade',
    'Lote',
    'Local origem',
    'Local destino',
    'Valor unitário',
    'Observação',
  ]);

  formatarCabecalho(
    movimentos.getRow(1)
  );

  for (const item of movimentacoes) {
    movimentos.addRow([
      item.criadoEm.toLocaleString(
        'pt-BR'
      ),

      nomesMovimentacao[item.tipo] ||
        item.tipo,

      item.classe,

      item.genero.nome,

      Number(item.quantidade),

      item.genero.unidade.sigla,

      item.lote?.numero || '',

      item.localOrigem?.nome || '',

      item.localDestino?.nome || '',

      item.valorUnitario != null
        ? Number(item.valorUnitario)
        : '',

      item.observacao || '',
    ]);
  }

  ajustarColunas(movimentos, [
    24,
    22,
    10,
    32,
    14,
    12,
    20,
    28,
    28,
    16,
    45,
  ]);

  movimentos.views = [
    {
      state: 'frozen',
      ySplit: 1,
    },
  ];

  movimentos.autoFilter = {
    from: 'A1',
    to: 'K1',
  };

  /*
   * ==================================================
   * FORMATAÇÃO GERAL
   * ==================================================
   */
  for (const planilha of [
    resumo,
    efetivo,
    movimentos,
  ]) {
    planilha.eachRow((linha) => {
      linha.alignment = {
        ...linha.alignment,
        vertical: 'middle',
        wrapText: true,
      };
    });
  }

  /*
   * Geração do arquivo XLSX
   */
  const buffer =
    await workbook.xlsx.writeBuffer();

  const nomeArquivo =
    `EstoqueAprov_${inicio}_${fim}.xlsx`;

  return new Response(buffer as BodyInit, {
    status: 200,

    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

      'Content-Disposition':
        `attachment; filename="${nomeArquivo}"`,

      'Cache-Control':
        'no-store',
    },
  });
}

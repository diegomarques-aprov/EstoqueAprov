import {
  ClasseOperacao,
  DestinoSaida,
} from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const TIME_ZONE = 'America/Campo_Grande';

function inicioUtcDoDiaLocal(data: string) {
  return new Date(
    `${data.slice(0, 10)}T04:00:00.000Z`
  );
}

function fimUtcDoDiaLocal(data: string) {
  const inicio = inicioUtcDoDiaLocal(data);

  return new Date(
    inicio.getTime() +
      24 * 60 * 60 * 1000 -
      1
  );
}

function dataHojeLocal() {
  const partes = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).formatToParts(new Date());

  const ano = partes.find(
    (p) => p.type === 'year'
  )?.value;

  const mes = partes.find(
    (p) => p.type === 'month'
  )?.value;

  const dia = partes.find(
    (p) => p.type === 'day'
  )?.value;

  return `${ano}-${mes}-${dia}`;
}

function dataLocalISO(data: Date) {
  const partes = new Intl.DateTimeFormat(
    'en-CA',
    {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  ).formatToParts(data);

  const ano = partes.find(
    (p) => p.type === 'year'
  )?.value;

  const mes = partes.find(
    (p) => p.type === 'month'
  )?.value;

  const dia = partes.find(
    (p) => p.type === 'day'
  )?.value;

  return `${ano}-${mes}-${dia}`;
}

function nomeRefeicao(destino: DestinoSaida) {
  const nomes: Record<DestinoSaida, string> = {
    CAFE_DA_MANHA: 'Café da manhã',
    ALMOCO: 'Almoço',
    JANTAR: 'Jantar',
    CEIA: 'Ceia',
    SERVICO_DIA_SEGUINTE:
      'Serviço do dia seguinte',
    OUTRO: 'Outro',
  };

  return nomes[destino];
}

function tipoServico(destino: DestinoSaida) {
  return destino ===
    'SERVICO_DIA_SEGUINTE'
    ? 'dia seguinte'
    : 'mesmo dia';
}

export async function GET(req: Request) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const parametros =
    new URL(req.url).searchParams;

  const hoje = dataHojeLocal();

  const inicio =
    parametros.get('inicio') || hoje;

  const fim =
    parametros.get('fim') || inicio;

  const classeParametro =
    parametros.get('classe');

  const classe:
    | ClasseOperacao
    | null =
    classeParametro === 'QS' ||
    classeParametro === 'QR'
      ? classeParametro
      : null;

  const inicioPeriodo =
    inicioUtcDoDiaLocal(inicio);

  const fimPeriodo =
    fimUtcDoDiaLocal(fim);

  const [
    movimentacoes,
    arranchamentos,
    estoque,
    generosAtivos,
    saidasFisicas,
  ] = await Promise.all([
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

        localOrigem: true,
        localDestino: true,
        lote: true,
      },

      orderBy: {
        criadoEm: 'asc',
      },
    }),

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
        criadoEm: true,
        observacao: true,
      },

      orderBy: {
        criadoEm: 'asc',
      },
    }),
  ]);

  /*
   * POSIÇÃO ATUAL DO ESTOQUE
   *
   * Todos os gêneros ativos são incluídos,
   * inclusive os que estão com saldo zero.
   */
  const saldoPorGenero =
    new Map<string, number>();

  for (const item of estoque) {
    saldoPorGenero.set(
      item.generoId,
      (saldoPorGenero.get(
        item.generoId
      ) || 0) +
        Number(item.quantidade)
    );
  }

  const posicaoEstoque =
    generosAtivos.map((genero) => ({
      generoId: genero.id,
      nome: genero.nome,
      classe: genero.classe,
      unidade: genero.unidade.sigla,

      categoriaId:
        genero.categoria?.id || null,

      categoria:
        genero.categoria?.nome ||
        'Sem categoria',

      grupoId:
        genero.categoria?.grupo?.id ||
        null,

      grupo:
        genero.categoria?.grupo?.nome ||
        'Sem grupo',

      estoqueMinimo:
        genero.estoqueMinimo != null
          ? Number(genero.estoqueMinimo)
          : null,

      quantidade:
        saldoPorGenero.get(genero.id) ||
        0,
    }));

  /*
   * RESUMO POR GÊNERO
   */
  const porGenero =
    new Map<
      string,
      {
        generoId: string;
        nome: string;
        classe: string;
        unidade: string;
        categoriaId: string | null;
        categoria: string;
        grupoId: string | null;
        grupo: string;

        saldoInicial: number;
        recebimentos: number;
        saidas: number;
        devolucoes: number;
        perdas: number;
        correcoes: number;
        transferencias: number;
        saldoAtual: number;

        movimentacoes: {
          id: string;
          tipo: string;
          quantidade: number;
          dataHora: Date;
          lote: string | null;
          localOrigem: string | null;
          localDestino: string | null;
          observacao: string | null;
        }[];
      }
    >();

  for (const genero of generosAtivos) {
    porGenero.set(genero.id, {
      generoId: genero.id,
      nome: genero.nome,
      classe: genero.classe,
      unidade: genero.unidade.sigla,

      categoriaId:
        genero.categoria?.id || null,

      categoria:
        genero.categoria?.nome ||
        'Sem categoria',

      grupoId:
        genero.categoria?.grupo?.id ||
        null,

      grupo:
        genero.categoria?.grupo?.nome ||
        'Sem grupo',

      saldoInicial: 0,
      recebimentos: 0,
      saidas: 0,
      devolucoes: 0,
      perdas: 0,
      correcoes: 0,
      transferencias: 0,

      saldoAtual:
        saldoPorGenero.get(genero.id) ||
        0,

      movimentacoes: [],
    });
  }

  for (const movimento of movimentacoes) {
    let registro =
      porGenero.get(
        movimento.generoId
      );

    if (!registro) {
      registro = {
        generoId:
          movimento.generoId,

        nome:
          movimento.genero.nome,

        classe:
          movimento.genero.classe,

        unidade:
          movimento.genero.unidade
            .sigla,

        categoriaId:
          movimento.genero.categoria
            ?.id || null,

        categoria:
          movimento.genero.categoria
            ?.nome ||
          'Sem categoria',

        grupoId:
          movimento.genero.categoria
            ?.grupo?.id || null,

        grupo:
          movimento.genero.categoria
            ?.grupo?.nome ||
          'Sem grupo',

        saldoInicial: 0,
        recebimentos: 0,
        saidas: 0,
        devolucoes: 0,
        perdas: 0,
        correcoes: 0,
        transferencias: 0,

        saldoAtual:
          saldoPorGenero.get(
            movimento.generoId
          ) || 0,

        movimentacoes: [],
      };

      porGenero.set(
        movimento.generoId,
        registro
      );
    }

    const quantidade =
      Number(movimento.quantidade);

    switch (movimento.tipo) {
      case 'SALDO_INICIAL':
        registro.saldoInicial +=
          quantidade;
        break;

      case 'RECEBIMENTO':
        registro.recebimentos +=
          quantidade;
        break;

      case 'SAIDA':
        registro.saidas +=
          quantidade;
        break;

      case 'DEVOLUCAO':
        registro.devolucoes +=
          quantidade;
        break;

      case 'PERDA':
        registro.perdas +=
          quantidade;
        break;

      case 'CORRECAO':
        registro.correcoes +=
          quantidade;
        break;

      case 'TRANSFERENCIA':
        registro.transferencias +=
          quantidade;
        break;
    }

    registro.movimentacoes.push({
      id: movimento.id,
      tipo: movimento.tipo,
      quantidade,
      dataHora: movimento.criadoEm,

      lote:
        movimento.lote?.numero ||
        null,

      localOrigem:
        movimento.localOrigem?.nome ||
        null,

      localDestino:
        movimento.localDestino?.nome ||
        null,

      observacao:
        movimento.observacao ||
        null,
    });
  }

  const generos = Array.from(
    porGenero.values()
  ).sort((a, b) => {
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

    if (categoria !== 0) {
      return categoria;
    }

    return a.nome.localeCompare(
      b.nome,
      'pt-BR'
    );
  });

  /*
   * MOVIMENTAÇÕES DETALHADAS
   */
  const movimentosDetalhados =
    movimentacoes.map((item) => ({
      id: item.id,
      tipo: item.tipo,
      classe: item.classe,

      generoId:
        item.generoId,

      genero:
        item.genero.nome,

      grupo:
        item.genero.categoria?.grupo
          ?.nome ||
        'Sem grupo',

      categoria:
        item.genero.categoria?.nome ||
        'Sem categoria',

      quantidade:
        Number(item.quantidade),

      unidade:
        item.genero.unidade.sigla,

      dataHora:
        item.criadoEm,

      lote:
        item.lote?.numero || null,

      localOrigem:
        item.localOrigem?.nome ||
        null,

      localDestino:
        item.localDestino?.nome ||
        null,

      observacao:
        item.observacao || null,
    }));

  const entradas =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo ===
        'RECEBIMENTO'
    );

  const saidas =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo === 'SAIDA'
    );

  const devolucoes =
    movimentosDetalhados.filter(
      (item) =>
        item.tipo === 'DEVOLUCAO'
    );

  /*
   * EFETIVO POR REFEIÇÃO
   */
  const efetivos =
    arranchamentos.map((item) => ({
      id: item.id,
      data: item.data,
      refeicao: item.refeicao,

      oficiaisStenSgt:
        item.oficiaisStenSgt,

      cabosSoldados:
        item.cabosSoldados,

      outrosPrevistos:
        item.outrosPrevistos,

      quantidade:
        item.totalPrevisto,

      totalPrevisto:
        item.totalPrevisto,

      margemSegurancaPercent:
        Number(
          item.margemSegurancaPercent
        ),

      efetivoPlanejamento:
        item.efetivoPlanejamento,

      efetivoAlimentado:
        item.arranchadosCompareceram,

      arranchadosCompareceram:
        item.arranchadosCompareceram,

      faltas:
        item.faltas,

      militaresDeFora:
        item.naoArranchadosAtendidos,

      naoArranchadosAtendidos:
        item.naoArranchadosAtendidos,

      totalAtendido:
        item.totalAtendido,

      sobraKg:
        item.sobraKg != null
          ? Number(item.sobraKg)
          : null,

      fechamentoRealizadoEm:
        item.fechamentoRealizadoEm,

      observacao:
        item.observacao,

      usuario:
        item.usuario,
    }));

  const resumoEfetivo = {
    refeicoes:
      efetivos.length,

    efetivoPrevisto:
      efetivos.reduce(
        (total, item) =>
          total +
          item.totalPrevisto,
        0
      ),

    efetivoAlimentado:
      efetivos.reduce(
        (total, item) =>
          total +
          (item.efetivoAlimentado ??
            0),
        0
      ),

    faltas:
      efetivos.reduce(
        (total, item) =>
          total +
          (item.faltas ?? 0),
        0
      ),

    militaresDeFora:
      efetivos.reduce(
        (total, item) =>
          total +
          item.militaresDeFora,
        0
      ),

    totalAtendido:
      efetivos.reduce(
        (total, item) =>
          total +
          (item.totalAtendido ??
            0),
        0
      ),

    sobraKg:
      efetivos.reduce(
        (total, item) =>
          total +
          (item.sobraKg ?? 0),
        0
      ),
  };

  /*
   * REFEIÇÕES RELACIONADAS ÀS SAÍDAS FÍSICAS
   *
   * Uma refeição é contada apenas uma vez por
   * data local + destino.
   */
  const refeicoesMap =
    new Map<
      string,
      {
        data: string;
        destino: DestinoSaida;
        nome: string;
        referencia: string;
      }
    >();

  for (const saida of saidasFisicas) {
    const data =
      dataLocalISO(
        saida.criadoEm
      );

    const chave =
      `${data}|${saida.destino}`;

    if (!refeicoesMap.has(chave)) {
      refeicoesMap.set(chave, {
        data,
        destino:
          saida.destino,

        nome:
          nomeRefeicao(
            saida.destino
          ),

        referencia:
          tipoServico(
            saida.destino
          ),
      });
    }
  }

  const refeicoesRelacionadas =
    Array.from(
      refeicoesMap.values()
    );

  /*
   * ALERTAS DE ESTOQUE
   *
   * Sempre serão retornados.
   * Incluem também gênero com saldo zero.
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
      .map((item) => ({
        id:
          item.generoId,

        nome:
          item.nome,

        unidade:
          item.unidade,

        qtd:
          item.quantidade,

        min:
          item.estoqueMinimo,

        zerado:
          item.quantidade <= 0,
      }));

  const agora = Date.now();

  const limite =
    agora +
    30 *
      24 *
      60 *
      60 *
      1000;

  const validade =
    estoque
      .filter(
        (item) =>
          Number(
            item.quantidade
          ) > 0 &&
          item.lote?.validade &&
          new Date(
            item.lote.validade
          ).getTime() <=
            limite
      )
      .map((item) => {
        const validade =
          item.lote!.validade!;

        return {
          genero:
            item.genero.nome,

          lote:
            item.lote?.numero,

          validade,

          quantidade:
            Number(
              item.quantidade
            ),

          unidade:
            item.genero.unidade
              .sigla,

          vencido:
            new Date(
              validade
            ).getTime() <
            agora,
        };
      });

  /*
   * RESUMO DAS MOVIMENTAÇÕES
   *
   * Mantido para compatibilidade com a tela atual.
   * Os totais não devem ser somados entre unidades
   * diferentes na apresentação.
   */
  const resumo: Record<
    string,
    number
  > = {
    SALDO_INICIAL: 0,
    RECEBIMENTO: 0,
    SAIDA: 0,
    DEVOLUCAO: 0,
    PERDA: 0,
    CORRECAO: 0,
    TRANSFERENCIA: 0,
  };

  for (const movimento of movimentacoes) {
    if (
      resumo[
        movimento.tipo
      ] !== undefined
    ) {
      resumo[
        movimento.tipo
      ] += Number(
        movimento.quantidade
      );
    }
  }

  return Response.json({
    inicio,
    fim,

    classe:
      classe || 'TODOS',

    timeZone:
      TIME_ZONE,

    resumo,

    resumoEfetivo,

    refeicoesRelacionadas,

    entradas,
    saidas,
    devolucoes,

    movimentacoes:
      movimentosDetalhados,

    generos,

    posicaoEstoque,

    efetivos,

    arranchamentos:
      efetivos,

    estoqueBaixo,

    validade,

    alertas: {
      estoqueBaixo,
      validade,

      total:
        estoqueBaixo.length +
        validade.length,
    },
  });
}

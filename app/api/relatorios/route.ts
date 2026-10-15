import { ClasseOperacao } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const TIME_ZONE = 'America/Campo_Grande';

function inicioUtcDoDiaLocal(data: string) {
  return new Date(
    `${data.slice(0, 10)}T04:00:00.000Z`
  );
}

function fimUtcDoDiaLocal(data: string) {
  const inicio =
    inicioUtcDoDiaLocal(data);

  return new Date(
    inicio.getTime() +
      24 * 60 * 60 * 1000 -
      1
  );
}

function dataHojeLocal() {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(new Date());

  const ano =
    partes.find(
      (p) => p.type === 'year'
    )?.value;

  const mes =
    partes.find(
      (p) => p.type === 'month'
    )?.value;

  const dia =
    partes.find(
      (p) => p.type === 'day'
    )?.value;

  return `${ano}-${mes}-${dia}`;
}

function chaveGenero(
  generoId: string
) {
  return generoId;
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
    new URL(req.url).searchParams;

  const hoje =
    dataHojeLocal();

  const inicio =
    parametros.get('inicio') ||
    hoje;

  const fim =
    parametros.get('fim') ||
    inicio;

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
        criadoEm: 'desc',
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
        quantidade: {
          gt: 0,
        },

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
  ]);

  const saldoAtual =
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
        quantidade: number;
      }
    >();

  for (const item of estoque) {
    const id =
      chaveGenero(
        item.generoId
      );

    let registro =
      saldoAtual.get(id);

    if (!registro) {
      registro = {
        generoId:
          item.generoId,

        nome:
          item.genero.nome,

        classe:
          item.genero.classe,

        unidade:
          item.genero.unidade
            .sigla,

        categoriaId:
          item.genero.categoria
            ?.id || null,

        categoria:
          item.genero.categoria
            ?.nome ||
          'Sem categoria',

        grupoId:
          item.genero.categoria
            ?.grupo?.id ||
          null,

        grupo:
          item.genero.categoria
            ?.grupo?.nome ||
          'Sem grupo',

        quantidade: 0,
      };

      saldoAtual.set(
        id,
        registro
      );
    }

    registro.quantidade +=
      Number(
        item.quantidade
      );
  }

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

  function obterGenero(
    movimento: (typeof movimentacoes)[number]
  ) {
    const id =
      chaveGenero(
        movimento.generoId
      );

    let registro =
      porGenero.get(id);

    if (!registro) {
      const saldo =
        saldoAtual.get(id);

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
          movimento.genero
            .categoria?.id ||
          saldo?.categoriaId ||
          null,

        categoria:
          movimento.genero
            .categoria?.nome ||
          saldo?.categoria ||
          'Sem categoria',

        grupoId:
          movimento.genero
            .categoria?.grupo
            ?.id ||
          saldo?.grupoId ||
          null,

        grupo:
          movimento.genero
            .categoria?.grupo
            ?.nome ||
          saldo?.grupo ||
          'Sem grupo',

        saldoInicial: 0,
        recebimentos: 0,
        saidas: 0,
        devolucoes: 0,
        perdas: 0,
        correcoes: 0,
        transferencias: 0,

        saldoAtual:
          saldo?.quantidade ||
          0,

        movimentacoes: [],
      };

      porGenero.set(
        id,
        registro
      );
    }

    return registro;
  }

  for (
    const movimento of movimentacoes
  ) {
    const registro =
      obterGenero(
        movimento
      );

    const quantidade =
      Number(
        movimento.quantidade
      );

    switch (
      movimento.tipo
    ) {
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

      tipo:
        movimento.tipo,

      quantidade,

      dataHora:
        movimento.criadoEm,

      lote:
        movimento.lote
          ?.numero ||
        null,

      localOrigem:
        movimento.localOrigem
          ?.nome ||
        null,

      localDestino:
        movimento.localDestino
          ?.nome ||
        null,

      observacao:
        movimento.observacao ||
        null,
    });
  }

  for (
    const saldo of saldoAtual.values()
  ) {
    if (
      !porGenero.has(
        saldo.generoId
      )
    ) {
      porGenero.set(
        saldo.generoId,
        {
          generoId:
            saldo.generoId,

          nome:
            saldo.nome,

          classe:
            saldo.classe,

          unidade:
            saldo.unidade,

          categoriaId:
            saldo.categoriaId,

          categoria:
            saldo.categoria,

          grupoId:
            saldo.grupoId,

          grupo:
            saldo.grupo,

          saldoInicial: 0,
          recebimentos: 0,
          saidas: 0,
          devolucoes: 0,
          perdas: 0,
          correcoes: 0,
          transferencias: 0,

          saldoAtual:
            saldo.quantidade,

          movimentacoes: [],
        }
      );
    }
  }

  const generos =
    Array.from(
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

      if (
        categoria !== 0
      ) {
        return categoria;
      }

      return a.nome.localeCompare(
        b.nome,
        'pt-BR'
      );
    });

  const estoqueBaixo =
    estoque
      .filter(
        (item) =>
          item.genero
            .estoqueMinimo !=
          null
      )
      .reduce(
        (
          acumulado: any[],
          item
        ) => {
          let registro =
            acumulado.find(
              (x) =>
                x.id ===
                item.generoId
            );

          if (!registro) {
            registro = {
              id:
                item.generoId,

              nome:
                item.genero
                  .nome,

              unidade:
                item.genero
                  .unidade
                  .sigla,

              qtd: 0,

              min: Number(
                item.genero
                  .estoqueMinimo
              ),
            };

            acumulado.push(
              registro
            );
          }

          registro.qtd +=
            Number(
              item.quantidade
            );

          return acumulado;
        },
        []
      )
      .filter(
        (item) =>
          item.qtd <
          item.min
      );

  const agora =
    Date.now();

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
          item.lote
            ?.validade &&
          new Date(
            item.lote.validade
          ).getTime() <=
            limite
      )
      .map((item) => ({
        genero:
          item.genero.nome,

        lote:
          item.lote
            ?.numero,

        validade:
          item.lote
            ?.validade,

        quantidade:
          Number(
            item.quantidade
          ),

        unidade:
          item.genero
            .unidade.sigla,
      }));

  const efetivos =
    arranchamentos.map(
      (item) => ({
        id: item.id,

        data:
          item.data,

        refeicao:
          item.refeicao,

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

        arranchadosCompareceram:
          item.arranchadosCompareceram,

        naoArranchadosAtendidos:
          item.naoArranchadosAtendidos,

        totalAtendido:
          item.totalAtendido,

        sobraKg:
          item.sobraKg != null
            ? Number(
                item.sobraKg
              )
            : null,

        fechamentoRealizadoEm:
          item.fechamentoRealizadoEm,

        observacao:
          item.observacao,

        usuario:
          item.usuario,
      })
    );

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

  for (
    const movimento of movimentacoes
  ) {
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
      classe ||
      'TODOS',

    timeZone:
      TIME_ZONE,

    resumo,

    movimentacoes:
      movimentacoes.map(
        (item) => ({
          ...item,

          quantidade:
            Number(
              item.quantidade
            ),

          valorUnitario:
            item.valorUnitario !=
            null
              ? Number(
                  item.valorUnitario
                )
              : null,
        })
      ),

    generos,

    efetivos,

    arranchamentos:
      efetivos,

    estoqueBaixo,

    validade,
  });
}

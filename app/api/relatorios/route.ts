import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

function dt(s: string, end = false) {
  return new Date(
    s.slice(0, 10) +
      (end ? 'T23:59:59.999Z' : 'T00:00:00.000Z')
  );
}

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const q = new URL(req.url).searchParams;

  const hoje = new Date().toISOString().slice(0, 10);
  const inicio = q.get('inicio') || hoje;
  const fim = q.get('fim') || inicio;
  const classe = q.get('classe');

  const where: any = {
    criadoEm: {
      gte: dt(inicio),
      lte: dt(fim, true),
    },
  };

  if (classe === 'QS' || classe === 'QR') {
    where.classe = classe;
  }

  const movimentacoes = await prisma.movimentacaoEstoque.findMany({
    where,
    include: {
      genero: {
        include: {
          unidade: true,
        },
      },
      localOrigem: true,
      localDestino: true,
      lote: true,
    },
    orderBy: {
      criadoEm: 'desc',
    },
  });

  const arranchamentos = await prisma.arranchamento.findMany({
    where: {
      data: {
        gte: dt(inicio),
        lte: dt(fim, true),
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

  const estoque = await prisma.estoqueLocal.findMany({
    where: {
      quantidade: {
        gt: 0,
      },
      genero: {
        situacao: 'ATIVO',
        ...(classe === 'QS' || classe === 'QR'
          ? { classe }
          : {}),
      },
    },
    include: {
      genero: {
        include: {
          unidade: true,
        },
      },
      local: true,
      lote: true,
    },
  });

  const resumo: Record<string, number> = {
    SALDO_INICIAL: 0,
    RECEBIMENTO: 0,
    SAIDA: 0,
    DEVOLUCAO: 0,
    PERDA: 0,
    CORRECAO: 0,
    TRANSFERENCIA: 0,
  };

  for (const movimento of movimentacoes) {
    resumo[movimento.tipo] += Number(movimento.quantidade);
  }

  const estoqueBaixo = estoque
    .filter((item) => item.genero.estoqueMinimo != null)
    .reduce((acumulado: any[], item) => {
      let registro = acumulado.find(
        (x) => x.id === item.generoId
      );

      if (!registro) {
        registro = {
          id: item.generoId,
          nome: item.genero.nome,
          unidade: item.genero.unidade.sigla,
          qtd: 0,
          min: Number(item.genero.estoqueMinimo),
        };

        acumulado.push(registro);
      }

      registro.qtd += Number(item.quantidade);

      return acumulado;
    }, [])
    .filter((item) => item.qtd < item.min);

  const agora = Date.now();
  const limite = agora + 30 * 86400000;

  const validade = estoque
    .filter(
      (item) =>
        item.lote?.validade &&
        new Date(item.lote.validade).getTime() <= limite
    )
    .map((item) => ({
      genero: item.genero.nome,
      lote: item.lote?.numero,
      validade: item.lote?.validade,
      quantidade: Number(item.quantidade),
      unidade: item.genero.unidade.sigla,
    }));

  const efetivos = arranchamentos.map((item) => ({
    id: item.id,
    data: item.data,
    refeicao: item.refeicao,

    oficiaisStenSgt: item.oficiaisStenSgt,
    cabosSoldados: item.cabosSoldados,
    outrosPrevistos: item.outrosPrevistos,

    quantidade: item.totalPrevisto,
    totalPrevisto: item.totalPrevisto,

    margemSegurancaPercent: Number(
      item.margemSegurancaPercent
    ),

    efetivoPlanejamento: item.efetivoPlanejamento,

    arranchadosCompareceram:
      item.arranchadosCompareceram,

    naoArranchadosAtendidos:
      item.naoArranchadosAtendidos,

    totalAtendido: item.totalAtendido,

    sobraKg:
      item.sobraKg != null
        ? Number(item.sobraKg)
        : null,

    fechamentoRealizadoEm:
      item.fechamentoRealizadoEm,

    observacao: item.observacao,
    usuario: item.usuario,
  }));

  return Response.json({
    inicio,
    fim,
    classe: classe || 'TODOS',

    resumo,

    movimentacoes: movimentacoes.map((item) => ({
      ...item,
      quantidade: Number(item.quantidade),
      valorUnitario:
        item.valorUnitario != null
          ? Number(item.valorUnitario)
          : null,
    })),

    efetivos,
    arranchamentos: efetivos,

    estoqueBaixo,
    validade,
  });
}

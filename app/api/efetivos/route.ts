import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import { z } from 'zod';

const Refeicao = z.enum([
  'CAFE_DA_MANHA',
  'ALMOCO',
  'JANTAR',
  'CEIA',
  'OUTRO',
]);

const ArranchamentoSchema = z.object({
  data: z.string().min(10),
  refeicao: Refeicao,

  oficiaisStenSgt: z.coerce.number().int().min(0).default(0),
  cabosSoldados: z.coerce.number().int().min(0).default(0),
  outrosPrevistos: z.coerce.number().int().min(0).default(0),

  totalPrevisto: z.coerce.number().int().min(0).optional(),

  margemSegurancaPercent: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(10),

  observacao: z.string().optional(),
});

function dia(s: string) {
  return new Date(s.slice(0, 10) + 'T12:00:00.000Z');
}

export async function GET(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const url = new URL(req.url);

  const inicio = url.searchParams.get('inicio');
  const fim = url.searchParams.get('fim');

  const rows = await prisma.arranchamento.findMany({
    where:
      inicio && fim
        ? {
            data: {
              gte: dia(inicio),
              lte: dia(fim),
            },
          }
        : {},
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
        data: 'desc',
      },
      {
        refeicao: 'asc',
      },
    ],
  });

  return Response.json(rows);
}

export async function POST(req: Request) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const body = await req.json();
  const validacao = ArranchamentoSchema.safeParse(body);

  if (!validacao.success) {
    return Response.json(
      {
        error: 'Informe corretamente a data, a refeição e o efetivo previsto.',
      },
      {
        status: 400,
      }
    );
  }

  const dados = validacao.data;

  const somaCategorias =
    dados.oficiaisStenSgt +
    dados.cabosSoldados +
    dados.outrosPrevistos;

  const totalPrevisto =
    dados.totalPrevisto !== undefined
      ? dados.totalPrevisto
      : somaCategorias;

  if (totalPrevisto <= 0) {
    return Response.json(
      {
        error: 'Informe o total de militares arranchados para esta refeição.',
      },
      {
        status: 400,
      }
    );
  }

  const margem = dados.margemSegurancaPercent;

  const efetivoPlanejamento = Math.ceil(
    totalPrevisto * (1 + margem / 100)
  );

  const data = dia(dados.data);

  const anterior = await prisma.arranchamento.findUnique({
    where: {
      data_refeicao: {
        data,
        refeicao: dados.refeicao,
      },
    },
  });

  const row = await prisma.arranchamento.upsert({
    where: {
      data_refeicao: {
        data,
        refeicao: dados.refeicao,
      },
    },

    update: {
      oficiaisStenSgt: dados.oficiaisStenSgt,
      cabosSoldados: dados.cabosSoldados,
      outrosPrevistos: dados.outrosPrevistos,
      totalPrevisto,
      margemSegurancaPercent: margem,
      efetivoPlanejamento,
      observacao: dados.observacao,
      usuarioId: g.user!.id,
    },

    create: {
      data,
      refeicao: dados.refeicao,
      oficiaisStenSgt: dados.oficiaisStenSgt,
      cabosSoldados: dados.cabosSoldados,
      outrosPrevistos: dados.outrosPrevistos,
      totalPrevisto,
      margemSegurancaPercent: margem,
      efetivoPlanejamento,
      observacao: dados.observacao,
      usuarioId: g.user!.id,
    },
  });

  await prisma.auditoria.create({
    data: {
      usuarioId: g.user!.id,
      acao: anterior
        ? 'ALTERACAO_ARRANCHAMENTO'
        : 'REGISTRO_ARRANCHAMENTO',
      entidade: 'Arranchamento',
      entidadeId: row.id,

      dadosAnteriores: anterior
        ? {
            data: dados.data,
            refeicao: anterior.refeicao,
            oficiaisStenSgt: anterior.oficiaisStenSgt,
            cabosSoldados: anterior.cabosSoldados,
            outrosPrevistos: anterior.outrosPrevistos,
            totalPrevisto: anterior.totalPrevisto,
            margemSegurancaPercent:
              anterior.margemSegurancaPercent.toString(),
            efetivoPlanejamento: anterior.efetivoPlanejamento,
          }
        : undefined,

      dadosNovos: {
        data: dados.data,
        refeicao: dados.refeicao,
        oficiaisStenSgt: dados.oficiaisStenSgt,
        cabosSoldados: dados.cabosSoldados,
        outrosPrevistos: dados.outrosPrevistos,
        totalPrevisto,
        margemSegurancaPercent: margem,
        efetivoPlanejamento,
      },
    },
  });

  return Response.json(row);
}

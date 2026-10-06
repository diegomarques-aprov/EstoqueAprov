import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const dadosLocal = z.object({
  nome: z.string().trim().min(2),
  descricao: z.string().trim().optional(),
});

export async function GET() {
  const g = await requireAdmin();
  if (g.error) return g.error;

  return Response.json(
    await prisma.localArmazenamento.findMany({
      where: { situacao: 'ATIVO' },
      orderBy: { nome: 'asc' },
    })
  );
}

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;

  const p = dadosLocal.safeParse(await req.json());

  if (!p.success) {
    return Response.json(
      { error: 'Informe o nome do local.' },
      { status: 400 }
    );
  }

  try {
    const x = await prisma.localArmazenamento.create({
      data: {
        nome: p.data.nome,
        descricao: p.data.descricao || undefined,
      },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: g.user!.id,
        acao: 'CRIAR',
        entidade: 'LocalArmazenamento',
        entidadeId: x.id,
        dadosNovos: p.data,
      },
    });

    return Response.json(x);
  } catch {
    return Response.json(
      { error: 'Já existe um local com esse nome.' },
      { status: 409 }
    );
  }
}

export async function PUT(req: Request) {
  const g = await requireAdmin();
  if (g.error) return g.error;

  const p = z.object({
    id: z.string().min(1),
    nome: z.string().trim().min(2),
    descricao: z.string().trim().optional(),
  }).safeParse(await req.json());

  if (!p.success) {
    return Response.json(
      { error: 'Para atualizar o local, informe o nome corretamente.' },
      { status: 400 }
    );
  }

  const atual = await prisma.localArmazenamento.findUnique({
    where: { id: p.data.id },
  });

  if (!atual) {
    return Response.json(
      { error: 'Local não encontrado.' },
      { status: 404 }
    );
  }

  try {
    const atualizado = await prisma.localArmazenamento.update({
      where: { id: p.data.id },
      data: {
        nome: p.data.nome,
        descricao: p.data.descricao || null,
      },
    });

    await prisma.auditoria.create({
      data: {
        usuarioId: g.user!.id,
        acao: 'EDITAR',
        entidade: 'LocalArmazenamento',
        entidadeId: atualizado.id,
        dadosAnteriores: {
          nome: atual.nome,
          descricao: atual.descricao,
        },
        dadosNovos: {
          nome: atualizado.nome,
          descricao: atualizado.descricao,
        },
      },
    });

    return Response.json(atualizado);
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível atualizar. Verifique se já existe outro local com esse nome.',
      },
      { status: 409 }
    );
  }
}

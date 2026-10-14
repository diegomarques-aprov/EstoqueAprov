import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import { z } from 'zod';

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome do grupo.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),

  descricao: z
    .string()
    .trim()
    .max(200, 'A descrição deve ter no máximo 200 caracteres.')
    .nullable()
    .optional(),
});

const alteracaoSchema = cadastroSchema.extend({
  id: z.string().min(1, 'Grupo inválido.'),
  situacao: z.enum(['ATIVO', 'INATIVO']),
});

export async function GET() {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const grupos = await prisma.grupoGenero.findMany({
    include: {
      _count: {
        select: {
          categorias: true,
        },
      },
    },
    orderBy: [
      {
        situacao: 'asc',
      },
      {
        nome: 'asc',
      },
    ],
  });

  return Response.json(grupos);
}

export async function POST(request: Request) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  try {
    const body = cadastroSchema.parse(
      await request.json()
    );

    const existente = await prisma.grupoGenero.findUnique({
      where: {
        nome: body.nome,
      },
    });

    if (existente) {
      return Response.json(
        {
          error: 'Já existe um grupo com esse nome.',
        },
        {
          status: 409,
        }
      );
    }

    const grupo = await prisma.grupoGenero.create({
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        situacao: 'ATIVO',
      },
    });

    return Response.json(
      {
        ok: true,
        grupo,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error:
            error.issues[0]?.message ||
            'Dados inválidos.',
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        error:
          'Não foi possível cadastrar o grupo.',
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(request: Request) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  try {
    const body = alteracaoSchema.parse(
      await request.json()
    );

    const grupoAtual = await prisma.grupoGenero.findUnique({
      where: {
        id: body.id,
      },
      include: {
        _count: {
          select: {
            categorias: true,
          },
        },
      },
    });

    if (!grupoAtual) {
      return Response.json(
        {
          error: 'Grupo não encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    const mesmoNome = await prisma.grupoGenero.findUnique({
      where: {
        nome: body.nome,
      },
    });

    if (
      mesmoNome &&
      mesmoNome.id !== body.id
    ) {
      return Response.json(
        {
          error:
            'Já existe outro grupo com esse nome.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      body.situacao === 'INATIVO' &&
      grupoAtual._count.categorias > 0
    ) {
      return Response.json(
        {
          error:
            'Este grupo possui categorias vinculadas. Altere as categorias vinculadas antes de inativá-lo.',
        },
        {
          status: 409,
        }
      );
    }

    const grupo = await prisma.grupoGenero.update({
      where: {
        id: body.id,
      },
      data: {
        nome: body.nome,
        descricao: body.descricao || null,
        situacao: body.situacao,
      },
    });

    return Response.json({
      ok: true,
      grupo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error:
            error.issues[0]?.message ||
            'Dados inválidos.',
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        error:
          'Não foi possível alterar o grupo.',
      },
      {
        status: 500,
      }
    );
  }
}

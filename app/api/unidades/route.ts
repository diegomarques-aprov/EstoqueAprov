import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import { z } from 'zod';

const cadastroSchema = z.object({
  sigla: z
    .string()
    .trim()
    .min(1, 'Informe a sigla da unidade.')
    .max(10, 'A sigla deve ter no máximo 10 caracteres.'),

  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome da unidade.')
    .max(60, 'O nome deve ter no máximo 60 caracteres.'),
});

const alteracaoSchema = z.object({
  id: z.string().min(1),

  sigla: z
    .string()
    .trim()
    .min(1, 'Informe a sigla da unidade.')
    .max(10),

  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome da unidade.')
    .max(60),

  situacao: z.enum(['ATIVO', 'INATIVO']),
});

export async function GET() {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const unidades =
    await prisma.unidadeMedida.findMany({
      orderBy: [
        {
          situacao: 'asc',
        },
        {
          nome: 'asc',
        },
      ],
    });

  return Response.json(unidades);
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

    const existente =
      await prisma.unidadeMedida.findUnique({
        where: {
          sigla: body.sigla,
        },
      });

    if (existente) {
      return Response.json(
        {
          error:
            'Já existe uma unidade de medida com essa sigla.',
        },
        {
          status: 409,
        }
      );
    }

    const unidade =
      await prisma.unidadeMedida.create({
        data: {
          sigla: body.sigla,
          nome: body.nome,
          situacao: 'ATIVO',
        },
      });

    return Response.json(
      {
        ok: true,
        unidade,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
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
          'Não foi possível cadastrar a unidade de medida.',
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

    const unidadeAtual =
      await prisma.unidadeMedida.findUnique({
        where: {
          id: body.id,
        },
        include: {
          _count: {
            select: {
              generos: true,
            },
          },
        },
      });

    if (!unidadeAtual) {
      return Response.json(
        {
          error:
            'Unidade de medida não encontrada.',
        },
        {
          status: 404,
        }
      );
    }

    const mesmaSigla =
      await prisma.unidadeMedida.findUnique({
        where: {
          sigla: body.sigla,
        },
      });

    if (
      mesmaSigla &&
      mesmaSigla.id !== body.id
    ) {
      return Response.json(
        {
          error:
            'Já existe outra unidade de medida com essa sigla.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      body.situacao === 'INATIVO' &&
      unidadeAtual._count.generos > 0
    ) {
      return Response.json(
        {
          error:
            'Esta unidade está vinculada a gêneros cadastrados. Altere os gêneros vinculados antes de inativá-la.',
        },
        {
          status: 409,
        }
      );
    }

    const unidade =
      await prisma.unidadeMedida.update({
        where: {
          id: body.id,
        },
        data: {
          sigla: body.sigla,
          nome: body.nome,
          situacao: body.situacao,
        },
      });

    return Response.json({
      ok: true,
      unidade,
    });
  } catch (error: any) {
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
          'Não foi possível alterar a unidade de medida.',
      },
      {
        status: 500,
      }
    );
  }
}

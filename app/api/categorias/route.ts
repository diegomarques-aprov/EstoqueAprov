import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';
import { z } from 'zod';

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome da categoria.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),

  grupoId: z.string().nullable().optional(),

  controlaLotePadrao: z.boolean().nullable().optional(),

  controlaValidadePadrao: z
    .boolean()
    .nullable()
    .optional(),

  localPadraoId: z.string().nullable().optional(),
});

const alteracaoSchema = cadastroSchema.extend({
  id: z.string().min(1, 'Categoria inválida.'),
  situacao: z.enum(['ATIVO', 'INATIVO']),
});

async function validarGrupo(grupoId?: string | null) {
  if (!grupoId) {
    return null;
  }

  const grupo = await prisma.grupoGenero.findUnique({
    where: {
      id: grupoId,
    },
  });

  if (!grupo || grupo.situacao !== 'ATIVO') {
    return Response.json(
      {
        error:
          'O grupo informado não existe ou está inativo.',
      },
      {
        status: 400,
      }
    );
  }

  return null;
}

async function validarLocal(localPadraoId?: string | null) {
  if (!localPadraoId) {
    return null;
  }

  const local = await prisma.localArmazenamento.findUnique({
    where: {
      id: localPadraoId,
    },
  });

  if (!local || local.situacao !== 'ATIVO') {
    return Response.json(
      {
        error:
          'O local habitual informado não existe ou está inativo.',
      },
      {
        status: 400,
      }
    );
  }

  return null;
}

export async function GET() {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const categorias = await prisma.categoria.findMany({
    include: {
      grupo: true,
      localPadrao: true,
      _count: {
        select: {
          generos: true,
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

  return Response.json(categorias);
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

    const existente = await prisma.categoria.findUnique({
      where: {
        nome: body.nome,
      },
    });

    if (existente) {
      return Response.json(
        {
          error:
            'Já existe uma categoria com esse nome.',
        },
        {
          status: 409,
        }
      );
    }

    const erroGrupo = await validarGrupo(body.grupoId);

    if (erroGrupo) {
      return erroGrupo;
    }

    const erroLocal = await validarLocal(
      body.localPadraoId
    );

    if (erroLocal) {
      return erroLocal;
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: body.nome,

        grupoId: body.grupoId || null,

        controlaLotePadrao:
          body.controlaLotePadrao ?? null,

        controlaValidadePadrao:
          body.controlaValidadePadrao ?? null,

        localPadraoId:
          body.localPadraoId || null,

        situacao: 'ATIVO',
      },
      include: {
        grupo: true,
        localPadrao: true,
      },
    });

    return Response.json(
      {
        ok: true,
        categoria,
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
          'Não foi possível cadastrar a categoria.',
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

    const categoriaAtual =
      await prisma.categoria.findUnique({
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

    if (!categoriaAtual) {
      return Response.json(
        {
          error: 'Categoria não encontrada.',
        },
        {
          status: 404,
        }
      );
    }

    const mesmoNome =
      await prisma.categoria.findUnique({
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
            'Já existe outra categoria com esse nome.',
        },
        {
          status: 409,
        }
      );
    }

    const erroGrupo = await validarGrupo(body.grupoId);

    if (erroGrupo) {
      return erroGrupo;
    }

    const erroLocal = await validarLocal(
      body.localPadraoId
    );

    if (erroLocal) {
      return erroLocal;
    }

    if (
      body.situacao === 'INATIVO' &&
      categoriaAtual._count.generos > 0
    ) {
      return Response.json(
        {
          error:
            'Esta categoria está vinculada a gêneros cadastrados. Altere os gêneros vinculados antes de inativá-la.',
        },
        {
          status: 409,
        }
      );
    }

    const categoria = await prisma.categoria.update({
      where: {
        id: body.id,
      },
      data: {
        nome: body.nome,

        grupoId: body.grupoId || null,

        controlaLotePadrao:
          body.controlaLotePadrao ?? null,

        controlaValidadePadrao:
          body.controlaValidadePadrao ?? null,

        localPadraoId:
          body.localPadraoId || null,

        situacao: body.situacao,
      },
      include: {
        grupo: true,
        localPadrao: true,
      },
    });

    return Response.json({
      ok: true,
      categoria,
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
          'Não foi possível alterar a categoria.',
      },
      {
        status: 500,
      }
    );
  }
}

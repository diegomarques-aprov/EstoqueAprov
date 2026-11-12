import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  requireAdmin,
  requireOperacaoEstoque,
} from '@/lib/guard';

const dadosLocal = z.object({
  nome: z.string().trim().min(2),
  descricao: z.string().trim().optional(),
});

export async function GET() {
  const g =
    await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  return Response.json(
    await prisma.localArmazenamento.findMany({
      where: {
        situacao: 'ATIVO',
      },

      orderBy: {
        nome: 'asc',
      },
    })
  );
}

export async function POST(
  req: Request
) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const p = dadosLocal.safeParse(
    await req.json()
  );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe o nome do local.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    const x =
      await prisma.localArmazenamento.create({
        data: {
          nome: p.data.nome,

          descricao:
            p.data.descricao ||
            undefined,
        },
      });

    await prisma.auditoria.create({
      data: {
        usuarioId:
          g.user!.id,

        acao: 'CRIAR',

        entidade:
          'LocalArmazenamento',

        entidadeId: x.id,

        dadosNovos: p.data,
      },
    });

    return Response.json(x);
  } catch {
    return Response.json(
      {
        error:
          'Já existe um local com esse nome.',
      },
      {
        status: 409,
      }
    );
  }
}

export async function PUT(
  req: Request
) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const p = z
    .object({
      id: z.string().min(1),

      nome:
        z.string().trim().min(2),

      descricao:
        z.string().trim().optional(),
    })
    .safeParse(
      await req.json()
    );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Para atualizar o local, informe o nome corretamente.',
      },
      {
        status: 400,
      }
    );
  }

  const atual =
    await prisma.localArmazenamento.findUnique({
      where: {
        id: p.data.id,
      },
    });

  if (!atual) {
    return Response.json(
      {
        error:
          'Local não encontrado.',
      },
      {
        status: 404,
      }
    );
  }

  try {
    const atualizado =
      await prisma.localArmazenamento.update({
        where: {
          id: p.data.id,
        },

        data: {
          nome: p.data.nome,

          descricao:
            p.data.descricao ||
            null,
        },
      });

    await prisma.auditoria.create({
      data: {
        usuarioId:
          g.user!.id,

        acao: 'EDITAR',

        entidade:
          'LocalArmazenamento',

        entidadeId:
          atualizado.id,

        dadosAnteriores: {
          nome: atual.nome,

          descricao:
            atual.descricao,
        },

        dadosNovos: {
          nome:
            atualizado.nome,

          descricao:
            atualizado.descricao,
        },
      },
    });

    return Response.json(
      atualizado
    );
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível atualizar. Verifique se já existe outro local com esse nome.',
      },
      {
        status: 409,
      }
    );
  }
}

export async function DELETE(
  req: Request
) {
  const g = await requireAdmin();

  if (g.error) {
    return g.error;
  }

  const p = z
    .object({
      id: z.string().min(1),
    })
    .safeParse(
      await req.json()
    );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe o local que deseja excluir.',
      },
      {
        status: 400,
      }
    );
  }

  const local =
    await prisma.localArmazenamento.findUnique({
      where: {
        id: p.data.id,
      },

      include: {
        _count: {
          select: {
            categoriasPadrao: true,
            generosPadrao: true,
            estoques: true,
            itensRecebimento: true,
            movimentacoesOrigem: true,
            movimentacoesDestino: true,
          },
        },
      },
    });

  if (!local) {
    return Response.json(
      {
        error:
          'Local não encontrado.',
      },
      {
        status: 404,
      }
    );
  }

  const vinculos =
    local._count.categoriasPadrao +
    local._count.generosPadrao +
    local._count.estoques +
    local._count.itensRecebimento +
    local._count.movimentacoesOrigem +
    local._count.movimentacoesDestino;

  if (vinculos > 0) {
    const motivos: string[] = [];

    if (
      local._count.categoriasPadrao >
      0
    ) {
      motivos.push(
        'categoria(s)'
      );
    }

    if (
      local._count.generosPadrao >
      0
    ) {
      motivos.push(
        'gênero(s)'
      );
    }

    if (
      local._count.estoques > 0
    ) {
      motivos.push(
        'registro(s) de estoque'
      );
    }

    if (
      local._count.itensRecebimento >
      0
    ) {
      motivos.push(
        'recebimento(s)'
      );
    }

    if (
      local._count
        .movimentacoesOrigem >
        0 ||
      local._count
        .movimentacoesDestino >
        0
    ) {
      motivos.push(
        'movimentação(ões) de estoque'
      );
    }

    return Response.json(
      {
        error:
          `O local "${local.nome}" não pode ser excluído porque já está vinculado a ${motivos.join(
            ', '
          )}. Para preservar o histórico do estoque, remova primeiro os vínculos permitidos ou mantenha este local cadastrado.`,
      },
      {
        status: 409,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao: 'EXCLUIR',

            entidade:
              'LocalArmazenamento',

            entidadeId:
              local.id,

            dadosAnteriores: {
              nome: local.nome,

              descricao:
                local.descricao,

              situacao:
                local.situacao,
            },
          },
        });

        await tx.localArmazenamento.delete({
          where: {
            id: local.id,
          },
        });
      }
    );

    return Response.json({
      ok: true,

      mensagem:
        `Local "${local.nome}" excluído com sucesso.`,
    });
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível excluir o local. Verifique se ele possui algum vínculo com o estoque.',
      },
      {
        status: 409,
      }
    );
  }
}

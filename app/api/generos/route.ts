import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  requireAdmin,
  requireOperacaoEstoque,
} from '@/lib/guard';

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, 'Informe o nome do gênero.')
    .max(120, 'Nome muito longo.'),

  classe: z.enum(['QS', 'QR']),

  categoriaId: z
    .string()
    .nullable()
    .optional(),

  unidadeId: z
    .string()
    .min(1, 'Informe a unidade de medida.'),

  controlaLote: z.boolean(),

  controlaValidade: z.boolean(),

  estoqueMinimo: z
    .union([
      z.number().nonnegative(),
      z.null(),
    ])
    .optional(),

  /*
   * Valor apenas de referência.
   *
   * Não representa crédito,
   * empenho ou saldo financeiro.
   *
   * Pode ser utilizado futuramente
   * para uma consulta opcional de
   * orçamento estimado.
   */
  valorUnitarioReferencia: z
    .union([
      z.number().nonnegative(),
      z.null(),
    ])
    .optional(),

  localPadraoId: z
    .string()
    .nullable()
    .optional(),
});

const alteracaoSchema =
  cadastroSchema.extend({
    id: z
      .string()
      .min(
        1,
        'Gênero inválido.'
      ),

    situacao: z.enum([
      'ATIVO',
      'INATIVO',
    ]),
  });

async function validarRelacionamentos(
  dados: z.infer<
    typeof cadastroSchema
  >
) {
  const unidade =
    await prisma.unidadeMedida.findUnique(
      {
        where: {
          id:
            dados.unidadeId,
        },
      }
    );

  if (
    !unidade ||
    unidade.situacao !==
      'ATIVO'
  ) {
    return 'A unidade de medida informada não existe ou está inativa.';
  }

  if (dados.categoriaId) {
    const categoria =
      await prisma.categoria.findUnique(
        {
          where: {
            id:
              dados.categoriaId,
          },
        }
      );

    if (
      !categoria ||
      categoria.situacao !==
        'ATIVO'
    ) {
      return 'A categoria informada não existe ou está inativa.';
    }
  }

  if (
    dados.localPadraoId
  ) {
    const local =
      await prisma.localArmazenamento.findUnique(
        {
          where: {
            id:
              dados.localPadraoId,
          },
        }
      );

    if (
      !local ||
      local.situacao !==
        'ATIVO'
    ) {
      return 'O local habitual informado não existe ou está inativo.';
    }
  }

  return null;
}

export async function GET(
  req: Request
) {
  const guard =
    await requireOperacaoEstoque();

  if (guard.error) {
    return guard.error;
  }

  const classe =
    new URL(
      req.url
    ).searchParams.get(
      'classe'
    );

  const generos =
    await prisma.genero.findMany(
      {
        where: {
          ...(classe ===
            'QS' ||
          classe === 'QR'
            ? { classe }
            : {}),
        },

        include: {
          categoria: {
            include: {
              grupo: true,
            },
          },

          unidade: true,
          localPadrao: true,
        },

        orderBy: [
          {
            situacao:
              'asc',
          },
          {
            nome: 'asc',
          },
        ],
      }
    );

  return Response.json(
    generos
  );
}

export async function POST(
  req: Request
) {
  const guard =
    await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const resultado =
    cadastroSchema.safeParse(
      await req.json()
    );

  if (
    !resultado.success
  ) {
    return Response.json(
      {
        error:
          resultado.error
            .issues[0]
            ?.message ||
          'Faltam informações obrigatórias no gênero.',
      },
      {
        status: 400,
      }
    );
  }

  const dados =
    resultado.data;

  const erroRelacionamento =
    await validarRelacionamentos(
      dados
    );

  if (
    erroRelacionamento
  ) {
    return Response.json(
      {
        error:
          erroRelacionamento,
      },
      {
        status: 400,
      }
    );
  }

  try {
    const genero =
      await prisma.genero.create(
        {
          data: {
            nome:
              dados.nome,

            classe:
              dados.classe,

            categoriaId:
              dados.categoriaId ||
              null,

            unidadeId:
              dados.unidadeId,

            controlaLote:
              dados.controlaLote,

            controlaValidade:
              dados.controlaValidade,

            estoqueMinimo:
              dados.estoqueMinimo ??
              undefined,

            valorUnitarioReferencia:
              dados.valorUnitarioReferencia ??
              null,

            localPadraoId:
              dados.localPadraoId ||
              null,

            situacao:
              'ATIVO',

            criadoPorId:
              guard.user!.id,
          },
        }
      );

    await prisma.auditoria.create(
      {
        data: {
          usuarioId:
            guard.user!.id,

          acao: 'CRIAR',

          entidade:
            'Genero',

          entidadeId:
            genero.id,

          dadosNovos: {
            nome:
              genero.nome,

            classe:
              genero.classe,

            categoriaId:
              genero.categoriaId,

            unidadeId:
              genero.unidadeId,

            controlaLote:
              genero.controlaLote,

            controlaValidade:
              genero.controlaValidade,

            estoqueMinimo:
              genero.estoqueMinimo,

            valorUnitarioReferencia:
              genero.valorUnitarioReferencia,

            localPadraoId:
              genero.localPadraoId,

            situacao:
              genero.situacao,
          },
        },
      }
    );

    return Response.json(
      genero,
      {
        status: 201,
      }
    );
  } catch {
    return Response.json(
      {
        error:
          'Já existe um gênero com este nome nesta classificação ou há um cadastro relacionado inválido.',
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
  const guard =
    await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const resultado =
    alteracaoSchema.safeParse(
      await req.json()
    );

  if (
    !resultado.success
  ) {
    return Response.json(
      {
        error:
          resultado.error
            .issues[0]
            ?.message ||
          'Dados inválidos para alteração do gênero.',
      },
      {
        status: 400,
      }
    );
  }

  const dados =
    resultado.data;

  const atual =
    await prisma.genero.findUnique(
      {
        where: {
          id:
            dados.id,
        },
      }
    );

  if (!atual) {
    return Response.json(
      {
        error:
          'Gênero não encontrado.',
      },
      {
        status: 404,
      }
    );
  }

  const erroRelacionamento =
    await validarRelacionamentos(
      dados
    );

  if (
    erroRelacionamento
  ) {
    return Response.json(
      {
        error:
          erroRelacionamento,
      },
      {
        status: 400,
      }
    );
  }

  try {
    const genero =
      await prisma.genero.update(
        {
          where: {
            id:
              dados.id,
          },

          data: {
            nome:
              dados.nome,

            classe:
              dados.classe,

            categoriaId:
              dados.categoriaId ||
              null,

            unidadeId:
              dados.unidadeId,

            controlaLote:
              dados.controlaLote,

            controlaValidade:
              dados.controlaValidade,

            estoqueMinimo:
              dados.estoqueMinimo ??
              null,

            valorUnitarioReferencia:
              dados.valorUnitarioReferencia ??
              null,

            localPadraoId:
              dados.localPadraoId ||
              null,

            situacao:
              dados.situacao,
          },
        }
      );

    await prisma.auditoria.create(
      {
        data: {
          usuarioId:
            guard.user!.id,

          acao:
            'ALTERAR',

          entidade:
            'Genero',

          entidadeId:
            genero.id,

          dadosAnteriores: {
            nome:
              atual.nome,

            classe:
              atual.classe,

            categoriaId:
              atual.categoriaId,

            unidadeId:
              atual.unidadeId,

            controlaLote:
              atual.controlaLote,

            controlaValidade:
              atual.controlaValidade,

            estoqueMinimo:
              atual.estoqueMinimo,

            valorUnitarioReferencia:
              atual.valorUnitarioReferencia,

            localPadraoId:
              atual.localPadraoId,

            situacao:
              atual.situacao,
          },

          dadosNovos: {
            nome:
              genero.nome,

            classe:
              genero.classe,

            categoriaId:
              genero.categoriaId,

            unidadeId:
              genero.unidadeId,

            controlaLote:
              genero.controlaLote,

            controlaValidade:
              genero.controlaValidade,

            estoqueMinimo:
              genero.estoqueMinimo,

            valorUnitarioReferencia:
              genero.valorUnitarioReferencia,

            localPadraoId:
              genero.localPadraoId,

            situacao:
              genero.situacao,
          },
        },
      }
    );

    return Response.json({
      ok: true,
      genero,
    });
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível alterar o gênero. Verifique se já existe outro gênero com os mesmos dados.',
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
  const guard =
    await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const resultado = z
    .object({
      id: z
        .string()
        .min(
          1,
          'Gênero inválido.'
        ),
    })
    .safeParse(
      await req.json()
    );

  if (!resultado.success) {
    return Response.json(
      {
        error:
          'Informe o gênero que deseja excluir.',
      },
      {
        status: 400,
      }
    );
  }

  const genero =
    await prisma.genero.findUnique({
      where: {
        id: resultado.data.id,
      },

      include: {
        _count: {
          select: {
            lotes: true,
            estoques: true,
            itensRecebimento: true,
            itensSaida: true,
            movimentacoesEstoque:
              true,
            referenciasConsumoQS:
              true,
            itensPlanejamentoRessuprimentoQS:
              true,
            itensRessuprimentoComplementarQS:
              true,
            itensCompraQR: true,
            itensRecebimentoCompraQR:
              true,
          },
        },
      },
    });

  if (!genero) {
    return Response.json(
      {
        error:
          'Gênero não encontrado.',
      },
      {
        status: 404,
      }
    );
  }

  const vinculos =
    genero._count;

  const possuiHistorico =
    vinculos.lotes > 0 ||
    vinculos.estoques > 0 ||
    vinculos.itensRecebimento > 0 ||
    vinculos.itensSaida > 0 ||
    vinculos.movimentacoesEstoque >
      0 ||
    vinculos.referenciasConsumoQS >
      0 ||
    vinculos
      .itensPlanejamentoRessuprimentoQS >
      0 ||
    vinculos
      .itensRessuprimentoComplementarQS >
      0 ||
    vinculos.itensCompraQR > 0 ||
    vinculos
      .itensRecebimentoCompraQR > 0;

  if (possuiHistorico) {
    return Response.json(
      {
        error:
          `O gênero "${genero.nome}" não pode ser excluído porque já possui vínculo ou histórico no sistema. Para preservar os registros do estoque, recebimentos, saídas e planejamentos, edite o gênero e altere sua situação para INATIVO.`,
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
              guard.user!.id,

            acao: 'EXCLUIR',

            entidade:
              'Genero',

            entidadeId:
              genero.id,

            dadosAnteriores: {
              nome:
                genero.nome,

              classe:
                genero.classe,

              categoriaId:
                genero.categoriaId,

              unidadeId:
                genero.unidadeId,

              controlaLote:
                genero.controlaLote,

              controlaValidade:
                genero.controlaValidade,

              estoqueMinimo:
                genero.estoqueMinimo,

              valorUnitarioReferencia:
                genero.valorUnitarioReferencia,

              localPadraoId:
                genero.localPadraoId,

              situacao:
                genero.situacao,
            },
          },
        });

        await tx.genero.delete({
          where: {
            id: genero.id,
          },
        });
      }
    );

    return Response.json({
      ok: true,

      mensagem:
        `Gênero "${genero.nome}" excluído com sucesso.`,
    });
  } catch {
    return Response.json(
      {
        error:
          'Não foi possível excluir o gênero. Verifique se existe algum vínculo com registros do sistema.',
      },
      {
        status: 409,
      }
    );
  }
}

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  estoqueId: z
    .string()
    .min(1),

  quantidade: z
    .number()
    .positive(),

  motivo: z
    .string()
    .trim()
    .min(3),
});

const EPSILON = 1e-9;

export async function POST(
  req: Request
) {
  const g =
    await requireOperacaoEstoque();

  if (g.error) {
    return g.error;
  }

  const p =
    body.safeParse(
      await req.json()
    );

  if (!p.success) {
    return Response.json(
      {
        error:
          'Informe a quantidade e descreva o motivo da perda/descarte.',
      },
      {
        status: 400,
      }
    );
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        /*
         * A perda é registrada diretamente
         * sobre um saldo físico existente,
         * preservando gênero, lote e local.
         */
        const estoque =
          await tx.estoqueLocal.findUnique({
            where: {
              id:
                p.data.estoqueId,
            },

            include: {
              genero: true,
            },
          });

        if (!estoque) {
          throw new Error(
            'NAO_ENCONTRADO'
          );
        }

        const saldoAnterior =
          Number(
            estoque.quantidade
          );

        /*
         * Nunca permitir perda superior
         * ao saldo físico disponível.
         */
        if (
          p.data.quantidade >
          saldoAnterior + EPSILON
        ) {
          throw new Error(
            'SALDO'
          );
        }

        const saldoCalculado =
          saldoAnterior -
          p.data.quantidade;

        /*
         * Elimina eventual resíduo
         * numérico muito próximo de zero.
         */
        const saldoFinal =
          Math.abs(
            saldoCalculado
          ) <= EPSILON
            ? 0
            : saldoCalculado;

        await tx.estoqueLocal.update({
          where: {
            id:
              estoque.id,
          },

          data: {
            quantidade:
              saldoFinal,
          },
        });

        /*
         * Movimentação física da perda.
         *
         * A quantidade permanece positiva.
         * O localOrigemId indica de onde
         * o material foi retirado.
         */
        await tx.movimentacaoEstoque.create({
          data: {
            tipo:
              'PERDA',

            classe:
              estoque.genero.classe,

            generoId:
              estoque.generoId,

            loteId:
              estoque.loteId,

            localOrigemId:
              estoque.localId,

            quantidade:
              p.data.quantidade,

            observacao:
              p.data.motivo.trim(),

            usuarioId:
              g.user!.id,
          },
        });

        /*
         * Auditoria administrativa.
         *
         * Preserva saldo anterior,
         * quantidade descartada,
         * saldo final, motivo e
         * responsável pela operação.
         */
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao:
              'PERDA_ESTOQUE',

            entidade:
              'EstoqueLocal',

            entidadeId:
              estoque.id,

            dadosAnteriores: {
              quantidade:
                saldoAnterior,

              generoId:
                estoque.generoId,

              loteId:
                estoque.loteId,

              localId:
                estoque.localId,
            },

            dadosNovos: {
              perda:
                p.data.quantidade,

              quantidade:
                saldoFinal,

              generoId:
                estoque.generoId,

              loteId:
                estoque.loteId,

              localId:
                estoque.localId,

              motivo:
                p.data.motivo.trim(),
            },
          },
        });
      }
    );

    return Response.json({
      ok: true,
    });
  } catch (error) {
    const mensagem =
      error instanceof Error
        ? error.message
        : '';

    if (
      mensagem ===
      'SALDO'
    ) {
      return Response.json(
        {
          error:
            'A quantidade da perda/descarte é superior ao saldo disponível.',
        },
        {
          status: 409,
        }
      );
    }

    if (
      mensagem ===
      'NAO_ENCONTRADO'
    ) {
      return Response.json(
        {
          error:
            'O saldo de estoque informado não foi encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    console.error(
      error
    );

    return Response.json(
      {
        error:
          'Não foi possível registrar a perda/descarte. Nenhuma baixa foi efetivada.',
      },
      {
        status: 409,
      }
    );
  }
}

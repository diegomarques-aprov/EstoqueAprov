import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  estoqueId: z
    .string()
    .min(1),

  ajuste: z
    .number()
    .finite()
    .refine(
      (valor) => valor !== 0,
      {
        message:
          'O ajuste deve ser diferente de zero.',
      }
    ),

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
          'Informe um ajuste diferente de zero e descreva o motivo da correção.',
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
         * O ajuste é sempre realizado
         * sobre um saldo físico existente.
         *
         * Assim preservamos exatamente
         * gênero, lote e local.
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

        const saldoNovo =
          saldoAnterior +
          p.data.ajuste;

        /*
         * Nenhuma correção pode deixar
         * o saldo físico negativo.
         */
        if (
          saldoNovo <
          -EPSILON
        ) {
          throw new Error(
            'NEGATIVO'
          );
        }

        /*
         * Proteção contra resíduos
         * de ponto flutuante muito
         * próximos de zero.
         */
        const saldoFinal =
          Math.abs(
            saldoNovo
          ) <= EPSILON
            ? 0
            : saldoNovo;

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
         * Na movimentação, a quantidade
         * representa sempre a magnitude
         * física movimentada.
         *
         * O sentido da correção é indicado
         * por localOrigemId/localDestinoId.
         *
         * ajuste negativo:
         * estoque -> saída por correção
         *
         * ajuste positivo:
         * entrada por correção -> estoque
         */
        await tx.movimentacaoEstoque.create({
          data: {
            tipo:
              'CORRECAO',

            classe:
              estoque.genero.classe,

            generoId:
              estoque.generoId,

            loteId:
              estoque.loteId,

            localOrigemId:
              p.data.ajuste < 0
                ? estoque.localId
                : null,

            localDestinoId:
              p.data.ajuste > 0
                ? estoque.localId
                : null,

            quantidade:
              Math.abs(
                p.data.ajuste
              ),

            observacao:
              p.data.motivo.trim(),

            usuarioId:
              g.user!.id,
          },
        });

        /*
         * Auditoria explícita da correção,
         * preservando o saldo anterior,
         * o ajuste informado e o saldo
         * resultante.
         */
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao:
              'CORRECAO_ESTOQUE',

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
              ajuste:
                p.data.ajuste,

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
      'NEGATIVO'
    ) {
      return Response.json(
        {
          error:
            'A correção deixaria o estoque negativo. Revise o ajuste.',
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
          'Não foi possível registrar a correção. Nenhuma alteração foi efetivada.',
      },
      {
        status: 409,
      }
    );
  }
}

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireOperacaoEstoque } from '@/lib/guard';

const body = z.object({
  estoqueId: z
    .string()
    .min(1),

  localDestinoId: z
    .string()
    .min(1),

  quantidade: z
    .number()
    .positive(),

  observacao: z
    .string()
    .trim()
    .optional(),
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
          'Informe o item, o local de destino e a quantidade para a transferência.',
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
         * Saldo físico de origem.
         *
         * O registro define exatamente
         * gênero, lote e local de origem
         * da transferência.
         */
        const origem =
          await tx.estoqueLocal.findUnique({
            where: {
              id:
                p.data.estoqueId,
            },

            include: {
              genero: true,
              local: true,
            },
          });

        if (!origem) {
          throw new Error(
            'ORIGEM_NAO_ENCONTRADA'
          );
        }

        /*
         * O destino precisa existir
         * e estar ativo.
         */
        const localDestino =
          await tx.localArmazenamento.findFirst({
            where: {
              id:
                p.data.localDestinoId,

              situacao:
                'ATIVO',
            },

            select: {
              id: true,
              nome: true,
            },
          });

        if (!localDestino) {
          throw new Error(
            'DESTINO_INVALIDO'
          );
        }

        /*
         * Não existe transferência
         * física entre o mesmo local.
         */
        if (
          origem.localId ===
          localDestino.id
        ) {
          throw new Error(
            'MESMO_LOCAL'
          );
        }

        const saldoAnteriorOrigem =
          Number(
            origem.quantidade
          );

        /*
         * Impede retirada superior
         * ao saldo físico disponível.
         */
        if (
          p.data.quantidade >
          saldoAnteriorOrigem +
            EPSILON
        ) {
          throw new Error(
            `SALDO:${saldoAnteriorOrigem}`
          );
        }

        const saldoCalculadoOrigem =
          saldoAnteriorOrigem -
          p.data.quantidade;

        const saldoFinalOrigem =
          Math.abs(
            saldoCalculadoOrigem
          ) <= EPSILON
            ? 0
            : saldoCalculadoOrigem;

        /*
         * Retira da origem.
         */
        await tx.estoqueLocal.update({
          where: {
            id:
              origem.id,
          },

          data: {
            quantidade:
              saldoFinalOrigem,
          },
        });

        /*
         * Procura no destino exatamente
         * a mesma combinação:
         *
         * gênero + local + lote.
         */
        const destino =
          await tx.estoqueLocal.findFirst({
            where: {
              generoId:
                origem.generoId,

              localId:
                localDestino.id,

              loteId:
                origem.loteId,
            },
          });

        const saldoAnteriorDestino =
          destino
            ? Number(
                destino.quantidade
              )
            : 0;

        const saldoFinalDestino =
          saldoAnteriorDestino +
          p.data.quantidade;

        if (destino) {
          await tx.estoqueLocal.update({
            where: {
              id:
                destino.id,
            },

            data: {
              quantidade:
                saldoFinalDestino,
            },
          });
        } else {
          await tx.estoqueLocal.create({
            data: {
              generoId:
                origem.generoId,

              localId:
                localDestino.id,

              loteId:
                origem.loteId,

              quantidade:
                p.data.quantidade,
            },
          });
        }

        /*
         * Movimentação física.
         *
         * Mantém gênero, lote,
         * origem, destino e quantidade.
         */
        await tx.movimentacaoEstoque.create({
          data: {
            tipo:
              'TRANSFERENCIA',

            classe:
              origem.genero.classe,

            generoId:
              origem.generoId,

            loteId:
              origem.loteId,

            localOrigemId:
              origem.localId,

            localDestinoId:
              localDestino.id,

            quantidade:
              p.data.quantidade,

            observacao:
              p.data.observacao?.trim() ||
              undefined,

            usuarioId:
              g.user!.id,
          },
        });

        /*
         * Auditoria administrativa
         * da transferência.
         *
         * Registra os saldos dos dois
         * locais antes e depois.
         */
        await tx.auditoria.create({
          data: {
            usuarioId:
              g.user!.id,

            acao:
              'TRANSFERENCIA_ESTOQUE',

            entidade:
              'EstoqueLocal',

            entidadeId:
              origem.id,

            dadosAnteriores: {
              generoId:
                origem.generoId,

              loteId:
                origem.loteId,

              localOrigemId:
                origem.localId,

              localOrigem:
                origem.local.nome,

              saldoOrigem:
                saldoAnteriorOrigem,

              localDestinoId:
                localDestino.id,

              localDestino:
                localDestino.nome,

              saldoDestino:
                saldoAnteriorDestino,
            },

            dadosNovos: {
              quantidadeTransferida:
                p.data.quantidade,

              saldoOrigem:
                saldoFinalOrigem,

              saldoDestino:
                saldoFinalDestino,

              observacao:
                p.data.observacao?.trim() ||
                null,
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
      'ORIGEM_NAO_ENCONTRADA'
    ) {
      return Response.json(
        {
          error:
            'O saldo de estoque de origem não foi encontrado.',
        },
        {
          status: 404,
        }
      );
    }

    if (
      mensagem ===
      'DESTINO_INVALIDO'
    ) {
      return Response.json(
        {
          error:
            'O local de destino não existe ou está inativo. Selecione um local ativo para prosseguir.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      mensagem ===
      'MESMO_LOCAL'
    ) {
      return Response.json(
        {
          error:
            'O local de destino deve ser diferente do local de origem.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      mensagem.startsWith(
        'SALDO:'
      )
    ) {
      const saldo =
        Number(
          mensagem.split(':')[1] ||
            0
        );

      return Response.json(
        {
          error:
            `A quantidade da transferência é superior ao saldo disponível (${saldo.toLocaleString(
              'pt-BR',
              {
                maximumFractionDigits:
                  3,
              }
            )}).`,
        },
        {
          status: 409,
        }
      );
    }

    console.error(
      error
    );

    return Response.json(
      {
        error:
          'Não foi possível concluir a transferência. Nenhuma movimentação foi efetivada.',
      },
      {
        status: 500,
      }
    );
  }
}

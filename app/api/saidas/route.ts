import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

const destinos = [
  'CAFE_DA_MANHA',
  'ALMOCO',
  'JANTAR',
  'CEIA',
  'SERVICO_DIA_SEGUINTE',
  'OUTRO',
] as const;

const body = z.object({
  classe: z.enum(['QS', 'QR']),
  destino: z.enum(destinos),
  data: z.string(),
  observacao: z.string().optional(),
  itens: z
    .array(
      z.object({
        generoId: z.string(),
        quantidade: z.number().positive(),
      })
    )
    .min(1),
});

function inicioHojeLocal() {
  const agora = new Date();

  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Campo_Grande',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(agora);

  const ano =
    partes.find((parte) => parte.type === 'year')?.value || '';

  const mes =
    partes.find((parte) => parte.type === 'month')?.value || '';

  const dia =
    partes.find((parte) => parte.type === 'day')?.value || '';

  /*
   * Corumbá / Campo Grande = UTC-4.
   * 00:00 local corresponde a 04:00 UTC.
   */
  return new Date(`${ano}-${mes}-${dia}T04:00:00.000Z`);
}

export async function POST(req: Request) {
  const guard = await requireAdmin();

  if (guard.error) {
    return guard.error;
  }

  const parsed = body.safeParse(await req.json());

  if (!parsed.success) {
    return Response.json(
      {
        error:
          'Revise os dados da saída e as quantidades informadas.',
      },
      {
        status: 400,
      }
    );
  }

  const ids = [
    ...new Set(parsed.data.itens.map((item) => item.generoId)),
  ];

  if (ids.length !== parsed.data.itens.length) {
    return Response.json(
      {
        error:
          'O mesmo gênero foi informado mais de uma vez. Some as quantidades em um único item.',
      },
      {
        status: 400,
      }
    );
  }

  const generos = await prisma.genero.findMany({
    where: {
      id: {
        in: ids,
      },
      situacao: 'ATIVO',
    },

    include: {
      unidade: true,
    },
  });

  for (const item of parsed.data.itens) {
    const genero = generos.find(
      (registro) => registro.id === item.generoId
    );

    if (!genero || genero.classe !== parsed.data.classe) {
      return Response.json(
        {
          error:
            'Há gênero incompatível com a classificação da saída.',
        },
        {
          status: 400,
        }
      );
    }
  }

  try {
    const saida = await prisma.$transaction(async (tx) => {
      /*
       * IMPORTANTE:
       *
       * "data" identifica a data operacional informada na saída.
       *
       * O momento físico real em que o material saiu do estoque
       * é registrado automaticamente pelo criadoEm da Saida e
       * pelo criadoEm de cada MovimentacaoEstoque.
       *
       * Portanto, SERVICO_DIA_SEGUINTE NÃO altera nem antecipa
       * a data/hora real da movimentação.
       */
      const out = await tx.saida.create({
        data: {
          classe: parsed.data.classe,
          destino: parsed.data.destino,

          /*
           * Mantém a data operacional recebida da interface.
           * O horário real da baixa continua sendo criadoEm.
           */
          data: new Date(parsed.data.data),

          observacao: parsed.data.observacao,
          criadoPorId: guard.user!.id,
        },
      });

      const hojeLocal = inicioHojeLocal();

      for (const item of parsed.data.itens) {
        const genero = generos.find(
          (registro) => registro.id === item.generoId
        )!;

        /*
         * PVPS:
         * primeiro o lote válido com vencimento mais próximo.
         */
        const rows = await tx.estoqueLocal.findMany({
          where: {
            generoId: item.generoId,
            quantidade: {
              gt: 0,
            },
          },

          include: {
            lote: true,
          },

          orderBy: [
            {
              lote: {
                validade: 'asc',
              },
            },
            {
              atualizadoEm: 'asc',
            },
          ],
        });

        /*
         * O saldo disponível para consumo considera apenas
         * estoque sem lote ou lote ainda válido.
         */
        const rowsValidos = rows.filter((row) => {
          if (!row.lote?.validade) {
            return true;
          }

          return row.lote.validade >= hojeLocal;
        });

        const disponivel = rowsValidos.reduce(
          (soma, row) => soma + Number(row.quantidade),
          0
        );

        if (disponivel + 1e-9 < item.quantidade) {
          throw new Error(
            `ESTOQUE:${genero.nome}:${disponivel}:${genero.unidade.sigla}`
          );
        }

        let restante = item.quantidade;

        for (const row of rowsValidos) {
          if (restante <= 1e-9) {
            break;
          }

          const atual = Number(row.quantidade);

          const retirar = Math.min(atual, restante);

          if (retirar <= 0) {
            continue;
          }

          await tx.estoqueLocal.update({
            where: {
              id: row.id,
            },

            data: {
              quantidade: {
                decrement: retirar,
              },
            },
          });

          /*
           * O criadoEm desta movimentação é o registro oficial
           * do instante real da saída física.
           *
           * Nos relatórios ele é exibido em
           * America/Campo_Grande (UTC-4).
           */
          await tx.movimentacaoEstoque.create({
            data: {
              tipo: 'SAIDA',
              classe: parsed.data.classe,
              generoId: item.generoId,
              loteId: row.loteId,
              localOrigemId: row.localId,
              quantidade: retirar,
              referenciaTipo: 'Saida',
              referenciaId: out.id,
              observacao: `Destino: ${parsed.data.destino}`,
              usuarioId: guard.user!.id,
            },
          });

          restante -= retirar;
        }

        if (restante > 1e-9) {
          throw new Error(
            `VALIDADE:${genero.nome}:${genero.unidade.sigla}`
          );
        }

        await tx.itemSaida.create({
          data: {
            saidaId: out.id,
            generoId: item.generoId,
            quantidade: item.quantidade,
          },
        });
      }

      return out;
    });

    return Response.json({
      id: saida.id,
      numero: saida.numero,
    });
  } catch (error) {
    const mensagem =
      error instanceof Error ? error.message : '';

    if (mensagem.startsWith('ESTOQUE:')) {
      const [, nome, saldo, unidade] = mensagem.split(':');

      return Response.json(
        {
          error:
            `Estoque válido insuficiente para ${nome}. ` +
            `Disponível para saída: ${Number(saldo).toLocaleString(
              'pt-BR'
            )} ${unidade}.`,
        },
        {
          status: 409,
        }
      );
    }

    if (mensagem.startsWith('VALIDADE:')) {
      const [, nome] = mensagem.split(':');

      return Response.json(
        {
          error:
            `${nome}: o saldo disponível está em lote vencido ` +
            'ou bloqueado para consumo.',
        },
        {
          status: 409,
        }
      );
    }

    console.error(error);

    return Response.json(
      {
        error:
          'Não foi possível confirmar a saída. Nenhuma baixa foi efetivada.',
      },
      {
        status: 500,
      }
    );
  }
}

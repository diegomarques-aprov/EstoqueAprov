import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ConferenciaFLVClient from '@/components/ConferenciaFLVClient';

function inicioDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      0,
      0,
      0,
      0
    )
  );
}

function fimDoDiaUTC(data: Date) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      23,
      59,
      59,
      999
    )
  );
}

export default async function AvisosPage() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  const administrador =
    usuario.perfil === 'ADMIN_PRINCIPAL' ||
    usuario.perfil === 'ADMINISTRADOR';

  const chefeDeposito =
    usuario.perfil === 'CHEFE_DEPOSITO';

  const graduadoServico =
    usuario.perfil === 'GRADUADO_SERVICO';

  const podeVerEfetivo =
    administrador || graduadoServico;

  const podeVerEstoque =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const hoje = new Date();

  const inicioHoje =
    inicioDoDiaUTC(hoje);

  const amanha = new Date(hoje);

  amanha.setDate(
    amanha.getDate() + 1
  );

  const inicioAmanha =
    inicioDoDiaUTC(amanha);

  const fimAmanha =
    fimDoDiaUTC(amanha);

  const [
    estoques,
    arranchamentosAmanha,
    fechamentosPendentes,
  ] = await Promise.all([
    prisma.estoqueLocal.findMany({
      where: {
        quantidade: {
          gt: 0,
        },
      },

      select: {
        generoId: true,
        quantidade: true,

        genero: {
          select: {
            nome: true,
            estoqueMinimo: true,
          },
        },

        lote: {
          select: {
            validade: true,
          },
        },
      },
    }),

    prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioAmanha,
          lte: fimAmanha,
        },
      },

      select: {
        totalPrevisto: true,
        efetivoPlanejamento: true,
        refeicao: true,
      },

      orderBy: {
        refeicao: 'asc',
      },
    }),

    prisma.arranchamento.findMany({
      where: {
        data: {
          lt: inicioHoje,
        },

        fechamentoRealizadoEm: null,
      },

      select: {
        data: true,
        refeicao: true,
      },

      orderBy: [
        {
          data: 'asc',
        },
        {
          refeicao: 'asc',
        },
      ],
    }),
  ]);

  /*
   * ESTOQUE ABAIXO DO MÍNIMO
   */

  const saldosPorGenero = new Map<
    string,
    {
      nome: string;
      quantidade: number;
      minimo: number;
    }
  >();

  for (const estoque of estoques) {
    if (
      estoque.genero.estoqueMinimo ==
      null
    ) {
      continue;
    }

    const atual =
      saldosPorGenero.get(
        estoque.generoId
      );

    if (atual) {
      atual.quantidade += Number(
        estoque.quantidade
      );
    } else {
      saldosPorGenero.set(
        estoque.generoId,
        {
          nome:
            estoque.genero.nome,

          quantidade: Number(
            estoque.quantidade
          ),

          minimo: Number(
            estoque.genero
              .estoqueMinimo
          ),
        }
      );
    }
  }

  const baixos = Array.from(
    saldosPorGenero.values()
  ).filter(
    (item) =>
      item.quantidade <
      item.minimo
  );

  /*
   * VALIDADES
   */

  const agora = hoje.getTime();

  const limiteValidade =
    agora + 30 * 86400000;

  let quantidadeVencidos = 0;

  let quantidadeProximosDaValidade =
    0;

  for (const estoque of estoques) {
    if (!estoque.lote?.validade) {
      continue;
    }

    const validade = new Date(
      estoque.lote.validade
    ).getTime();

    if (validade < agora) {
      quantidadeVencidos += 1;
      continue;
    }

    if (
      validade <=
      limiteValidade
    ) {
      quantidadeProximosDaValidade +=
        1;
    }
  }

  /*
   * EFETIVO DO DIA SEGUINTE
   */

  const efetivoAmanhaInformado =
    arranchamentosAmanha.length > 0;

  const totalPrevistoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total +
        item.totalPrevisto,
      0
    );

  const totalPlanejamentoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total +
        item.efetivoPlanejamento,
      0
    );

  /*
   * FECHAMENTOS PENDENTES
   */

  const diasPendentes = new Set(
    fechamentosPendentes.map(
      (item) =>
        item.data
          .toISOString()
          .slice(0, 10)
    )
  );

  const quantidadeDiasPendentes =
    diasPendentes.size;

  /*
   * CARDÁPIO SEMANAL
   *
   * Sexta-feira:
   * lembra o Administrador de
   * preparar o cardápio da
   * próxima semana.
   */

  const diaDaSemana =
    hoje.getDay();

  const exibirLembreteCardapio =
    administrador &&
    diaDaSemana === 5;

  /*
   * QDAA
   */

  const diaDoMes =
    hoje.getDate();

  const exibirLembreteQDAA =
    administrador &&
    diaDoMes >= 23 &&
    diaDoMes <= 25;

  const diasParaQDAA =
    25 - diaDoMes;

  return (
    <main>
      <Link
        href="/inicio"
        className="back"
      >
        ← Início
      </Link>

      <h1>Painel de Avisos</h1>

      <div
        className="card"
        style={{
          border:
            '1px solid #22c55e',

          background:
            'rgba(34, 197, 94, 0.06)',
        }}
      >
        <strong>
          Consulte este painel
          diariamente.
        </strong>

        <p
          className="muted"
          style={{
            marginBottom: 0,
          }}
        >
          Aqui ficam concentrados os
          alertas e lembretes
          operacionais do
          Aprovisionamento.
        </p>
      </div>

      {/* FLV */}

      {podeVerEstoque && (
        <ConferenciaFLVClient />
      )}

      {/* FECHAMENTO DIÁRIO */}

      {podeVerEfetivo &&
        fechamentosPendentes.length >
          0 && (
          <div
            className="card"
            style={{
              border:
                '1px solid #ef4444',

              background:
                'rgba(239, 68, 68, 0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ⚠ Fechamento Diário
              pendente
            </h2>

            <p>
              Existem{' '}
              <strong>
                {
                  quantidadeDiasPendentes
                }{' '}
                {quantidadeDiasPendentes ===
                1
                  ? 'dia'
                  : 'dias'}
              </strong>{' '}
              com fechamento do
              efetivo alimentado
              pendente.
            </p>

            <div className="row">
              <span>
                Refeições pendentes
              </span>

              <strong>
                {
                  fechamentosPendentes.length
                }
              </strong>
            </div>

            <div
              className="actions"
              style={{
                marginTop: 14,
              }}
            >
              <Link
                className="btn"
                href="/efetivo/fechamento"
              >
                Realizar Fechamento
                Diário
              </Link>
            </div>
          </div>
        )}

      {/* EFETIVO DO DIA SEGUINTE */}

      {podeVerEfetivo &&
        (!efetivoAmanhaInformado ? (
          <div
            className="card"
            style={{
              border:
                '1px solid #f59e0b',

              background:
                'rgba(245, 158, 11, 0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ⚠ Efetivo do dia
              seguinte
            </h2>

            <p>
              O efetivo arranchado
              previsto para amanhã
              ainda não foi
              informado.
            </p>

            <p className="muted">
              O planejamento deve
              estar disponível para
              que o saque dos gêneros
              ocorra antes das 15:00
              do dia anterior.
            </p>

            <div className="actions">
              <Link
                className="btn"
                href="/efetivo"
              >
                Informar efetivo de
                amanhã
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="card"
            style={{
              border:
                '1px solid #22c55e',

              background:
                'rgba(34, 197, 94, 0.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ✓ Efetivo do dia
              seguinte informado
            </h2>

            <div className="row">
              <span>
                Refeições
                relacionadas
              </span>

              <strong>
                {
                  arranchamentosAmanha.length
                }
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo previsto
              </span>

              <strong>
                {
                  totalPrevistoAmanha
                }
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo considerado
                no planejamento
              </span>

              <strong>
                {
                  totalPlanejamentoAmanha
                }
              </strong>
            </div>
          </div>
        ))}

      {/* ESTOQUE */}

      {podeVerEstoque &&
        baixos.length > 0 && (
          <div
            className="card"
            style={{
              border:
                '1px solid #f59e0b',

              background:
                'rgba(245, 158, 11, 0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ⚠ Estoque abaixo do
              mínimo
            </h2>

            <p>
              Existem{' '}
              <strong>
                {baixos.length}
              </strong>{' '}
              gênero(s) abaixo do
              estoque mínimo
              definido.
            </p>

            <div className="actions">
              <Link
                className="btn secondary"
                href={
                  administrador
                    ? '/relatorios'
                    : '/estoque'
                }
              >
                Consultar estoque
              </Link>
            </div>
          </div>
        )}

      {/* VALIDADE PRÓXIMA */}

      {podeVerEstoque &&
        quantidadeProximosDaValidade >
          0 && (
          <div
            className="card"
            style={{
              border:
                '1px solid #f59e0b',

              background:
                'rgba(245, 158, 11, 0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ⏳ Validade próxima
            </h2>

            <p>
              <strong>
                {
                  quantidadeProximosDaValidade
                }
              </strong>{' '}
              lote(s) vencem em até
              30 dias.
            </p>

            <div className="actions">
              <Link
                className="btn secondary"
                href={
                  administrador
                    ? '/relatorios'
                    : '/estoque'
                }
              >
                Consultar
              </Link>
            </div>
          </div>
        )}

      {/* LOTES VENCIDOS */}

      {podeVerEstoque &&
        quantidadeVencidos > 0 && (
          <div
            className="card"
            style={{
              border:
                '1px solid #ef4444',

              background:
                'rgba(239, 68, 68, 0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ⚠ Lote vencido
            </h2>

            <p>
              Existem{' '}
              <strong>
                {
                  quantidadeVencidos
                }
              </strong>{' '}
              lote(s) vencido(s) com
              saldo registrado.
            </p>

            <div className="actions">
              <Link
                className="btn secondary"
                href={
                  administrador
                    ? '/relatorios'
                    : '/estoque'
                }
              >
                Verificar agora
              </Link>
            </div>
          </div>
        )}

      {/* CARDÁPIO DA PRÓXIMA SEMANA */}

      {exibirLembreteCardapio && (
        <div
          className="card"
          style={{
            border:
              '1px solid #3b82f6',

            background:
              'rgba(59, 130, 246, 0.08)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            📅 Cardápio da próxima
            semana
          </h2>

          <p>
            <strong>
              Hoje é sexta-feira.
            </strong>
          </p>

          <p className="muted">
            Verifique e cadastre o
            cardápio previsto para a
            próxima semana. Esse
            planejamento auxilia a
            organização do
            Aprovisionamento e o
            consumo dos gêneros,
            especialmente os FLV.
          </p>

          <div className="actions">
            <Link
              className="btn secondary"
              href="/cardapio"
            >
              Acessar Cardápio
            </Link>
          </div>
        </div>
      )}

      {/* QDAA */}

      {exibirLembreteQDAA && (
        <div
          className="card"
          style={{
            border:
              '1px solid #3b82f6',

            background:
              'rgba(59, 130, 246, 0.08)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            📋 Lembrete QDAA
          </h2>

          {diaDoMes === 25 ? (
            <p>
              <strong>
                O QDAA deve ser
                realizado hoje.
              </strong>
            </p>
          ) : (
            <p>
              O QDAA deve ser
              realizado no dia 25.
              Faltam{' '}
              <strong>
                {diasParaQDAA}{' '}
                {diasParaQDAA === 1
                  ? 'dia'
                  : 'dias'}
              </strong>
              .
            </p>
          )}

          <div className="actions">
            <Link
              className="btn secondary"
              href="/qdaa"
            >
              Acessar QDAA /
              Ressuprimento QS
            </Link>
          </div>
        </div>
      )}

      {/* SEM PENDÊNCIAS */}

      {baixos.length === 0 &&
        quantidadeProximosDaValidade ===
          0 &&
        quantidadeVencidos === 0 &&
        fechamentosPendentes.length ===
          0 &&
        efetivoAmanhaInformado &&
        !exibirLembreteCardapio &&
        !exibirLembreteQDAA && (
          <div className="card">
            <h2
              style={{
                marginTop: 0,
              }}
            >
              ✓ Situação operacional
            </h2>

            <p
              className="muted"
              style={{
                marginBottom: 0,
              }}
            >
              Nenhuma outra pendência
              operacional identificada
              no momento.
            </p>
          </div>
        )}
    </main>
  );
}

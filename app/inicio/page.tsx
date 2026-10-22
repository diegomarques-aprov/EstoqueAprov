import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
import ConferenciaFLVClient from '@/components/ConferenciaFLVClient';
import packageJson from '@/package.json';

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

const estiloAreaAdministrativa = {
  border: '1px solid #2563eb',
  background: 'rgba(37, 99, 235, 0.08)',
};

const estiloBotaoAzul = {
  background: '#2563eb',
  borderColor: '#3b82f6',
  color: '#ffffff',
};

const verdesOperacao = [
  {
    background: '#86efac',
    borderColor: '#86efac',
    color: '#052e16',
  },
  {
    background: '#4ade80',
    borderColor: '#4ade80',
    color: '#052e16',
  },
  {
    background: '#22c55e',
    borderColor: '#22c55e',
    color: '#052e16',
  },
  {
    background: '#16a34a',
    borderColor: '#16a34a',
    color: '#ffffff',
  },
  {
    background: '#15803d',
    borderColor: '#15803d',
    color: '#ffffff',
  },
  {
    background: '#166534',
    borderColor: '#166534',
    color: '#ffffff',
  },
];

export default async function Inicio() {
  const u = await currentUser();

  if (!u) {
    redirect('/login');
  }

  /*
   * PERFIS
   */

  const administrador =
    u.perfil === 'ADMIN_PRINCIPAL' ||
    u.perfil === 'ADMINISTRADOR';

  const administradorPrincipal =
    u.perfil === 'ADMIN_PRINCIPAL';

  const chefeDeposito =
    u.perfil === 'CHEFE_DEPOSITO';

  const graduadoServico =
    u.perfil === 'GRADUADO_SERVICO';

  /*
   * VISIBILIDADE
   *
   * Administradores:
   * visão completa.
   *
   * Chefe do Depósito:
   * operação do depósito.
   *
   * Graduado de Serviço:
   * estoque, entradas, saídas,
   * devoluções/ajustes/pesagem e efetivo.
   */

  const podeVerPainelEstoque =
    administrador || chefeDeposito;

  const podeVerEfetivo =
    administrador || graduadoServico;

  const podeVerEstoqueInicial =
    administrador || chefeDeposito;

  const podeConsultarEstoque =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const podeReceber =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const podeRegistrarSaida =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const podeAjustar =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const podeVerRelatorios =
    administrador;

  const podeVerQDAA =
    administrador;

  /*
   * DATAS
   */

  const hoje = new Date();
  const inicioHoje = inicioDoDiaUTC(hoje);

  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const inicioAmanha =
    inicioDoDiaUTC(amanha);

  const fimAmanha =
    fimDoDiaUTC(amanha);

  /*
   * CONSULTAS PRINCIPAIS
   *
   * Mantemos as consultas existentes em paralelo
   * para preservar o comportamento e o desempenho
   * atuais do Início.
   */

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
      estoque.genero.estoqueMinimo == null
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
          nome: estoque.genero.nome,
          quantidade: Number(
            estoque.quantidade
          ),
          minimo: Number(
            estoque.genero.estoqueMinimo
          ),
        }
      );
    }
  }

  const baixos = Array.from(
    saldosPorGenero.values()
  ).filter(
    (item) =>
      item.quantidade < item.minimo
  );

  /*
   * VALIDADES
   */

  const agora = hoje.getTime();

  const limiteValidade =
    agora + 30 * 86400000;

  let quantidadeVencidos = 0;
  let quantidadeProximosDaValidade = 0;

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

    if (validade <= limiteValidade) {
      quantidadeProximosDaValidade += 1;
    }
  }

  /*
   * ARRANCHAMENTO DO DIA SEGUINTE
   */

  const totalPrevistoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total + item.totalPrevisto,
      0
    );

  const totalPlanejamentoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total +
        item.efetivoPlanejamento,
      0
    );

  const efetivoAmanhaInformado =
    arranchamentosAmanha.length > 0;

  /*
   * FECHAMENTOS PENDENTES
   */

  const diasPendentes = new Set(
    fechamentosPendentes.map((item) =>
      item.data
        .toISOString()
        .slice(0, 10)
    )
  );

  const quantidadeDiasPendentes =
    diasPendentes.size;

  /*
   * LEMBRETE QDAA
   */

  const diaDoMes = hoje.getDate();

  const exibirLembreteQDAA =
    administrador &&
    diaDoMes >= 23 &&
    diaDoMes <= 25;

  const diasParaQDAA =
    25 - diaDoMes;

  return (
    <main>
      <header className="top">
        <div>
          <div className="brand">
            EstoqueAprov
          </div>

          <span className="muted">
            {u.postoGraduacao
              ? `${u.postoGraduacao} `
              : ''}
            {u.nome} ·{' '}
            {u.funcao || u.perfil}
          </span>
        </div>

        <LogoutButton />
      </header>

      <h1>Início</h1>
{/* CONFERÊNCIA DIÁRIA FLV */}

{podeConsultarEstoque && (
  <ConferenciaFLVClient />
)}
      {/* FECHAMENTOS PENDENTES */}

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
              ⚠ Fechamento Diário pendente
            </h2>

            <p>
              Existem{' '}
              <strong>
                {quantidadeDiasPendentes}{' '}
                {quantidadeDiasPendentes ===
                1
                  ? 'dia'
                  : 'dias'}
              </strong>{' '}
              com fechamento do efetivo
              alimentado pendente.
            </p>

            <p className="muted">
              Informe o comparecimento dos
              arranchados, os não arranchados
              atendidos e a sobra pesada de
              cada refeição.
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
                Realizar Fechamento Diário
              </Link>
            </div>
          </div>
        )}

      {/* ARRANCHAMENTO */}

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
              ⚠ Efetivo do dia seguinte
            </h2>

            <p>
              Informe o efetivo arranchado
              previsto para amanhã. O
              planejamento deve ser realizado
              para que o saque dos gêneros
              ocorra{' '}
              <strong>
                antes das 15:00 do dia
                anterior
              </strong>
              .
            </p>

            <p className="muted">
              O efetivo informado será
              utilizado como base para o
              planejamento das quantidades de
              gêneros, considerando também a
              margem de segurança definida no
              arranchamento.
            </p>

            <Link
              className="btn"
              href="/efetivo"
            >
              Informar efetivo de amanhã
            </Link>
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
              ✓ Efetivo do dia seguinte
            </h2>

            <p>
              <strong>
                Efetivo de arranchados para
                o dia seguinte já
                relacionado.
              </strong>
            </p>

            <div className="row">
              <span>
                Refeições relacionadas
              </span>

              <strong>
                {
                  arranchamentosAmanha.length
                }
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo previsto relacionado
              </span>

              <strong>
                {totalPrevistoAmanha}
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo considerado no
                planejamento
              </span>

              <strong>
                {totalPlanejamentoAmanha}
              </strong>
            </div>

            <div
              className="actions"
              style={{
                marginTop: 14,
              }}
            >
              <Link
                className="btn secondary"
                href="/efetivo"
              >
                Consultar / alterar
                arranchamento
              </Link>
            </div>
          </div>
        ))}

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
                O QDAA deve ser realizado
                hoje.
              </strong>
            </p>
          ) : (
            <p>
              O QDAA deve ser realizado no
              dia 25. Faltam{' '}
              <strong>
                {diasParaQDAA}{' '}
                {diasParaQDAA === 1
                  ? 'dia'
                  : 'dias'}
              </strong>
              .
            </p>
          )}

          <p className="muted">
            Consulte a consolidação mensal
            dos gêneros QS e as informações
            de apoio ao planejamento do
            próximo ressuprimento da cadeia
            de suprimento.
          </p>

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

      {/* PAINEL DE SITUAÇÃO */}

      {podeVerPainelEstoque && (
        <div className="card">
          <h2>Painel de situação</h2>

          {baixos.length === 0 &&
          quantidadeProximosDaValidade ===
            0 &&
          quantidadeVencidos === 0 ? (
            <p className="muted">
              Nenhuma pendência de estoque
              no momento.
            </p>
          ) : (
            <div className="actions">
              {baixos.length > 0 && (
                administrador ? (
                  <Link
                    className="btn secondary"
                    href="/relatorios"
                  >
                    ⚠ {baixos.length}{' '}
                    gênero(s) abaixo do
                    mínimo
                  </Link>
                ) : (
                  <Link
                    className="btn secondary"
                    href="/estoque"
                  >
                    ⚠ {baixos.length}{' '}
                    gênero(s) abaixo do
                    mínimo
                  </Link>
                )
              )}

              {quantidadeProximosDaValidade >
                0 &&
                (administrador ? (
                  <Link
                    className="btn secondary"
                    href="/relatorios"
                  >
                    ⏳{' '}
                    {
                      quantidadeProximosDaValidade
                    }{' '}
                    lote(s) vencendo em até
                    30 dias
                  </Link>
                ) : (
                  <Link
                    className="btn secondary"
                    href="/estoque"
                  >
                    ⏳{' '}
                    {
                      quantidadeProximosDaValidade
                    }{' '}
                    lote(s) vencendo em até
                    30 dias
                  </Link>
                ))}

              {quantidadeVencidos > 0 &&
                (administrador ? (
                  <Link
                    className="btn secondary"
                    href="/relatorios"
                    style={{
                      borderColor:
                        '#ef4444',
                      color: '#ef4444',
                    }}
                  >
                    ⚠ {quantidadeVencidos}{' '}
                    lote(s) vencido(s)
                  </Link>
                ) : (
                  <Link
                    className="btn secondary"
                    href="/estoque"
                    style={{
                      borderColor:
                        '#ef4444',
                      color: '#ef4444',
                    }}
                  >
                    ⚠ {quantidadeVencidos}{' '}
                    lote(s) vencido(s)
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}

      {/* OPERAÇÃO */}

      <div className="card">
        <h2>Operação</h2>

        <div className="actions">
          {podeVerEstoqueInicial && (
            <Link
              className="btn"
              style={verdesOperacao[0]}
              href="/estoque/inicial"
            >
              Estoque inicial
            </Link>
          )}

          {podeConsultarEstoque && (
            <Link
              className="btn"
              style={verdesOperacao[1]}
              href="/estoque"
            >
              Consultar estoque
            </Link>
          )}

          {podeReceber && (
            <Link
              className="btn"
              style={verdesOperacao[2]}
              href="/recebimentos"
            >
              Novo recebimento
            </Link>
          )}

          {podeRegistrarSaida && (
            <Link
              className="btn"
              style={verdesOperacao[3]}
              href="/saidas"
            >
              Saída de gêneros
            </Link>
          )}

          {podeAjustar && (
            <Link
              className="btn"
              style={verdesOperacao[4]}
              href="/ajustes"
            >
              Devoluções e ajustes
            </Link>
          )}

          {podeVerEfetivo && (
            <Link
              className="btn"
              style={verdesOperacao[5]}
              href="/efetivo"
            >
              Efetivo alimentado
            </Link>
          )}

          {podeVerRelatorios && (
            <Link
              className="btn"
              style={verdesOperacao[0]}
              href="/relatorios"
            >
              Relatórios
            </Link>
          )}

          {podeVerQDAA && (
            <Link
              className="btn"
              style={verdesOperacao[1]}
              href="/qdaa"
            >
              QDAA / Ressuprimento QS
            </Link>
          )}
        </div>
      </div>

      {/* CONFIGURAÇÕES */}

      {administrador && (
        <div
          className="card"
          style={
            estiloAreaAdministrativa
          }
        >
          <h2>Configurações</h2>

          <p className="muted">
            Defina a estrutura utilizada
            pelo sistema para organizar e
            controlar o estoque.
          </p>

          <div className="actions">
            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/admin/locais"
            >
              Locais de armazenamento
            </Link>

            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/admin/unidades"
            >
              Unidades de medida
            </Link>

            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/admin/grupos-generos"
            >
              Grupos de gêneros
            </Link>

            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/admin/categorias"
            >
              Categorias de gêneros
            </Link>

            {administradorPrincipal && (
              <Link
                className="btn"
                style={estiloBotaoAzul}
                href="/admin/usuarios"
              >
                Usuários e permissões
              </Link>
            )}
          </div>
        </div>
      )}

      {/* CADASTROS */}

      {administrador && (
        <div
          className="card"
          style={
            estiloAreaAdministrativa
          }
        >
          <h2>Cadastros</h2>

          <p className="muted">
            Cadastre, consulte e altere os
            gêneros utilizados pelo
            Aprovisionamento.
          </p>

          <div className="actions">
            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/admin/generos"
            >
              Gêneros QS/QR
            </Link>
          </div>
        </div>
      )}

      {/* RODAPÉ */}

      <footer
        style={{
          marginTop: '32px',
          paddingTop: '16px',
          paddingBottom: '12px',
          textAlign: 'center',
          fontSize: '11px',
          lineHeight: '1.5',
          color: '#facc15',
          opacity: 0.9,
        }}
      >
        <div>
          Desenvolvido por: 1º Sgt Diego
          Marques - 18ª Bda Inf Pan -
          Serviço de Aprovisionamento/2026
        </div>

        <div>
          EstoqueAprov — Versão{' '}
          {packageJson.version}
        </div>

        <div>
          © 2026 — Todos os Direitos
          Reservados
        </div>
      </footer>
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LogoutButton from '@/components/LogoutButton';
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

export default async function Dashboard() {
  const u = await currentUser();

  if (!u) redirect('/login');

  const estoques = await prisma.estoqueLocal.findMany({
    where: { quantidade: { gt: 0 } },
    include: {
      genero: { include: { unidade: true } },
      lote: true,
    },
  });

  const soma = (c: 'QS' | 'QR') =>
    estoques
      .filter((x) => x.genero.classe === c)
      .reduce((a, x) => a + Number(x.quantidade), 0);

  const baixos = estoques
    .reduce((a: any[], x) => {
      if (x.genero.estoqueMinimo == null) return a;

      let r = a.find((y) => y.id === x.generoId);

      if (!r) {
        r = {
          id: x.generoId,
          n: x.genero.nome,
          q: 0,
          m: Number(x.genero.estoqueMinimo),
        };

        a.push(r);
      }

      r.q += Number(x.quantidade);
      return a;
    }, [])
    .filter((x) => x.q < x.m);

  const lim = Date.now() + 30 * 86400000;

  const val = estoques.filter(
    (x) =>
      x.lote?.validade &&
      new Date(x.lote.validade).getTime() <= lim
  );

  /*
   * Arranchamento do dia seguinte
   */
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  const inicioAmanha = inicioDoDiaUTC(amanha);
  const fimAmanha = fimDoDiaUTC(amanha);

  const arranchamentosAmanha =
    await prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioAmanha,
          lte: fimAmanha,
        },
      },
      orderBy: {
        refeicao: 'asc',
      },
    });

  const totalPrevistoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) => total + item.totalPrevisto,
      0
    );

  const totalPlanejamentoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total + item.efetivoPlanejamento,
      0
    );

  const efetivoAmanhaInformado =
    arranchamentosAmanha.length > 0;

  /*
   * Fechamentos pendentes
   *
   * Considera arranchamentos de dias anteriores que ainda
   * não tiveram o fechamento realizado.
   *
   * O fechamento retroativo continua permitido.
   */
  const hoje = new Date();
  const inicioHoje = inicioDoDiaUTC(hoje);

  const fechamentosPendentes =
    await prisma.arranchamento.findMany({
      where: {
        data: {
          lt: inicioHoje,
        },
        fechamentoRealizadoEm: null,
      },
      orderBy: [
        {
          data: 'asc',
        },
        {
          refeicao: 'asc',
        },
      ],
    });

  const diasPendentes = Array.from(
    new Set(
      fechamentosPendentes.map((item) =>
        item.data.toISOString().slice(0, 10)
      )
    )
  );

  const quantidadeDiasPendentes =
    diasPendentes.length;

  return (
    <main>
      <header className="top">
        <div>
          <div className="brand">EstoqueAprov</div>

          <span className="muted">
            {u.postoGraduacao
              ? u.postoGraduacao + ' '
              : ''}
            {u.nome} · {u.funcao || u.perfil}
          </span>
        </div>

        <LogoutButton />
      </header>

      <h1>Início</h1>

      {/* FECHAMENTOS DE DIAS ANTERIORES */}
      {fechamentosPendentes.length > 0 && (
        <div
          className="card"
          style={{
            border: '1px solid #ef4444',
            background:
              'rgba(239, 68, 68, 0.08)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            ⚠ Fechamento Diário pendente
          </h2>

          <p>
            Existem{' '}
            <strong>
              {quantidadeDiasPendentes}{' '}
              {quantidadeDiasPendentes === 1
                ? 'dia'
                : 'dias'}
            </strong>{' '}
            com fechamento do efetivo alimentado
            pendente.
          </p>

          <p className="muted">
            Informe o comparecimento dos arranchados, os
            não arranchados atendidos e a sobra pesada de
            cada refeição. O lançamento permanecerá
            vinculado à data real do serviço.
          </p>

          <div className="row">
            <span>Refeições pendentes</span>
            <strong>
              {fechamentosPendentes.length}
            </strong>
          </div>

          <div
            className="actions"
            style={{ marginTop: 14 }}
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

      {/* ARRANCHAMENTO DO DIA SEGUINTE */}
      {!efetivoAmanhaInformado ? (
        <div
          className="card"
          style={{
            border: '1px solid #f59e0b',
            background:
              'rgba(245, 158, 11, 0.08)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            ⚠ Efetivo do dia seguinte
          </h2>

          <p>
            Informe o efetivo arranchado previsto para
            amanhã. O planejamento deve ser realizado para
            que o saque dos gêneros ocorra{' '}
            <strong>
              antes das 15:00 do dia anterior
            </strong>
            .
          </p>

          <p className="muted">
            O efetivo informado será utilizado como base
            para o planejamento das quantidades de
            gêneros, considerando também a margem de
            segurança definida no arranchamento.
          </p>

          <Link className="btn" href="/efetivo">
            Informar efetivo de amanhã
          </Link>
        </div>
      ) : (
        <div
          className="card"
          style={{
            border: '1px solid #22c55e',
            background:
              'rgba(34, 197, 94, 0.07)',
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            ✓ Efetivo do dia seguinte
          </h2>

          <p>
            <strong>
              Efetivo de arranchados para o dia seguinte
              já relacionado.
            </strong>
          </p>

          <div className="row">
            <span>Refeições relacionadas</span>
            <strong>
              {arranchamentosAmanha.length}
            </strong>
          </div>

          <div className="row">
            <span>Efetivo previsto relacionado</span>
            <strong>{totalPrevistoAmanha}</strong>
          </div>

          <div className="row">
            <span>
              Efetivo considerado no planejamento
            </span>
            <strong>{totalPlanejamentoAmanha}</strong>
          </div>

          <div
            className="actions"
            style={{ marginTop: 14 }}
          >
            <Link
              className="btn secondary"
              href="/efetivo"
            >
              Consultar / alterar arranchamento
            </Link>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <b>QS</b>

          <div className="big">
            {soma('QS').toLocaleString('pt-BR', {
              maximumFractionDigits: 3,
            })}
          </div>

          <span className="muted">
            quantidade consolidada*
          </span>
        </div>

        <div className="card">
          <b>QR</b>

          <div className="big">
            {soma('QR').toLocaleString('pt-BR', {
              maximumFractionDigits: 3,
            })}
          </div>

          <span className="muted">
            quantidade consolidada*
          </span>
        </div>
      </div>

      <div className="card">
        <h2>Atenção</h2>

        {baixos.length === 0 &&
        val.length === 0 ? (
          <p className="muted">
            Nenhum alerta de estoque no momento.
          </p>
        ) : (
          <div className="actions">
            {baixos.length > 0 && (
              <Link
                className="btn secondary"
                href="/relatorios"
              >
                ⚠ {baixos.length} gênero(s) abaixo do
                mínimo
              </Link>
            )}

            {val.length > 0 && (
              <Link
                className="btn secondary"
                href="/relatorios"
              >
                ⏳ {val.length} lote(s) com validade em
                até 30 dias
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Operação</h2>

        <div className="actions">
          <Link
            className="btn"
            href="/estoque/inicial"
          >
            Estoque inicial
          </Link>

          <Link
            className="btn secondary"
            href="/estoque"
          >
            Consultar estoque
          </Link>

          <Link
            className="btn"
            href="/recebimentos"
          >
            Novo recebimento
          </Link>

          <Link
            className="btn secondary"
            href="/saidas"
          >
            Saída de gêneros
          </Link>

          <Link
            className="btn secondary"
            href="/ajustes"
          >
            Devoluções e ajustes
          </Link>

          <Link
            className="btn secondary"
            href="/efetivo"
          >
            Efetivo alimentado
          </Link>

          <Link
            className="btn secondary"
            href="/relatorios"
          >
            Relatórios
          </Link>

          <Link
            className="btn secondary"
            href="/qr/financeiro"
          >
            Recursos e Compras QR
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Configuração</h2>

        <div className="actions">
          <Link
            className="btn"
            href="/admin/locais"
          >
            Locais de armazenamento
          </Link>

          <Link
            className="btn secondary"
            href="/admin/generos"
          >
            Gêneros QS/QR
          </Link>
        </div>
      </div>

      <p className="muted">
        * QS e QR podem usar unidades diferentes; o
        detalhamento correto por gênero/unidade está na
        consulta de estoque.
      </p>

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
          Desenvolvido por: 1º Sgt Diego Marques - 18ª Bda
          Inf Pan - Serviço de Aprovisionamento/2026
        </div>

        <div>
          EstoqueAprov — Versão {packageJson.version}
        </div>

        <div>
          © 2026 — Todos os Direitos Reservados
        </div>
      </footer>
    </main>
  );
}

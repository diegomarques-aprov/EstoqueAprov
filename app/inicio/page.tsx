import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import packageJson from '@/package.json';

const estiloAreaAdministrativa = {
  border: '1px solid #2563eb',
  background: 'rgba(37, 99, 235, 0.08)',
};

const estiloBotaoAzul = {
  background: '#2563eb',
  borderColor: '#3b82f6',
  color: '#ffffff',
};

const estiloPainelAvisos = {
  border: '1px solid #f59e0b',
  background: 'rgba(245, 158, 11, 0.08)',
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
   * VISIBILIDADE OPERACIONAL
   */

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

  const podeVerEfetivo =
    administrador ||
    graduadoServico;

  const podeVerRelatorios =
    administrador;

  const podeVerQDAA =
    administrador;

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

      {/* PAINEL DE AVISOS */}

      <div
        className="card"
        style={estiloPainelAvisos}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          ⚠ Painel de Avisos
        </h2>

        <p
          style={{
            marginBottom: 6,
          }}
        >
          <strong>
            Consulte diariamente.
          </strong>
        </p>

        <p className="muted">
          Alertas de estoque, validade,
          conferência FLV, efetivo,
          fechamento diário e demais
          lembretes operacionais ficam
          concentrados neste painel.
        </p>

        <div className="actions">
          <Link
            className="btn"
            href="/avisos"
          >
            Consultar avisos
          </Link>
        </div>
      </div>

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
            Cadastre e consulte as
            informações utilizadas pelo
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

            <Link
              className="btn"
              style={estiloBotaoAzul}
              href="/cardapio"
            >
              Cardápio
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

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import packageJson from '@/package.json';

const estiloAreaAdministrativa = {
  border: '1px solid #2563eb',
  background: 'rgba(37, 99, 235, 0.08)',
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

const estiloBotaoAzul = {
  background: '#2563eb',
  borderColor: '#3b82f6',
  color: '#ffffff',
};

const estiloGridModulos = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(145px, 1fr))',
  gap: '12px',
};

const estiloModulo = {
  minHeight: '96px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '15px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '14px',
  textDecoration: 'none',
  fontWeight: 800,
  lineHeight: 1.25,
  boxShadow:
    '0 6px 18px rgba(0, 0, 0, 0.14)',
};

const estiloIcone = {
  fontSize: '23px',
  lineHeight: 1,
};

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

      <section
        className="card"
        style={estiloPainelAvisos}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              fontSize: '25px',
            }}
          >
            ⚠
          </span>

          <h2
            style={{
              margin: 0,
            }}
          >
            Painel de Avisos
          </h2>
        </div>

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

        <Link
          className="btn"
          href="/avisos"
        >
          Consultar avisos
        </Link>
      </section>

      {/* OPERAÇÃO */}

      <section className="card">
        <h2
          style={{
            marginTop: 0,
          }}
        >
          Operação
        </h2>

        <p className="muted">
          Acesse as principais rotinas do
          Aprovisionamento.
        </p>

        <div style={estiloGridModulos}>
          {podeVerEstoqueInicial && (
            <Link
              href="/estoque/inicial"
              style={{
                ...estiloModulo,
                ...verdesOperacao[0],
              }}
            >
              <span style={estiloIcone}>
                📦
              </span>

              <span>
                Estoque inicial
              </span>
            </Link>
          )}

          {podeConsultarEstoque && (
            <Link
              href="/estoque"
              style={{
                ...estiloModulo,
                ...verdesOperacao[1],
              }}
            >
              <span style={estiloIcone}>
                🔎
              </span>

              <span>
                Consultar estoque
              </span>
            </Link>
          )}

          {podeReceber && (
            <Link
              href="/recebimentos"
              style={{
                ...estiloModulo,
                ...verdesOperacao[2],
              }}
            >
              <span style={estiloIcone}>
                ↓
              </span>

              <span>
                Novo recebimento
              </span>
            </Link>
          )}

          {podeRegistrarSaida && (
            <Link
              href="/saidas"
              style={{
                ...estiloModulo,
                ...verdesOperacao[3],
              }}
            >
              <span style={estiloIcone}>
                ↑
              </span>

              <span>
                Saída de gêneros
              </span>
            </Link>
          )}

          {podeAjustar && (
            <Link
              href="/ajustes"
              style={{
                ...estiloModulo,
                ...verdesOperacao[4],
              }}
            >
              <span style={estiloIcone}>
                ↺
              </span>

              <span>
                Devoluções e ajustes
              </span>
            </Link>
          )}

          {podeVerEfetivo && (
            <Link
              href="/efetivo"
              style={{
                ...estiloModulo,
                ...verdesOperacao[5],
              }}
            >
              <span style={estiloIcone}>
                👥
              </span>

              <span>
                Efetivo alimentado
              </span>
            </Link>
          )}

          {podeVerRelatorios && (
            <Link
              href="/relatorios"
              style={{
                ...estiloModulo,
                ...verdesOperacao[0],
              }}
            >
              <span style={estiloIcone}>
                📊
              </span>

              <span>
                Relatórios
              </span>
            </Link>
          )}

          {podeVerQDAA && (
            <Link
              href="/qdaa"
              style={{
                ...estiloModulo,
                ...verdesOperacao[1],
              }}
            >
              <span style={estiloIcone}>
                📋
              </span>

              <span>
                QDAA / Ressuprimento QS
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* CONFIGURAÇÕES */}

      {administrador && (
        <section
          className="card"
          style={
            estiloAreaAdministrativa
          }
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Configurações
          </h2>

          <p className="muted">
            Defina a estrutura utilizada
            pelo sistema para organizar e
            controlar o estoque.
          </p>

          <div style={estiloGridModulos}>
            <Link
              href="/admin/locais"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                ▣
              </span>

              <span>
                Locais de armazenamento
              </span>
            </Link>

            <Link
              href="/admin/unidades"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                ⚖
              </span>

              <span>
                Unidades de medida
              </span>
            </Link>

            <Link
              href="/admin/grupos-generos"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                ▦
              </span>

              <span>
                Grupos de gêneros
              </span>
            </Link>

            <Link
              href="/admin/categorias"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                ◫
              </span>

              <span>
                Categorias de gêneros
              </span>
            </Link>

            {administradorPrincipal && (
              <Link
                href="/admin/usuarios"
                style={{
                  ...estiloModulo,
                  ...estiloBotaoAzul,
                }}
              >
                <span style={estiloIcone}>
                  👤
                </span>

                <span>
                  Usuários e permissões
                </span>
              </Link>
            )}
          </div>
        </section>
      )}

      {/* CADASTROS */}

      {administrador && (
        <section
          className="card"
          style={
            estiloAreaAdministrativa
          }
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Cadastros
          </h2>

          <p className="muted">
            Cadastre e consulte as
            informações utilizadas pelo
            Aprovisionamento.
          </p>

          <div style={estiloGridModulos}>
            <Link
              href="/admin/generos"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                📦
              </span>

              <span>
                Gêneros QS/QR
              </span>
            </Link>

            <Link
              href="/cardapio"
              style={{
                ...estiloModulo,
                ...estiloBotaoAzul,
              }}
            >
              <span style={estiloIcone}>
                📅
              </span>

              <span>
                Cardápio
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* RODAPÉ */}

      <footer
        style={{
          marginTop: '32px',
          paddingTop: '16px',
          paddingBottom:
            'calc(12px + env(safe-area-inset-bottom))',
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

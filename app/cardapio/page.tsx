import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import CardapioClient from '@/components/CardapioClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function CardapioPage() {
  const u = await currentUser();

  if (!u) {
    redirect('/login');
  }

  const administrador =
    u.perfil === 'ADMIN_PRINCIPAL' ||
    u.perfil === 'ADMINISTRADOR';

  const perfilOperacional =
    administrador ||
    u.perfil === 'CHEFE_DEPOSITO' ||
    u.perfil === 'GRADUADO_SERVICO';

  if (!perfilOperacional) {
    redirect('/inicio');
  }

  return (
    <main>
      <Link
        className="back"
        href="/inicio"
      >
        ← Início
      </Link>

      <header
        style={{
          marginTop: '18px',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            marginBottom: '6px',
          }}
        >
          Cardápio
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Planejamento e consulta dos cardápios
          previstos para o Aprovisionamento.
        </p>
      </header>

      {!administrador && (
        <section
          style={{
            marginBottom: '16px',
            padding: '14px',
            border: '1px solid #3b82f6',
            background:
              'rgba(59, 130, 246, 0.08)',
            borderRadius: '13px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ◉
            </span>

            <div>
              <strong>
                Consulta de cardápio
              </strong>

              <p
                className="muted"
                style={{
                  margin: '5px 0 0',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                Seu perfil pode consultar os
                cardápios cadastrados. O cadastro
                e a alteração são realizados
                pelos Administradores.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '18px',
            paddingBottom: '14px',
            borderBottom:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              lineHeight: 1,
            }}
          >
            ▦
          </div>

          <div>
            <strong>
              {administrador
                ? 'Planejamento do cardápio'
                : 'Cardápios cadastrados'}
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              {administrador
                ? 'Cadastre, consulte e mantenha o planejamento das refeições do Aprovisionamento.'
                : 'Consulte o planejamento das refeições cadastrado pelos Administradores.'}
            </div>
          </div>
        </div>

        <CardapioClient
          podeEditar={administrador}
        />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

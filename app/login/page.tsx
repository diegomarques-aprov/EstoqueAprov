import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (await currentUser()) {
    redirect('/inicio');
  }

  return (
    <main>
      <div
        style={{
          minHeight: 'calc(100dvh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <header
          style={{
            textAlign: 'center',
            marginBottom: '18px',
          }}
        >
          <div
            className="brand"
            style={{
              fontSize: '26px',
              marginBottom: '6px',
            }}
          >
            EstoqueAprov
          </div>

          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: '11px',
              lineHeight: 1.5,
            }}
          >
            Sistema de Controle de Estoque
            do Aprovisionamento
          </p>
        </header>

        <section
          className="card"
          style={{
            width: '100%',
            maxWidth: '430px',
            margin: '0 auto',
            border: '1px solid #284334',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background:
                  'rgba(43,138,87,.12)',
                border:
                  '1px solid rgba(43,138,87,.35)',
                fontSize: '19px',
              }}
            >
              🔐
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '19px',
                }}
              >
                Acesso ao sistema
              </h1>

              <span
                className="muted"
                style={{
                  display: 'block',
                  marginTop: '3px',
                  fontSize: '10px',
                }}
              >
                Informe suas credenciais
                para continuar.
              </span>
            </div>
          </div>

          <LoginForm />

          <div
            style={{
              marginTop: '16px',
              padding: '10px',
              borderRadius: '10px',
              background: '#102018',
              border: '1px solid #284334',
              textAlign: 'center',
            }}
          >
            <span
              className="muted"
              style={{
                fontSize: '9px',
                lineHeight: 1.45,
              }}
            >
              Acesso restrito aos usuários
              cadastrados no EstoqueAprov.
            </span>
          </div>
        </section>

        <footer
          style={{
            marginTop: '20px',
            paddingBottom:
              'calc(8px + env(safe-area-inset-bottom))',
            textAlign: 'center',
            fontSize: '9px',
            lineHeight: 1.5,
            color: '#facc15',
            opacity: 0.8,
          }}
        >
          18ª Bda Inf Pan
          <br />
          Serviço de Aprovisionamento
        </footer>
      </div>
    </main>
  );
}

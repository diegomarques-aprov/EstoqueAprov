import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import GenerosClient from '@/components/GenerosClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  if (
    ![
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
    ].includes(usuario.perfil)
  ) {
    redirect('/inicio');
  }

  return (
    <main>
      <Link
        href="/inicio"
        className="back"
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
          Gêneros
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Cadastre e organize os gêneros
          alimentícios utilizados pelo
          Aprovisionamento.
        </p>
      </header>

      <section
        className="card"
        style={{
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '11px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '11px',
              background: '#183d2a',
              border: '1px solid #284334',
              fontSize: '19px',
            }}
          >
            ▤
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Cadastro de gêneros
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Os gêneros QS e QR permanecem
              separados para facilitar o
              controle operacional do estoque.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <div
            style={{
              padding: '11px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              QS
            </div>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '10px',
                lineHeight: 1.35,
              }}
            >
              Cadeia de suprimento
            </div>
          </div>

          <div
            style={{
              padding: '11px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '13px',
              }}
            >
              QR
            </div>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '10px',
                lineHeight: 1.35,
              }}
            >
              Compra local
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <span
            style={{
              fontSize: '21px',
              lineHeight: 1,
            }}
          >
            +
          </span>

          <div>
            <strong>
              Gerenciar gêneros
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Consulte, cadastre e altere os
              gêneros utilizados no controle
              de estoque.
            </div>
          </div>
        </div>

        <GenerosClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import UnidadesClient from '@/components/UnidadesClient';
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
          Unidades de medida
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Cadastre e mantenha as unidades
          utilizadas para controlar as
          quantidades dos gêneros do
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
              fontSize: '17px',
              fontWeight: 800,
            }}
          >
            kg
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
              Padronização das quantidades
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Cada gênero utiliza uma
              unidade de medida para
              registrar corretamente
              entradas, saídas e saldos
              do estoque.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <div
            style={{
              padding: '11px 7px',
              borderRadius: '11px',
              textAlign: 'center',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '15px',
              }}
            >
              kg
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                marginTop: '3px',
                fontSize: '10px',
              }}
            >
              Quilograma
            </span>
          </div>

          <div
            style={{
              padding: '11px 7px',
              borderRadius: '11px',
              textAlign: 'center',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '15px',
              }}
            >
              L
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                marginTop: '3px',
                fontSize: '10px',
              }}
            >
              Litro
            </span>
          </div>

          <div
            style={{
              padding: '11px 7px',
              borderRadius: '11px',
              textAlign: 'center',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '15px',
              }}
            >
              un
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                marginTop: '3px',
                fontSize: '10px',
              }}
            >
              Unidade
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '10px',
            padding: '11px',
            borderRadius: '10px',
            background:
              'rgba(43,138,87,.06)',
            border:
              '1px solid rgba(43,138,87,.3)',
          }}
        >
          <span
            className="muted"
            style={{
              display: 'block',
              fontSize: '11px',
              lineHeight: 1.45,
            }}
          >
            As unidades cadastradas ficam
            disponíveis para seleção no
            cadastro dos gêneros QS e QR.
          </span>
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
              Gerenciar unidades
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Cadastre, consulte e altere
              as unidades de medida
              utilizadas pelo Estoque
              Aprov.
            </div>
          </div>
        </div>

        <UnidadesClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

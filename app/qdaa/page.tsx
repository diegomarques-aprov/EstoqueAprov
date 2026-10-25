import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import QDAAClient from '@/components/QDAAClient';
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
          QDAA / Ressuprimento QS
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Acompanhamento do consumo e
          planejamento das necessidades da
          cadeia de suprimento.
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
              fontSize: '20px',
            }}
          >
            ▦
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
              Controle da cadeia de suprimento
            </strong>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              Área destinada ao acompanhamento
              dos gêneros classificados como QS
              e ao planejamento das necessidades
              da cadeia de suprimento.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '11px',
            background: '#0c1811',
            border: '1px solid #284334',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                fontSize: '17px',
              }}
            >
              ℹ
            </span>

            <p
              className="muted"
              style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              O QDAA é apurado mensalmente. O
              histórico de consumo líquido real
              dos gêneros é utilizado como base
              para auxiliar o planejamento dos
              próximos ciclos de ressuprimento.
            </p>
          </div>
        </div>

        <Link
          className="btn"
          href="/qdaa/historico"
          style={{
            width: '100%',
            marginTop: '14px',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          Histórico de Ressuprimentos QS
        </Link>
      </section>

      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '17px',
            paddingBottom: '14px',
            borderBottom:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: '21px',
              lineHeight: 1,
            }}
          >
            ≡
          </div>

          <div>
            <strong>
              Apuração e planejamento QS
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Consulte o consumo apurado e
              utilize os dados para apoiar o
              planejamento do próximo
              ressuprimento.
            </div>
          </div>
        </div>

        <QDAAClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RelatoriosClient from '@/components/RelatoriosClient';
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
          Relatórios
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Consulte informações consolidadas
          para acompanhamento do estoque e
          apoio à gestão do Aprovisionamento.
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
            ▥
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
              Análises operacionais
            </strong>

            <p
              className="muted"
              style={{
                margin: '6px 0 0',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              Relacione os dados de consumo
              dos gêneros com a atividade
              operacional do Aprovisionamento.
            </p>
          </div>
        </div>

        <Link
          href="/consumo-efetivo"
          className="btn"
          style={{
            display: 'block',
            width: '100%',
            marginTop: '14px',
            boxSizing: 'border-box',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          Consumo × Efetivo
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
              Relatórios do estoque
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Defina os parâmetros da consulta
              para visualizar os dados e
              movimentações registrados no
              Estoque Aprov.
            </div>
          </div>
        </div>

        <RelatoriosClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

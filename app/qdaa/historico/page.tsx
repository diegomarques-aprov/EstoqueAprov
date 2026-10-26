import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import HistoricoRessuprimentoQSClient from '@/components/HistoricoRessuprimentoQSClient';
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
        href="/qdaa"
      >
        ← QDAA / Ressuprimento QS
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
          Histórico de Ressuprimentos QS
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Consulte os planejamentos de
          Ressuprimento QS registrados no
          EstoqueAprov.
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
            ◷
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
              Planejamentos registrados
            </strong>

            <p
              style={{
                margin: '7px 0 0',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              Acompanhe os planejamentos
              realizados para os ciclos de
              Ressuprimento QS e consulte a
              memória dos cálculos já
              registrados.
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
              Os planejamentos finalizados
              mantêm a memória do cálculo,
              os quantitativos sugeridos e
              planejados, as justificativas
              das alterações, o responsável
              e as datas de registro.
            </p>
          </div>
        </div>
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
              Histórico dos planejamentos
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Selecione um planejamento para
              consultar seus parâmetros,
              quantitativos e decisões
              registradas.
            </div>
          </div>
        </div>

        <HistoricoRessuprimentoQSClient />
      </section>

      <NavegacaoInferior
        voltarHref="/qdaa"
        voltarTexto="QDAA / Ressuprimento QS"
      />
    </main>
  );
}

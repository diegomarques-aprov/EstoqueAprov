import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EfetivoClient from '@/components/EfetivoClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  const podeAcessar =
    user.perfil === 'ADMIN_PRINCIPAL' ||
    user.perfil === 'ADMINISTRADOR' ||
    user.perfil === 'GRADUADO_SERVICO';

  if (!podeAcessar) {
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
          Efetivo alimentado
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Registre e acompanhe o efetivo
          previsto e alimentado nas refeições
          do dia.
        </p>
      </header>

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
              fontSize: '23px',
              lineHeight: 1,
            }}
          >
            👥
          </div>

          <div>
            <strong>
              Controle de efetivo
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Informe os quantitativos das
              refeições para acompanhamento
              do serviço de aprovisionamento.
            </div>
          </div>
        </div>

        <EfetivoClient />
      </section>

      <section
        className="card"
        style={{
          marginTop: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '23px',
              lineHeight: 1,
            }}
          >
            ✓
          </div>

          <div>
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Fechamento do serviço diário
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 0',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              Após a realização das refeições,
              registre o efetivo realmente
              alimentado, as faltas, os militares
              não arranchados atendidos e a sobra
              total do serviço.
            </p>
          </div>
        </div>

        <Link
          href="/efetivo/fechamento"
          className="btn"
          style={{
            width: '100%',
            textAlign: 'center',
            display: 'block',
          }}
        >
          Fechamento Diário
        </Link>
      </section>

      <NavegacaoInferior />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import FechamentoDiarioClient from '@/components/FechamentoDiarioClient';
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
        href="/efetivo"
      >
        ← Efetivo alimentado
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
          Fechamento Diário
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Registre os dados reais do serviço após
          a realização das refeições do dia.
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
            ✓
          </div>

          <div>
            <strong>
              Fechamento do serviço
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Confira o efetivo previsto e informe
              o comparecimento, atendimentos adicionais
              e demais dados necessários para concluir
              o serviço diário.
            </div>
          </div>
        </div>

        <FechamentoDiarioClient />
      </section>

      <NavegacaoInferior
        voltarHref="/efetivo"
        voltarTexto="Efetivo alimentado"
      />
    </main>
  );
}

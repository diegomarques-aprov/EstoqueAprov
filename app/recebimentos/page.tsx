import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RecebimentoClient from '@/components/RecebimentoClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
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
          Novo recebimento
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Registre a entrada de gêneros QS ou QR
          no estoque.
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
            ↓
          </div>

          <div>
            <strong>
              Entrada de gêneros
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Lote e validade serão solicitados
              somente quando o gênero exigir.
            </div>
          </div>
        </div>

        <RecebimentoClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

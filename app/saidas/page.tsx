import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import SaidaClient from '@/components/SaidaClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
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
          Saída de gêneros
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Registre a retirada de gêneros QS ou QR
          do estoque.
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
            ↑
          </div>

          <div>
            <strong>
              Retirada do estoque
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Informe os gêneros, quantidades e o
              destino operacional da saída.
            </div>
          </div>
        </div>

        <SaidaClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

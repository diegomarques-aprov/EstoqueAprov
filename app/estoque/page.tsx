import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EstoqueClient from '@/components/EstoqueClient';
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
          Estoque atual
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Consulte os gêneros disponíveis
          e acompanhe a situação atual do
          estoque.
        </p>
      </header>

      <section className="card">
        <EstoqueClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

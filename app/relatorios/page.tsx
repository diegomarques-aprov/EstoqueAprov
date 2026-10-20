import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RelatoriosClient from '@/components/RelatoriosClient';

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

      <h1>Relatórios</h1>

      <section
        className="card"
        style={{
          marginBottom: 16,
        }}
      >
        <h2>
          Análises operacionais
        </h2>

        <p
          style={{
            marginBottom: 14,
            opacity: 0.8,
          }}
        >
          Consulte análises que relacionam
          o consumo dos gêneros com a
          atividade do Aprovisionamento.
        </p>

        <Link
          href="/consumo-efetivo"
          className="btn"
          style={{
            display: 'inline-block',
            textDecoration: 'none',
          }}
        >
          Consumo × Efetivo
        </Link>
      </section>

      <RelatoriosClient />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import GruposGenerosClient from '@/components/GruposGenerosClient';

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
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <Link
          href="/inicio"
          className="back"
        >
          ← Início
        </Link>
      </div>

      <h1>Grupos de gêneros</h1>

      <p className="muted">
        Organize as categorias do estoque em grandes
        grupos para facilitar consultas, relatórios e
        planejamento.
      </p>

      <GruposGenerosClient />
    </main>
  );
}

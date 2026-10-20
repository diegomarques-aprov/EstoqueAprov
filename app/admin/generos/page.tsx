import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import GenerosClient from '@/components/GenerosClient';

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
        href="/inicio"
        className="back"
      >
        ← Início
      </Link>

      <h1>Gêneros</h1>

      <p className="muted">
        QS e QR ficam separados na interface e
        compartilham a mesma estrutura segura no banco.
      </p>

      <GenerosClient />
    </main>
  );
}

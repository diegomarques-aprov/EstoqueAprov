import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LocaisClient from '@/components/LocaisClient';

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

      <h1>Locais de armazenamento</h1>

      <p className="muted">
        Cadastre os locais reais do Aprovisionamento.
        Câmara de Resfriamento é o local habitual do
        hortifruti/FLV.
      </p>

      <LocaisClient />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import UnidadesClient from '@/components/UnidadesClient';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  return (
    <main>
      <Link
        href="/inicio"
        className="back"
      >
        ← Início
      </Link>

      <h1>Unidades de medida</h1>

      <p className="muted">
        Cadastre e mantenha as unidades de medida
        utilizadas nos gêneros do Aprovisionamento,
        como quilograma (kg), litro (L) e unidade
        (un).
      </p>

      <UnidadesClient />
    </main>
  );
}

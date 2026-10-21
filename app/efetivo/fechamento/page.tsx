import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import FechamentoDiarioClient from '@/components/FechamentoDiarioClient';

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

      <h1>Fechamento Diário</h1>

      <FechamentoDiarioClient />
    </main>
  );
}

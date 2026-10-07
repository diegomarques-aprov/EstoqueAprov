import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import FechamentoDiarioClient from '@/components/FechamentoDiarioClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link className="back" href="/efetivo">
        ← Efetivo alimentado
      </Link>

      <h1>Fechamento Diário</h1>

      <FechamentoDiarioClient />
    </main>
  );
}

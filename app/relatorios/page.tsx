import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RelatoriosClient from '@/components/RelatoriosClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link className="back" href="/dashboard">
        ← Início
      </Link>

      <h1>Relatórios</h1>

      <RelatoriosClient />
    </main>
  );
}

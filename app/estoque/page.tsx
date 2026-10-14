import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EstoqueClient from '@/components/EstoqueClient';

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

      <h1>Estoque atual</h1>

      <EstoqueClient />
    </main>
  );
}

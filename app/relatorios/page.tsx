import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RelatoriosClient from '@/components/RelatoriosClient';
import QDAAClient from '@/components/QDAAClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link
        className="back"
        href="/dashboard"
      >
        ← Início
      </Link>

      <h1>Relatórios</h1>

      <RelatoriosClient />

      <div
        style={{
          marginTop: 28,
          marginBottom: 18,
          borderTop:
            '1px solid rgba(255,255,255,0.15)',
        }}
      />

      <QDAAClient />
    </main>
  );
}

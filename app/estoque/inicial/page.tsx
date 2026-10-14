import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EstoqueInicialClient from '@/components/EstoqueInicialClient';

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

      <h1>Estoque inicial</h1>

      <p className="muted">
        Registre somente o material existente na
        implantação. Para FLV sem controle por lote,
        o campo não será solicitado.
      </p>

      <EstoqueInicialClient />
    </main>
  );
}

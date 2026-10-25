import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import RecebimentoClient from '@/components/RecebimentoClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

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

      <h1>Novo recebimento</h1>

      <p className="muted">
        Registre QS ou QR. Lote e validade aparecem
        somente quando o gênero exigir.
      </p>

      <RecebimentoClient />

      <NavegacaoInferior />
    </main>
  );
}

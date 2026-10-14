import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import SaidaClient from '@/components/SaidaClient';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
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

      <h1>Saída de gêneros</h1>

      <p className="muted">
        Registre saídas de QS ou QR para café da
        manhã, almoço, jantar, ceia ou outro destino.
      </p>

      <SaidaClient />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EfetivoClient from '@/components/EfetivoClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link className="back" href="/dashboard">
        ← Início
      </Link>

      <h1>Efetivo alimentado</h1>

      <div
        className="card"
        style={{
          marginBottom: 20,
        }}
      >
        <h2>Arranchamento / Efetivo</h2>

        <p className="muted">
          Planeje o efetivo arranchado para o serviço de
          alimentação e, após a realização das refeições,
          registre o fechamento diário.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/efetivo/fechamento"
            className="btn"
          >
            Fechamento Diário
          </Link>
        </div>
      </div>

      <EfetivoClient />
    </main>
  );
}

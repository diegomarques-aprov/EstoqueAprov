import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (await currentUser()) {
    redirect('/inicio');
  }

  return (
    <main>
      <div className="card">
        <h1>EstoqueAprov</h1>

        <p className="muted">
          Sistema de Controle de Estoque do
          Aprovisionamento
        </p>

        <LoginForm />
      </div>
    </main>
  );
}

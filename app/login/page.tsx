import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export const dynamic = 'force-dynamic';

export default async function Login() {
  if ((await prisma.usuario.count()) === 0) {
    redirect('/configuracao-inicial');
  }

  if (await currentUser()) {
    redirect('/dashboard');
  }

  return (
    <main className="narrow">
      <div className="brand">EstoqueAprov</div>
      <p className="muted">Sistema de Controle do Aprovisionamento</p>

      <div className="card">
        <h1>Entrar</h1>
        <LoginForm />
      </div>
    </main>
  );
}

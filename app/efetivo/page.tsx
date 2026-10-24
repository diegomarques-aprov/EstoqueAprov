import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EfetivoClient from '@/components/EfetivoClient';

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  const podeAcessar =
    user.perfil === 'ADMIN_PRINCIPAL' ||
    user.perfil === 'ADMINISTRADOR' ||
    user.perfil === 'GRADUADO_SERVICO';

  if (!podeAcessar) {
    redirect('/inicio');
  }

  return (
    <main>
      <Link
        className="back"
        href="/inicio"
      >
        ← Início
      </Link>

      <h1>Efetivo alimentado</h1>

      <EfetivoClient />

      <div
        className="card"
        style={{
          marginTop: 20,
        }}
      >
        <h2>Fechamento do serviço diário</h2>

        <p className="muted">
          Após a realização das refeições do dia,
          registre o efetivo realmente alimentado,
          as faltas, os militares não arranchados
          atendidos e a sobra total do serviço.
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
    </main>
  );
}

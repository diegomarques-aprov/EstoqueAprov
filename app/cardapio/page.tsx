import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import CardapioClient from '@/components/CardapioClient';

export default async function CardapioPage() {
  const u = await currentUser();

  if (!u) {
    redirect('/login');
  }

  const administrador =
    u.perfil === 'ADMIN_PRINCIPAL' ||
    u.perfil === 'ADMINISTRADOR';

  const perfilOperacional =
    administrador ||
    u.perfil === 'CHEFE_DEPOSITO' ||
    u.perfil === 'GRADUADO_SERVICO';

  if (!perfilOperacional) {
    redirect('/inicio');
  }

  return (
    <main>
      <div
        className="actions"
        style={{
          marginBottom: 16,
        }}
      >
        <Link
          className="btn secondary"
          href="/inicio"
        >
          ← Início
        </Link>
      </div>

      <h1>Cardápio</h1>

      <p className="muted">
        Cadastro e consulta dos cardápios
        previstos para o Aprovisionamento.
      </p>

      {!administrador && (
        <div
          className="card"
          style={{
            border: '1px solid #3b82f6',
            background:
              'rgba(59, 130, 246, 0.08)',
          }}
        >
          <strong>
            Consulta de cardápio
          </strong>

          <p
            className="muted"
            style={{
              marginBottom: 0,
            }}
          >
            Seu perfil pode consultar os
            cardápios cadastrados. O cadastro
            e a alteração são realizados
            pelos Administradores.
          </p>
        </div>
      )}

      <CardapioClient
        podeEditar={administrador}
      />
    </main>
  );
}

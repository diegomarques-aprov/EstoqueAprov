import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import UsuariosClient from '@/components/UsuariosClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function UsuariosPage() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  if (usuario.perfil !== 'ADMIN_PRINCIPAL') {
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

      <h1>Usuários e permissões</h1>

      <p className="muted">
        Gerencie os usuários autorizados a
        acessar o EstoqueAprov, seus perfis
        de acesso e situação no sistema.
      </p>

      <UsuariosClient />

      <NavegacaoInferior />
    </main>
  );
}

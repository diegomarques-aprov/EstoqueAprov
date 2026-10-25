import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import EstoqueInicialClient from '@/components/EstoqueInicialClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  if (
    ![
      'ADMIN_PRINCIPAL',
      'ADMINISTRADOR',
      'CHEFE_DEPOSITO',
    ].includes(usuario.perfil)
  ) {
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

      <h1>Estoque inicial</h1>

      <p className="muted">
        Registre somente o material existente na
        implantação. Para FLV sem controle por lote,
        o campo não será solicitado.
      </p>

      <EstoqueInicialClient />

      <NavegacaoInferior />
    </main>
  );
}

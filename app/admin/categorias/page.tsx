import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import CategoriasClient from '@/components/CategoriasClient';

export default async function Page() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  return (
    <main>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <Link
          href="/inicio"
          className="back"
        >
          ← Início
        </Link>
      </div>

      <h1>Categorias de gêneros</h1>

      <p className="muted">
        Cadastre e mantenha as categorias utilizadas
        para organizar os gêneros do Aprovisionamento.
        As configurações da categoria podem sugerir
        automaticamente controle de lote, validade e
        local habitual no cadastro do gênero.
      </p>

      <CategoriasClient />
    </main>
  );
}

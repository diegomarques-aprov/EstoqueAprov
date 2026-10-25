import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import QDAAClient from '@/components/QDAAClient';
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

      <h1>
        QDAA / Ressuprimento QS
      </h1>

      <div className="card">
        <h2>
          Controle da cadeia de suprimento
        </h2>

        <p>
          Área destinada ao acompanhamento dos
          gêneros classificados como QS e ao
          planejamento das necessidades da cadeia
          de suprimento.
        </p>

        <p className="muted">
          O QDAA é apurado mensalmente. O histórico
          de consumo líquido real dos gêneros é
          utilizado como base para auxiliar o
          planejamento dos próximos ciclos de
          ressuprimento.
        </p>

        <div
          className="actions"
          style={{
            marginTop: 14,
          }}
        >
          <Link
            className="btn"
            href="/qdaa/historico"
          >
            Histórico de Ressuprimentos QS
          </Link>
        </div>
      </div>

      <QDAAClient />

      <NavegacaoInferior />
    </main>
  );
}

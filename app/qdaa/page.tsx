import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import QDAAClient from '@/components/QDAAClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link
        className="back"
        href="/dashboard"
      >
        ← Início
      </Link>

      <h1>QDAA / Ressuprimento QS</h1>

      <div className="card">
        <h2>
          Controle da cadeia de suprimento
        </h2>

        <p>
          Área destinada ao acompanhamento dos
          gêneros classificados como QS e ao
          apoio ao planejamento das necessidades
          da cadeia de suprimento.
        </p>

        <p className="muted">
          O QDAA é apurado mensalmente. O
          histórico de consumo será utilizado
          para auxiliar o cálculo das
          necessidades do próximo ciclo
          bimestral de ressuprimento.
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
    </main>
  );
}

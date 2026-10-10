import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import HistoricoRessuprimentoQSClient from '@/components/HistoricoRessuprimentoQSClient';

export default async function Page() {
  if (!(await currentUser())) {
    redirect('/login');
  }

  return (
    <main>
      <Link
        className="back"
        href="/qdaa"
      >
        ← QDAA / Ressuprimento QS
      </Link>

      <h1>
        Histórico de Ressuprimentos QS
      </h1>

      <div className="card">
        <h2>
          Planejamentos registrados
        </h2>

        <p>
          Consulte os planejamentos de
          Ressuprimento QS registrados no
          EstoqueAprov.
        </p>

        <p className="muted">
          Os planejamentos finalizados mantêm
          a memória do cálculo, os quantitativos
          sugeridos e planejados, as
          justificativas das alterações, o
          responsável e as datas de registro.
        </p>
      </div>

      <HistoricoRessuprimentoQSClient />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import ConsumoEfetivoClient from '@/components/ConsumoEfetivoClient';

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
        href="/relatorios"
      >
        ← Relatórios
      </Link>

      <Link
        className="back"
        href="/inicio"
        style={{
          marginLeft: 14,
        }}
      >
        ← Início
      </Link>

      <h1>
        Consumo × Efetivo
      </h1>

      <div className="card">
        <h2>
          Análise do consumo operacional
        </h2>

        <p>
          Esta área relaciona os gêneros QS
          retirados do estoque com o efetivo
          realmente atendido.
        </p>

        <p className="muted">
          O saque registrado como Serviço do
          dia seguinte é relacionado à soma
          das refeições realizadas no dia
          seguinte. Saques específicos de
          Café da manhã, Almoço, Jantar ou
          Ceia são considerados
          complementações da respectiva
          refeição.
        </p>

        <p className="muted">
          As devoluções registradas são
          descontadas antes do cálculo do
          consumo por atendimento.
        </p>
      </div>

      <ConsumoEfetivoClient />
    </main>
  );
}

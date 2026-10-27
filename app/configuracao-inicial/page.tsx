import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SetupForm from '@/components/SetupForm';

export const dynamic = 'force-dynamic';

export default async function Setup() {
  if ((await prisma.usuario.count()) > 0) {
    redirect('/login');
  }

  return (
    <main>
      <header
        style={{
          marginBottom: '20px',
        }}
      >
        <div
          className="brand"
          style={{
            marginBottom: '5px',
          }}
        >
          EstoqueAprov
        </div>

        <p
          className="muted"
          style={{
            margin: 0,
            fontSize: '12px',
          }}
        >
          Configuração inicial do sistema
        </p>
      </header>

      <section
        className="card"
        style={{
          border: '1px solid #284334',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <span className="tag">
            ETAPA 1 DE 4
          </span>

          <span
            style={{
              fontSize: '20px',
            }}
          >
            👤
          </span>
        </div>

        <h1
          style={{
            marginTop: 0,
            marginBottom: '8px',
          }}
        >
          Criar Administrador Principal
        </h1>

        <p
          className="muted"
          style={{
            fontSize: '11px',
            lineHeight: 1.55,
            marginBottom: '16px',
          }}
        >
          Cadastre o primeiro usuário do
          EstoqueAprov. Ele terá autoridade
          para realizar a configuração do
          sistema e cadastrar os demais
          usuários.
        </p>

        <div
          style={{
            padding: '11px',
            borderRadius: '10px',
            background:
              'rgba(37,99,235,.07)',
            border:
              '1px solid rgba(37,99,235,.35)',
            marginBottom: '16px',
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            Administrador Principal
          </strong>

          <span
            className="muted"
            style={{
              display: 'block',
              fontSize: '10px',
              lineHeight: 1.5,
            }}
          >
            Este é o usuário responsável
            pela administração inicial e
            pelo gerenciamento das
            permissões do sistema.
          </span>
        </div>

        <SetupForm />
      </section>

      <section
        className="card"
        style={{
          border: '1px solid #284334',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: '16px',
          }}
        >
          Próximas etapas
        </h2>

        <p
          className="muted"
          style={{
            fontSize: '10px',
            lineHeight: 1.5,
          }}
        >
          Após criar o Administrador
          Principal, será possível preparar
          a estrutura necessária para
          iniciar o controle do estoque.
        </p>

        <div
          style={{
            display: 'grid',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {[
            [
              '2',
              'Locais de armazenamento',
              'Cadastre os locais utilizados para armazenar os gêneros.',
            ],
            [
              '3',
              'Gêneros QS e QR',
              'Cadastre e organize os gêneros utilizados pelo Aprovisionamento.',
            ],
            [
              '4',
              'Estoque inicial',
              'Registre os saldos existentes para iniciar o controle pelo sistema.',
            ],
          ].map(
            ([
              numero,
              titulo,
              descricao,
            ]) => (
              <div
                key={numero}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#102018',
                  border:
                    '1px solid #284334',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9px',
                    background:
                      'rgba(43,138,87,.12)',
                    border:
                      '1px solid rgba(43,138,87,.35)',
                    fontWeight: 800,
                    fontSize: '11px',
                  }}
                >
                  {numero}
                </div>

                <div>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      marginBottom: '3px',
                    }}
                  >
                    {titulo}
                  </strong>

                  <span
                    className="muted"
                    style={{
                      display: 'block',
                      fontSize: '9px',
                      lineHeight: 1.45,
                    }}
                  >
                    {descricao}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

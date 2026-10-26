import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import ConsumoEfetivoClient from '@/components/ConsumoEfetivoClient';
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
        href="/relatorios"
      >
        ← Relatórios
      </Link>

      <header
        style={{
          marginTop: '18px',
          marginBottom: '20px',
        }}
      >
        <h1
          style={{
            marginBottom: '6px',
          }}
        >
          Consumo × Efetivo
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Analise a relação entre os gêneros
          QS consumidos e o efetivo realmente
          atendido pelo Aprovisionamento.
        </p>
      </header>

      <section
        className="card"
        style={{
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '11px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '11px',
              background: '#183d2a',
              border: '1px solid #284334',
              fontSize: '20px',
            }}
          >
            ◫
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Análise do consumo operacional
            </strong>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: '13px',
                lineHeight: 1.5,
              }}
            >
              Esta área relaciona os gêneros
              QS retirados do estoque com o
              efetivo realmente atendido.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '9px',
            marginTop: '14px',
          }}
        >
          <div
            style={{
              padding: '12px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '9px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: '17px',
                }}
              >
                → 
              </span>

              <p
                className="muted"
                style={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                O saque registrado como
                <strong>
                  {' '}
                  Serviço do dia seguinte
                </strong>{' '}
                é relacionado à soma das
                refeições realizadas no dia
                seguinte.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '9px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: '17px',
                }}
              >
                +
              </span>

              <p
                className="muted"
                style={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                Saques específicos de
                <strong>
                  {' '}
                  Café da manhã, Almoço,
                  Jantar ou Ceia
                </strong>{' '}
                são considerados
                complementações da respectiva
                refeição.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '11px',
              background:
                'rgba(43,138,87,.07)',
              border:
                '1px solid rgba(43,138,87,.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '9px',
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontSize: '17px',
                }}
              >
                ↩
              </span>

              <p
                className="muted"
                style={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                As devoluções registradas são
                descontadas antes do cálculo
                do consumo por atendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '17px',
            paddingBottom: '14px',
            borderBottom:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: '21px',
              lineHeight: 1,
            }}
          >
            ≡
          </div>

          <div>
            <strong>
              Consulta de consumo
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Selecione o período para analisar
              o consumo dos gêneros em relação
              ao efetivo atendido.
            </div>
          </div>
        </div>

        <ConsumoEfetivoClient />
      </section>

      <NavegacaoInferior
        voltarHref="/relatorios"
        voltarTexto="Relatórios"
      />
    </main>
  );
}

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
          Estoque inicial
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Registre os gêneros existentes no
          depósito no momento da implantação
          do Estoque Aprov.
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
              Implantação do estoque
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Este procedimento deve ser usado
              somente para registrar o material
              que já existia fisicamente no
              depósito quando o sistema começou
              a ser utilizado.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '11px',
            background: 'rgba(43,138,87,.07)',
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
              ✓
            </span>

            <div>
              <strong
                style={{
                  display: 'block',
                  fontSize: '13px',
                }}
              >
                FLV sem controle por lote
              </strong>

              <p
                className="muted"
                style={{
                  margin: '4px 0 0',
                  fontSize: '12px',
                  lineHeight: 1.45,
                }}
              >
                Para gêneros FLV que não utilizam
                controle por lote, esse campo não
                será solicitado no lançamento.
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
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <span
            style={{
              fontSize: '21px',
              lineHeight: 1,
            }}
          >
            +
          </span>

          <div>
            <strong>
              Registrar saldo inicial
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Informe o gênero, local de
              armazenamento, quantidade e demais
              dados exigidos para compor o saldo
              inicial.
            </div>
          </div>
        </div>

        <EstoqueInicialClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

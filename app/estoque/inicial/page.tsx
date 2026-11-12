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

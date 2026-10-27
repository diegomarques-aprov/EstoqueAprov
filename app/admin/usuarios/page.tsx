import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import UsuariosClient from '@/components/UsuariosClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

export default async function UsuariosPage() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  if (
    usuario.perfil !==
    'ADMIN_PRINCIPAL'
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
          Usuários e permissões
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Gerencie quem pode acessar o
          Estoque Aprov e qual nível de
          permissão cada usuário possui
          no sistema.
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
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            ♙
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
              Controle de acesso
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Os perfis determinam quais
              módulos e procedimentos
              cada usuário pode acessar
              no Estoque Aprov.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
            marginTop: '14px',
          }}
        >
          <div
            style={{
              padding: '11px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '12px',
                marginBottom: '3px',
              }}
            >
              Administração
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              Perfis administrativos
              possuem acesso aos módulos
              de gestão conforme as
              permissões definidas no
              sistema.
            </span>
          </div>

          <div
            style={{
              padding: '11px',
              borderRadius: '11px',
              background: '#0c1811',
              border: '1px solid #284334',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '12px',
                marginBottom: '3px',
              }}
            >
              Operação
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              Os demais perfis recebem
              acesso somente às funções
              necessárias para suas
              atividades no
              Aprovisionamento.
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '10px',
            padding: '11px',
            borderRadius: '10px',
            background:
              'rgba(245,158,11,.06)',
            border:
              '1px solid rgba(245,158,11,.3)',
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '11px',
              marginBottom: '3px',
            }}
          >
            Área restrita
          </strong>

          <span
            className="muted"
            style={{
              display: 'block',
              fontSize: '10px',
              lineHeight: 1.45,
            }}
          >
            O gerenciamento de usuários
            e permissões é exclusivo do
            Administrador Principal.
          </span>
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
              Gerenciar usuários
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Cadastre e gerencie os
              usuários, seus perfis de
              acesso e a situação de cada
              conta.
            </div>
          </div>
        </div>

        <UsuariosClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

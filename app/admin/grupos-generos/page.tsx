import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import GruposGenerosClient from '@/components/GruposGenerosClient';
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
        href="/inicio"
        className="back"
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
          Grupos de gêneros
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Organize as categorias do
          estoque em grandes grupos para
          facilitar consultas, relatórios
          e planejamento.
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
              fontSize: '17px',
              fontWeight: 800,
            }}
          >
            ≡
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
              Estrutura do estoque
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Os grupos representam o
              nível mais amplo de
              organização dos gêneros
              alimentícios.
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
              Grupo
            </strong>

            <span
              className="muted"
              style={{
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Reúne categorias com
              características semelhantes
              dentro do estoque.
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
              Categorias e gêneros
            </strong>

            <span
              className="muted"
              style={{
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              As categorias ficam
              vinculadas aos grupos e,
              abaixo delas, ficam os
              gêneros cadastrados.
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: '10px',
            padding: '10px 11px',
            borderRadius: '10px',
            background:
              'rgba(43,138,87,.06)',
            border:
              '1px solid rgba(43,138,87,.3)',
          }}
        >
          <span
            className="muted"
            style={{
              fontSize: '11px',
              lineHeight: 1.45,
            }}
          >
            Estrutura: Grupo → Categoria
            → Gênero
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
              Gerenciar grupos
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Cadastre, consulte e altere
              os grupos utilizados para
              organizar o estoque.
            </div>
          </div>
        </div>

        <GruposGenerosClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import LocaisClient from '@/components/LocaisClient';
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
          Locais de armazenamento
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Cadastre os locais físicos
          utilizados para armazenar os
          gêneros do Aprovisionamento.
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
            ▣
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
              Organização física
            </strong>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Os locais representam onde
              cada gênero fica armazenado
              fisicamente no
              Aprovisionamento.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '11px',
            background: '#0c1811',
            border: '1px solid #284334',
          }}
        >
          <strong
            style={{
              display: 'block',
              fontSize: '12px',
              marginBottom: '4px',
            }}
          >
            Local habitual
          </strong>

          <span
            className="muted"
            style={{
              display: 'block',
              fontSize: '11px',
              lineHeight: 1.45,
            }}
          >
            O local pode ser definido
            como padrão nas categorias e
            nos gêneros para agilizar os
            lançamentos do estoque.
          </span>
        </div>

        <div
          style={{
            marginTop: '10px',
            padding: '12px',
            borderRadius: '11px',
            background:
              'rgba(43,138,87,.07)',
            border:
              '1px solid rgba(43,138,87,.35)',
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
                fontSize: '17px',
                lineHeight: 1,
              }}
            >
              ❄
            </span>

            <div>
              <strong
                style={{
                  display: 'block',
                  fontSize: '12px',
                  marginBottom: '3px',
                }}
              >
                Hortifruti / FLV
              </strong>

              <span
                className="muted"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  lineHeight: 1.45,
                }}
              >
                Câmara de Resfriamento é
                o local habitual para
                armazenamento dos gêneros
                FLV.
              </span>
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
              Gerenciar locais
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
              os locais de armazenamento
              utilizados pelo Estoque
              Aprov.
            </div>
          </div>
        </div>

        <LocaisClient />
      </section>

      <NavegacaoInferior />
    </main>
  );
}

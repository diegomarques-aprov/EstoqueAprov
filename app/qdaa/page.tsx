import Link from 'next/link';
import { redirect } from 'next/navigation';

import NavegacaoInferior from '@/components/NavegacaoInferior';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function QDAAPage() {
  const usuario = await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  const podeAcessar =
    usuario.perfil === 'ADMIN_PRINCIPAL' ||
    usuario.perfil === 'ADMINISTRADOR';

  if (!podeAcessar) {
    redirect('/inicio');
  }

  const opcoes = [
    {
      titulo: 'Apoio ao QDAA',
      descricao: 'Consolidação mensal e controle dos gêneros QS.',
      href: '/qdaa/apoio',
      icone: '▤',
    },
    {
      titulo: 'Planejamento de Ressuprimento QS',
      descricao:
        'Cálculo das necessidades, referências pendentes e próximo ciclo.',
      href: '/qdaa/planejamento',
      icone: '⇄',
    },
    {
      titulo: 'Histórico de Ressuprimentos',
      descricao: 'Consulta dos planejamentos QS já registrados.',
      href: '/qdaa/historico',
      icone: '◷',
    },
  ];

  return (
    <main>
      <header
        style={{
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '11px',
              border: '1px solid #315640',
              background: '#102018',
              fontSize: '20px',
            }}
          >
            ▤
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                lineHeight: 1.15,
              }}
            >
              QDAA / Ressuprimento QS
            </h1>

            <p
              className="muted"
              style={{
                margin: '5px 0 0',
                fontSize: '14px',
                lineHeight: 1.4,
              }}
            >
              Selecione a operação que deseja realizar.
            </p>
          </div>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gap: '9px',
        }}
      >
        {opcoes.map((opcao) => (
          <Link
            key={opcao.href}
            href={opcao.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '62px',
              padding: '11px 13px',
              borderRadius: '12px',
              border: '1px solid #284334',
              background: '#0c1811',
              color: 'inherit',
              textDecoration: 'none',
              boxSizing: 'border-box',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '35px',
                height: '35px',
                flex: '0 0 35px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '9px',
                background: '#14271c',
                border: '1px solid #315640',
                fontSize: '17px',
              }}
            >
              {opcao.icone}
            </div>

            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <strong
                style={{
                  display: 'block',
                  fontSize: '15px',
                  lineHeight: 1.3,
                }}
              >
                {opcao.titulo}
              </strong>

              <span
                className="muted"
                style={{
                  display: 'block',
                  marginTop: '3px',
                  fontSize: '12px',
                  lineHeight: 1.35,
                }}
              >
                {opcao.descricao}
              </span>
            </div>

            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                fontSize: '20px',
                lineHeight: 1,
                opacity: 0.75,
              }}
            >
              ›
            </span>
          </Link>
        ))}
      </section>

      <section
        style={{
          marginTop: '15px',
          padding: '11px 12px',
          borderRadius: '11px',
          border: '1px solid rgba(245,158,11,.35)',
          background: 'rgba(245,158,11,.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
            }}
          >
            ℹ
          </span>

          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: '12px',
              lineHeight: 1.45,
            }}
          >
            O QDAA consolida os dados mensais dos gêneros QS. O
            planejamento utiliza o histórico de consumo e as referências
            necessárias para apoiar o próximo ressuprimento.
          </p>
        </div>
      </section>

      <NavegacaoInferior />
    </main>
  );
}

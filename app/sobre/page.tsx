import Link from 'next/link';
import packageJson from '@/package.json';
import ManualEstoqueAprov from '@/components/ManualEstoqueAprov';

export default function SobrePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        maxWidth: '100%',
        margin: 0,
        padding:
          'calc(34px + env(safe-area-inset-top)) 18px calc(34px + env(safe-area-inset-bottom))',
        background:
          'linear-gradient(160deg, #ead8b5 0%, #d5bc8c 48%, #b89561 100%)',
        color: '#20352a',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        {/* CABEÇALHO */}

        <header
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <img
            src="/icon-192.png"
            alt="Estoque Aprov"
            width={100}
            height={100}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '24px',
              border: '2px solid rgba(73, 48, 27, .35)',
              boxShadow:
                '0 8px 22px rgba(66, 43, 23, .25)',
            }}
          />

          <h1
            style={{
              margin: '16px 0 4px',
              fontSize: '30px',
              lineHeight: 1.05,
              color: '#173b2a',
              letterSpacing: '-0.5px',
            }}
          >
            Estoque Aprov
          </h1>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#79562f',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            Sistema de Gestão do Aprovisionamento
          </div>

          <p
            style={{
              maxWidth: '620px',
              margin: '18px auto 0',
              padding: '0 8px',
              fontSize: '14px',
              lineHeight: 1.65,
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#4f3a25',
              textAlign: 'center',
            }}
          >
            “Sem o aprovisionamento correto, a bravura
            dos soldados perde a força; a logística é a
            verdadeira espinha dorsal que sustenta a
            vitória no campo de batalha.”
          </p>
        </header>

        {/* APRESENTAÇÃO */}

        <section
          style={{
            padding: '22px',
            marginBottom: '16px',
            borderRadius: '20px',
            background: 'rgba(255, 250, 238, .72)',
            border: '1px solid rgba(92, 62, 32, .18)',
            boxShadow:
              '0 8px 24px rgba(73, 48, 27, .12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '24px',
              }}
            >
              ◈
            </span>

            <h2
              style={{
                margin: 0,
                color: '#173b2a',
                fontSize: '20px',
              }}
            >
              Sobre o projeto
            </h2>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#3f392f',
              textAlign: 'justify',
              textIndent: '1.8em',
            }}
          >
            O <strong>Estoque Aprov</strong> é um
            sistema desenvolvido para apoiar as
            atividades do Serviço de
            Aprovisionamento, reunindo em um único
            ambiente as principais rotinas de
            controle, acompanhamento e gestão dos
            gêneros alimentícios.
          </p>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#3f392f',
              textAlign: 'justify',
              textIndent: '1.8em',
            }}
          >
            O projeto nasceu a partir das
            necessidades práticas do
            Aprovisionamento, buscando tornar os
            procedimentos mais simples, seguros,
            organizados e rastreáveis, além de
            facilitar a consulta das informações
            necessárias à tomada de decisão.
          </p>
        </section>

        {/* RECURSOS */}

        <section
          style={{
            padding: '22px',
            marginBottom: '16px',
            borderRadius: '20px',
            background: 'rgba(255, 250, 238, .72)',
            border: '1px solid rgba(92, 62, 32, .18)',
            boxShadow:
              '0 8px 24px rgba(73, 48, 27, .12)',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px',
              color: '#173b2a',
              fontSize: '20px',
            }}
          >
            O que o sistema integra
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              ['📦', 'Estoque QS e QR'],
              ['↓', 'Recebimentos'],
              ['↑', 'Saídas'],
              ['↺', 'Devoluções e ajustes'],
              ['🥬', 'Controle de FLV'],
              ['📅', 'Cardápio'],
              ['👥', 'Efetivo alimentado'],
              ['📊', 'Relatórios'],
              ['📋', 'QDAA mensal'],
              ['🚚', 'Ressuprimento QS'],
            ].map(([icone, texto]) => (
              <div
                key={texto}
                style={{
                  minHeight: '78px',
                  padding: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px',
                  borderRadius: '14px',
                  background:
                    'rgba(55, 86, 61, .09)',
                  border:
                    '1px solid rgba(55, 86, 61, .14)',
                  color: '#294735',
                  fontSize: '13px',
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                  }}
                >
                  {icone}
                </span>

                <span>{texto}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PRINCÍPIOS */}

        <section
          style={{
            padding: '22px',
            marginBottom: '16px',
            borderRadius: '20px',
            background: '#294735',
            color: '#f8edd8',
            boxShadow:
              '0 8px 24px rgba(38, 57, 44, .22)',
          }}
        >
          <h2
            style={{
              margin: '0 0 14px',
              fontSize: '20px',
              color: '#f4d79d',
            }}
          >
            Gestão e rastreabilidade
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#f5ead6',
              textAlign: 'justify',
              textIndent: '1.8em',
            }}
          >
            O Estoque Aprov foi estruturado para
            preservar o histórico das movimentações,
            apoiar o controle por origem, lote e
            validade, aplicar o princípio PVPS e
            oferecer informações claras sobre
            saldos, consumo e necessidades de
            ressuprimento.
          </p>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#f5ead6',
              textAlign: 'justify',
              textIndent: '1.8em',
            }}
          >
            O planejamento de Ressuprimento QS
            considera o ciclo normal bimestral,
            mantendo também a possibilidade de
            registrar necessidades complementares
            extraordinárias sem alterar o
            planejamento original.
          </p>
        </section>

        {/* IDENTIFICAÇÃO */}

        <section
          style={{
            padding: '22px',
            marginBottom: '16px',
            borderRadius: '20px',
            textAlign: 'center',
            background: 'rgba(255, 250, 238, .78)',
            border: '1px solid rgba(92, 62, 32, .18)',
            boxShadow:
              '0 8px 24px rgba(73, 48, 27, .12)',
          }}
        >
          <div
            style={{
              marginBottom: '7px',
              color: '#79562f',
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1.4px',
            }}
          >
            Idealização e desenvolvimento
          </div>

          <div
            style={{
              fontSize: '21px',
              fontWeight: 900,
              color: '#173b2a',
            }}
          >
            1º Sgt Diego Marques
          </div>

          <div
            style={{
              marginTop: '5px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#4e493e',
            }}
          >
            Adjunto do Aprovisionamento
          </div>

          <div
            style={{
              width: '48px',
              height: '2px',
              margin: '17px auto',
              borderRadius: '999px',
              background: '#a7793d',
            }}
          />

          <div
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: '#4e493e',
            }}
          >
            <strong>
              18ª Brigada de Infantaria de Pantanal
            </strong>
            <br />
            Serviço de Aprovisionamento
            <br />
            Corumbá-MS · 2026
          </div>
        </section>

        {/* MANUAL DE UTILIZAÇÃO */}

        <ManualEstoqueAprov />

        {/* VERSÃO */}

        <section
          style={{
            padding: '18px',
            marginBottom: '24px',
            borderRadius: '18px',
            textAlign: 'center',
            background: 'rgba(86, 57, 29, .14)',
            border: '1px solid rgba(86, 57, 29, .18)',
          }}
        >
          <div
            style={{
              color: '#654724',
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}
          >
            Versão do sistema
          </div>

          <div
            style={{
              marginTop: '5px',
              color: '#173b2a',
              fontSize: '20px',
              fontWeight: 900,
            }}
          >
            Estoque Aprov · {packageJson.version}
          </div>
        </section>

        {/* NAVEGAÇÃO */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/inicio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '42px',
              padding: '9px 18px',
              borderRadius: '12px',
              background: '#5d3f25',
              border: '1px solid #765535',
              color: '#fff7e8',
              fontSize: '14px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow:
                '0 5px 14px rgba(73, 48, 27, .18)',
            }}
          >
            ← Voltar ao Início
          </Link>
        </div>

        <footer
          style={{
            marginTop: '26px',
            textAlign: 'center',
            color: '#654724',
            fontSize: '11px',
            lineHeight: 1.6,
            fontWeight: 700,
          }}
        >
          <div>
            Estoque Aprov · Serviço de
            Aprovisionamento
          </div>

          <div>
            © 2026 — Todos os Direitos Reservados
          </div>
        </footer>
      </div>
    </main>
  );
}

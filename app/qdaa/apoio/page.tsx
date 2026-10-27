'use client';

import Link from 'next/link';
import {
  useEffect,
  useState,
} from 'react';

import NavegacaoInferior from '@/components/NavegacaoInferior';

const meses = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' },
];

function formatarNumero(
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return '—';
  }

  return Number(
    valor
  ).toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  );
}

function Indicador({
  titulo,
  valor,
}: {
  titulo: string;
  valor: unknown;
}) {
  return (
    <div
      style={{
        padding: '11px',
        borderRadius: '11px',
        background: '#0c1811',
        border: '1px solid #284334',
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: '12px',
          lineHeight: 1.3,
        }}
      >
        {titulo}
      </div>

      <strong
        style={{
          display: 'block',
          marginTop: '4px',
          fontSize: '20px',
        }}
      >
        {String(valor)}
      </strong>
    </div>
  );
}

function Dado({
  titulo,
  valor,
  forte = false,
}: {
  titulo: string;
  valor: React.ReactNode;
  forte?: boolean;
}) {
  return (
    <div>
      <div
        className="muted"
        style={{
          marginBottom: '3px',
          fontSize: '12px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: '14px',
          lineHeight: 1.35,
          fontWeight:
            forte ? 800 : 600,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function ApoioQDAAPage() {
  const hoje = new Date();

  const [ano, setAno] =
    useState(
      hoje.getFullYear()
    );

  const [mes, setMes] =
    useState(
      hoje.getMonth() + 1
    );

  const [dados, setDados] =
    useState<any>(null);

  const [erro, setErro] =
    useState('');

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    generoAberto,
    setGeneroAberto,
  ] = useState<string | null>(
    null
  );

  async function carregarQDAA() {
    setErro('');
    setCarregando(true);

    try {
      const resposta =
        await fetch(
          `/api/relatorios/qdaa?ano=${ano}&mes=${mes}`
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Erro ao gerar apoio ao QDAA.'
        );

        return;
      }

      setDados(json);
      setGeneroAberto(null);
    } catch {
      setErro(
        'Não foi possível gerar o apoio ao QDAA.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarQDAA();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nomeMes =
    meses.find(
      (item) =>
        item.valor === mes
    )?.nome || '';

  function alternarGenero(
    generoId: string
  ) {
    setGeneroAberto(
      (atual) =>
        atual === generoId
          ? null
          : generoId
    );
  }

  return (
    <main>
      <header
        style={{
          marginBottom: '16px',
        }}
      >
        <Link
          href="/qdaa"
          className="back"
        >
          ← QDAA
        </Link>

        <div
          style={{
            marginTop: '14px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              lineHeight: 1.2,
            }}
          >
            Apoio ao QDAA
          </h1>

          <p
            className="muted"
            style={{
              margin: '5px 0 0',
              fontSize: '14px',
              lineHeight: 1.4,
            }}
          >
            Consolidação mensal dos gêneros QS.
          </p>
        </div>
      </header>

      <section
        style={{
          padding: '14px',
          borderRadius: '13px',
          border: '1px solid #284334',
          background: '#0c1811',
        }}
      >
        <strong>
          Período do QDAA
        </strong>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: '9px',
            marginTop: '11px',
          }}
        >
          <label>
            Mês

            <select
              value={mes}
              onChange={(e) =>
                setMes(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              {meses.map(
                (item) => (
                  <option
                    key={
                      item.valor
                    }
                    value={
                      item.valor
                    }
                  >
                    {item.nome}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Ano

            <input
              type="number"
              min="2000"
              max="2100"
              value={ano}
              onChange={(e) =>
                setAno(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="btn"
          onClick={
            carregarQDAA
          }
          disabled={
            carregando
          }
          style={{
            marginTop: '11px',
            width: 'auto',
            minWidth: '150px',
          }}
        >
          {carregando
            ? 'Gerando...'
            : 'Gerar QDAA'}
        </button>

        {erro && (
          <div
            className="error"
            style={{
              marginTop: '11px',
            }}
          >
            {erro}
          </div>
        )}
      </section>

      {dados && (
        <>
          <section
            style={{
              marginTop: '14px',
            }}
          >
            <div
              style={{
                marginBottom: '10px',
              }}
            >
              <strong
                style={{
                  fontSize: '16px',
                }}
              >
                {nomeMes}/{ano} — QS
              </strong>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, minmax(0, 1fr))',
                gap: '7px',
              }}
            >
              <Indicador
                titulo="Cadastrados"
                valor={
                  dados
                    .estatisticas
                    .generosCadastrados
                }
              />

              <Indicador
                titulo="Com movimento"
                valor={
                  dados
                    .estatisticas
                    .generosComMovimento
                }
              />

              <Indicador
                titulo="Sem movimento"
                valor={
                  dados
                    .estatisticas
                    .generosSemMovimento
                }
              />
            </div>
          </section>

          <section
            style={{
              marginTop: '17px',
            }}
          >
            <div
              style={{
                marginBottom: '10px',
              }}
            >
              <strong
                style={{
                  fontSize: '16px',
                }}
              >
                Controle mensal por gênero QS
              </strong>

              <p
                className="muted"
                style={{
                  margin: '4px 0 0',
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                Toque em um gênero para consultar os dados.
              </p>
            </div>

            {dados.itens.length ===
            0 ? (
              <div
                style={{
                  padding: '13px',
                  borderRadius: '11px',
                  border: '1px solid #284334',
                  background: '#0c1811',
                }}
              >
                <span className="muted">
                  Nenhum gênero QS cadastrado.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '7px',
                }}
              >
                {dados.itens.map(
                  (item: any) => {
                    const aberto =
                      generoAberto ===
                      item.generoId;

                    return (
                      <article
                        key={
                          item.generoId
                        }
                        style={{
                          borderRadius: '11px',
                          border:
                            '1px solid #284334',
                          background:
                            '#0c1811',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            alternarGenero(
                              item.generoId
                            )
                          }
                          style={{
                            width: '100%',
                            minHeight: '46px',
                            padding:
                              '10px 12px',
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            gap: '10px',
                            border: 0,
                            borderRadius: 0,
                            background:
                              'transparent',
                            color: 'inherit',
                            textAlign:
                              'left',
                            cursor:
                              'pointer',
                            font: 'inherit',
                          }}
                        >
                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >
                            <strong
                              style={{
                                display:
                                  'block',
                                fontSize:
                                  '14px',
                                lineHeight:
                                  1.3,
                              }}
                            >
                              {item.genero}
                            </strong>

                            <span
                              className="muted"
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '2px',
                                fontSize:
                                  '11px',
                              }}
                            >
                              Estoque final:{' '}
                              {formatarNumero(
                                item
                                  .estoqueFinalCalculado
                              )}{' '}
                              {item.unidade}
                            </span>
                          </div>

                          <span
                            aria-hidden="true"
                            style={{
                              flexShrink: 0,
                              fontSize:
                                '18px',
                              transform:
                                aberto
                                  ? 'rotate(90deg)'
                                  : 'none',
                              transition:
                                'transform .15s ease',
                            }}
                          >
                            ›
                          </span>
                        </button>

                        {aberto && (
                          <div
                            style={{
                              padding:
                                '12px',
                              borderTop:
                                '1px solid #284334',
                              background:
                                '#101d15',
                            }}
                          >
                            <div
                              style={{
                                display:
                                  'grid',
                                gridTemplateColumns:
                                  'repeat(2, minmax(0, 1fr))',
                                gap:
                                  '11px 14px',
                              }}
                            >
                              <Dado
                                titulo="Estoque inicial"
                                valor={formatarNumero(
                                  item
                                    .estoqueInicial
                                )}
                              />

                              <Dado
                                titulo="Entradas"
                                valor={formatarNumero(
                                  item
                                    .recebimentos
                                )}
                              />

                              <Dado
                                titulo="Devoluções"
                                valor={formatarNumero(
                                  item
                                    .devolucoes
                                )}
                              />

                              <Dado
                                titulo="Consumo"
                                valor={formatarNumero(
                                  item
                                    .consumo
                                )}
                              />

                              <Dado
                                titulo="Perdas"
                                valor={formatarNumero(
                                  item
                                    .perdas
                                )}
                              />

                              <Dado
                                titulo="Ajustes"
                                valor={formatarNumero(
                                  item
                                    .correcoes
                                )}
                              />
                            </div>

                            <div
                              style={{
                                marginTop:
                                  '11px',
                                paddingTop:
                                  '10px',
                                borderTop:
                                  '1px solid rgba(255,255,255,.07)',
                              }}
                            >
                              <Dado
                                titulo="Estoque final"
                                valor={
                                  <>
                                    {formatarNumero(
                                      item
                                        .estoqueFinalCalculado
                                    )}{' '}
                                    {item.unidade}
                                  </>
                                }
                                forte
                              />
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>
        </>
      )}

      <NavegacaoInferior
        voltarHref="/qdaa"
        voltarTexto="QDAA"
      />
    </main>
  );
}

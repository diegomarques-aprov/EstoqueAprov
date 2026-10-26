'use client';

import {
  useEffect,
  useState,
} from 'react';

const TIME_ZONE =
  'America/Campo_Grande';

function dataLocalISO(
  data: Date
) {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(data);

  const ano =
    partes.find(
      (parte) =>
        parte.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (parte) =>
        parte.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (parte) =>
        parte.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function adicionarDias(
  data: string,
  dias: number
) {
  const base = new Date(
    `${data}T12:00:00.000Z`
  );

  base.setUTCDate(
    base.getUTCDate() + dias
  );

  return base
    .toISOString()
    .slice(0, 10);
}

function formatarNumero(
  valor: unknown,
  casas = 3
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
      maximumFractionDigits:
        casas,
    }
  );
}

function formatarData(
  data: string
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      data
    )
  ) {
    return data;
  }

  const [
    ano,
    mes,
    dia,
  ] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}

type Dados = {
  periodo: {
    inicio: string;
    fim: string;
  };

  resumo: {
    diasAnalisados: number;
    diasCompletos: number;
    diasIncompletos: number;
    registrosRelacionados: number;
    registrosSemEfetivoFechado: number;
  };

  dias: Array<{
    data: string;
    refeicoesPrevistas: number;
    refeicoesFechadas: number;
    totalAtendido: number;
    completo: boolean;

    detalhes: Array<{
      refeicao: string;
      refeicaoNome: string;

      totalAtendido:
        | number
        | null;

      fechada: boolean;
    }>;
  }>;

  registros: Array<{
    saidaId: string;
    numeroSaida: number;
    dataSaque: string;
    dataAlimentacao: string;

    tipo:
      | 'PRINCIPAL'
      | 'COMPLEMENTAR';

    destino: string;
    destinoNome: string;
    generoId: string;
    genero: string;
    grupo: string;
    categoria: string;
    unidade: string;
    quantidadeSaida: number;
    quantidadeDevolvida: number;
    quantidadeLiquida: number;

    totalAtendido:
      | number
      | null;

    consumoPorAtendimento:
      | number
      | null;

    efetivoFechado: boolean;
  }>;

  consumoPorGenero: Array<{
    generoId: string;
    genero: string;
    grupo: string;
    categoria: string;
    unidade: string;
    quantidadeLiquida: number;
    atendimentosRelacionados: number;
    registrosValidos: number;

    consumoMedioPorAtendimento:
      | number
      | null;
  }>;
};

function Dado({
  titulo,
  valor,
  destaque = false,
}: {
  titulo: string;
  valor: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div>
      <div
        className="muted"
        style={{
          fontSize: '11px',
          lineHeight: 1.3,
          marginBottom: '3px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize:
            destaque
              ? '16px'
              : '13px',
          fontWeight:
            destaque
              ? 800
              : 600,
          lineHeight: 1.4,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  alerta = false,
}: {
  titulo: string;
  valor: React.ReactNode;
  alerta?: boolean;
}) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '11px',
        background:
          alerta
            ? 'rgba(245,158,11,.08)'
            : '#0c1811',
        border:
          alerta
            ? '1px solid rgba(245,158,11,.4)'
            : '1px solid #284334',
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: '11px',
          lineHeight: 1.3,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          marginTop: '4px',
          fontSize: '20px',
          fontWeight: 800,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function ConsumoEfetivoClient() {
  const hoje =
    dataLocalISO(
      new Date()
    );

  const [
    inicio,
    setInicio,
  ] = useState(
    adicionarDias(
      hoje,
      -30
    )
  );

  const [
    fim,
    setFim,
  ] = useState(
    hoje
  );

  const [
    dados,
    setDados,
  ] =
    useState<Dados | null>(
      null
    );

  const [
    carregando,
    setCarregando,
  ] =
    useState(false);

  const [
    erro,
    setErro,
  ] =
    useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const params =
        new URLSearchParams({
          inicio,
          fim,
        });

      const resposta =
        await fetch(
          `/api/relatorios/consumo-efetivo?${params.toString()}`,
          {
            cache:
              'no-store',
          }
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          json.error ||
            'Não foi possível gerar a análise.'
        );
      }

      setDados(json);
    } catch (e) {
      setDados(null);

      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível gerar a análise.'
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregar();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <section>
        <div
          style={{
            display: 'flex',
            alignItems:
              'flex-start',
            gap: '10px',
            marginBottom:
              '14px',
          }}
        >
          <span
            style={{
              fontSize: '20px',
            }}
          >
            ◫
          </span>

          <div>
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Período de análise
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '12px',
                lineHeight: 1.4,
              }}
            >
              Selecione as datas que
              deseja comparar.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
          }}
        >
          <label>
            Data inicial

            <input
              type="date"
              value={inicio}
              onChange={(e) =>
                setInicio(
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Data final

            <input
              type="date"
              value={fim}
              onChange={(e) =>
                setFim(
                  e.target.value
                )
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="btn"
          disabled={
            carregando
          }
          onClick={
            carregar
          }
          style={{
            width: '100%',
            marginTop: '14px',
          }}
        >
          {carregando
            ? 'Analisando...'
            : 'Atualizar análise'}
        </button>

        {erro && (
          <div
            className="error"
            style={{
              marginTop:
                '12px',
            }}
          >
            {erro}
          </div>
        )}
      </section>

      {dados && (
        <>
          <section
            className="card"
            style={{
              marginTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'flex-start',
                gap: '10px',
                marginBottom:
                  '13px',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Resumo
                </h2>

                <div
                  className="muted"
                  style={{
                    marginTop:
                      '3px',
                    fontSize:
                      '11px',
                  }}
                >
                  {formatarData(
                    dados.periodo
                      .inicio
                  )}{' '}
                  a{' '}
                  {formatarData(
                    dados.periodo
                      .fim
                  )}
                </div>
              </div>

              <span
                style={{
                  padding:
                    '5px 8px',
                  borderRadius:
                    '999px',
                  background:
                    '#183d2a',
                  border:
                    '1px solid #284334',
                  fontSize:
                    '11px',
                  fontWeight:
                    700,
                }}
              >
                {
                  dados.resumo
                    .diasAnalisados
                }{' '}
                dia(s)
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              <Indicador
                titulo="Dias completos"
                valor={
                  dados.resumo
                    .diasCompletos
                }
              />

              <Indicador
                titulo="Dias incompletos"
                valor={
                  dados.resumo
                    .diasIncompletos
                }
                alerta={
                  dados.resumo
                    .diasIncompletos >
                  0
                }
              />

              <Indicador
                titulo="Registros relacionados"
                valor={
                  dados.resumo
                    .registrosRelacionados
                }
              />

              <Indicador
                titulo="Sem efetivo fechado"
                valor={
                  dados.resumo
                    .registrosSemEfetivoFechado
                }
                alerta={
                  dados.resumo
                    .registrosSemEfetivoFechado >
                  0
                }
              />
            </div>

            {dados.resumo
              .registrosSemEfetivoFechado >
              0 && (
              <div
                style={{
                  marginTop:
                    '11px',
                  padding:
                    '12px',
                  borderRadius:
                    '11px',
                  border:
                    '1px solid rgba(245,158,11,.55)',
                  background:
                    'rgba(245,158,11,.08)',
                }}
              >
                <strong
                  style={{
                    display:
                      'block',
                    fontSize:
                      '13px',
                  }}
                >
                  ⚠ Dados ainda não
                  fechados
                </strong>

                <p
                  className="muted"
                  style={{
                    margin:
                      '5px 0 0',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.45,
                  }}
                >
                  {
                    dados.resumo
                      .registrosSemEfetivoFechado
                  }{' '}
                  registro(s) de
                  consumo ainda não
                  possuem efetivo
                  fechado suficiente
                  para cálculo por
                  atendimento.
                </p>
              </div>
            )}
          </section>

          <section className="card">
            <h2>
              Fechamento diário
            </h2>

            <p
              className="muted"
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              Para o saque principal
              do Serviço do dia
              seguinte, o sistema
              utiliza a soma dos
              atendimentos das
              refeições cadastradas e
              fechadas do dia
              relacionado.
            </p>

            {dados.dias.length ===
            0 ? (
              <div
                style={{
                  padding: '13px',
                  borderRadius:
                    '11px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <span className="muted">
                  Nenhum dia
                  encontrado no
                  período.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '8px',
                }}
              >
                {dados.dias.map(
                  (dia) => {
                    const semRegistro =
                      dia.refeicoesPrevistas ===
                      0;

                    return (
                      <article
                        key={
                          dia.data
                        }
                        style={{
                          padding:
                            '12px',
                          borderRadius:
                            '12px',
                          background:
                            '#0c1811',
                          border:
                            semRegistro
                              ? '1px solid #284334'
                              : dia.completo
                                ? '1px solid rgba(43,138,87,.55)'
                                : '1px solid rgba(245,158,11,.55)',
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            alignItems:
                              'flex-start',
                            gap:
                              '10px',
                            marginBottom:
                              '10px',
                          }}
                        >
                          <strong>
                            {formatarData(
                              dia.data
                            )}
                          </strong>

                          <span
                            style={{
                              fontSize:
                                '11px',
                              fontWeight:
                                700,
                              textAlign:
                                'right',
                            }}
                          >
                            {semRegistro
                              ? '— Sem registro'
                              : dia.completo
                                ? '✓ Completo'
                                : '⚠ Incompleto'}
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap:
                              '10px',
                          }}
                        >
                          <Dado
                            titulo="Refeições fechadas"
                            valor={
                              semRegistro
                                ? '—'
                                : `${dia.refeicoesFechadas}/${dia.refeicoesPrevistas}`
                            }
                          />

                          <Dado
                            titulo="Total de atendimentos"
                            valor={
                              semRegistro
                                ? '—'
                                : formatarNumero(
                                    dia.totalAtendido,
                                    0
                                  )
                            }
                            destaque
                          />
                        </div>

                        {!semRegistro &&
                          dia.detalhes &&
                          dia.detalhes
                            .length >
                            0 && (
                            <div
                              style={{
                                marginTop:
                                  '10px',
                                paddingTop:
                                  '9px',
                                borderTop:
                                  '1px solid rgba(255,255,255,.07)',
                                display:
                                  'grid',
                                gap:
                                  '6px',
                              }}
                            >
                              {dia.detalhes.map(
                                (
                                  detalhe
                                ) => (
                                  <div
                                    key={
                                      detalhe.refeicao
                                    }
                                    style={{
                                      display:
                                        'flex',
                                      justifyContent:
                                        'space-between',
                                      gap:
                                        '10px',
                                      fontSize:
                                        '11px',
                                    }}
                                  >
                                    <span
                                      className="muted"
                                    >
                                      {
                                        detalhe.refeicaoNome
                                      }
                                    </span>

                                    <strong>
                                      {detalhe.fechada
                                        ? `${formatarNumero(
                                            detalhe.totalAtendido,
                                            0
                                          )} atend.`
                                        : 'Pendente'}
                                    </strong>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </section>

          <section className="card">
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                gap: '10px',
                marginBottom:
                  '8px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                Consumo por gênero
              </h2>

              <span
                className="muted"
                style={{
                  fontSize:
                    '11px',
                }}
              >
                {
                  dados
                    .consumoPorGenero
                    .length
                }{' '}
                gênero(s)
              </span>
            </div>

            <p
              className="muted"
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              A média considera
              somente registros que
              possuem efetivo real
              fechado. As devoluções
              são abatidas antes do
              cálculo.
            </p>

            {dados
              .consumoPorGenero
              .length === 0 ? (
              <div
                style={{
                  padding: '13px',
                  borderRadius:
                    '11px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <span className="muted">
                  Ainda não existem
                  registros suficientes
                  para calcular consumo
                  por atendimento neste
                  período.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '9px',
                }}
              >
                {dados
                  .consumoPorGenero
                  .map(
                    (item) => (
                      <article
                        key={
                          item.generoId
                        }
                        style={{
                          padding:
                            '13px',
                          borderRadius:
                            '12px',
                          background:
                            '#0c1811',
                          border:
                            '1px solid #284334',
                        }}
                      >
                        <div
                          style={{
                            paddingBottom:
                              '9px',
                            marginBottom:
                              '9px',
                            borderBottom:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                '14px',
                            }}
                          >
                            {
                              item.genero
                            }
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '3px',
                              fontSize:
                                '11px',
                            }}
                          >
                            {item.grupo ||
                              'Sem grupo'}
                            {' · '}
                            {item.categoria ||
                              'Sem categoria'}
                          </div>
                        </div>

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
                            titulo="Consumo líquido"
                            valor={`${formatarNumero(
                              item.quantidadeLiquida
                            )} ${
                              item.unidade
                            }`}
                          />

                          <Dado
                            titulo="Atendimentos"
                            valor={formatarNumero(
                              item.atendimentosRelacionados,
                              0
                            )}
                          />

                          <Dado
                            titulo="Registros válidos"
                            valor={formatarNumero(
                              item.registrosValidos,
                              0
                            )}
                          />

                          <Dado
                            titulo="Média por atendimento"
                            valor={
                              item.consumoMedioPorAtendimento ==
                              null
                                ? '—'
                                : `${formatarNumero(
                                    item.consumoMedioPorAtendimento,
                                    6
                                  )} ${item.unidade}`
                            }
                            destaque
                          />
                        </div>
                      </article>
                    )
                  )}
              </div>
            )}
          </section>

          <section className="card">
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                gap: '10px',
                marginBottom:
                  '8px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                Saques relacionados
              </h2>

              <span
                className="muted"
                style={{
                  fontSize:
                    '11px',
                }}
              >
                {
                  dados.registros
                    .length
                }{' '}
                registro(s)
              </span>
            </div>

            <p
              className="muted"
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
              }}
            >
              <strong>
                Principal
              </strong>{' '}
              = Serviço do dia
              seguinte.{' '}
              <strong>
                Complementar
              </strong>{' '}
              = saque específico
              realizado para uma
              refeição.
            </p>

            {dados.registros
              .length === 0 ? (
              <div
                style={{
                  padding: '13px',
                  borderRadius:
                    '11px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <span className="muted">
                  Nenhum saque QS
                  relacionado ao
                  efetivo foi
                  encontrado no
                  período.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '10px',
                }}
              >
                {dados.registros.map(
                  (
                    item,
                    indice
                  ) => (
                    <article
                      key={`${item.saidaId}-${item.generoId}-${indice}`}
                      style={{
                        padding:
                          '13px',
                        borderRadius:
                          '12px',
                        background:
                          '#0c1811',
                        border:
                          item.efetivoFechado
                            ? '1px solid #284334'
                            : '1px solid rgba(245,158,11,.55)',
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'flex-start',
                          gap:
                            '10px',
                          paddingBottom:
                            '9px',
                          marginBottom:
                            '9px',
                          borderBottom:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize:
                                '14px',
                            }}
                          >
                            {
                              item.genero
                            }
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '3px',
                              fontSize:
                                '11px',
                            }}
                          >
                            {item.grupo ||
                              'Sem grupo'}
                            {' · '}
                            {item.categoria ||
                              'Sem categoria'}
                          </div>
                        </div>

                        <span
                          style={{
                            flexShrink:
                              0,
                            padding:
                              '4px 7px',
                            borderRadius:
                              '999px',
                            background:
                              item.tipo ===
                              'PRINCIPAL'
                                ? '#183d2a'
                                : '#102018',
                            border:
                              '1px solid #284334',
                            fontSize:
                              '10px',
                            fontWeight:
                              800,
                          }}
                        >
                          {item.tipo ===
                          'PRINCIPAL'
                            ? 'PRINCIPAL'
                            : 'COMPLEMENTAR'}
                        </span>
                      </div>

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
                          titulo="Alimentação"
                          valor={formatarData(
                            item.dataAlimentacao
                          )}
                        />

                        <Dado
                          titulo="Data do saque"
                          valor={formatarData(
                            item.dataSaque
                          )}
                        />

                        <Dado
                          titulo="Saída"
                          valor={`Nº ${item.numeroSaida}`}
                        />

                        <Dado
                          titulo="Finalidade"
                          valor={
                            item.destinoNome
                          }
                        />

                        <Dado
                          titulo="Quantidade retirada"
                          valor={`${formatarNumero(
                            item.quantidadeSaida
                          )} ${
                            item.unidade
                          }`}
                        />

                        <Dado
                          titulo="Devolução"
                          valor={`${formatarNumero(
                            item.quantidadeDevolvida
                          )} ${
                            item.unidade
                          }`}
                        />
                      </div>

                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            'repeat(2, minmax(0, 1fr))',
                          gap:
                            '10px',
                          marginTop:
                            '11px',
                          padding:
                            '11px',
                          borderRadius:
                            '10px',
                          background:
                            '#102018',
                          border:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <Dado
                          titulo="Consumo líquido"
                          valor={`${formatarNumero(
                            item.quantidadeLiquida
                          )} ${
                            item.unidade
                          }`}
                          destaque
                        />

                        <Dado
                          titulo="Atendidos"
                          valor={
                            item.totalAtendido ==
                            null
                              ? '—'
                              : formatarNumero(
                                  item.totalAtendido,
                                  0
                                )
                          }
                          destaque
                        />
                      </div>

                      <div
                        style={{
                          marginTop:
                            '9px',
                          padding:
                            '11px',
                          borderRadius:
                            '10px',
                          background:
                            item.consumoPorAtendimento ==
                            null
                              ? 'rgba(245,158,11,.07)'
                              : 'rgba(43,138,87,.08)',
                          border:
                            item.consumoPorAtendimento ==
                            null
                              ? '1px solid rgba(245,158,11,.4)'
                              : '1px solid rgba(43,138,87,.45)',
                        }}
                      >
                        <Dado
                          titulo="Consumo por atendimento"
                          valor={
                            item.consumoPorAtendimento ==
                            null
                              ? 'Aguardando fechamento do efetivo'
                              : `${formatarNumero(
                                  item.consumoPorAtendimento,
                                  6
                                )} ${item.unidade}`
                          }
                          destaque
                        />
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

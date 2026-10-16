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
      <div className="card">
        <h2>
          Período de análise
        </h2>

        <div className="grid">
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

        <div
          className="actions"
          style={{
            marginTop: 14,
          }}
        >
          <button
            type="button"
            className="btn"
            disabled={
              carregando
            }
            onClick={
              carregar
            }
          >
            {carregando
              ? 'Analisando...'
              : 'Atualizar análise'}
          </button>
        </div>

        {erro && (
          <div className="error">
            {erro}
          </div>
        )}
      </div>

      {dados && (
        <>
          <div className="card">
            <h2>
              Resumo
            </h2>

            <div className="grid">
              <div>
                <strong>
                  Dias analisados
                </strong>

                <div>
                  {
                    dados
                      .resumo
                      .diasAnalisados
                  }
                </div>
              </div>

              <div>
                <strong>
                  Dias completos
                </strong>

                <div>
                  {
                    dados
                      .resumo
                      .diasCompletos
                  }
                </div>
              </div>

              <div>
                <strong>
                  Dias incompletos
                </strong>

                <div>
                  {
                    dados
                      .resumo
                      .diasIncompletos
                  }
                </div>
              </div>

              <div>
                <strong>
                  Registros relacionados
                </strong>

                <div>
                  {
                    dados
                      .resumo
                      .registrosRelacionados
                  }
                </div>
              </div>
            </div>

            {dados.resumo
              .registrosSemEfetivoFechado >
              0 && (
              <div
                className="card"
                style={{
                  marginTop: 16,
                  border:
                    '1px solid #facc15',
                }}
              >
                <strong>
                  ⚠ Dados ainda não
                  fechados
                </strong>

                <p>
                  {
                    dados
                      .resumo
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
          </div>

          <div className="card">
            <h2>
              Fechamento diário
            </h2>

            <p className="muted">
              Para o saque principal
              do Serviço do dia
              seguinte, o sistema
              utiliza a soma dos
              atendimentos das
              refeições fechadas do
              dia relacionado.
            </p>

            <div
              style={{
                overflowX:
                  'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                  minWidth: 720,
                }}
              >
                <thead>
                  <tr>
                    <th>
                      Data
                    </th>

                    <th>
                      Refeições
                      fechadas
                    </th>

                    <th>
                      Total de
                      atendimentos
                    </th>

                    <th>
                      Situação
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {dados.dias.map(
                    (dia) => (
                      <tr
                        key={
                          dia.data
                        }
                        style={{
                          borderTop:
                            '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        <td
                          style={{
                            padding:
                              10,
                          }}
                        >
                          {formatarData(
                            dia.data
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              10,
                          }}
                        >
                          {
                            dia.refeicoesFechadas
                          }
                          /4
                        </td>

                        <td
                          style={{
                            padding:
                              10,
                            textAlign:
                              'right',
                          }}
                        >
                          {formatarNumero(
                            dia.totalAtendido,
                            0
                          )}
                        </td>

                        <td
                          style={{
                            padding:
                              10,
                          }}
                        >
                          {dia.completo
                            ? '✓ Completo'
                            : '⚠ Incompleto'}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2>
              Consumo por gênero
            </h2>

            <p className="muted">
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
              <p className="muted">
                Ainda não existem
                registros suficientes
                para calcular consumo
                por atendimento neste
                período.
              </p>
            ) : (
              <div
                style={{
                  overflowX:
                    'auto',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse:
                      'collapse',
                    minWidth: 950,
                  }}
                >
                  <thead>
                    <tr>
                      <th>
                        Gênero
                      </th>

                      <th>
                        Grupo
                      </th>

                      <th>
                        Categoria
                      </th>

                      <th>
                        Consumo líquido
                      </th>

                      <th>
                        Atendimentos
                      </th>

                      <th>
                        Média por
                        atendimento
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dados
                      .consumoPorGenero
                      .map(
                        (item) => (
                          <tr
                            key={
                              item.generoId
                            }
                            style={{
                              borderTop:
                                '1px solid rgba(255,255,255,0.12)',
                            }}
                          >
                            <td
                              style={{
                                padding:
                                  10,
                              }}
                            >
                              <strong>
                                {
                                  item.genero
                                }
                              </strong>
                            </td>

                            <td
                              style={{
                                padding:
                                  10,
                              }}
                            >
                              {
                                item.grupo
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  10,
                              }}
                            >
                              {
                                item.categoria
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  10,
                                textAlign:
                                  'right',
                              }}
                            >
                              {formatarNumero(
                                item.quantidadeLiquida
                              )}{' '}
                              {
                                item.unidade
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  10,
                                textAlign:
                                  'right',
                              }}
                            >
                              {formatarNumero(
                                item.atendimentosRelacionados,
                                0
                              )}
                            </td>

                            <td
                              style={{
                                padding:
                                  10,
                                textAlign:
                                  'right',
                              }}
                            >
                              <strong>
                                {formatarNumero(
                                  item.consumoMedioPorAtendimento,
                                  6
                                )}{' '}
                                {
                                  item.unidade
                                }
                              </strong>
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h2>
              Saques relacionados
            </h2>

            <p className="muted">
              Principal = Serviço do
              dia seguinte.
              Complementar = saque
              específico realizado
              para uma refeição.
            </p>

            {dados.registros
              .length === 0 ? (
              <p className="muted">
                Nenhum saque QS
                relacionado ao
                efetivo foi
                encontrado no
                período.
              </p>
            ) : (
              <div
                style={{
                  overflowX:
                    'auto',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse:
                      'collapse',
                    minWidth: 1250,
                  }}
                >
                  <thead>
                    <tr>
                      <th>
                        Alimentação
                      </th>

                      <th>
                        Saque
                      </th>

                      <th>
                        Tipo
                      </th>

                      <th>
                        Finalidade
                      </th>

                      <th>
                        Gênero
                      </th>

                      <th>
                        Saída
                      </th>

                      <th>
                        Devolução
                      </th>

                      <th>
                        Líquido
                      </th>

                      <th>
                        Atendidos
                      </th>

                      <th>
                        Consumo /
                        atendimento
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dados.registros.map(
                      (
                        item,
                        indice
                      ) => (
                        <tr
                          key={`${item.saidaId}-${item.generoId}-${indice}`}
                          style={{
                            borderTop:
                              '1px solid rgba(255,255,255,0.12)',
                          }}
                        >
                          <td
                            style={{
                              padding:
                                10,
                            }}
                          >
                            {formatarData(
                              item.dataAlimentacao
                            )}
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                            }}
                          >
                            {formatarData(
                              item.dataSaque
                            )}

                            <div className="muted">
                              Saída nº{' '}
                              {
                                item.numeroSaida
                              }
                            </div>
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                            }}
                          >
                            {item.tipo ===
                            'PRINCIPAL'
                              ? 'Principal'
                              : 'Complementar'}
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                            }}
                          >
                            {
                              item.destinoNome
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                            }}
                          >
                            <strong>
                              {
                                item.genero
                              }
                            </strong>
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.quantidadeSaida
                            )}{' '}
                            {
                              item.unidade
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.quantidadeDevolvida
                            )}{' '}
                            {
                              item.unidade
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                              textAlign:
                                'right',
                            }}
                          >
                            <strong>
                              {formatarNumero(
                                item.quantidadeLiquida
                              )}{' '}
                              {
                                item.unidade
                              }
                            </strong>
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                              textAlign:
                                'right',
                            }}
                          >
                            {item.totalAtendido ==
                            null
                              ? '—'
                              : formatarNumero(
                                  item.totalAtendido,
                                  0
                                )}
                          </td>

                          <td
                            style={{
                              padding:
                                10,
                              textAlign:
                                'right',
                            }}
                          >
                            {item.consumoPorAtendimento ==
                            null
                              ? '—'
                              : `${formatarNumero(
                                  item.consumoPorAtendimento,
                                  6
                                )} ${item.unidade}`}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

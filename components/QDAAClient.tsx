'use client';

import { useEffect, useState } from 'react';

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

function formatarNumero(valor: unknown) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export default function QDAAClient() {
  const hoje = new Date();

  const [ano, setAno] = useState(
    hoje.getFullYear()
  );

  const [mes, setMes] = useState(
    hoje.getMonth() + 1
  );

  const [dados, setDados] =
    useState<any>(null);

  const [erro, setErro] =
    useState('');

  const [carregando, setCarregando] =
    useState(false);

  async function carregar() {
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
        `/api/relatorios/qdaa?ano=${ano}&mes=${mes}`
      );

      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Erro ao gerar apoio ao QDAA.'
        );
        return;
      }

      setDados(json);
    } catch {
      setErro(
        'Não foi possível gerar o apoio ao QDAA.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nomeMes =
    meses.find(
      (item) => item.valor === mes
    )?.nome || '';

  return (
    <>
      <div className="card">
        <h2>Apoio ao QDAA</h2>

        <p className="muted">
          Consolidação mensal dos gêneros
          classificados como QS e recebidos pela
          cadeia de suprimento.
        </p>

        <div className="grid">
          <label>
            Mês

            <select
              value={mes}
              onChange={(e) =>
                setMes(
                  Number(e.target.value)
                )
              }
            >
              {meses.map((item) => (
                <option
                  key={item.valor}
                  value={item.valor}
                >
                  {item.nome}
                </option>
              ))}
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
                  Number(e.target.value)
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
            className="btn"
            onClick={carregar}
            disabled={carregando}
          >
            {carregando
              ? 'Gerando...'
              : 'Gerar apoio ao QDAA'}
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
              {nomeMes}/{ano} — QS
            </h2>

            <div className="grid">
              <div>
                <span className="muted">
                  Gêneros QS cadastrados
                </span>

                <div className="big">
                  {
                    dados.estatisticas
                      .generosCadastrados
                  }
                </div>
              </div>

              <div>
                <span className="muted">
                  Com movimentação
                </span>

                <div className="big">
                  {
                    dados.estatisticas
                      .generosComMovimento
                  }
                </div>
              </div>

              <div>
                <span className="muted">
                  Sem movimentação
                </span>

                <div className="big">
                  {
                    dados.estatisticas
                      .generosSemMovimento
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              Controle mensal por gênero QS
            </h2>

            <p className="muted">
              Estoque inicial + entradas +
              devoluções − consumo − perdas ±
              correções = estoque final.
            </p>

            {dados.itens.length === 0 ? (
              <p className="muted">
                Nenhum gênero QS cadastrado.
              </p>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  marginTop: 16,
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse:
                      'collapse',
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: 10,
                        }}
                      >
                        Gênero
                      </th>

                      <th
                        style={{
                          textAlign: 'left',
                          padding: 10,
                        }}
                      >
                        Unid.
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Estoque inicial
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Entradas
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Devoluções
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Consumo
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Perdas
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Ajustes
                      </th>

                      <th
                        style={{
                          textAlign: 'right',
                          padding: 10,
                        }}
                      >
                        Estoque final
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dados.itens.map(
                      (item: any) => (
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
                              padding: 10,
                            }}
                          >
                            <strong>
                              {item.genero}
                            </strong>
                          </td>

                          <td
                            style={{
                              padding: 10,
                            }}
                          >
                            {item.unidade}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.estoqueInicial
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.recebimentos
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.devolucoes
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            <strong>
                              {formatarNumero(
                                item.consumo
                              )}
                            </strong>
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.perdas
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            {formatarNumero(
                              item.correcoes
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              textAlign:
                                'right',
                            }}
                          >
                            <strong>
                              {formatarNumero(
                                item.estoqueFinalCalculado
                              )}
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
              Totais por unidade de medida
            </h2>

            <p className="muted">
              Os totais são separados para não
              somar kg, litros e unidades entre
              si.
            </p>

            {dados.totaisPorUnidade.map(
              (item: any) => (
                <div
                  className="card"
                  key={item.unidade}
                >
                  <h3>
                    Unidade: {item.unidade}
                  </h3>

                  <div className="grid">
                    <div>
                      <span className="muted">
                        Estoque inicial
                      </span>

                      <div className="big">
                        {formatarNumero(
                          item.estoqueInicial
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="muted">
                        Entradas
                      </span>

                      <div className="big">
                        {formatarNumero(
                          item.recebimentos
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="muted">
                        Consumo
                      </span>

                      <div className="big">
                        {formatarNumero(
                          item.consumo
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="muted">
                        Estoque final
                      </span>

                      <div className="big">
                        {formatarNumero(
                          item.estoqueFinalCalculado
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="card">
            <h2>
              Ressuprimento QS
            </h2>

            <p>
              O QDAA é mensal. O histórico de
              consumo QS será utilizado pelo
              EstoqueAprov para auxiliar o
              planejamento do ressuprimento
              bimestral realizado na segunda
              quinzena.
            </p>

            <p className="muted">
              Nesta etapa o sistema apresenta os
              dados consolidados. A sugestão de
              quantitativos para o próximo
              ressuprimento será acrescentada na
              próxima evolução do módulo.
            </p>
          </div>
        </>
      )}
    </>
  );
}

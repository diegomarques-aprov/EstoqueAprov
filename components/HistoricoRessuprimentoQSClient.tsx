'use client';

import { useEffect, useState } from 'react';

function formatarNumero(valor: unknown) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return '—';
  }

  return Number(valor).toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  );
}

function formatarData(valor: string | null) {
  if (!valor) {
    return '—';
  }

  return new Date(valor).toLocaleDateString(
    'pt-BR'
  );
}

function formatarDataHora(
  valor: string | null
) {
  if (!valor) {
    return '—';
  }

  return new Date(valor).toLocaleString(
    'pt-BR'
  );
}

function origemTexto(origem: string) {
  if (
    origem ===
    'HISTORICO_ESTOQUEAPROV'
  ) {
    return 'Histórico do EstoqueAprov';
  }

  if (
    origem ===
    'REFERENCIA_INICIAL'
  ) {
    return 'Referência inicial';
  }

  return origem || '—';
}

export default function HistoricoRessuprimentoQSClient() {
  const [
    planejamentos,
    setPlanejamentos,
  ] = useState<any[]>([]);

  const [
    selecionado,
    setSelecionado,
  ] = useState<any>(null);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    carregandoDetalhe,
    setCarregandoDetalhe,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState('');

  async function carregarHistorico() {
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
        '/api/relatorios/planejamento-ressuprimento-qs'
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Não foi possível consultar o histórico.'
        );

        return;
      }

      setPlanejamentos(
        Array.isArray(json)
          ? json
          : []
      );
    } catch {
      setErro(
        'Não foi possível consultar o histórico de Ressuprimento QS.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function abrirPlanejamento(
    id: string
  ) {
    setErro('');
    setCarregandoDetalhe(true);

    try {
      const resposta = await fetch(
        `/api/relatorios/planejamento-ressuprimento-qs?id=${encodeURIComponent(
          id
        )}`
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Não foi possível abrir o planejamento.'
        );

        return;
      }

      setSelecionado(json);
    } catch {
      setErro(
        'Não foi possível abrir o planejamento.'
      );
    } finally {
      setCarregandoDetalhe(false);
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  if (selecionado) {
    return (
      <>
        <div className="card">
          <div className="actions">
            <button
              type="button"
              className="btn"
              onClick={() =>
                setSelecionado(null)
              }
            >
              ← Voltar ao histórico
            </button>
          </div>

          <h2
            style={{
              marginTop: 18,
            }}
          >
            Planejamento de Ressuprimento QS
          </h2>

          <div className="grid">
            <div>
              <span className="muted">
                Data de referência
              </span>

              <div className="big">
                {formatarData(
                  selecionado.dataReferencia
                )}
              </div>
            </div>

            <div>
              <span className="muted">
                Situação
              </span>

              <div className="big">
                {selecionado.status ===
                'FINALIZADO'
                  ? 'Finalizado'
                  : 'Rascunho'}
              </div>
            </div>

            <div>
              <span className="muted">
                Gêneros
              </span>

              <div className="big">
                {
                  selecionado.itens
                    ?.length
                }
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>
            Parâmetros utilizados
          </h2>

          <div className="grid">
            <div>
              <span className="muted">
                Histórico considerado
              </span>

              <p>
                <strong>
                  {
                    selecionado.mesesHistorico
                  }{' '}
                  mês(es)
                </strong>
              </p>
            </div>

            <div>
              <span className="muted">
                Ciclo planejado
              </span>

              <p>
                <strong>
                  {
                    selecionado.mesesCiclo
                  }{' '}
                  mês(es)
                </strong>
              </p>
            </div>

            <div>
              <span className="muted">
                Margem de segurança
              </span>

              <p>
                <strong>
                  {formatarNumero(
                    selecionado.margemSegurancaPercent
                  )}
                  %
                </strong>
              </p>
            </div>
          </div>

          {selecionado.observacao && (
            <>
              <h3>
                Observação geral
              </h3>

              <p>
                {
                  selecionado.observacao
                }
              </p>
            </>
          )}
        </div>

        <div className="card">
          <h2>
            Memória do cálculo
          </h2>

          <p className="muted">
            Os valores abaixo representam a
            situação utilizada no momento em
            que este planejamento foi salvo.
          </p>

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
                minWidth: 1450,
              }}
            >
              <thead>
                <tr>
                  {[
                    'Gênero',
                    'Unid.',
                    'Base',
                    'Média/mês',
                    'Projeção',
                    'Segurança',
                    'Estoque',
                    'Prev. receber',
                    'Sugerido',
                    'Planejado',
                    'Justificativa',
                  ].map(
                    (titulo) => (
                      <th
                        key={titulo}
                        style={{
                          padding: 10,

                          textAlign:
                            [
                              'Gênero',
                              'Unid.',
                              'Base',
                              'Justificativa',
                            ].includes(
                              titulo
                            )
                              ? 'left'
                              : 'right',
                        }}
                      >
                        {titulo}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {selecionado.itens?.map(
                  (item: any) => {
                    const alterado =
                      Math.abs(
                        Number(
                          item.quantidadePlanejada
                        ) -
                          Number(
                            item.quantidadeSugerida
                          )
                      ) > 0.0005;

                    return (
                      <tr
                        key={item.id}
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
                          }}
                        >
                          {origemTexto(
                            item.origemMedia
                          )}
                        </td>

                        {[
                          item.mediaMensalUtilizada,
                          item.consumoProjetado,
                          item.estoqueSeguranca,
                          item.estoqueDisponivel,
                          item.previstoReceber,
                          item.quantidadeSugerida,
                          item.quantidadePlanejada,
                        ].map(
                          (
                            valor,
                            index
                          ) => (
                            <td
                              key={index}
                              style={{
                                padding: 10,
                                textAlign:
                                  'right',
                              }}
                            >
                              <strong
                                style={
                                  index ===
                                    6 &&
                                  alterado
                                    ? {
                                        textDecoration:
                                          'underline',
                                      }
                                    : undefined
                                }
                              >
                                {formatarNumero(
                                  valor
                                )}
                              </strong>
                            </td>
                          )
                        )}

                        <td
                          style={{
                            padding: 10,
                          }}
                        >
                          {alterado
                            ? item.justificativaAlteracao ||
                              '—'
                            : 'Quantidade sugerida mantida'}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>
            Registro administrativo
          </h2>

          <div className="grid">
            <div>
              <span className="muted">
                Responsável
              </span>

              <p>
                <strong>
                  {[
                    selecionado
                      .responsavel
                      ?.postoGraduacao,
                    selecionado
                      .responsavel
                      ?.nome,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                </strong>
              </p>

              {selecionado.responsavel
                ?.funcao && (
                <p className="muted">
                  {
                    selecionado
                      .responsavel
                      .funcao
                  }
                </p>
              )}
            </div>

            <div>
              <span className="muted">
                Criado em
              </span>

              <p>
                <strong>
                  {formatarDataHora(
                    selecionado.criadoEm
                  )}
                </strong>
              </p>
            </div>

            <div>
              <span className="muted">
                Finalizado em
              </span>

              <p>
                <strong>
                  {formatarDataHora(
                    selecionado.finalizadoEm
                  )}
                </strong>
              </p>
            </div>
          </div>

          <p className="muted">
            Identificação:{' '}
            {selecionado.id}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <h2>
          Histórico dos Ressuprimentos QS
        </h2>

        <p>
          Consulte os planejamentos salvos e
          finalizados anteriormente.
        </p>

        <p className="muted">
          Os planejamentos finalizados
          permanecem preservados como memória
          administrativa do cálculo realizado.
        </p>

        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={
              carregarHistorico
            }
            disabled={
              carregando
            }
          >
            {carregando
              ? 'Atualizando...'
              : 'Atualizar histórico'}
          </button>
        </div>

        {erro && (
          <div className="error">
            {erro}
          </div>
        )}
      </div>

      {carregando ? (
        <div className="card">
          <p className="muted">
            Carregando histórico...
          </p>
        </div>
      ) : planejamentos.length ===
        0 ? (
        <div className="card">
          <p className="muted">
            Ainda não existem planejamentos
            de Ressuprimento QS registrados.
          </p>
        </div>
      ) : (
        <div className="card">
          <h2>
            Planejamentos registrados
          </h2>

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
                minWidth: 950,
              }}
            >
              <thead>
                <tr>
                  {[
                    'Data',
                    'Situação',
                    'Histórico',
                    'Ciclo',
                    'Margem',
                    'Gêneros',
                    'Responsável',
                    'Finalizado em',
                    'Ação',
                  ].map(
                    (titulo) => (
                      <th
                        key={titulo}
                        style={{
                          padding: 10,
                          textAlign:
                            'left',
                        }}
                      >
                        {titulo}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {planejamentos.map(
                  (item: any) => (
                    <tr
                      key={item.id}
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
                        {formatarData(
                          item.dataReferencia
                        )}
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        <strong>
                          {item.status ===
                          'FINALIZADO'
                            ? '✓ Finalizado'
                            : 'Rascunho'}
                        </strong>
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {
                          item.mesesHistorico
                        }{' '}
                        mês(es)
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {
                          item.mesesCiclo
                        }{' '}
                        mês(es)
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {formatarNumero(
                          item.margemSegurancaPercent
                        )}
                        %
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {
                          item.quantidadeGeneros
                        }
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {[
                          item.responsavel
                            ?.postoGraduacao,
                          item.responsavel
                            ?.nome,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(' ')}
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        {formatarDataHora(
                          item.finalizadoEm
                        )}
                      </td>

                      <td
                        style={{
                          padding: 10,
                        }}
                      >
                        <button
                          type="button"
                          className="btn"
                          disabled={
                            carregandoDetalhe
                          }
                          onClick={() =>
                            abrirPlanejamento(
                              item.id
                            )
                          }
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

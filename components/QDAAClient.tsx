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

  return 'Sem base de cálculo';
}

export default function QDAAClient() {
  const hoje = new Date();

  /*
   * =====================================================
   * QDAA
   * =====================================================
   */

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

  /*
   * =====================================================
   * RESSUPRIMENTO QS
   * =====================================================
   */

  const [
    ressuprimento,
    setRessuprimento,
  ] = useState<any>(null);

  const [
    carregandoRessuprimento,
    setCarregandoRessuprimento,
  ] = useState(false);

  const [
    erroRessuprimento,
    setErroRessuprimento,
  ] = useState('');

  const [
    mesesHistorico,
    setMesesHistorico,
  ] = useState(2);

  const [
    mesesCiclo,
    setMesesCiclo,
  ] = useState(2);

  const [
    margemSeguranca,
    setMargemSeguranca,
  ] = useState(10);

  /*
   * =====================================================
   * REFERÊNCIA INICIAL
   * =====================================================
   */

  const [
    generoReferencia,
    setGeneroReferencia,
  ] = useState<any>(null);

  const [
    tipoReferencia,
    setTipoReferencia,
  ] = useState<
    'MENSAL' | 'BIMESTRAL'
  >('BIMESTRAL');

  const [
    quantidadeReferencia,
    setQuantidadeReferencia,
  ] = useState('');

  const [
    observacaoReferencia,
    setObservacaoReferencia,
  ] = useState('');

  const [
    salvandoReferencia,
    setSalvandoReferencia,
  ] = useState(false);

  const [
    mensagemReferencia,
    setMensagemReferencia,
  ] = useState('');

  const [
    erroReferencia,
    setErroReferencia,
  ] = useState('');

  async function carregarQDAA() {
    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
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
    } catch {
      setErro(
        'Não foi possível gerar o apoio ao QDAA.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRessuprimento() {
    setErroRessuprimento('');
    setCarregandoRessuprimento(true);

    try {
      const params =
        new URLSearchParams({
          historico:
            String(mesesHistorico),

          ciclo:
            String(mesesCiclo),

          margem:
            String(margemSeguranca),
        });

      const resposta = await fetch(
        `/api/relatorios/ressuprimento-qs?${params.toString()}`
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroRessuprimento(
          json.error ||
            'Não foi possível calcular o ressuprimento QS.'
        );

        return;
      }

      setRessuprimento(json);
    } catch {
      setErroRessuprimento(
        'Não foi possível calcular o ressuprimento QS.'
      );
    } finally {
      setCarregandoRessuprimento(false);
    }
  }

  useEffect(() => {
    carregarQDAA();
    carregarRessuprimento();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirReferencia(
    item: any
  ) {
    setGeneroReferencia(item);

    setTipoReferencia(
      item.referenciaInicial?.tipo ||
        'BIMESTRAL'
    );

    setQuantidadeReferencia(
      item.referenciaInicial
        ? String(
            item.referenciaInicial
              .quantidade
          )
        : ''
    );

    setObservacaoReferencia(
      item.referenciaInicial
        ?.observacao || ''
    );

    setMensagemReferencia('');
    setErroReferencia('');
  }

  function fecharReferencia() {
    setGeneroReferencia(null);
    setQuantidadeReferencia('');
    setObservacaoReferencia('');
    setMensagemReferencia('');
    setErroReferencia('');
  }

  async function salvarReferencia() {
    if (!generoReferencia) {
      return;
    }

    const quantidade = Number(
      quantidadeReferencia.replace(
        ',',
        '.'
      )
    );

    if (
      !Number.isFinite(quantidade) ||
      quantidade <= 0
    ) {
      setErroReferencia(
        'Informe uma quantidade maior que zero.'
      );

      return;
    }

    setErroReferencia('');
    setMensagemReferencia('');
    setSalvandoReferencia(true);

    try {
      const resposta = await fetch(
        '/api/relatorios/referencia-consumo-qs',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            generoId:
              generoReferencia.generoId,

            tipo:
              tipoReferencia,

            quantidade,

            observacao:
              observacaoReferencia.trim() ||
              null,
          }),
        }
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroReferencia(
          json.error ||
            'Não foi possível salvar a referência.'
        );

        return;
      }

      setMensagemReferencia(
        json.mensagem ||
          'Referência registrada.'
      );

      /*
       * Recalcula imediatamente o
       * ressuprimento.
       */
      await carregarRessuprimento();

      setTimeout(() => {
        fecharReferencia();
      }, 800);
    } catch {
      setErroReferencia(
        'Não foi possível salvar a referência.'
      );
    } finally {
      setSalvandoReferencia(false);
    }
  }

  const nomeMes =
    meses.find(
      (item) =>
        item.valor === mes
    )?.nome || '';

  return (
    <>
      {/* ======================================
          QDAA
      ====================================== */}

      <div className="card">
        <h2>Apoio ao QDAA</h2>

        <p className="muted">
          Consolidação mensal dos gêneros
          classificados como QS e recebidos
          pela cadeia de suprimento.
        </p>

        <div className="grid">
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

        <div
          className="actions"
          style={{
            marginTop: 14,
          }}
        >
          <button
            className="btn"
            onClick={
              carregarQDAA
            }
            disabled={
              carregando
            }
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
                  Gêneros QS
                  cadastrados
                </span>

                <div className="big">
                  {
                    dados
                      .estatisticas
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
                    dados
                      .estatisticas
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
                    dados
                      .estatisticas
                      .generosSemMovimento
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              Controle mensal por
              gênero QS
            </h2>

            <p className="muted">
              Estoque inicial +
              entradas + devoluções −
              consumo − perdas ±
              correções = estoque
              final.
            </p>

            {dados.itens.length ===
            0 ? (
              <p className="muted">
                Nenhum gênero QS
                cadastrado.
              </p>
            ) : (
              <div
                style={{
                  overflowX:
                    'auto',

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
                      {[
                        'Gênero',
                        'Unid.',
                        'Estoque inicial',
                        'Entradas',
                        'Devoluções',
                        'Consumo',
                        'Perdas',
                        'Ajustes',
                        'Estoque final',
                      ].map(
                        (
                          titulo
                        ) => (
                          <th
                            key={
                              titulo
                            }
                            style={{
                              textAlign:
                                titulo ===
                                  'Gênero' ||
                                titulo ===
                                  'Unid.'
                                  ? 'left'
                                  : 'right',

                              padding: 10,
                            }}
                          >
                            {
                              titulo
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {dados.itens.map(
                      (
                        item: any
                      ) => (
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
                              {
                                item.genero
                              }
                            </strong>
                          </td>

                          <td
                            style={{
                              padding: 10,
                            }}
                          >
                            {
                              item.unidade
                            }
                          </td>

                          {[
                            item.estoqueInicial,
                            item.recebimentos,
                            item.devolucoes,
                            item.consumo,
                            item.perdas,
                            item.correcoes,
                            item.estoqueFinalCalculado,
                          ].map(
                            (
                              valor,
                              index
                            ) => (
                              <td
                                key={
                                  index
                                }
                                style={{
                                  padding: 10,
                                  textAlign:
                                    'right',
                                }}
                              >
                                {formatarNumero(
                                  valor
                                )}
                              </td>
                            )
                          )}
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

      {/* ======================================
          RESSUPRIMENTO QS
      ====================================== */}

      <div className="card">
        <h2>
          Planejamento do Ressuprimento QS
        </h2>

        <p>
          Estimativa dos quantitativos para o
          próximo ciclo de ressuprimento da
          cadeia de suprimento.
        </p>

        <p className="muted">
          O cálculo utiliza o histórico de
          consumo do EstoqueAprov. Quando ainda
          não houver histórico, poderá ser
          informada uma referência inicial
          mensal ou bimestral.
        </p>

        <div className="grid">
          <label>
            Histórico utilizado

            <select
              value={
                mesesHistorico
              }
              onChange={(e) =>
                setMesesHistorico(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={1}>
                1 mês
              </option>

              <option value={2}>
                2 meses
              </option>

              <option value={3}>
                3 meses
              </option>

              <option value={6}>
                6 meses
              </option>
            </select>
          </label>

          <label>
            Próximo ciclo

            <select
              value={
                mesesCiclo
              }
              onChange={(e) =>
                setMesesCiclo(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={1}>
                1 mês
              </option>

              <option value={2}>
                2 meses
              </option>

              <option value={3}>
                3 meses
              </option>
            </select>
          </label>

          <label>
            Margem de segurança (%)

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={
                margemSeguranca
              }
              onChange={(e) =>
                setMargemSeguranca(
                  Number(
                    e.target.value
                  )
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
            onClick={
              carregarRessuprimento
            }
            disabled={
              carregandoRessuprimento
            }
          >
            {carregandoRessuprimento
              ? 'Calculando...'
              : 'Calcular ressuprimento'}
          </button>
        </div>

        {erroRessuprimento && (
          <div className="error">
            {erroRessuprimento}
          </div>
        )}
      </div>

      {ressuprimento && (
        <>
          <div className="card">
            <h2>
              Situação da base de cálculo
            </h2>

            <div className="grid">
              <div>
                <span className="muted">
                  Histórico do sistema
                </span>

                <div className="big">
                  {
                    ressuprimento
                      .estatisticas
                      .usandoHistoricoEstoqueAprov
                  }
                </div>
              </div>

              <div>
                <span className="muted">
                  Referência inicial
                </span>

                <div className="big">
                  {
                    ressuprimento
                      .estatisticas
                      .usandoReferenciaInicial
                  }
                </div>
              </div>

              <div>
                <span className="muted">
                  Sem base de cálculo
                </span>

                <div className="big">
                  {
                    ressuprimento
                      .estatisticas
                      .semBaseCalculo
                  }
                </div>
              </div>
            </div>

            <p className="muted">
              Período histórico:{' '}
              {
                ressuprimento
                  .parametros
                  .inicioHistorico
              }{' '}
              a{' '}
              {
                ressuprimento
                  .parametros
                  .fimHistorico
              }
              .
            </p>
          </div>

          <div className="card">
            <h2>
              Necessidade por gênero QS
            </h2>

            <p className="muted">
              Projeção + segurança − estoque
              disponível − previsto para
              receber.
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
                  minWidth: 1150,
                }}
              >
                <thead>
                  <tr>
                    {[
                      'Gênero',
                      'Unid.',
                      'Origem da média',
                      'Média mensal',
                      'Projeção',
                      'Segurança',
                      'Estoque atual',
                      'Prev. receber',
                      'Sugestão',
                      'Ação',
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
                                'Origem da média',
                                'Ação',
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
                  {ressuprimento.itens.map(
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
                          }}
                        >
                          {origemTexto(
                            item.origemMedia
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
                            item.mediaMensalUtilizada
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
                            item.consumoProjetado
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
                            item.estoqueSeguranca
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
                            item.estoqueDisponivel
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
                            item.previstoReceber
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
                              item.quantidadeSugerida
                            )}
                          </strong>
                        </td>

                        <td
                          style={{
                            padding: 10,
                          }}
                        >
                          <button
                            type="button"
                            className="btn"
                            onClick={() =>
                              abrirReferencia(
                                item
                              )
                            }
                          >
                            {item.possuiReferenciaInicial
                              ? 'Alterar referência'
                              : 'Informar referência'}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ======================================
          REFERÊNCIA INICIAL
      ====================================== */}

      {generoReferencia && (
        <div className="card">
          <h2>
            Referência inicial —{' '}
            {generoReferencia.genero}
          </h2>

          <p>
            Informe o consumo conhecido antes
            da implantação do EstoqueAprov.
          </p>

          <p className="muted">
            Esta referência ficará registrada
            com responsável e data. Quando o
            sistema possuir histórico real de
            consumo, o histórico do
            EstoqueAprov terá prioridade no
            cálculo.
          </p>

          <div className="grid">
            <label>
              Tipo de referência

              <select
                value={
                  tipoReferencia
                }
                onChange={(e) =>
                  setTipoReferencia(
                    e.target.value as
                      | 'MENSAL'
                      | 'BIMESTRAL'
                  )
                }
              >
                <option value="MENSAL">
                  Consumo médio mensal
                </option>

                <option value="BIMESTRAL">
                  Consumo bimestral
                </option>
              </select>
            </label>

            <label>
              Quantidade (
              {
                generoReferencia.unidade
              }
              )

              <input
                type="text"
                inputMode="decimal"
                value={
                  quantidadeReferencia
                }
                onChange={(e) =>
                  setQuantidadeReferencia(
                    e.target.value
                  )
                }
                placeholder="Ex.: 800"
              />
            </label>
          </div>

          {tipoReferencia ===
            'BIMESTRAL' &&
            Number(
              quantidadeReferencia.replace(
                ',',
                '.'
              )
            ) > 0 && (
              <p className="muted">
                Média mensal equivalente:{' '}
                <strong>
                  {formatarNumero(
                    Number(
                      quantidadeReferencia.replace(
                        ',',
                        '.'
                      )
                    ) / 2
                  )}{' '}
                  {
                    generoReferencia.unidade
                  }
                  /mês
                </strong>
              </p>
            )}

          <label>
            Observação

            <textarea
              value={
                observacaoReferencia
              }
              onChange={(e) =>
                setObservacaoReferencia(
                  e.target.value
                )
              }
              placeholder="Ex.: referência baseada no controle anterior da OM."
            />
          </label>

          {erroReferencia && (
            <div className="error">
              {erroReferencia}
            </div>
          )}

          {mensagemReferencia && (
            <div className="success">
              {mensagemReferencia}
            </div>
          )}

          <div
            className="actions"
            style={{
              marginTop: 14,
            }}
          >
            <button
              className="btn"
              type="button"
              onClick={
                salvarReferencia
              }
              disabled={
                salvandoReferencia
              }
            >
              {salvandoReferencia
                ? 'Salvando...'
                : 'Salvar referência'}
            </button>

            <button
              className="btn"
              type="button"
              onClick={
                fecharReferencia
              }
              disabled={
                salvandoReferencia
              }
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

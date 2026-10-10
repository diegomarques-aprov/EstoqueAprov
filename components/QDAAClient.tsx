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

function numeroCampo(valor: string) {
  const convertido = Number(
    valor.replace(',', '.')
  );

  return Number.isFinite(convertido)
    ? convertido
    : null;
}

function diferente(
  a: number,
  b: number
) {
  return Math.abs(a - b) > 0.0005;
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

type DecisaoPlanejamento = {
  quantidade: string;
  justificativa: string;
};

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
   * DECISÃO DO PLANEJAMENTO
   * =====================================================
   */

  const [
    decisoes,
    setDecisoes,
  ] = useState<
    Record<
      string,
      DecisaoPlanejamento
    >
  >({});

  const [
    planejamentoId,
    setPlanejamentoId,
  ] = useState<string | null>(
    null
  );

  const [
    statusPlanejamento,
    setStatusPlanejamento,
  ] = useState<
    'NOVO' | 'RASCUNHO' | 'FINALIZADO'
  >('NOVO');

  const [
    observacaoPlanejamento,
    setObservacaoPlanejamento,
  ] = useState('');

  const [
    salvandoPlanejamento,
    setSalvandoPlanejamento,
  ] = useState(false);

  const [
    erroPlanejamento,
    setErroPlanejamento,
  ] = useState('');

  const [
    mensagemPlanejamento,
    setMensagemPlanejamento,
  ] = useState('');

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

  /*
   * =====================================================
   * QDAA
   * =====================================================
   */

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

  /*
   * =====================================================
   * RESSUPRIMENTO
   * =====================================================
   */

  async function carregarRessuprimento() {
    setErroRessuprimento('');
    setErroPlanejamento('');
    setMensagemPlanejamento('');
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

      /*
       * Novo cálculo = novo planejamento.
       *
       * Cada quantidade planejada começa
       * igual à sugestão do EstoqueAprov.
       */
      const novasDecisoes: Record<
        string,
        DecisaoPlanejamento
      > = {};

      for (const item of json.itens) {
        if (
          item.quantidadeSugerida !==
          null
        ) {
          novasDecisoes[
            item.generoId
          ] = {
            quantidade: String(
              item.quantidadeSugerida
            ),

            justificativa: '',
          };
        }
      }

      setDecisoes(
        novasDecisoes
      );

      setPlanejamentoId(null);
      setStatusPlanejamento('NOVO');
      setObservacaoPlanejamento('');
    } catch {
      setErroRessuprimento(
        'Não foi possível calcular o ressuprimento QS.'
      );
    } finally {
      setCarregandoRessuprimento(false);
    }
  }

  /*
   * =====================================================
   * REFERÊNCIA INICIAL
   * =====================================================
   */

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

    const quantidade =
      numeroCampo(
        quantidadeReferencia
      );

    if (
      quantidade === null ||
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

  /*
   * =====================================================
   * EDIÇÃO DA QUANTIDADE PLANEJADA
   * =====================================================
   */

  function alterarQuantidade(
    generoId: string,
    valor: string
  ) {
    setDecisoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          quantidade: valor,

          justificativa:
            atual[generoId]
              ?.justificativa || '',
        },
      })
    );

    setMensagemPlanejamento('');
    setErroPlanejamento('');
  }

  function alterarJustificativa(
    generoId: string,
    valor: string
  ) {
    setDecisoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          quantidade:
            atual[generoId]
              ?.quantidade || '',

          justificativa: valor,
        },
      })
    );

    setMensagemPlanejamento('');
    setErroPlanejamento('');
  }

  /*
   * =====================================================
   * SALVAR / FINALIZAR
   * =====================================================
   */

  async function salvarPlanejamento(
    finalizar: boolean
  ) {
    if (!ressuprimento) {
      return;
    }

    const itensCalculados =
      ressuprimento.itens.filter(
        (item: any) =>
          item.quantidadeSugerida !==
            null &&
          item.mediaMensalUtilizada !==
            null &&
          item.consumoProjetado !==
            null &&
          item.estoqueSeguranca !==
            null
      );

    if (
      itensCalculados.length === 0
    ) {
      setErroPlanejamento(
        'Para salvar o planejamento, informe primeiro a referência de consumo dos gêneros QS sem base de cálculo.'
      );

      return;
    }

    /*
     * Para FINALIZAR, nenhum gênero QS pode
     * permanecer sem base de cálculo.
     */
    if (
      finalizar &&
      ressuprimento.itens.some(
        (item: any) =>
          item.quantidadeSugerida ===
          null
      )
    ) {
      setErroPlanejamento(
        'Para finalizar o planejamento, ainda existem gêneros QS sem histórico ou referência inicial de consumo.'
      );

      return;
    }

    const itens: any[] = [];

    for (
      const item of itensCalculados
    ) {
      const decisao =
        decisoes[item.generoId];

      const quantidadePlanejada =
        numeroCampo(
          decisao?.quantidade || ''
        );

      if (
        quantidadePlanejada ===
          null ||
        quantidadePlanejada < 0
      ) {
        setErroPlanejamento(
          `Informe uma quantidade planejada válida para ${item.genero}.`
        );

        return;
      }

      const alterado =
        diferente(
          quantidadePlanejada,
          Number(
            item.quantidadeSugerida
          )
        );

      const justificativa =
        decisao?.justificativa
          ?.trim() || '';

      if (
        alterado &&
        !justificativa
      ) {
        setErroPlanejamento(
          `A quantidade planejada de ${item.genero} foi alterada. Informe a justificativa.`
        );

        return;
      }

      itens.push({
        generoId:
          item.generoId,

        origemMedia:
          item.origemMedia,

        mediaMensalUtilizada:
          Number(
            item.mediaMensalUtilizada
          ),

        consumoProjetado:
          Number(
            item.consumoProjetado
          ),

        estoqueSeguranca:
          Number(
            item.estoqueSeguranca
          ),

        estoqueDisponivel:
          Number(
            item.estoqueDisponivel
          ),

        previstoReceber:
          Number(
            item.previstoReceber || 0
          ),

        quantidadeSugerida:
          Number(
            item.quantidadeSugerida
          ),

        quantidadePlanejada,

        justificativaAlteracao:
          alterado
            ? justificativa
            : null,
      });
    }

    if (
      finalizar &&
      !window.confirm(
        'Confirma a finalização do Planejamento de Ressuprimento QS? Após finalizar, este planejamento ficará preservado no histórico e não poderá ser alterado.'
      )
    ) {
      return;
    }

    setErroPlanejamento('');
    setMensagemPlanejamento('');
    setSalvandoPlanejamento(true);

    try {
      const resposta = await fetch(
        '/api/relatorios/planejamento-ressuprimento-qs',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            planejamentoId,

            mesesHistorico,

            mesesCiclo,

            margemSegurancaPercent:
              margemSeguranca,

            observacao:
              observacaoPlanejamento.trim() ||
              null,

            finalizar,

            itens,
          }),
        }
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroPlanejamento(
          json.error ||
            'Não foi possível salvar o planejamento.'
        );

        return;
      }

      setPlanejamentoId(
        json.planejamentoId
      );

      setStatusPlanejamento(
        json.status
      );

      setMensagemPlanejamento(
        json.mensagem ||
          'Planejamento registrado.'
      );
    } catch {
      setErroPlanejamento(
        'Não foi possível salvar o planejamento de Ressuprimento QS.'
      );
    } finally {
      setSalvandoPlanejamento(false);
    }
  }

  useEffect(() => {
    carregarQDAA();
    carregarRessuprimento();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nomeMes =
    meses.find(
      (item) =>
        item.valor === mes
    )?.nome || '';

  const quantidadeSemBase =
    ressuprimento?.itens?.filter(
      (item: any) =>
        item.quantidadeSugerida ===
        null
    ).length || 0;

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

            {dados.itens.length ===
            0 ? (
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
                        (titulo) => (
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
                            {titulo}
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
          CONFIGURAÇÃO DO RESSUPRIMENTO
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
          O EstoqueAprov utiliza o histórico
          real de consumo. Na ausência de
          histórico, poderá ser utilizada uma
          referência inicial informada pelo
          Administrador.
        </p>

        <div className="grid">
          <label>
            Histórico utilizado

            <select
              value={
                mesesHistorico
              }
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
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
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
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
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
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
              carregandoRessuprimento ||
              statusPlanejamento ===
                'FINALIZADO'
            }
          >
            {carregandoRessuprimento
              ? 'Calculando...'
              : 'Calcular / recalcular'}
          </button>
        </div>

        {erroRessuprimento && (
          <div className="error">
            {erroRessuprimento}
          </div>
        )}
      </div>

      {/* ======================================
          RESULTADO DO RESSUPRIMENTO
      ====================================== */}

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

            {quantidadeSemBase >
              0 && (
              <div
                className="card"
                style={{
                  border:
                    '1px solid #facc15',
                }}
              >
                <strong>
                  ⚠ Base de cálculo incompleta
                </strong>

                <p>
                  {quantidadeSemBase}{' '}
                  gênero(s) QS ainda não
                  possuem histórico nem
                  referência inicial.
                </p>

                <p className="muted">
                  Informe a referência desses
                  gêneros antes de finalizar o
                  planejamento.
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2>
              Necessidade por gênero QS
            </h2>

            <p className="muted">
              Quantidade sugerida = consumo
              projetado + estoque de segurança
              − estoque disponível − quantidade
              prevista para receber.
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
                      'Referência',
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
                                'Referência',
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
                    (item: any) => {
                      const decisao =
                        decisoes[
                          item.generoId
                        ];

                      const planejado =
                        numeroCampo(
                          decisao
                            ?.quantidade ||
                            ''
                        );

                      const foiAlterado =
                        planejado !==
                          null &&
                        item.quantidadeSugerida !==
                          null &&
                        diferente(
                          planejado,
                          Number(
                            item.quantidadeSugerida
                          )
                        );

                      return (
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
                              minWidth: 130,
                            }}
                          >
                            {item.quantidadeSugerida ===
                            null ? (
                              <span className="muted">
                                —
                              </span>
                            ) : (
                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  decisao
                                    ?.quantidade ||
                                  ''
                                }
                                disabled={
                                  statusPlanejamento ===
                                  'FINALIZADO'
                                }
                                onChange={(
                                  e
                                ) =>
                                  alterarQuantidade(
                                    item.generoId,
                                    e.target
                                      .value
                                  )
                                }
                              />
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              minWidth: 240,
                            }}
                          >
                            {foiAlterado ? (
                              <input
                                type="text"
                                value={
                                  decisao
                                    ?.justificativa ||
                                  ''
                                }
                                disabled={
                                  statusPlanejamento ===
                                  'FINALIZADO'
                                }
                                onChange={(
                                  e
                                ) =>
                                  alterarJustificativa(
                                    item.generoId,
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Obrigatória"
                              />
                            ) : (
                              <span className="muted">
                                {item.quantidadeSugerida ===
                                null
                                  ? 'Sem base'
                                  : 'Não necessária'}
                              </span>
                            )}
                          </td>

                          <td
                            style={{
                              padding: 10,
                              minWidth: 170,
                            }}
                          >
                            <button
                              type="button"
                              className="btn"
                              disabled={
                                statusPlanejamento ===
                                'FINALIZADO'
                              }
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
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================
              DECISÃO ADMINISTRATIVA
          ================================== */}

          <div className="card">
            <h2>
              Decisão do Ressuprimento QS
            </h2>

            <p>
              Revise os quantitativos antes de
              finalizar. A quantidade planejada
              pode ser diferente da sugestão do
              EstoqueAprov, desde que seja
              registrada a justificativa.
            </p>

            <label>
              Observação geral do planejamento

              <textarea
                value={
                  observacaoPlanejamento
                }
                disabled={
                  statusPlanejamento ===
                  'FINALIZADO'
                }
                onChange={(e) =>
                  setObservacaoPlanejamento(
                    e.target.value
                  )
                }
                placeholder="Ex.: previsão de exercício, aumento de efetivo, missão extraordinária ou outra consideração operacional."
              />
            </label>

            <div
              style={{
                marginTop: 14,
              }}
            >
              <strong>
                Situação:{' '}
                {statusPlanejamento ===
                'NOVO'
                  ? 'Novo planejamento'
                  : statusPlanejamento ===
                      'RASCUNHO'
                    ? 'Rascunho salvo'
                    : 'Planejamento finalizado'}
              </strong>
            </div>

            {planejamentoId && (
              <p className="muted">
                Identificação do planejamento:{' '}
                {planejamentoId}
              </p>
            )}

            {erroPlanejamento && (
              <div className="error">
                {erroPlanejamento}
              </div>
            )}

            {mensagemPlanejamento && (
              <div className="success">
                {
                  mensagemPlanejamento
                }
              </div>
            )}

            {statusPlanejamento !==
              'FINALIZADO' && (
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
                    salvandoPlanejamento
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      false
                    )
                  }
                >
                  {salvandoPlanejamento
                    ? 'Salvando...'
                    : 'Salvar rascunho'}
                </button>

                <button
                  type="button"
                  className="btn"
                  disabled={
                    salvandoPlanejamento ||
                    quantidadeSemBase > 0
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      true
                    )
                  }
                >
                  Finalizar planejamento
                </button>
              </div>
            )}

            {quantidadeSemBase >
              0 && (
              <p className="muted">
                Para finalizar, informe a
                referência inicial dos gêneros
                que ainda estão sem base de
                cálculo.
              </p>
            )}

            {statusPlanejamento ===
              'FINALIZADO' && (
              <div className="success">
                ✓ Planejamento finalizado. Os
                dados e a memória do cálculo
                foram preservados no histórico.
              </div>
            )}
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
            A referência ficará registrada com
            responsável e data. Quando houver
            histórico real suficiente no
            EstoqueAprov, o histórico do
            sistema será utilizado no cálculo.
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
            (numeroCampo(
              quantidadeReferencia
            ) || 0) > 0 && (
              <p className="muted">
                Média mensal equivalente:{' '}
                <strong>
                  {formatarNumero(
                    Number(
                      numeroCampo(
                        quantidadeReferencia
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
              {
                mensagemReferencia
              }
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

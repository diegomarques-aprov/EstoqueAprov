'use client';

import Link from 'next/link';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import NavegacaoInferior from '@/components/NavegacaoInferior';

const MESES_CICLO_RESSUPRIMENTO_QS = 2;

type DecisaoPlanejamento = {
  quantidade: string;
  justificativa: string;
};

function numeroCampo(
  valor: string
) {
  const convertido = Number(
    valor.replace(',', '.')
  );

  return Number.isFinite(
    convertido
  )
    ? convertido
    : null;
}

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

function diferente(
  a: number,
  b: number
) {
  return (
    Math.abs(a - b) >
    0.0005
  );
}

function origemTexto(
  origem: string
) {
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

function parametroInteiro(
  valor: string | null,
  padrao: number,
  permitidos?: number[]
) {
  if (!valor) {
    return padrao;
  }

  const numero = Number(valor);

  if (
    !Number.isInteger(numero)
  ) {
    return padrao;
  }

  if (
    permitidos &&
    !permitidos.includes(numero)
  ) {
    return padrao;
  }

  return numero;
}

function parametroMargem(
  valor: string | null
) {
  if (!valor) {
    return 10;
  }

  const numero = Number(valor);

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > 100
  ) {
    return 10;
  }

  return numero;
}

function Indicador({
  titulo,
  valor,
  alerta = false,
}: {
  titulo: string;
  valor: unknown;
  alerta?: boolean;
}) {
  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '10px',
        background: alerta
          ? 'rgba(245,158,11,.07)'
          : '#0c1811',
        border: alerta
          ? '1px solid rgba(245,158,11,.5)'
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

      <strong
        style={{
          display: 'block',
          marginTop: '3px',
          fontSize: '19px',
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
          fontSize: '11px',
          marginBottom: '3px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight:
            forte ? 800 : 600,
          lineHeight: 1.35,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function PlanejamentoQDAAContent() {
  const searchParams =
    useSearchParams();

  const historicoUrl =
    parametroInteiro(
      searchParams.get(
        'historico'
      ),
      2,
      [1, 2, 3, 6]
    );

  const margemUrl =
    parametroMargem(
      searchParams.get(
        'margem'
      )
    );

  const [
    ressuprimento,
    setRessuprimento,
  ] = useState<any>(null);

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    mesesHistorico,
    setMesesHistorico,
  ] = useState(
    historicoUrl
  );

  const mesesCiclo =
    MESES_CICLO_RESSUPRIMENTO_QS;

  const [
    margemSeguranca,
    setMargemSeguranca,
  ] = useState(
    margemUrl
  );

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
    generoAberto,
    setGeneroAberto,
  ] = useState<string | null>(
    null
  );

  const [
    planejamentoId,
    setPlanejamentoId,
  ] = useState<
    string | null
  >(null);

  const [
    statusPlanejamento,
    setStatusPlanejamento,
  ] = useState<
    | 'NOVO'
    | 'RASCUNHO'
    | 'FINALIZADO'
  >('NOVO');

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    erroPlanejamento,
    setErroPlanejamento,
  ] = useState('');

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  async function carregarRessuprimento(
    historico =
      mesesHistorico,
    margem =
      margemSeguranca
  ) {
    setErro('');
    setErroPlanejamento('');
    setMensagem('');
    setCarregando(true);

    try {
      const params =
        new URLSearchParams({
          historico:
            String(historico),

          margem:
            String(margem),
        });

      const resposta =
        await fetch(
          `/api/relatorios/ressuprimento-qs?${params.toString()}`,
          {
            cache: 'no-store',
          }
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Não foi possível calcular o ressuprimento QS.'
        );

        return;
      }

      setRessuprimento(json);

      const novasDecisoes:
        Record<
          string,
          DecisaoPlanejamento
        > = {};

      for (
        const item of json.itens
      ) {
        if (
          item.quantidadeSugerida !==
          null
        ) {
          novasDecisoes[
            item.generoId
          ] = {
            quantidade:
              String(
                item.quantidadeSugerida
              ),

            justificativa: '',
          };
        }
      }

      setDecisoes(
        novasDecisoes
      );

      setGeneroAberto(null);

      setPlanejamentoId(null);

      setStatusPlanejamento(
        'NOVO'
      );

      setObservacao('');
    } catch {
      setErro(
        'Não foi possível calcular o ressuprimento QS.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    setMesesHistorico(
      historicoUrl
    );

    setMargemSeguranca(
      margemUrl
    );

    carregarRessuprimento(
      historicoUrl,
      margemUrl
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    historicoUrl,
    margemUrl,
  ]);

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
              ?.justificativa ||
            '',
        },
      })
    );

    setMensagem('');

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
              ?.quantidade ||
            '',

          justificativa:
            valor,
        },
      })
    );

    setMensagem('');

    setErroPlanejamento('');
  }

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
      itensCalculados.length ===
      0
    ) {
      setErroPlanejamento(
        'Para salvar o planejamento, informe primeiro as referências de consumo pendentes.'
      );

      return;
    }

    if (
      finalizar &&
      ressuprimento.itens.some(
        (item: any) =>
          item.quantidadeSugerida ===
          null
      )
    ) {
      setErroPlanejamento(
        'Para finalizar, ainda existem gêneros QS sem base de cálculo.'
      );

      return;
    }

    const itens: any[] = [];

    for (
      const item of itensCalculados
    ) {
      const decisao =
        decisoes[
          item.generoId
        ];

      const quantidadePlanejada =
        numeroCampo(
          decisao?.quantidade ||
            ''
        );

      if (
        quantidadePlanejada ===
          null ||
        quantidadePlanejada < 0
      ) {
        setErroPlanejamento(
          `Informe uma quantidade válida para ${item.genero}.`
        );

        return;
      }

      const alterado =
        diferente(
          quantidadePlanejada,
          Number(
            item
              .quantidadeSugerida
          )
        );

      const justificativa =
        decisao
          ?.justificativa
          ?.trim() || '';

      if (
        alterado &&
        !justificativa
      ) {
        setErroPlanejamento(
          `Informe a justificativa da alteração de ${item.genero}.`
        );

        setGeneroAberto(
          item.generoId
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
            item
              .mediaMensalUtilizada
          ),

        consumoProjetado:
          Number(
            item
              .consumoProjetado
          ),

        estoqueSeguranca:
          Number(
            item
              .estoqueSeguranca
          ),

        estoqueDisponivel:
          Number(
            item
              .estoqueDisponivel
          ),

        previstoReceber:
          Number(
            item
              .previstoReceber ||
              0
          ),

        quantidadeSugerida:
          Number(
            item
              .quantidadeSugerida
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
        'Confirma a finalização do Planejamento Bimestral de Ressuprimento QS? Após finalizar, ele ficará preservado no histórico e não poderá ser alterado.'
      )
    ) {
      return;
    }

    setErroPlanejamento('');

    setMensagem('');

    setSalvando(true);

    try {
      const resposta =
        await fetch(
          '/api/relatorios/planejamento-ressuprimento-qs',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                planejamentoId,

                mesesHistorico,

                mesesCiclo:
                  MESES_CICLO_RESSUPRIMENTO_QS,

                margemSegurancaPercent:
                  margemSeguranca,

                observacao:
                  observacao
                    .trim() ||
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

      setMensagem(
        json.mensagem ||
          'Planejamento registrado.'
      );
    } catch {
      setErroPlanejamento(
        'Não foi possível salvar o planejamento de Ressuprimento QS.'
      );
    } finally {
      setSalvando(false);
    }
  }

  const quantidadeSemBase =
    ressuprimento
      ?.itens?.filter(
        (item: any) =>
          item.quantidadeSugerida ===
          null
      ).length || 0;

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
            Planejamento de Ressuprimento QS
          </h1>

          <p
            className="muted"
            style={{
              margin: '5px 0 0',
              fontSize: '14px',
              lineHeight: 1.4,
            }}
          >
            Planejamento do ciclo normal bimestral de gêneros QS.
          </p>
        </div>
      </header>

      <section
        style={{
          padding: '13px',
          borderRadius: '12px',
          border:
            '1px solid #284334',
          background: '#0c1811',
        }}
      >
        <strong>
          Parâmetros
        </strong>

        <div
          style={{
            marginTop: '10px',
            padding: '10px 11px',
            borderRadius: '9px',
            border:
              '1px solid #365744',
            background: '#101d15',
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: '11px',
            }}
          >
            Ciclo normal
          </div>

          <strong
            style={{
              display: 'block',
              marginTop: '2px',
              fontSize: '15px',
            }}
          >
            2 meses — Bimestral
          </strong>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '9px',
            marginTop: '10px',
          }}
        >
          <label>
            Histórico para média

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
            Segurança (%)

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

        <button
          type="button"
          className="btn secondary"
          disabled={
            carregando ||
            statusPlanejamento ===
              'FINALIZADO'
          }
          onClick={() =>
            carregarRessuprimento()
          }
          style={{
            marginTop: '10px',
            width: 'auto',
          }}
        >
          {carregando
            ? 'Calculando...'
            : 'Recalcular'}
        </button>
      </section>

      {erro && (
        <div
          className="error"
          style={{
            marginTop: '12px',
          }}
        >
          {erro}
        </div>
      )}

      {ressuprimento && (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, minmax(0, 1fr))',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <Indicador
              titulo="Gêneros QS"
              valor={
                ressuprimento
                  .resumo
                  .totalGenerosQS
              }
            />

            <Indicador
              titulo="Com base"
              valor={
                ressuprimento
                  .resumo
                  .comBaseCalculo
              }
            />

            <Indicador
              titulo="Pendentes"
              valor={
                ressuprimento
                  .resumo
                  .semBaseCalculo
              }
              alerta={
                ressuprimento
                  .resumo
                  .semBaseCalculo >
                0
              }
            />
          </section>

          {quantidadeSemBase >
            0 && (
            <section
              style={{
                marginTop: '12px',
                padding: '12px',
                borderRadius: '11px',
                border:
                  '1px solid rgba(245,158,11,.55)',
                background:
                  'rgba(245,158,11,.06)',
              }}
            >
              <strong
                style={{
                  fontSize: '14px',
                }}
              >
                Referências pendentes
              </strong>

              <p
                className="muted"
                style={{
                  margin:
                    '5px 0 10px',
                  fontSize: '12px',
                  lineHeight: 1.45,
                }}
              >
                Informe a referência inicial dos gêneros abaixo para concluir o planejamento.
              </p>

              <div
                style={{
                  display: 'grid',
                  gap: '6px',
                }}
              >
                {ressuprimento.itens
                  .filter(
                    (item: any) =>
                      item.quantidadeSugerida ===
                      null
                  )
                  .map(
                    (item: any) => {
                      const params =
                        new URLSearchParams({
                          generoId:
                            item.generoId,

                          historico:
                            String(
                              mesesHistorico
                            ),

                          margem:
                            String(
                              margemSeguranca
                            ),
                        });

                      return (
                        <Link
                          key={
                            item.generoId
                          }
                          href={`/qdaa/referencia?${params.toString()}`}
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            gap: '10px',
                            padding:
                              '9px 10px',
                            borderRadius:
                              '9px',
                            border:
                              '1px solid #5b4a22',
                            background:
                              '#17170f',
                            textDecoration:
                              'none',
                          }}
                        >
                          <span>
                            <strong
                              style={{
                                display:
                                  'block',
                                fontSize:
                                  '13px',
                              }}
                            >
                              {item.genero}
                            </strong>

                            <span
                              className="muted"
                              style={{
                                fontSize:
                                  '11px',
                              }}
                            >
                              {item.unidade}
                            </span>
                          </span>

                          <span
                            style={{
                              fontSize:
                                '12px',
                              fontWeight:
                                700,
                            }}
                          >
                            Informar →
                          </span>
                        </Link>
                      );
                    }
                  )}
              </div>
            </section>
          )}

          <section
            className="card"
            style={{
              marginTop: '12px',
            }}
          >
            <strong>
              Planejamento por gênero
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 10px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              Abra somente o gênero que deseja conferir ou ajustar.
            </p>

            <div
              style={{
                display: 'grid',
                gap: '6px',
              }}
            >
              {ressuprimento.itens.map(
                (item: any) => {
                  const aberto =
                    generoAberto ===
                    item.generoId;

                  const semBase =
                    item.quantidadeSugerida ===
                    null;

                  const decisao =
                    decisoes[
                      item.generoId
                    ];

                  const quantidadePlanejada =
                    numeroCampo(
                      decisao
                        ?.quantidade ||
                        ''
                    );

                  const alterado =
                    !semBase &&
                    quantidadePlanejada !==
                      null &&
                    diferente(
                      quantidadePlanejada,
                      Number(
                        item
                          .quantidadeSugerida
                      )
                    );

                  return (
                    <div
                      key={
                        item.generoId
                      }
                      style={{
                        borderRadius:
                          '10px',
                        border:
                          semBase
                            ? '1px solid rgba(245,158,11,.5)'
                            : '1px solid #284334',
                        background:
                          '#0c1811',
                        overflow:
                          'hidden',
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
                          width:
                            '100%',
                          border: 0,
                          background:
                            'transparent',
                          color:
                            'inherit',
                          padding:
                            '10px',
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'space-between',
                          gap:
                            '10px',
                          textAlign:
                            'left',
                          cursor:
                            'pointer',
                        }}
                      >
                        <span
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <strong
                            style={{
                              display:
                                'block',
                              fontSize:
                                '14px',
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
                            {item.unidade}
                            {' • '}
                            {origemTexto(
                              item.origemMedia
                            )}
                          </span>
                        </span>

                        <span
                          style={{
                            flexShrink:
                              0,
                            fontSize:
                              '12px',
                            fontWeight:
                              800,
                          }}
                        >
                          {semBase
                            ? 'Pendente'
                            : alterado
                              ? 'Alterado'
                              : `${formatarNumero(
                                  item.quantidadeSugerida
                                )} ${item.unidade}`}
                          {' '}
                          {aberto
                            ? '▲'
                            : '▼'}
                        </span>
                      </button>

                      {aberto && (
                        <div
                          style={{
                            padding:
                              '0 10px 11px',
                            borderTop:
                              '1px solid rgba(255,255,255,.06)',
                          }}
                        >
                          {semBase ? (
                            <div
                              style={{
                                paddingTop:
                                  '10px',
                              }}
                            >
                              <p
                                className="muted"
                                style={{
                                  margin:
                                    '0 0 8px',
                                  fontSize:
                                    '12px',
                                  lineHeight:
                                    1.45,
                                }}
                              >
                                Ainda não existe base suficiente para calcular este gênero.
                              </p>

                              <Link
                                href={`/qdaa/referencia?generoId=${encodeURIComponent(
                                  item.generoId
                                )}&historico=${mesesHistorico}&margem=${margemSeguranca}`}
                                className="btn secondary"
                                style={{
                                  display:
                                    'inline-flex',
                                  width:
                                    'auto',
                                  textDecoration:
                                    'none',
                                }}
                              >
                                Informar referência
                              </Link>
                            </div>
                          ) : (
                            <>
                              <div
                                style={{
                                  display:
                                    'grid',
                                  gridTemplateColumns:
                                    'repeat(2, minmax(0, 1fr))',
                                  gap:
                                    '10px 14px',
                                  paddingTop:
                                    '10px',
                                }}
                              >
                                <Dado
                                  titulo="Média mensal"
                                  valor={`${formatarNumero(
                                    item.mediaMensalUtilizada
                                  )} ${item.unidade}`}
                                />

                                <Dado
                                  titulo="Projeção 2 meses"
                                  valor={`${formatarNumero(
                                    item.consumoProjetado
                                  )} ${item.unidade}`}
                                />

                                <Dado
                                  titulo="Estoque segurança"
                                  valor={`${formatarNumero(
                                    item.estoqueSeguranca
                                  )} ${item.unidade}`}
                                />

                                <Dado
                                  titulo="Estoque disponível"
                                  valor={`${formatarNumero(
                                    item.estoqueDisponivel
                                  )} ${item.unidade}`}
                                />

                                <Dado
                                  titulo="Previsto receber"
                                  valor={`${formatarNumero(
                                    item.previstoReceber
                                  )} ${item.unidade}`}
                                />

                                <Dado
                                  titulo="Sugestão EstoqueAprov"
                                  valor={`${formatarNumero(
                                    item.quantidadeSugerida
                                  )} ${item.unidade}`}
                                  forte
                                />
                              </div>

                              <label
                                style={{
                                  display:
                                    'block',
                                  marginTop:
                                    '11px',
                                }}
                              >
                                Quantidade planejada ({item.unidade})

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
                                  onChange={(e) =>
                                    alterarQuantidade(
                                      item.generoId,
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                />
                              </label>

                              {alterado && (
                                <label
                                  style={{
                                    display:
                                      'block',
                                    marginTop:
                                      '9px',
                                  }}
                                >
                                  Justificativa da alteração

                                  <textarea
                                    value={
                                      decisao
                                        ?.justificativa ||
                                      ''
                                    }
                                    disabled={
                                      statusPlanejamento ===
                                      'FINALIZADO'
                                    }
                                    onChange={(e) =>
                                      alterarJustificativa(
                                        item.generoId,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                    rows={2}
                                    maxLength={
                                      1000
                                    }
                                    placeholder="Informe o motivo da alteração."
                                    style={{
                                      width:
                                        '100%',
                                      resize:
                                        'vertical',
                                      boxSizing:
                                        'border-box',
                                    }}
                                  />
                                </label>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section
            className="card"
            style={{
              marginTop: '12px',
            }}
          >
            <strong>
              Registro do planejamento
            </strong>

            <label
              style={{
                display: 'block',
                marginTop: '10px',
              }}
            >
              Observação geral

              <textarea
                value={
                  observacao
                }
                disabled={
                  statusPlanejamento ===
                  'FINALIZADO'
                }
                onChange={(e) =>
                  setObservacao(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Observação operacional, se necessária."
                style={{
                  width: '100%',
                  resize:
                    'vertical',
                  boxSizing:
                    'border-box',
                }}
              />
            </label>

            <div
              style={{
                marginTop: '10px',
                fontSize: '13px',
              }}
            >
              Situação:{' '}

              <strong>
                {statusPlanejamento ===
                'NOVO'
                  ? 'Novo planejamento'
                  : statusPlanejamento ===
                      'RASCUNHO'
                    ? 'Rascunho salvo'
                    : 'Finalizado'}
              </strong>
            </div>

            {erroPlanejamento && (
              <div
                className="error"
                style={{
                  marginTop:
                    '10px',
                }}
              >
                {erroPlanejamento}
              </div>
            )}

            {mensagem && (
              <div
                className="success"
                style={{
                  marginTop:
                    '10px',
                }}
              >
                {mensagem}
              </div>
            )}

            {statusPlanejamento !==
              'FINALIZADO' && (
              <div
                style={{
                  display:
                    'flex',
                  flexWrap:
                    'wrap',
                  gap: '7px',
                  marginTop:
                    '11px',
                }}
              >
                <button
                  type="button"
                  className="btn secondary"
                  disabled={
                    salvando
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      false
                    )
                  }
                  style={{
                    width:
                      'auto',
                  }}
                >
                  {salvando
                    ? 'Salvando...'
                    : 'Salvar rascunho'}
                </button>

                <button
                  type="button"
                  className="btn"
                  disabled={
                    salvando ||
                    quantidadeSemBase >
                      0
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      true
                    )
                  }
                  style={{
                    width:
                      'auto',
                  }}
                >
                  Finalizar
                </button>
              </div>
            )}

            {statusPlanejamento ===
              'FINALIZADO' &&
              planejamentoId && (
                <div
                  style={{
                    marginTop:
                      '12px',
                    paddingTop:
                      '12px',
                    borderTop:
                      '1px solid rgba(255,255,255,.08)',
                  }}
                >
                  <p
                    className="muted"
                    style={{
                      margin:
                        '0 0 9px',
                      fontSize:
                        '12px',
                      lineHeight:
                        1.45,
                    }}
                  >
                    Caso surja uma necessidade extraordinária durante este ciclo de 2 meses, registre-a separadamente sem alterar o planejamento original.
                  </p>

                  <Link
                    href={`/qdaa/ressuprimento-complementar?planejamentoId=${encodeURIComponent(
                      planejamentoId
                    )}`}
                    className="btn secondary"
                    style={{
                      display:
                        'inline-flex',
                      width:
                        'auto',
                      textDecoration:
                        'none',
                    }}
                  >
                    + Ressuprimento complementar
                  </Link>
                </div>
              )}

            {quantidadeSemBase >
              0 && (
              <p
                className="muted"
                style={{
                  margin:
                    '10px 0 0',
                  fontSize:
                    '12px',
                  lineHeight:
                    1.4,
                }}
              >
                A finalização será liberada após informar todas as referências pendentes.
              </p>
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

function CarregandoPlanejamento() {
  return (
    <main>
      <div className="card">
        <h1>
          Planejamento de Ressuprimento QS
        </h1>

        <p className="muted">
          Carregando planejamento...
        </p>
      </div>
    </main>
  );
}

export default function PlanejamentoQDAAPage() {
  return (
    <Suspense
      fallback={
        <CarregandoPlanejamento />
      }
    >
      <PlanejamentoQDAAContent />
    </Suspense>
  );
}

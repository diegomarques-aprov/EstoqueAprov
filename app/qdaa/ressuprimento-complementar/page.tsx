'use client';

import Link from 'next/link';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import NavegacaoInferior from '@/components/NavegacaoInferior';

type ItemPlanejamento = {
  id: string;
  generoId: string;
  genero: string;
  unidade: string;
  quantidadePlanejada: number;
};

type Planejamento = {
  id: string;
  dataReferencia: string;
  mesesCiclo: number;
  status: string;
  finalizadoEm: string | null;
  responsavel: {
    nome: string;
    postoGraduacao: string | null;
    funcao: string | null;
  };
  itens: ItemPlanejamento[];
};

type ItemComplementar = {
  generoId: string;
  genero: string;
  unidade: string;
  quantidade: number;
};

type ComplementarRegistrado = {
  id: string;
  justificativa: string;
  criadoEm: string;
  responsavel: {
    nome: string;
    postoGraduacao: string | null;
    funcao: string | null;
  };
  itens: ItemComplementar[];
};

type SelecaoGenero = {
  selecionado: boolean;
  quantidade: string;
};

function formatarNumero(
  valor: number
) {
  return Number(
    valor || 0
  ).toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  );
}

function formatarData(
  valor: string | null
) {
  if (!valor) {
    return '—';
  }

  return new Date(
    valor
  ).toLocaleDateString(
    'pt-BR'
  );
}

function formatarDataHora(
  valor: string
) {
  return new Date(
    valor
  ).toLocaleString(
    'pt-BR'
  );
}

function numeroCampo(
  valor: string
) {
  const convertido =
    Number(
      valor.replace(
        ',',
        '.'
      )
    );

  if (
    !Number.isFinite(
      convertido
    )
  ) {
    return null;
  }

  return convertido;
}

function RessuprimentoComplementarContent() {
  const searchParams =
    useSearchParams();

  const planejamentoId =
    searchParams.get(
      'planejamentoId'
    ) || '';

  const [
    planejamento,
    setPlanejamento,
  ] = useState<
    Planejamento | null
  >(null);

  const [
    complementares,
    setComplementares,
  ] = useState<
    ComplementarRegistrado[]
  >([]);

  const [
    selecoes,
    setSelecoes,
  ] = useState<
    Record<
      string,
      SelecaoGenero
    >
  >({});

  const [
    justificativa,
    setJustificativa,
  ] = useState('');

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  async function carregar() {
    if (
      !planejamentoId
    ) {
      setErro(
        'Para registrar um Ressuprimento Complementar, selecione primeiro um planejamento bimestral finalizado.'
      );

      setCarregando(false);

      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const [
        respostaPlanejamento,
        respostaComplementares,
      ] = await Promise.all([
        fetch(
          `/api/relatorios/planejamento-ressuprimento-qs?id=${encodeURIComponent(
            planejamentoId
          )}`,
          {
            cache:
              'no-store',
          }
        ),

        fetch(
          `/api/relatorios/ressuprimento-complementar?planejamentoId=${encodeURIComponent(
            planejamentoId
          )}`,
          {
            cache:
              'no-store',
          }
        ),
      ]);

      const [
        jsonPlanejamento,
        jsonComplementares,
      ] = await Promise.all([
        respostaPlanejamento.json(),
        respostaComplementares.json(),
      ]);

      if (
        !respostaPlanejamento.ok
      ) {
        setErro(
          jsonPlanejamento.error ||
            'Não foi possível carregar o planejamento bimestral.'
        );

        return;
      }

      if (
        jsonPlanejamento.status !==
        'FINALIZADO'
      ) {
        setErro(
          'O Ressuprimento Complementar só pode ser registrado para um planejamento bimestral já finalizado.'
        );

        setPlanejamento(
          jsonPlanejamento
        );

        return;
      }

      if (
        Number(
          jsonPlanejamento.mesesCiclo
        ) !== 2
      ) {
        setErro(
          'O planejamento selecionado não corresponde a um ciclo normal bimestral de 2 meses.'
        );

        setPlanejamento(
          jsonPlanejamento
        );

        return;
      }

      setPlanejamento(
        jsonPlanejamento
      );

      if (
        respostaComplementares.ok &&
        Array.isArray(
          jsonComplementares
        )
      ) {
        setComplementares(
          jsonComplementares
        );
      } else {
        setComplementares(
          []
        );
      }

      const novaSelecao:
        Record<
          string,
          SelecaoGenero
        > = {};

      for (
        const item of
          jsonPlanejamento.itens ||
        []
      ) {
        novaSelecao[
          item.generoId
        ] = {
          selecionado:
            false,
          quantidade: '',
        };
      }

      setSelecoes(
        novaSelecao
      );
    } catch {
      setErro(
        'Não foi possível carregar os dados do Ressuprimento Complementar.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    planejamentoId,
  ]);

  const itensSelecionados =
    useMemo(
      () =>
        planejamento?.itens.filter(
          (item) =>
            selecoes[
              item.generoId
            ]?.selecionado
        ) || [],
      [
        planejamento,
        selecoes,
      ]
    );

  function alternarGenero(
    generoId: string
  ) {
    setSelecoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          selecionado:
            !atual[
              generoId
            ]?.selecionado,

          quantidade:
            atual[
              generoId
            ]?.quantidade ||
            '',
        },
      })
    );

    setErro('');
    setMensagem('');
  }

  function alterarQuantidade(
    generoId: string,
    valor: string
  ) {
    setSelecoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          selecionado:
            true,

          quantidade:
            valor,
        },
      })
    );

    setErro('');
    setMensagem('');
  }

  function limparFormulario() {
    if (
      !planejamento
    ) {
      return;
    }

    const novaSelecao:
      Record<
        string,
        SelecaoGenero
      > = {};

    for (
      const item of
        planejamento.itens
    ) {
      novaSelecao[
        item.generoId
      ] = {
        selecionado:
          false,
        quantidade: '',
      };
    }

    setSelecoes(
      novaSelecao
    );

    setJustificativa('');
  }

  async function registrar() {
    if (
      !planejamento
    ) {
      setErro(
        'Planejamento bimestral não carregado.'
      );

      return;
    }

    if (
      planejamento.status !==
      'FINALIZADO'
    ) {
      setErro(
        'Finalize primeiro o planejamento normal bimestral.'
      );

      return;
    }

    if (
      itensSelecionados.length ===
      0
    ) {
      setErro(
        'Selecione pelo menos um gênero para o Ressuprimento Complementar.'
      );

      return;
    }

    const itens: {
      generoId: string;
      quantidade: number;
    }[] = [];

    for (
      const item of
        itensSelecionados
    ) {
      const quantidade =
        numeroCampo(
          selecoes[
            item.generoId
          ]?.quantidade ||
            ''
        );

      if (
        quantidade ===
          null ||
        quantidade <= 0
      ) {
        setErro(
          `Informe uma quantidade complementar válida para ${item.genero}.`
        );

        return;
      }

      itens.push({
        generoId:
          item.generoId,

        quantidade,
      });
    }

    const motivo =
      justificativa.trim();

    if (
      motivo.length < 3
    ) {
      setErro(
        'Informe a justificativa do Ressuprimento Complementar.'
      );

      return;
    }

    const nomes =
      itensSelecionados
        .map(
          (item) =>
            item.genero
        )
        .join(', ');

    if (
      !window.confirm(
        `Confirma o Ressuprimento Complementar para: ${nomes}? Este registro ficará vinculado ao planejamento bimestral original.`
      )
    ) {
      return;
    }

    setSalvando(true);
    setErro('');
    setMensagem('');

    try {
      const resposta =
        await fetch(
          '/api/relatorios/ressuprimento-complementar',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                planejamentoId:
                  planejamento.id,

                justificativa:
                  motivo,

                itens,
              }),
          }
        );

      const json =
        await resposta.json();

      if (
        !resposta.ok
      ) {
        setErro(
          json.error ||
            'Não foi possível registrar o Ressuprimento Complementar QS.'
        );

        return;
      }

      setMensagem(
        json.mensagem ||
          'Ressuprimento Complementar QS registrado.'
      );

      limparFormulario();

      const respostaHistorico =
        await fetch(
          `/api/relatorios/ressuprimento-complementar?planejamentoId=${encodeURIComponent(
            planejamento.id
          )}`,
          {
            cache:
              'no-store',
          }
        );

      if (
        respostaHistorico.ok
      ) {
        const jsonHistorico =
          await respostaHistorico.json();

        if (
          Array.isArray(
            jsonHistorico
          )
        ) {
          setComplementares(
            jsonHistorico
          );
        }
      }
    } catch {
      setErro(
        'Não foi possível registrar o Ressuprimento Complementar QS.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (
    carregando
  ) {
    return (
      <main>
        <Link
          href="/qdaa/historico"
          className="back"
        >
          ← Histórico
        </Link>

        <div
          className="card"
          style={{
            marginTop:
              '14px',
          }}
        >
          <h1>
            Ressuprimento Complementar QS
          </h1>

          <p className="muted">
            Carregando planejamento...
          </p>
        </div>

        <NavegacaoInferior
          voltarHref="/qdaa"
          voltarTexto="QDAA"
        />
      </main>
    );
  }

  return (
    <main>
      <header
        style={{
          marginBottom:
            '16px',
        }}
      >
        <Link
          href="/qdaa/historico"
          className="back"
        >
          ← Histórico
        </Link>

        <div
          style={{
            marginTop:
              '14px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize:
                '22px',
              lineHeight:
                1.2,
            }}
          >
            Ressuprimento Complementar QS
          </h1>

          <p
            className="muted"
            style={{
              margin:
                '5px 0 0',
              fontSize:
                '14px',
              lineHeight:
                1.45,
            }}
          >
            Registre uma necessidade extraordinária dentro do ciclo bimestral em andamento.
          </p>
        </div>
      </header>

      {erro && (
        <div
          className="error"
          style={{
            marginBottom:
              '12px',
          }}
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div
          className="success"
          style={{
            marginBottom:
              '12px',
          }}
        >
          {mensagem}
        </div>
      )}

      {planejamento && (
        <>
          <section
            className="card"
            style={{
              marginBottom:
                '13px',
            }}
          >
            <strong>
              Planejamento normal vinculado
            </strong>

            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap:
                  '10px 14px',
                marginTop:
                  '12px',
              }}
            >
              <div>
                <div
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  Data de referência
                </div>

                <strong>
                  {formatarData(
                    planejamento.dataReferencia
                  )}
                </strong>
              </div>

              <div>
                <div
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  Ciclo
                </div>

                <strong>
                  2 meses — Bimestral
                </strong>
              </div>

              <div>
                <div
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  Situação
                </div>

                <strong>
                  {planejamento.status ===
                  'FINALIZADO'
                    ? 'Finalizado'
                    : planejamento.status}
                </strong>
              </div>

              <div>
                <div
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  Finalizado em
                </div>

                <strong>
                  {formatarData(
                    planejamento.finalizadoEm
                  )}
                </strong>
              </div>
            </div>

            <div
              style={{
                marginTop:
                  '11px',
                paddingTop:
                  '10px',
                borderTop:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize:
                    '11px',
                }}
              >
                Responsável pelo planejamento
              </div>

              <strong
                style={{
                  fontSize:
                    '13px',
                }}
              >
                {planejamento
                  .responsavel
                  ?.postoGraduacao
                  ? `${planejamento.responsavel.postoGraduacao} `
                  : ''}
                {planejamento
                  .responsavel
                  ?.nome ||
                  '—'}
              </strong>
            </div>
          </section>

          {planejamento.status ===
            'FINALIZADO' && (
            <>
              <section
                className="card"
                style={{
                  marginBottom:
                    '13px',
                }}
              >
                <strong>
                  Gêneros para complementar
                </strong>

                <p
                  className="muted"
                  style={{
                    margin:
                      '5px 0 12px',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.45,
                  }}
                >
                  Selecione somente os gêneros que necessitam de quantidade adicional neste ciclo.
                </p>

                <div
                  style={{
                    display:
                      'grid',
                    gap: '7px',
                  }}
                >
                  {planejamento.itens.map(
                    (item) => {
                      const selecionado =
                        selecoes[
                          item.generoId
                        ]
                          ?.selecionado ||
                        false;

                      return (
                        <div
                          key={
                            item.generoId
                          }
                          style={{
                            padding:
                              '10px',
                            borderRadius:
                              '10px',
                            border:
                              selecionado
                                ? '1px solid #52765f'
                                : '1px solid #284334',
                            background:
                              selecionado
                                ? '#13261a'
                                : '#0c1811',
                          }}
                        >
                          <label
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap:
                                '9px',
                              margin: 0,
                              cursor:
                                'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                selecionado
                              }
                              onChange={() =>
                                alternarGenero(
                                  item.generoId
                                )
                              }
                            />

                            <div
                              style={{
                                flex:
                                  1,
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
                                Planejamento normal:{' '}
                                {formatarNumero(
                                  item.quantidadePlanejada
                                )}{' '}
                                {item.unidade}
                              </span>
                            </div>
                          </label>

                          {selecionado && (
                            <div
                              style={{
                                marginTop:
                                  '9px',
                                paddingTop:
                                  '9px',
                                borderTop:
                                  '1px solid rgba(255,255,255,.07)',
                              }}
                            >
                              <label>
                                Quantidade adicional ({item.unidade})

                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={
                                    selecoes[
                                      item.generoId
                                    ]
                                      ?.quantidade ||
                                    ''
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
                                  placeholder="0"
                                />
                              </label>
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
                  marginBottom:
                    '13px',
                }}
              >
                <strong>
                  Justificativa
                </strong>

                <p
                  className="muted"
                  style={{
                    margin:
                      '5px 0 10px',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.45,
                  }}
                >
                  Informe o motivo operacional que tornou necessário este novo abastecimento dentro do mesmo ciclo.
                </p>

                <textarea
                  value={
                    justificativa
                  }
                  onChange={(e) => {
                    setJustificativa(
                      e.target.value
                    );

                    setErro('');
                    setMensagem('');
                  }}
                  rows={4}
                  maxLength={
                    1000
                  }
                  placeholder="Ex.: quantidade recebida inferior à planejada, necessidade inesperada, correção de dados..."
                  style={{
                    width:
                      '100%',
                    boxSizing:
                      'border-box',
                    resize:
                      'vertical',
                  }}
                />

                <div
                  className="muted"
                  style={{
                    marginTop:
                      '5px',
                    textAlign:
                      'right',
                    fontSize:
                      '11px',
                  }}
                >
                  {justificativa.length}/1000
                </div>
              </section>

              <section
                style={{
                  padding:
                    '11px 12px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid rgba(245,158,11,.45)',
                  background:
                    'rgba(245,158,11,.06)',
                  marginBottom:
                    '13px',
                }}
              >
                <strong
                  style={{
                    fontSize:
                      '13px',
                  }}
                >
                  Importante
                </strong>

                <p
                  className="muted"
                  style={{
                    margin:
                      '5px 0 0',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.5,
                  }}
                >
                  Este registro não altera o planejamento original e não soma quantidade ao estoque. Quando o material chegar fisicamente, registre a entrada normalmente no módulo Recebimentos.
                </p>
              </section>

              <button
                type="button"
                className="btn"
                onClick={
                  registrar
                }
                disabled={
                  salvando
                }
                style={{
                  width:
                    'auto',
                  minWidth:
                    '190px',
                }}
              >
                {salvando
                  ? 'Registrando...'
                  : '+ Registrar complementar'}
              </button>
            </>
          )}

          <section
            className="card"
            style={{
              marginTop:
                '17px',
            }}
          >
            <strong>
              Complementares deste ciclo
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 11px',
                fontSize:
                  '12px',
                lineHeight:
                  1.45,
              }}
            >
              Histórico das necessidades extraordinárias vinculadas a este planejamento bimestral.
            </p>

            {complementares.length ===
            0 ? (
              <div
                style={{
                  padding:
                    '11px',
                  borderRadius:
                    '9px',
                  border:
                    '1px solid #284334',
                  background:
                    '#0c1811',
                  fontSize:
                    '13px',
                }}
              >
                Nenhum Ressuprimento Complementar registrado neste ciclo.
              </div>
            ) : (
              <div
                style={{
                  display:
                    'grid',
                  gap: '8px',
                }}
              >
                {complementares.map(
                  (
                    complementar,
                    indice
                  ) => (
                    <article
                      key={
                        complementar.id
                      }
                      style={{
                        padding:
                          '11px',
                        borderRadius:
                          '10px',
                        border:
                          '1px solid #284334',
                        background:
                          '#0c1811',
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
                        }}
                      >
                        <strong
                          style={{
                            fontSize:
                              '14px',
                          }}
                        >
                          Complementar nº{' '}
                          {complementares.length -
                            indice}
                        </strong>

                        <span
                          className="muted"
                          style={{
                            fontSize:
                              '11px',
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {formatarDataHora(
                            complementar.criadoEm
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          display:
                            'grid',
                          gap: '5px',
                          marginTop:
                            '9px',
                        }}
                      >
                        {complementar.itens.map(
                          (
                            item
                          ) => (
                            <div
                              key={
                                item.generoId
                              }
                              style={{
                                display:
                                  'flex',
                                justifyContent:
                                  'space-between',
                                gap:
                                  '10px',
                                padding:
                                  '6px 0',
                                borderBottom:
                                  '1px solid rgba(255,255,255,.06)',
                                fontSize:
                                  '13px',
                              }}
                            >
                              <span>
                                {item.genero}
                              </span>

                              <strong>
                                {formatarNumero(
                                  item.quantidade
                                )}{' '}
                                {item.unidade}
                              </strong>
                            </div>
                          )
                        )}
                      </div>

                      <div
                        style={{
                          marginTop:
                            '9px',
                        }}
                      >
                        <div
                          className="muted"
                          style={{
                            fontSize:
                              '11px',
                          }}
                        >
                          Justificativa
                        </div>

                        <div
                          style={{
                            marginTop:
                              '3px',
                            fontSize:
                              '13px',
                            lineHeight:
                              1.45,
                          }}
                        >
                          {complementar.justificativa}
                        </div>
                      </div>

                      <div
                        className="muted"
                        style={{
                          marginTop:
                            '9px',
                          paddingTop:
                            '8px',
                          borderTop:
                            '1px solid rgba(255,255,255,.06)',
                          fontSize:
                            '11px',
                        }}
                      >
                        Registrado por:{' '}
                        {complementar
                          .responsavel
                          ?.postoGraduacao
                          ? `${complementar.responsavel.postoGraduacao} `
                          : ''}
                        {complementar
                          .responsavel
                          ?.nome ||
                          '—'}
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      {!planejamento &&
        !erro && (
          <div className="card">
            Nenhum planejamento selecionado.
          </div>
        )}

      <NavegacaoInferior
        voltarHref="/qdaa/historico"
        voltarTexto="Histórico"
      />
    </main>
  );
}

function CarregandoComplementar() {
  return (
    <main>
      <div className="card">
        <h1>
          Ressuprimento Complementar QS
        </h1>

        <p className="muted">
          Carregando...
        </p>
      </div>
    </main>
  );
}

export default function RessuprimentoComplementarPage() {
  return (
    <Suspense
      fallback={
        <CarregandoComplementar />
      }
    >
      <RessuprimentoComplementarContent />
    </Suspense>
  );
}

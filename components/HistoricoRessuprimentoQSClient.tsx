'use client';

import Link from 'next/link';

import {
  useEffect,
  useState,
} from 'react';

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
  valor: string | null
) {
  if (!valor) {
    return '—';
  }

  return new Date(
    valor
  ).toLocaleString(
    'pt-BR'
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

  return origem || '—';
}

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
              : '14px',
          fontWeight:
            destaque
              ? 800
              : 600,
          lineHeight: 1.35,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function Status({
  status,
}: {
  status: string;
}) {
  const finalizado =
    status === 'FINALIZADO';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 9px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 800,
        lineHeight: 1,
        border: finalizado
          ? '1px solid rgba(43,138,87,.7)'
          : '1px solid rgba(214,165,109,.65)',
        background: finalizado
          ? 'rgba(43,138,87,.13)'
          : 'rgba(214,165,109,.10)',
      }}
    >
      {finalizado
        ? '✓ Finalizado'
        : 'Rascunho'}
    </span>
  );
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
      const resposta =
        await fetch(
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
    setCarregandoDetalhe(
      true
    );

    try {
      const resposta =
        await fetch(
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

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      setErro(
        'Não foi possível abrir o planejamento.'
      );
    } finally {
      setCarregandoDetalhe(
        false
      );
    }
  }

  useEffect(() => {
    carregarHistorico();
  }, []);

  if (selecionado) {
    return (
      <>
        <button
          type="button"
          className="btn secondary"
          onClick={() =>
            setSelecionado(null)
          }
          style={{
            width: '100%',
            marginBottom: '16px',
          }}
        >
          ← Voltar ao histórico
        </button>

        <section>
          <div
            style={{
              display: 'flex',
              alignItems:
                'flex-start',
              justifyContent:
                'space-between',
              gap: '10px',
              marginBottom:
                '14px',
            }}
          >
            <div>
              <div
                className="muted"
                style={{
                  fontSize:
                    '11px',
                  marginBottom:
                    '4px',
                }}
              >
                PLANEJAMENTO QS
              </div>

              <strong
                style={{
                  display:
                    'block',
                  fontSize:
                    '17px',
                  lineHeight:
                    1.3,
                }}
              >
                Ressuprimento de{' '}
                {formatarData(
                  selecionado.dataReferencia
                )}
              </strong>
            </div>

            <Status
              status={
                selecionado.status
              }
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '8px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Data de referência"
                valor={formatarData(
                  selecionado.dataReferencia
                )}
                destaque
              />
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Gêneros"
                valor={
                  selecionado.itens
                    ?.length || 0
                }
                destaque
              />
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: '19px',
            paddingTop: '17px',
            borderTop:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '9px',
              alignItems:
                'flex-start',
              marginBottom:
                '12px',
            }}
          >
            <span
              style={{
                fontSize: '19px',
              }}
            >
              ⚙
            </span>

            <div>
              <strong>
                Parâmetros utilizados
              </strong>

              <div
                className="muted"
                style={{
                  marginTop:
                    '3px',
                  fontSize:
                    '12px',
                }}
              >
                Configuração utilizada
                no cálculo deste
                planejamento.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(105px, 1fr))',
              gap: '8px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Histórico considerado"
                valor={`${selecionado.mesesHistorico} mês(es)`}
              />
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Ciclo planejado"
                valor={`${selecionado.mesesCiclo} mês(es)`}
              />
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Margem de segurança"
                valor={`${formatarNumero(
                  selecionado.margemSegurancaPercent
                )}%`}
              />
            </div>
          </div>

          {selecionado.observacao && (
            <div
              style={{
                marginTop:
                  '11px',
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize:
                    '11px',
                  marginBottom:
                    '5px',
                }}
              >
                Observação geral
              </div>

              <div
                style={{
                  fontSize:
                    '13px',
                  lineHeight:
                    1.5,
                  whiteSpace:
                    'pre-wrap',
                }}
              >
                {
                  selecionado.observacao
                }
              </div>
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: '19px',
            paddingTop: '17px',
            borderTop:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              marginBottom:
                '13px',
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Memória do cálculo
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '4px 0 0',
                fontSize:
                  '12px',
                lineHeight:
                  1.45,
              }}
            >
              Os valores abaixo
              representam a situação
              utilizada no momento em
              que este planejamento foi
              salvo.
            </p>
          </div>

          {!selecionado.itens ||
          selecionado.itens.length ===
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
                Este planejamento não
                possui gêneros
                registrados.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              {selecionado.itens.map(
                (item: any) => {
                  const alterado =
                    Math.abs(
                      Number(
                        item.quantidadePlanejada
                      ) -
                        Number(
                          item.quantidadeSugerida
                        )
                    ) >
                    0.0005;

                  return (
                    <article
                      key={item.id}
                      style={{
                        padding:
                          '13px',
                        borderRadius:
                          '13px',
                        background:
                          '#0c1811',
                        border:
                          alterado
                            ? '1px solid rgba(214,165,109,.6)'
                            : '1px solid #284334',
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
                          gap: '10px',
                          paddingBottom:
                            '10px',
                          marginBottom:
                            '10px',
                          borderBottom:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <div>
                          <strong>
                            {item.genero}
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '3px',
                              fontSize:
                                '11px',
                              lineHeight:
                                1.35,
                            }}
                          >
                            {origemTexto(
                              item.origemMedia
                            )}
                          </div>
                        </div>

                        <span
                          style={{
                            flexShrink: 0,
                            fontSize:
                              '12px',
                            fontWeight:
                              700,
                          }}
                        >
                          {item.unidade}
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
                          titulo="Média/mês"
                          valor={formatarNumero(
                            item.mediaMensalUtilizada
                          )}
                        />

                        <Dado
                          titulo="Projeção"
                          valor={formatarNumero(
                            item.consumoProjetado
                          )}
                        />

                        <Dado
                          titulo="Segurança"
                          valor={formatarNumero(
                            item.estoqueSeguranca
                          )}
                        />

                        <Dado
                          titulo="Estoque"
                          valor={formatarNumero(
                            item.estoqueDisponivel
                          )}
                        />

                        <Dado
                          titulo="Prev. receber"
                          valor={formatarNumero(
                            item.previstoReceber
                          )}
                        />

                        <Dado
                          titulo="Sugerido"
                          valor={formatarNumero(
                            item.quantidadeSugerida
                          )}
                          destaque
                        />
                      </div>

                      <div
                        style={{
                          marginTop:
                            '11px',
                          padding:
                            '11px',
                          borderRadius:
                            '10px',
                          background:
                            alterado
                              ? 'rgba(214,165,109,.08)'
                              : 'rgba(43,138,87,.07)',
                          border:
                            alterado
                              ? '1px solid rgba(214,165,109,.45)'
                              : '1px solid rgba(43,138,87,.35)',
                        }}
                      >
                        <Dado
                          titulo="Quantidade planejada"
                          valor={formatarNumero(
                            item.quantidadePlanejada
                          )}
                          destaque
                        />

                        <div
                          style={{
                            marginTop:
                              '8px',
                            paddingTop:
                              '8px',
                            borderTop:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div
                            className="muted"
                            style={{
                              fontSize:
                                '11px',
                              marginBottom:
                                '3px',
                            }}
                          >
                            {alterado
                              ? 'Justificativa da alteração'
                              : 'Decisão'}
                          </div>

                          <div
                            style={{
                              fontSize:
                                '13px',
                              lineHeight:
                                1.45,
                            }}
                          >
                            {alterado
                              ? item.justificativaAlteracao ||
                                '—'
                              : 'Quantidade sugerida mantida'}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section
          style={{
            marginTop: '19px',
            paddingTop: '17px',
            borderTop:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '9px',
              alignItems:
                'flex-start',
              marginBottom:
                '12px',
            }}
          >
            <span
              style={{
                fontSize: '19px',
              }}
            >
              ✓
            </span>

            <div>
              <strong>
                Registro administrativo
              </strong>

              <div
                className="muted"
                style={{
                  marginTop:
                    '3px',
                  fontSize:
                    '12px',
                }}
              >
                Responsável e datas
                vinculadas ao
                planejamento.
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '9px',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <Dado
                titulo="Responsável"
                valor={
                  [
                    selecionado
                      .responsavel
                      ?.postoGraduacao,
                    selecionado
                      .responsavel
                      ?.nome,
                  ]
                    .filter(Boolean)
                    .join(' ') ||
                  '—'
                }
                destaque
              />

              {selecionado
                .responsavel
                ?.funcao && (
                <div
                  className="muted"
                  style={{
                    marginTop:
                      '5px',
                    fontSize:
                      '12px',
                  }}
                >
                  {
                    selecionado
                      .responsavel
                      .funcao
                  }
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '9px',
              }}
            >
              <div
                style={{
                  padding:
                    '12px',
                  borderRadius:
                    '11px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <Dado
                  titulo="Criado em"
                  valor={formatarDataHora(
                    selecionado.criadoEm
                  )}
                />
              </div>

              <div
                style={{
                  padding:
                    '12px',
                  borderRadius:
                    '11px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <Dado
                  titulo="Finalizado em"
                  valor={formatarDataHora(
                    selecionado.finalizadoEm
                  )}
                />
              </div>
            </div>
          </div>

          <div
            className="muted"
            style={{
              marginTop: '11px',
              fontSize: '10px',
              lineHeight: 1.4,
              wordBreak:
                'break-all',
            }}
          >
            Identificação:{' '}
            {selecionado.id}
          </div>
        </section>

        {selecionado.status ===
          'FINALIZADO' &&
          Number(
            selecionado.mesesCiclo
          ) === 2 && (
            <section
              style={{
                marginTop: '19px',
                paddingTop: '17px',
                borderTop:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >
              <strong
                style={{
                  fontSize: '16px',
                }}
              >
                Ressuprimentos complementares
              </strong>

              <p
                className="muted"
                style={{
                  margin:
                    '5px 0 11px',
                  fontSize:
                    '12px',
                  lineHeight:
                    1.5,
                }}
              >
                Consulte os complementares já registrados neste ciclo ou registre uma necessidade extraordinária sem alterar o planejamento original.
              </p>

              <Link
                href={`/qdaa/ressuprimento-complementar?planejamentoId=${encodeURIComponent(
                  selecionado.id
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
                Ver / registrar complementar
              </Link>
            </section>
          )}
      </>
    );
  }

  return (
    <>
      <section>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems:
              'flex-start',
          }}
        >
          <span
            style={{
              fontSize: '20px',
            }}
          >
            ◷
          </span>

          <div>
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Histórico dos
              Ressuprimentos QS
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '4px 0 0',
                fontSize:
                  '12px',
                lineHeight:
                  1.45,
              }}
            >
              Consulte os
              planejamentos salvos e
              finalizados
              anteriormente.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn"
          onClick={
            carregarHistorico
          }
          disabled={
            carregando
          }
          style={{
            width: '100%',
            marginTop: '13px',
          }}
        >
          {carregando
            ? 'Atualizando...'
            : 'Atualizar histórico'}
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

      {carregando ? (
        <div
          style={{
            marginTop: '15px',
            padding: '14px',
            borderRadius: '12px',
            background: '#0c1811',
            border:
              '1px solid #284334',
          }}
        >
          <span className="muted">
            Carregando histórico...
          </span>
        </div>
      ) : planejamentos.length ===
        0 ? (
        <div
          style={{
            marginTop: '15px',
            padding: '14px',
            borderRadius: '12px',
            background: '#0c1811',
            border:
              '1px solid #284334',
          }}
        >
          <span className="muted">
            Ainda não existem
            planejamentos de
            Ressuprimento QS
            registrados.
          </span>
        </div>
      ) : (
        <section
          style={{
            marginTop: '19px',
            paddingTop: '17px',
            borderTop:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'space-between',
              gap: '10px',
              marginBottom:
                '12px',
            }}
          >
            <strong>
              Planejamentos
              registrados
            </strong>

            <span
              className="muted"
              style={{
                fontSize: '11px',
              }}
            >
              {
                planejamentos.length
              }{' '}
              registro(s)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '10px',
            }}
          >
            {planejamentos.map(
              (item: any) => (
                <article
                  key={item.id}
                  style={{
                    padding: '13px',
                    borderRadius:
                      '13px',
                    background:
                      '#0c1811',
                    border:
                      item.status ===
                      'FINALIZADO'
                        ? '1px solid #284334'
                        : '1px solid rgba(214,165,109,.55)',
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'flex-start',
                      justifyContent:
                        'space-between',
                      gap: '10px',
                      paddingBottom:
                        '10px',
                      marginBottom:
                        '10px',
                      borderBottom:
                        '1px solid rgba(255,255,255,.07)',
                    }}
                  >
                    <div>
                      <div
                        className="muted"
                        style={{
                          fontSize:
                            '10px',
                          marginBottom:
                            '3px',
                        }}
                      >
                        DATA DE
                        REFERÊNCIA
                      </div>

                      <strong
                        style={{
                          fontSize:
                            '16px',
                        }}
                      >
                        {formatarData(
                          item.dataReferencia
                        )}
                      </strong>
                    </div>

                    <Status
                      status={
                        item.status
                      }
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(2, minmax(0, 1fr))',
                      gap:
                        '11px 14px',
                    }}
                  >
                    <Dado
                      titulo="Histórico"
                      valor={`${item.mesesHistorico} mês(es)`}
                    />

                    <Dado
                      titulo="Ciclo"
                      valor={`${item.mesesCiclo} mês(es)`}
                    />

                    <Dado
                      titulo="Margem"
                      valor={`${formatarNumero(
                        item.margemSegurancaPercent
                      )}%`}
                    />

                    <Dado
                      titulo="Gêneros"
                      valor={
                        item.quantidadeGeneros
                      }
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
                      titulo="Responsável"
                      valor={
                        [
                          item
                            .responsavel
                            ?.postoGraduacao,
                          item
                            .responsavel
                            ?.nome,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            ' '
                          ) || '—'
                      }
                    />

                    <div
                      style={{
                        marginTop:
                          '9px',
                      }}
                    >
                      <Dado
                        titulo="Finalizado em"
                        valor={formatarDataHora(
                          item.finalizadoEm
                        )}
                      />
                    </div>
                  </div>

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
                    style={{
                      width: '100%',
                      marginTop:
                        '12px',
                    }}
                  >
                    {carregandoDetalhe
                      ? 'Abrindo...'
                      : 'Abrir planejamento'}
                  </button>
                </article>
              )
            )}
          </div>
        </section>
      )}
    </>
  );
}

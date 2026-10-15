'use client';

import { useEffect, useMemo, useState } from 'react';

const TIME_ZONE = 'America/Campo_Grande';

const nomesMovimentacao: Record<string, string> = {
  SALDO_INICIAL: 'Estoque inicial cadastrado',
  RECEBIMENTO: 'Recebimento',
  SAIDA: 'Saída',
  DEVOLUCAO: 'Devolução',
  PERDA: 'Perda / descarte',
  CORRECAO: 'Correção',
  TRANSFERENCIA: 'Transferência',
};

const nomesRefeicao: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  OUTRO: 'Outro',
};

function dataHojeCorumba() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const ano =
    partes.find((p) => p.type === 'year')?.value || '';

  const mes =
    partes.find((p) => p.type === 'month')?.value || '';

  const dia =
    partes.find((p) => p.type === 'day')?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function formatarData(valor: string) {
  if (!valor) return '—';

  const data = valor.slice(0, 10);
  const [ano, mes, dia] = data.split('-');

  if (!ano || !mes || !dia) {
    return valor;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(valor: string) {
  if (!valor) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(valor));
}

function formatarNumero(valor: number) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

function gerarDias(inicio: string, fim: string) {
  const resultado: string[] = [];

  const atual = new Date(
    `${inicio.slice(0, 10)}T12:00:00.000Z`
  );

  const final = new Date(
    `${fim.slice(0, 10)}T12:00:00.000Z`
  );

  while (atual <= final) {
    resultado.push(
      atual.toISOString().slice(0, 10)
    );

    atual.setUTCDate(
      atual.getUTCDate() + 1
    );
  }

  return resultado;
}

function temMovimento(item: any) {
  return (
    Number(item.saldoInicial || 0) !== 0 ||
    Number(item.recebimentos || 0) !== 0 ||
    Number(item.saidas || 0) !== 0 ||
    Number(item.devolucoes || 0) !== 0 ||
    Number(item.perdas || 0) !== 0 ||
    Number(item.correcoes || 0) !== 0 ||
    Number(item.transferencias || 0) !== 0
  );
}

export default function RelatoriosClient() {
  const hoje = dataHojeCorumba();

  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [classe, setClasse] = useState('TODOS');

  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] =
    useState(false);

  async function carregar() {
    if (!inicio || !fim) {
      setErro(
        'Informe a data inicial e a data final.'
      );
      return;
    }

    if (inicio > fim) {
      setErro(
        'A data inicial não pode ser posterior à data final.'
      );
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
        `/api/relatorios?inicio=${encodeURIComponent(
          inicio
        )}&fim=${encodeURIComponent(
          fim
        )}&classe=${encodeURIComponent(
          classe
        )}`,
        {
          cache: 'no-store',
        }
      );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Erro ao gerar relatório.'
        );
        return;
      }

      setDados(json);
    } catch {
      setErro(
        'Não foi possível gerar o relatório.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dias =
    dados && inicio && fim
      ? gerarDias(inicio, fim)
      : [];

  const arranchamentos =
    dados?.arranchamentos ||
    dados?.efetivos ||
    [];

  const totalPrevisto =
    arranchamentos.reduce(
      (total: number, item: any) =>
        total +
        Number(
          item.totalPrevisto || 0
        ),
      0
    );

  const totalPlanejamento =
    arranchamentos.reduce(
      (total: number, item: any) =>
        total +
        Number(
          item.efetivoPlanejamento || 0
        ),
      0
    );

  const registrosFechados =
    arranchamentos.filter(
      (item: any) =>
        Boolean(
          item.fechamentoRealizadoEm
        )
    );

  const existeFechamento =
    registrosFechados.length > 0;

  const totalAtendido =
    registrosFechados.reduce(
      (total: number, item: any) =>
        total +
        Number(
          item.totalAtendido ?? 0
        ),
      0
    );

  const totalSobras =
    registrosFechados.reduce(
      (total: number, item: any) =>
        total +
        Number(
          item.sobraKg ?? 0
        ),
      0
    );

  const parametrosExportacao =
    `inicio=${encodeURIComponent(inicio)}` +
    `&fim=${encodeURIComponent(fim)}` +
    `&classe=${encodeURIComponent(classe)}`;

  const urlExcel =
    `/api/relatorios/excel?${parametrosExportacao}`;

  const urlPdf =
    `/api/relatorios/pdf?${parametrosExportacao}`;

  const grupos = useMemo(() => {
    const resultado = new Map<
      string,
      Map<string, any[]>
    >();

    const generos =
      dados?.generos || [];

    for (const genero of generos) {
      const nomeGrupo =
        genero.grupo ||
        'Sem grupo';

      const nomeCategoria =
        genero.categoria ||
        'Sem categoria';

      if (
        !resultado.has(
          nomeGrupo
        )
      ) {
        resultado.set(
          nomeGrupo,
          new Map()
        );
      }

      const categorias =
        resultado.get(
          nomeGrupo
        )!;

      if (
        !categorias.has(
          nomeCategoria
        )
      ) {
        categorias.set(
          nomeCategoria,
          []
        );
      }

      categorias
        .get(nomeCategoria)!
        .push(genero);
    }

    return resultado;
  }, [dados]);

  const totalGenerosMovimentados =
    (dados?.generos || []).filter(
      (item: any) =>
        temMovimento(item)
    ).length;

  const totalSaidas =
    (dados?.generos || []).filter(
      (item: any) =>
        Number(
          item.saidas || 0
        ) > 0
    ).length;

  const totalAlertas =
    Number(
      dados?.estoqueBaixo?.length || 0
    ) +
    Number(
      dados?.validade?.length || 0
    );

  return (
    <>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                marginBottom: 6,
              }}
            >
              Relatório operacional
            </h2>

            <p
              className="muted"
              style={{
                margin: 0,
              }}
            >
              Consulte movimentações,
              efetivo e alertas do
              Aprovisionamento.
            </p>
          </div>

          <div
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              background:
                'rgba(34,197,94,0.10)',
              border:
                '1px solid rgba(34,197,94,0.35)',
              fontSize: 13,
            }}
          >
            Horário operacional:
            Corumbá / Campo Grande
          </div>
        </div>

        <div
          className="grid"
          style={{
            marginTop: 18,
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

          <label>
            Classe
            <select
              value={classe}
              onChange={(e) =>
                setClasse(
                  e.target.value
                )
              }
            >
              <option value="TODOS">
                QS + QR
              </option>

              <option value="QS">
                QS
              </option>

              <option value="QR">
                QR
              </option>
            </select>
          </label>
        </div>

        <div
          className="actions"
          style={{
            marginTop: 14,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn"
            onClick={carregar}
            disabled={carregando}
          >
            {carregando
              ? 'Gerando...'
              : 'Visualizar relatório'}
          </button>

          <a
            className="btn secondary"
            href={urlExcel}
            download
          >
            Baixar Excel
          </a>

          <a
            className="btn secondary"
            href={urlPdf}
            download
          >
            Baixar PDF
          </a>
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
              Situação do período
            </h2>

            <div className="grid">
              <div className="card">
                <span className="muted">
                  Efetivo previsto
                </span>

                <div className="big">
                  {totalPrevisto}
                </div>
              </div>

              <div className="card">
                <span className="muted">
                  Efetivo para planejamento
                </span>

                <div className="big">
                  {totalPlanejamento}
                </div>
              </div>

              <div className="card">
                <span className="muted">
                  Total atendido
                </span>

                <div className="big">
                  {existeFechamento
                    ? totalAtendido
                    : '—'}
                </div>
              </div>

              <div className="card">
                <span className="muted">
                  Sobras pesadas
                </span>

                <div className="big">
                  {existeFechamento
                    ? `${formatarNumero(
                        totalSobras
                      )} kg`
                    : '—'}
                </div>
              </div>
            </div>

            <div
              className="grid"
              style={{
                marginTop: 12,
              }}
            >
              <div className="card">
                <span className="muted">
                  Gêneros movimentados
                </span>

                <div className="big">
                  {
                    totalGenerosMovimentados
                  }
                </div>
              </div>

              <div className="card">
                <span className="muted">
                  Gêneros com saída
                </span>

                <div className="big">
                  {totalSaidas}
                </div>
              </div>

              <div
                className="card"
                style={{
                  border:
                    totalAlertas > 0
                      ? '2px solid #f59e0b'
                      : undefined,
                  background:
                    totalAlertas > 0
                      ? 'rgba(245,158,11,0.08)'
                      : undefined,
                }}
              >
                <span
                  style={{
                    color:
                      totalAlertas > 0
                        ? '#facc15'
                        : undefined,
                    fontWeight: 700,
                  }}
                >
                  Alertas ativos
                </span>

                <div className="big">
                  {totalAlertas}
                </div>
              </div>
            </div>

            {!existeFechamento &&
              arranchamentos.length >
                0 && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 10,
                    border:
                      '1px solid #f59e0b',
                    background:
                      'rgba(245,158,11,0.08)',
                    color:
                      '#fde68a',
                  }}
                >
                  ⚠ Existem
                  arranchamentos com
                  fechamento pendente.
                  Atendimento e sobras
                  ainda não foram
                  totalmente apurados.
                </div>
              )}
          </div>

          <div className="card">
            <h2>
              Movimentação dos gêneros
            </h2>

            <p className="muted">
              Os gêneros são apresentados
              por Grupo → Categoria →
              Gênero. As quantidades não
              são somadas entre unidades
              diferentes.
            </p>

            {grupos.size === 0 ? (
              <p className="muted">
                Nenhum gênero encontrado
                para os critérios
                selecionados.
              </p>
            ) : (
              Array.from(
                grupos.entries()
              ).map(
                ([
                  grupo,
                  categorias,
                ]) => (
                  <section
                    key={grupo}
                    style={{
                      marginTop: 20,
                      border:
                        '1px solid rgba(34,197,94,0.35)',
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '14px 16px',
                        background:
                          'rgba(22,101,52,0.35)',
                        borderBottom:
                          '1px solid rgba(34,197,94,0.35)',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {grupo}
                      </strong>
                    </div>

                    {Array.from(
                      categorias.entries()
                    ).map(
                      ([
                        categoria,
                        generos,
                      ]) => (
                        <div
                          key={`${grupo}-${categoria}`}
                          style={{
                            padding: 16,
                            borderBottom:
                              '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div
                            style={{
                              marginBottom: 12,
                              fontWeight: 700,
                              opacity: 0.9,
                            }}
                          >
                            {categoria}
                          </div>

                          {generos.map(
                            (
                              item: any
                            ) => (
                              <div
                                key={
                                  item.generoId
                                }
                                style={{
                                  marginBottom:
                                    12,
                                  padding: 14,
                                  borderRadius:
                                    12,
                                  border:
                                    '1px solid rgba(255,255,255,0.12)',
                                  background:
                                    'rgba(255,255,255,0.025)',
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      'flex',
                                    justifyContent:
                                      'space-between',
                                    alignItems:
                                      'center',
                                    gap: 12,
                                    flexWrap:
                                      'wrap',
                                  }}
                                >
                                  <div>
                                    <strong
                                      style={{
                                        fontSize:
                                          16,
                                      }}
                                    >
                                      {
                                        item.nome
                                      }
                                    </strong>

                                    <div
                                      className="muted"
                                      style={{
                                        marginTop:
                                          3,
                                      }}
                                    >
                                      {
                                        item.classe
                                      }{' '}
                                      ·{' '}
                                      {
                                        item.unidade
                                      }
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      textAlign:
                                        'right',
                                    }}
                                  >
                                    <span className="muted">
                                      Saldo atual
                                    </span>

                                    <div
                                      style={{
                                        fontSize:
                                          22,
                                        fontWeight:
                                          800,
                                      }}
                                    >
                                      {formatarNumero(
                                        item.saldoAtual
                                      )}{' '}
                                      {
                                        item.unidade
                                      }
                                    </div>
                                  </div>
                                </div>

                                {temMovimento(
                                  item
                                ) ? (
                                  <div
                                    style={{
                                      display:
                                        'grid',
                                      gridTemplateColumns:
                                        'repeat(auto-fit, minmax(135px, 1fr))',
                                      gap: 8,
                                      marginTop:
                                        14,
                                    }}
                                  >
                                    {Number(
                                      item.saldoInicial ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Estoque
                                          inicial
                                          cadastrado
                                        </span>

                                        <strong>
                                          {formatarNumero(
                                            item.saldoInicial
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.recebimentos ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Entradas
                                        </span>

                                        <strong>
                                          +
                                          {formatarNumero(
                                            item.recebimentos
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.saidas ||
                                        0
                                    ) !==
                                      0 && (
                                      <div
                                        className="card"
                                        style={{
                                          border:
                                            '1px solid rgba(239,68,68,0.40)',
                                        }}
                                      >
                                        <span className="muted">
                                          Saídas
                                        </span>

                                        <strong>
                                          −
                                          {formatarNumero(
                                            item.saidas
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.devolucoes ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Devoluções
                                        </span>

                                        <strong>
                                          +
                                          {formatarNumero(
                                            item.devolucoes
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.perdas ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Perdas
                                        </span>

                                        <strong>
                                          −
                                          {formatarNumero(
                                            item.perdas
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.correcoes ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Correções
                                        </span>

                                        <strong>
                                          {formatarNumero(
                                            item.correcoes
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}

                                    {Number(
                                      item.transferencias ||
                                        0
                                    ) !==
                                      0 && (
                                      <div className="card">
                                        <span className="muted">
                                          Transferências
                                        </span>

                                        <strong>
                                          {formatarNumero(
                                            item.transferencias
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p
                                    className="muted"
                                    style={{
                                      marginBottom:
                                        0,
                                      marginTop: 12,
                                    }}
                                  >
                                    Sem
                                    movimentação
                                    neste período.
                                  </p>
                                )}

                                {item
                                  .movimentacoes
                                  ?.length >
                                  0 && (
                                  <details
                                    style={{
                                      marginTop:
                                        12,
                                    }}
                                  >
                                    <summary
                                      style={{
                                        cursor:
                                          'pointer',
                                        fontWeight:
                                          700,
                                      }}
                                    >
                                      Ver
                                      movimentações
                                      do período
                                    </summary>

                                    <div
                                      style={{
                                        marginTop:
                                          10,
                                      }}
                                    >
                                      {item.movimentacoes.map(
                                        (
                                          mov: any
                                        ) => (
                                          <div
                                            key={
                                              mov.id
                                            }
                                            className="row"
                                            style={{
                                              gap: 12,
                                              flexWrap:
                                                'wrap',
                                            }}
                                          >
                                            <span>
                                              <strong>
                                                {nomesMovimentacao[
                                                  mov
                                                    .tipo
                                                ] ||
                                                  mov.tipo}
                                              </strong>
                                              {' · '}
                                              {formatarNumero(
                                                mov.quantidade
                                              )}{' '}
                                              {
                                                item.unidade
                                              }
                                            </span>

                                            <span>
                                              {formatarDataHora(
                                                mov.dataHora
                                              )}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )
                    )}
                  </section>
                )
              )
            )}
          </div>

          <div className="card">
            <h2>
              Alertas de estoque
            </h2>

            {dados.estoqueBaixo
              .length === 0 &&
            dados.validade.length ===
              0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border:
                    '1px solid rgba(34,197,94,0.35)',
                  background:
                    'rgba(34,197,94,0.06)',
                }}
              >
                ✓ Nenhum alerta de
                estoque nos critérios
                atuais.
              </div>
            ) : (
              <>
                {dados.estoqueBaixo.map(
                  (item: any) => (
                    <div
                      key={`baixo-${item.id}`}
                      style={{
                        padding: 14,
                        marginTop: 10,
                        borderRadius: 12,
                        border:
                          '2px solid #f59e0b',
                        background:
                          'rgba(245,158,11,0.10)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          gap: 12,
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <strong
                          style={{
                            color:
                              '#facc15',
                          }}
                        >
                          ⚠ ESTOQUE BAIXO
                        </strong>

                        <strong>
                          {item.nome}
                        </strong>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Saldo atual:{' '}
                        <strong>
                          {formatarNumero(
                            item.qtd
                          )}{' '}
                          {item.unidade}
                        </strong>
                        {' · '}
                        Estoque mínimo:{' '}
                        <strong>
                          {formatarNumero(
                            item.min
                          )}{' '}
                          {item.unidade}
                        </strong>
                      </div>
                    </div>
                  )
                )}

                {dados.validade.map(
                  (
                    item: any,
                    indice: number
                  ) => {
                    const vencida =
                      new Date(
                        item.validade
                      ).getTime() <
                      Date.now();

                    return (
                      <div
                        key={`validade-${indice}`}
                        style={{
                          padding: 14,
                          marginTop: 10,
                          borderRadius:
                            12,
                          border: vencida
                            ? '2px solid #ef4444'
                            : '2px solid #f59e0b',
                          background:
                            vencida
                              ? 'rgba(239,68,68,0.10)'
                              : 'rgba(245,158,11,0.10)',
                        }}
                      >
                        <strong
                          style={{
                            color:
                              vencida
                                ? '#f87171'
                                : '#facc15',
                          }}
                        >
                          {vencida
                            ? '⛔ LOTE VENCIDO'
                            : '⚠ VALIDADE PRÓXIMA'}
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                          }}
                        >
                          <strong>
                            {
                              item.genero
                            }
                          </strong>
                          {' · '}
                          Lote{' '}
                          {item.lote ||
                            '—'}
                        </div>

                        <div
                          className="muted"
                          style={{
                            marginTop: 4,
                          }}
                        >
                          Validade:{' '}
                          {formatarData(
                            item.validade
                          )}
                          {' · '}
                          {formatarNumero(
                            item.quantidade
                          )}{' '}
                          {item.unidade}
                        </div>
                      </div>
                    );
                  }
                )}
              </>
            )}
          </div>

          <div className="card">
            <h2>
              Arranchamento / Efetivo
            </h2>

            <p className="muted">
              Situação diária do
              planejamento e do
              fechamento das refeições.
            </p>

            {dias.map((dia) => {
              const registrosDoDia =
                arranchamentos.filter(
                  (item: any) =>
                    String(
                      item.data
                    ).slice(
                      0,
                      10
                    ) === dia
                );

              if (
                registrosDoDia.length ===
                0
              ) {
                return (
                  <div
                    key={dia}
                    style={{
                      padding: 14,
                      marginTop: 10,
                      borderRadius: 12,
                      border:
                        '1px solid #f59e0b',
                      background:
                        'rgba(245,158,11,0.06)',
                    }}
                  >
                    <div className="row">
                      <strong>
                        {formatarData(
                          dia
                        )}
                      </strong>

                      <strong
                        style={{
                          color:
                            '#facc15',
                        }}
                      >
                        ⚠ Sem lançamento
                      </strong>
                    </div>
                  </div>
                );
              }

              const diaFechado =
                registrosDoDia.every(
                  (item: any) =>
                    Boolean(
                      item.fechamentoRealizadoEm
                    )
                );

              return (
                <div
                  key={dia}
                  style={{
                    padding: 14,
                    marginTop: 10,
                    borderRadius: 12,
                    border: diaFechado
                      ? '1px solid #22c55e'
                      : '1px solid #f59e0b',
                    background:
                      diaFechado
                        ? 'rgba(34,197,94,0.05)'
                        : 'rgba(245,158,11,0.06)',
                  }}
                >
                  <div className="row">
                    <strong>
                      {formatarData(
                        dia
                      )}
                    </strong>

                    <strong
                      style={{
                        color:
                          diaFechado
                            ? '#4ade80'
                            : '#facc15',
                      }}
                    >
                      {diaFechado
                        ? '✓ Fechado'
                        : '⚠ Fechamento pendente'}
                    </strong>
                  </div>

                  {registrosDoDia.map(
                    (item: any) => {
                      const fechado =
                        Boolean(
                          item.fechamentoRealizadoEm
                        );

                      return (
                        <div
                          key={item.id}
                          style={{
                            marginTop:
                              14,
                            paddingTop:
                              12,
                            borderTop:
                              '1px solid rgba(255,255,255,0.10)',
                          }}
                        >
                          <strong>
                            {nomesRefeicao[
                              item
                                .refeicao
                            ] ||
                              item.refeicao.replaceAll(
                                '_',
                                ' '
                              )}
                          </strong>

                          <div
                            style={{
                              display:
                                'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(145px, 1fr))',
                              gap: 8,
                              marginTop:
                                10,
                            }}
                          >
                            <div>
                              <span className="muted">
                                Previsto
                              </span>
                              <div>
                                <strong>
                                  {
                                    item.totalPrevisto
                                  }
                                </strong>
                              </div>
                            </div>

                            <div>
                              <span className="muted">
                                Planejamento
                              </span>
                              <div>
                                <strong>
                                  {
                                    item.efetivoPlanejamento
                                  }
                                </strong>
                              </div>
                            </div>

                            <div>
                              <span className="muted">
                                Atendido
                              </span>
                              <div>
                                <strong>
                                  {fechado
                                    ? item.totalAtendido
                                    : '—'}
                                </strong>
                              </div>
                            </div>

                            <div>
                              <span className="muted">
                                Sobra
                              </span>
                              <div>
                                <strong>
                                  {fechado
                                    ? `${formatarNumero(
                                        item.sobraKg
                                      )} kg`
                                    : '—'}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {item.observacao && (
                            <p
                              className="muted"
                              style={{
                                marginBottom:
                                  0,
                              }}
                            >
                              Observação:{' '}
                              {
                                item.observacao
                              }
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

const TIME_ZONE =
  'America/Campo_Grande';

const nomesRefeicao: Record<
  string,
  string
> = {
  CAFE_DA_MANHA:
    'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE:
    'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

type OpcoesRelatorio = {
  efetivo: boolean;
  refeicoes: boolean;
  entradas: boolean;
  saidas: boolean;
  devolucoes: boolean;
  estoque: boolean;
};

const opcoesIniciais: OpcoesRelatorio =
  {
    efetivo: true,
    refeicoes: true,
    entradas: true,
    saidas: true,
    devolucoes: true,
    estoque: true,
  };

function dataHojeLocal() {
  const partes =
    new Intl.DateTimeFormat(
      'en-CA',
      {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).formatToParts(
      new Date()
    );

  const ano =
    partes.find(
      (p) =>
        p.type === 'year'
    )?.value || '';

  const mes =
    partes.find(
      (p) =>
        p.type === 'month'
    )?.value || '';

  const dia =
    partes.find(
      (p) =>
        p.type === 'day'
    )?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function formatarData(
  valor: string
) {
  if (!valor) {
    return '—';
  }

  const data =
    valor.slice(0, 10);

  const [
    ano,
    mes,
    dia,
  ] = data.split('-');

  if (
    !ano ||
    !mes ||
    !dia
  ) {
    return valor;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(
  valor: string
) {
  if (!valor) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      timeZone: TIME_ZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
  ).format(
    new Date(valor)
  );
}

function formatarNumero(
  valor:
    | number
    | null
    | undefined
) {
  return Number(
    valor || 0
  ).toLocaleString(
    'pt-BR',
    {
      maximumFractionDigits:
        3,
    }
  );
}

function parametrosOpcoes(
  opcoes: OpcoesRelatorio
) {
  const p =
    new URLSearchParams();

  p.set(
    'efetivo',
    opcoes.efetivo
      ? '1'
      : '0'
  );

  p.set(
    'refeicoes',
    opcoes.refeicoes
      ? '1'
      : '0'
  );

  p.set(
    'entradas',
    opcoes.entradas
      ? '1'
      : '0'
  );

  p.set(
    'saidas',
    opcoes.saidas
      ? '1'
      : '0'
  );

  p.set(
    'devolucoes',
    opcoes.devolucoes
      ? '1'
      : '0'
  );

  p.set(
    'estoque',
    opcoes.estoque
      ? '1'
      : '0'
  );

  return p;
}

function somarPorUnidade(
  itens: any[]
) {
  const totais =
    new Map<
      string,
      number
    >();

  for (
    const item of itens
  ) {
    const unidade =
      item.unidade ||
      'Sem unidade';

    totais.set(
      unidade,
      (totais.get(
        unidade
      ) || 0) +
        Number(
          item.quantidade ||
            0
        )
    );
  }

  return Array.from(
    totais.entries()
  )
    .sort((a, b) =>
      a[0].localeCompare(
        b[0],
        'pt-BR'
      )
    )
    .map(
      ([
        unidade,
        quantidade,
      ]) => ({
        unidade,
        quantidade,
      })
    );
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

function BlocoResumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '11px',
        background: '#0c1811',
        border:
          '1px solid #284334',
      }}
    >
      <Dado
        titulo={titulo}
        valor={valor}
        destaque
      />
    </div>
  );
}

function TotaisPorUnidade({
  titulo,
  totais,
}: {
  titulo: string;
  totais: {
    unidade: string;
    quantidade: number;
  }[];
}) {
  if (
    totais.length === 0
  ) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '11px',
        paddingTop: '10px',
        borderTop:
          '1px solid rgba(255,255,255,.08)',
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: '11px',
          marginBottom: '7px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '7px',
          flexWrap: 'wrap',
        }}
      >
        {totais.map(
          (total) => (
            <span
              key={
                total.unidade
              }
              style={{
                display:
                  'inline-flex',
                padding:
                  '6px 9px',
                borderRadius:
                  '999px',
                background:
                  '#183d2a',
                border:
                  '1px solid #284334',
                fontSize:
                  '12px',
                fontWeight:
                  700,
              }}
            >
              {formatarNumero(
                total.quantidade
              )}{' '}
              {total.unidade}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function Movimentos({
  titulo,
  itens,
  mostrarDestino = false,
}: {
  titulo: string;
  itens: any[];
  mostrarDestino?: boolean;
}) {
  return (
    <section className="card">
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          {titulo}
        </h2>

        <span
          className="muted"
          style={{
            fontSize: '11px',
          }}
        >
          {itens.length}{' '}
          registro(s)
        </span>
      </div>

      {itens.length ===
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
            Nenhum registro no
            período selecionado.
          </span>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '9px',
          }}
        >
          {itens.map(
            (item) => (
              <article
                key={item.id}
                style={{
                  padding: '13px',
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
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'flex-start',
                    gap: '10px',
                    paddingBottom:
                      '9px',
                    marginBottom:
                      '9px',
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
                      flexShrink: 0,
                      padding:
                        '4px 7px',
                      borderRadius:
                        '999px',
                      background:
                        '#183d2a',
                      border:
                        '1px solid #284334',
                      fontSize:
                        '11px',
                      fontWeight:
                        800,
                    }}
                  >
                    {item.classe}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap:
                      '10px 14px',
                  }}
                >
                  <Dado
                    titulo="Quantidade"
                    valor={`${formatarNumero(
                      item.quantidade
                    )} ${
                      item.unidade
                    }`}
                    destaque
                  />

                  <Dado
                    titulo="Data / hora"
                    valor={formatarDataHora(
                      item.dataHora
                    )}
                  />

                  {mostrarDestino && (
                    <>
                      <Dado
                        titulo="Finalidade"
                        valor={
                          item.destinoNome ||
                          '—'
                        }
                      />

                      <Dado
                        titulo="Referência"
                        valor={
                          item.referenciaServico ||
                          '—'
                        }
                      />
                    </>
                  )}
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}

export default function RelatoriosClient() {
  const hoje =
    dataHojeLocal();

  const [
    inicio,
    setInicio,
  ] = useState(
    hoje
  );

  const [
    fim,
    setFim,
  ] = useState(
    hoje
  );

  const [
    classe,
    setClasse,
  ] = useState(
    'TODOS'
  );

  const [
    opcoes,
    setOpcoes,
  ] =
    useState<OpcoesRelatorio>(
      opcoesIniciais
    );

  const [
    dados,
    setDados,
  ] =
    useState<any>(
      null
    );

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    carregando,
    setCarregando,
  ] =
    useState(false);

  async function carregar() {
    setErro('');

    if (
      !inicio ||
      !fim
    ) {
      setErro(
        'Informe a data inicial e a data final.'
      );

      return;
    }

    if (
      inicio > fim
    ) {
      setErro(
        'A data inicial não pode ser posterior à data final.'
      );

      return;
    }

    setCarregando(
      true
    );

    try {
      const params =
        new URLSearchParams(
          {
            inicio,
            fim,
            classe,
          }
        );

      const resposta =
        await fetch(
          `/api/relatorios?${params.toString()}`,
          {
            cache:
              'no-store',
          }
        );

      const json =
        await resposta.json();

      if (
        !resposta.ok
      ) {
        setErro(
          json.error ||
            'Não foi possível gerar o relatório.'
        );

        setDados(
          null
        );

        return;
      }

      setDados(
        json
      );
    } catch {
      setErro(
        'Não foi possível comunicar com o sistema.'
      );

      setDados(
        null
      );
    } finally {
      setCarregando(
        false
      );
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterarOpcao(
    campo:
      keyof OpcoesRelatorio
  ) {
    setOpcoes(
      (anterior) => ({
        ...anterior,
        [campo]:
          !anterior[
            campo
          ],
      })
    );
  }

  function urlExportacao(
    tipo:
      | 'pdf'
      | 'excel'
  ) {
    const params =
      parametrosOpcoes(
        opcoes
      );

    params.set(
      'inicio',
      inicio
    );

    params.set(
      'fim',
      fim
    );

    params.set(
      'classe',
      classe
    );

    return `/api/relatorios/${tipo}?${params.toString()}`;
  }

  const estoqueAgrupado =
    useMemo(() => {
      if (
        !dados?.posicaoEstoque
      ) {
        return [];
      }

      const grupos =
        new Map<
          string,
          any
        >();

      for (
        const item of
          dados.posicaoEstoque
      ) {
        const grupoNome =
          item.grupo ||
          'Sem grupo';

        if (
          !grupos.has(
            grupoNome
          )
        ) {
          grupos.set(
            grupoNome,
            {
              nome:
                grupoNome,

              categorias:
                new Map<
                  string,
                  any
                >(),

              itens: [],
            }
          );
        }

        const grupo =
          grupos.get(
            grupoNome
          );

        grupo.itens.push(
          item
        );

        const categoriaNome =
          item.categoria ||
          'Sem categoria';

        if (
          !grupo.categorias.has(
            categoriaNome
          )
        ) {
          grupo.categorias.set(
            categoriaNome,
            {
              nome:
                categoriaNome,

              itens: [],
            }
          );
        }

        grupo.categorias
          .get(
            categoriaNome
          )
          .itens.push(
            item
          );
      }

      return Array.from(
        grupos.values()
      )
        .sort(
          (a, b) =>
            a.nome.localeCompare(
              b.nome,
              'pt-BR'
            )
        )
        .map(
          (grupo) => ({
            ...grupo,

            totais:
              somarPorUnidade(
                grupo.itens
              ),

            categorias:
              Array.from(
                grupo.categorias.values()
              )
                .sort(
                  (
                    a: any,
                    b: any
                  ) =>
                    a.nome.localeCompare(
                      b.nome,
                      'pt-BR'
                    )
                )
                .map(
                  (
                    categoria: any
                  ) => ({
                    ...categoria,

                    itens:
                      categoria.itens.sort(
                        (
                          a: any,
                          b: any
                        ) =>
                          a.nome.localeCompare(
                            b.nome,
                            'pt-BR'
                          )
                      ),

                    totais:
                      somarPorUnidade(
                        categoria.itens
                      ),
                  })
                ),
          })
        );
    }, [dados]);

  const opcoesLista: {
    chave:
      keyof OpcoesRelatorio;
    titulo: string;
    descricao: string;
  }[] = [
    {
      chave: 'efetivo',
      titulo:
        'Efetivo por refeição',
      descricao:
        'Previsto, alimentado, faltas e militares de fora.',
    },
    {
      chave:
        'refeicoes',
      titulo:
        'Refeições relacionadas',
      descricao:
        'Refeições identificadas pelas saídas.',
    },
    {
      chave: 'entradas',
      titulo: 'Entradas',
      descricao:
        'Recebimentos registrados no período.',
    },
    {
      chave: 'saidas',
      titulo: 'Saídas',
      descricao:
        'Consumo e destinação dos gêneros.',
    },
    {
      chave:
        'devolucoes',
      titulo: 'Devoluções',
      descricao:
        'Materiais devolvidos ao estoque.',
    },
    {
      chave: 'estoque',
      titulo:
        'Posição do estoque',
      descricao:
        'Saldo atual por grupo e categoria.',
    },
  ];

  return (
    <>
      <section>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems:
              'flex-start',
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
              Relatório operacional
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
              Defina o período e a
              classe de gêneros que
              deseja consultar.
            </p>
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
              value={
                inicio
              }
              onChange={(
                e
              ) =>
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
              value={
                fim
              }
              onChange={(
                e
              ) =>
                setFim(
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Classe

            <select
              value={
                classe
              }
              onChange={(
                e
              ) =>
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
            ? 'Consultando...'
            : 'Visualizar relatório'}
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
              '12px',
          }}
        >
          <strong>
            O que incluir no relatório
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
            Marque as informações
            que deseja visualizar e
            exportar. Os alertas de
            estoque são sempre
            incluídos.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
          }}
        >
          {opcoesLista.map(
            (opcao) => (
              <label
                key={
                  opcao.chave
                }
                style={{
                  display:
                    'flex',
                  alignItems:
                    'flex-start',
                  gap: '10px',
                  padding:
                    '11px',
                  borderRadius:
                    '11px',
                  background:
                    opcoes[
                      opcao.chave
                    ]
                      ? 'rgba(43,138,87,.09)'
                      : '#0c1811',
                  border:
                    opcoes[
                      opcao.chave
                    ]
                      ? '1px solid rgba(43,138,87,.55)'
                      : '1px solid #284334',
                  cursor:
                    'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    opcoes[
                      opcao.chave
                    ]
                  }
                  onChange={() =>
                    alterarOpcao(
                      opcao.chave
                    )
                  }
                  style={{
                    marginTop:
                      '2px',
                    flexShrink: 0,
                  }}
                />

                <span>
                  <strong
                    style={{
                      display:
                        'block',
                      fontSize:
                        '13px',
                    }}
                  >
                    {opcao.titulo}
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
                      lineHeight:
                        1.35,
                    }}
                  >
                    {
                      opcao.descricao
                    }
                  </span>
                </span>
              </label>
            )
          )}
        </div>
      </section>

      {dados && (
        <>
          <section
            style={{
              marginTop:
                '19px',
              paddingTop:
                '17px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <strong>
              Exportar relatório
            </strong>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '8px',
                marginTop:
                  '10px',
              }}
            >
              <a
                className="btn"
                href={urlExportacao(
                  'pdf'
                )}
                target="_blank"
                rel="noreferrer"
                style={{
                  textAlign:
                    'center',
                  textDecoration:
                    'none',
                }}
              >
                PDF
              </a>

              <a
                className="btn"
                href={urlExportacao(
                  'excel'
                )}
                style={{
                  textAlign:
                    'center',
                  textDecoration:
                    'none',
                }}
              >
                Excel
              </a>
            </div>
          </section>

          {opcoes.efetivo && (
            <section className="card">
              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  gap: '10px',
                  marginBottom:
                    '12px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Efetivo por refeição
                </h2>

                <span
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  {
                    dados.efetivos
                      .length
                  }{' '}
                  registro(s)
                </span>
              </div>

              {dados.efetivos
                .length === 0 ? (
                <div
                  style={{
                    padding:
                      '13px',
                    borderRadius:
                      '11px',
                    background:
                      '#0c1811',
                    border:
                      '1px solid #284334',
                  }}
                >
                  <span className="muted">
                    Nenhum efetivo
                    registrado no
                    período.
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display:
                        'grid',
                      gap: '9px',
                    }}
                  >
                    {dados.efetivos.map(
                      (
                        item: any
                      ) => (
                        <article
                          key={
                            item.id
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
                              <strong>
                                {nomesRefeicao[
                                  item
                                    .refeicao
                                ] ||
                                  item.refeicao}
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
                                {formatarData(
                                  item.data
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                textAlign:
                                  'right',
                              }}
                            >
                              <div
                                className="muted"
                                style={{
                                  fontSize:
                                    '10px',
                                }}
                              >
                                ATENDIDO
                              </div>

                              <strong
                                style={{
                                  fontSize:
                                    '18px',
                                }}
                              >
                                {item.totalAtendido ??
                                  '—'}
                              </strong>
                            </div>
                          </div>

                          <div
                            style={{
                              display:
                                'grid',
                              gridTemplateColumns:
                                'repeat(2, minmax(0, 1fr))',
                              gap:
                                '10px 14px',
                            }}
                          >
                            <Dado
                              titulo="Efetivo previsto"
                              valor={
                                item.totalPrevisto
                              }
                            />

                            <Dado
                              titulo="Efetivo alimentado"
                              valor={
                                item.efetivoAlimentado ??
                                '—'
                              }
                            />

                            <Dado
                              titulo="Faltas"
                              valor={
                                item.faltas ??
                                '—'
                              }
                            />

                            <Dado
                              titulo="Militares de fora"
                              valor={
                                item.militaresDeFora ??
                                '—'
                              }
                            />
                          </div>
                        </article>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        'repeat(2, minmax(0, 1fr))',
                      gap: '8px',
                      marginTop:
                        '12px',
                    }}
                  >
                    <BlocoResumo
                      titulo="Refeições realizadas"
                      valor={
                        dados
                          .resumoEfetivo
                          .refeicoes
                      }
                    />

                    <BlocoResumo
                      titulo="Efetivo previsto"
                      valor={
                        dados
                          .resumoEfetivo
                          .efetivoPrevisto
                      }
                    />

                    <BlocoResumo
                      titulo="Efetivo alimentado"
                      valor={
                        dados
                          .resumoEfetivo
                          .efetivoAlimentado
                      }
                    />

                    <BlocoResumo
                      titulo="Faltas"
                      valor={
                        dados
                          .resumoEfetivo
                          .faltas
                      }
                    />

                    <BlocoResumo
                      titulo="Militares de fora"
                      valor={
                        dados
                          .resumoEfetivo
                          .militaresDeFora
                      }
                    />

                    <BlocoResumo
                      titulo="Total de atendimentos"
                      valor={
                        dados
                          .resumoEfetivo
                          .totalAtendido
                      }
                    />
                  </div>

                  <p
                    className="muted"
                    style={{
                      fontSize:
                        '11px',
                      lineHeight:
                        1.45,
                      margin:
                        '11px 0 0',
                    }}
                  >
                    O total de
                    atendimentos
                    representa as
                    refeições servidas
                    no período. A mesma
                    pessoa pode ter
                    participado de mais
                    de uma refeição.
                  </p>

                  <div
                    style={{
                      marginTop:
                        '13px',
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
                      titulo="Sobra pesada total no período"
                      valor={`${formatarNumero(
                        dados
                          .resumoEfetivo
                          .sobraKg
                      )} kg`}
                      destaque
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {opcoes.refeicoes && (
            <section className="card">
              <h2>
                Refeições relacionadas
              </h2>

              <p
                className="muted"
                style={{
                  fontSize:
                    '12px',
                  lineHeight:
                    1.45,
                }}
              >
                Refeições identificadas
                pelas saídas físicas de
                gêneros no período.
              </p>

              {dados
                .refeicoesRelacionadas
                .length === 0 ? (
                <div
                  style={{
                    padding:
                      '13px',
                    borderRadius:
                      '11px',
                    background:
                      '#0c1811',
                    border:
                      '1px solid #284334',
                  }}
                >
                  <span className="muted">
                    Nenhuma refeição
                    relacionada às
                    saídas do período.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display:
                      'grid',
                    gap: '8px',
                  }}
                >
                  {dados.refeicoesRelacionadas.map(
                    (
                      item: any,
                      indice: number
                    ) => (
                      <div
                        key={`${item.data}-${item.destino}-${indice}`}
                        style={{
                          padding:
                            '11px',
                          borderRadius:
                            '11px',
                          background:
                            '#0c1811',
                          border:
                            '1px solid #284334',
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap:
                            '10px',
                        }}
                      >
                        <div>
                          <strong>
                            {item.nome}
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
                            {formatarData(
                              item.data
                            )}
                          </div>
                        </div>

                        <strong
                          style={{
                            textAlign:
                              'right',
                            fontSize:
                              '12px',
                          }}
                        >
                          {
                            item.referencia
                          }
                        </strong>
                      </div>
                    )
                  )}

                  <div
                    style={{
                      padding:
                        '11px',
                      borderRadius:
                        '11px',
                      background:
                        '#183d2a',
                      border:
                        '1px solid #284334',
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap:
                        '10px',
                    }}
                  >
                    <span>
                      Total de refeições
                    </span>

                    <strong>
                      {
                        dados
                          .refeicoesRelacionadas
                          .length
                      }
                    </strong>
                  </div>
                </div>
              )}
            </section>
          )}

          {opcoes.entradas && (
            <Movimentos
              titulo="Entradas"
              itens={
                dados.entradas
              }
            />
          )}

          {opcoes.saidas && (
            <Movimentos
              titulo="Saídas"
              itens={
                dados.saidas
              }
              mostrarDestino
            />
          )}

          {opcoes.devolucoes && (
            <Movimentos
              titulo="Devoluções"
              itens={
                dados.devolucoes
              }
            />
          )}

          {opcoes.estoque && (
            <section className="card">
              <h2>
                Posição do estoque
              </h2>

              <p
                className="muted"
                style={{
                  fontSize:
                    '12px',
                  lineHeight:
                    1.45,
                }}
              >
                Saldo atual dos
                gêneros organizado
                por grupo e
                categoria. Os totais
                são calculados
                separadamente por
                unidade de medida.
              </p>

              {estoqueAgrupado.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      '13px',
                    borderRadius:
                      '11px',
                    background:
                      '#0c1811',
                    border:
                      '1px solid #284334',
                  }}
                >
                  <span className="muted">
                    Nenhum gênero
                    encontrado na
                    posição de estoque.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display:
                      'grid',
                    gap: '13px',
                  }}
                >
                  {estoqueAgrupado.map(
                    (
                      grupo: any
                    ) => (
                      <section
                        key={
                          grupo.nome
                        }
                        style={{
                          padding:
                            '13px',
                          borderRadius:
                            '13px',
                          background:
                            '#0c1811',
                          border:
                            '1px solid #284334',
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            gap:
                              '10px',
                            marginBottom:
                              '10px',
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                '16px',
                            }}
                          >
                            {
                              grupo.nome
                            }
                          </strong>

                          <span
                            className="muted"
                            style={{
                              fontSize:
                                '10px',
                            }}
                          >
                            {
                              grupo.itens
                                .length
                            }{' '}
                            gênero(s)
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gap:
                              '9px',
                          }}
                        >
                          {grupo.categorias.map(
                            (
                              categoria: any
                            ) => (
                              <div
                                key={
                                  categoria.nome
                                }
                                style={{
                                  padding:
                                    '11px',
                                  borderRadius:
                                    '11px',
                                  background:
                                    '#102018',
                                  border:
                                    '1px solid rgba(255,255,255,.08)',
                                }}
                              >
                                <strong
                                  style={{
                                    fontSize:
                                      '13px',
                                  }}
                                >
                                  {
                                    categoria.nome
                                  }
                                </strong>

                                <div
                                  style={{
                                    marginTop:
                                      '8px',
                                    display:
                                      'grid',
                                    gap:
                                      '6px',
                                  }}
                                >
                                  {categoria.itens.map(
                                    (
                                      item: any
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
                                          alignItems:
                                            'center',
                                          gap:
                                            '10px',
                                          padding:
                                            '7px 0',
                                          borderBottom:
                                            '1px solid rgba(255,255,255,.05)',
                                        }}
                                      >
                                        <div>
                                          <strong
                                            style={{
                                              fontSize:
                                                '12px',
                                            }}
                                          >
                                            {
                                              item.nome
                                            }
                                          </strong>

                                          <div
                                            className="muted"
                                            style={{
                                              fontSize:
                                                '10px',
                                              marginTop:
                                                '2px',
                                            }}
                                          >
                                            {
                                              item.classe
                                            }
                                          </div>
                                        </div>

                                        <strong
                                          style={{
                                            flexShrink:
                                              0,
                                            fontSize:
                                              '12px',
                                          }}
                                        >
                                          {formatarNumero(
                                            item.quantidade
                                          )}{' '}
                                          {
                                            item.unidade
                                          }
                                        </strong>
                                      </div>
                                    )
                                  )}
                                </div>

                                <TotaisPorUnidade
                                  titulo={`Subtotal — ${categoria.nome}`}
                                  totais={
                                    categoria.totais
                                  }
                                />
                              </div>
                            )
                          )}
                        </div>

                        <TotaisPorUnidade
                          titulo={`Total do grupo — ${grupo.nome}`}
                          totais={
                            grupo.totais
                          }
                        />
                      </section>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          <section className="card">
            <div
              style={{
                display: 'flex',
                gap: '9px',
                alignItems:
                  'flex-start',
                marginBottom:
                  '11px',
              }}
            >
              <span
                style={{
                  fontSize: '19px',
                }}
              >
                ⚠
              </span>

              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Alertas de estoque
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
                  Esta seção é sempre
                  exibida no relatório.
                </div>
              </div>
            </div>

            {dados.estoqueBaixo
              .length === 0 &&
            dados.validade
              .length === 0 ? (
              <div
                style={{
                  padding: '13px',
                  borderRadius:
                    '11px',
                  border:
                    '1px solid rgba(43,138,87,.55)',
                  background:
                    'rgba(43,138,87,.08)',
                }}
              >
                ✓ Nenhum alerta de
                estoque.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '9px',
                }}
              >
                {dados.estoqueBaixo.map(
                  (
                    item: any
                  ) => (
                    <article
                      key={
                        item.id
                      }
                      style={{
                        padding:
                          '13px',
                        borderRadius:
                          '12px',
                        border:
                          item.zerado
                            ? '2px solid #ef4444'
                            : '2px solid #f59e0b',
                        background:
                          item.zerado
                            ? 'rgba(239,68,68,.10)'
                            : 'rgba(245,158,11,.10)',
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
                              '12px',
                          }}
                        >
                          {item.zerado
                            ? '⛔ ESTOQUE ZERADO'
                            : '⚠ ESTOQUE BAIXO'}
                        </strong>

                        <strong
                          style={{
                            textAlign:
                              'right',
                          }}
                        >
                          {
                            item.nome
                          }
                        </strong>
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
                          paddingTop:
                            '10px',
                          borderTop:
                            '1px solid rgba(255,255,255,.08)',
                        }}
                      >
                        <Dado
                          titulo="Saldo atual"
                          valor={`${formatarNumero(
                            item.qtd
                          )} ${
                            item.unidade
                          }`}
                          destaque
                        />

                        <Dado
                          titulo="Estoque mínimo"
                          valor={`${formatarNumero(
                            item.min
                          )} ${
                            item.unidade
                          }`}
                        />
                      </div>
                    </article>
                  )
                )}

                {dados.validade.map(
                  (
                    item: any,
                    indice: number
                  ) => (
                    <article
                      key={`${item.genero}-${item.lote}-${indice}`}
                      style={{
                        padding:
                          '13px',
                        borderRadius:
                          '12px',
                        border:
                          item.vencido
                            ? '2px solid #ef4444'
                            : '2px solid #f59e0b',
                        background:
                          item.vencido
                            ? 'rgba(239,68,68,.10)'
                            : 'rgba(245,158,11,.10)',
                      }}
                    >
                      <strong
                        style={{
                          fontSize:
                            '12px',
                        }}
                      >
                        {item.vencido
                          ? '⛔ LOTE VENCIDO'
                          : '⚠ VALIDADE PRÓXIMA'}
                      </strong>

                      <div
                        style={{
                          marginTop:
                            '8px',
                        }}
                      >
                        <strong>
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
                          Lote{' '}
                          {item.lote ||
                            '—'}
                        </div>
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
                            '10px',
                          paddingTop:
                            '10px',
                          borderTop:
                            '1px solid rgba(255,255,255,.08)',
                        }}
                      >
                        <Dado
                          titulo="Validade"
                          valor={formatarData(
                            item.validade
                          )}
                        />

                        <Dado
                          titulo="Quantidade"
                          valor={`${formatarNumero(
                            item.quantidade
                          )} ${
                            item.unidade
                          }`}
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

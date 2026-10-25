'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

type Unidade = {
  id: string;
  nome: string;
  sigla: string;
};

type Grupo = {
  id: string;
  nome: string;
};

type Categoria = {
  id: string;
  nome: string;
  grupo: Grupo | null;
};

type Genero = {
  id: string;
  nome: string;
  classe: 'QS' | 'QR';
  unidade: Unidade;
  categoria: Categoria | null;
};

type Local = {
  id: string;
  nome: string;
};

type Lote = {
  id: string;
  numero: string;
  validade: string | null;
};

type Estoque = {
  id: string;
  quantidade: number;
  genero: Genero;
  local: Local;
  lote: Lote | null;
};

type TotalPorUnidade = {
  sigla: string;
  quantidade: number;
};

function formatarQuantidade(
  valor: number
) {
  return valor.toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

function somarPorUnidade(
  itens: Estoque[]
): TotalPorUnidade[] {
  const totais = new Map<
    string,
    TotalPorUnidade
  >();

  for (const item of itens) {
    const sigla =
      item.genero.unidade.sigla;

    const atual = totais.get(sigla);

    if (atual) {
      atual.quantidade +=
        Number(item.quantidade);
    } else {
      totais.set(sigla, {
        sigla,
        quantidade: Number(
          item.quantidade
        ),
      });
    }
  }

  return Array.from(
    totais.values()
  ).sort((a, b) =>
    a.sigla.localeCompare(
      b.sigla,
      'pt-BR'
    )
  );
}

function TextoTotais({
  itens,
}: {
  itens: Estoque[];
}) {
  const totais =
    somarPorUnidade(itens);

  return (
    <span>
      {totais
        .map(
          (total) =>
            `${formatarQuantidade(
              total.quantidade
            )} ${total.sigla}`
        )
        .join(' · ')}
    </span>
  );
}

const estiloResumo = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap' as const,
};

const estiloCategoria = {
  background:
    'rgba(255,255,255,0.04)',
  border:
    '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '12px 14px',
  marginBottom: '12px',
};

const estiloGenero = {
  background: '#0c1811',
  border: '1px solid #284334',
  borderRadius: '13px',
  padding: '14px',
  marginBottom: '10px',
};

const estiloLocal = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '10px 0',
  borderTop:
    '1px solid rgba(255,255,255,0.08)',
};

export default function EstoqueClient() {
  const [classe, setClasse] =
    useState<'QS' | 'QR'>('QS');

  const [registros, setRegistros] =
    useState<Estoque[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState('');

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro('');

      try {
        const resposta = await fetch(
          `/api/estoque?classe=${classe}`,
          {
            cache: 'no-store',
          }
        );

        const dados =
          await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            dados?.error ||
              'Não foi possível consultar o estoque.'
          );
        }

        if (ativo) {
          setRegistros(
            Array.isArray(dados)
              ? dados
              : []
          );
        }
      } catch (e) {
        if (ativo) {
          setRegistros([]);
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível consultar o estoque.'
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [classe]);

  const grupos = useMemo(() => {
    const mapa = new Map<
      string,
      {
        id: string;
        nome: string;
        itens: Estoque[];
      }
    >();

    for (const item of registros) {
      const grupo =
        item.genero.categoria?.grupo;

      const id =
        grupo?.id ||
        'sem-grupo';

      const nome =
        grupo?.nome ||
        'Sem grupo definido';

      const atual = mapa.get(id);

      if (atual) {
        atual.itens.push(item);
      } else {
        mapa.set(id, {
          id,
          nome,
          itens: [item],
        });
      }
    }

    return Array.from(
      mapa.values()
    ).sort((a, b) => {
      if (
        a.id === 'sem-grupo' &&
        b.id !== 'sem-grupo'
      ) {
        return 1;
      }

      if (
        b.id === 'sem-grupo' &&
        a.id !== 'sem-grupo'
      ) {
        return -1;
      }

      return a.nome.localeCompare(
        b.nome,
        'pt-BR'
      );
    });
  }, [registros]);

  return (
    <>
      {/* SELETOR QS / QR */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setClasse('QS')
          }
          style={{
            minHeight: '46px',
            borderRadius: '11px',
            border:
              classe === 'QS'
                ? '1px solid #2b8a57'
                : '1px solid #355143',
            background:
              classe === 'QS'
                ? '#2b8a57'
                : '#0c1811',
            color: '#eef7f1',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          QS
        </button>

        <button
          type="button"
          onClick={() =>
            setClasse('QR')
          }
          style={{
            minHeight: '46px',
            borderRadius: '11px',
            border:
              classe === 'QR'
                ? '1px solid #2b8a57'
                : '1px solid #355143',
            background:
              classe === 'QR'
                ? '#2b8a57'
                : '#0c1811',
            color: '#eef7f1',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          QR
        </button>
      </div>

      {/* ESTADO DE CARREGAMENTO */}

      {carregando && (
        <div
          style={{
            padding: '18px',
            textAlign: 'center',
          }}
        >
          <p
            className="muted"
            style={{
              margin: 0,
            }}
          >
            Consultando estoque...
          </p>
        </div>
      )}

      {/* ERRO */}

      {!carregando && erro && (
        <div className="error">
          {erro}
        </div>
      )}

      {/* SEM SALDO */}

      {!carregando &&
        !erro &&
        registros.length === 0 && (
          <div
            style={{
              padding: '22px 10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '28px',
                marginBottom: '8px',
              }}
            >
              📦
            </div>

            <strong>
              Nenhum saldo registrado
            </strong>

            <p className="muted">
              Não existem gêneros com
              saldo disponível nesta
              classe.
            </p>
          </div>
        )}

      {/* GRUPOS */}

      {!carregando &&
        !erro &&
        grupos.map((grupo) => {
          const categorias =
            new Map<
              string,
              {
                id: string;
                nome: string;
                itens: Estoque[];
              }
            >();

          for (const item of grupo.itens) {
            const categoria =
              item.genero.categoria;

            const id =
              categoria?.id ||
              'sem-categoria';

            const nome =
              categoria?.nome ||
              'Sem categoria definida';

            const atual =
              categorias.get(id);

            if (atual) {
              atual.itens.push(item);
            } else {
              categorias.set(id, {
                id,
                nome,
                itens: [item],
              });
            }
          }

          const categoriasOrdenadas =
            Array.from(
              categorias.values()
            ).sort((a, b) => {
              if (
                a.id ===
                  'sem-categoria' &&
                b.id !==
                  'sem-categoria'
              ) {
                return 1;
              }

              if (
                b.id ===
                  'sem-categoria' &&
                a.id !==
                  'sem-categoria'
              ) {
                return -1;
              }

              return a.nome.localeCompare(
                b.nome,
                'pt-BR'
              );
            });

          return (
            <section
              key={grupo.id}
              style={{
                marginBottom: '22px',
              }}
            >
              {/* CABEÇALHO DO GRUPO */}

              <div
                style={{
                  ...estiloResumo,
                  paddingBottom: '12px',
                  marginBottom: '14px',
                  borderBottom:
                    '2px solid rgba(34,197,94,0.35)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.7px',
                      color: '#a9b9af',
                      marginBottom: '3px',
                    }}
                  >
                    Grupo
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: '21px',
                    }}
                  >
                    {grupo.nome}
                  </h2>
                </div>

                <div
                  style={{
                    background:
                      '#183d2a',
                    border:
                      '1px solid #355143',
                    borderRadius:
                      '999px',
                    padding:
                      '7px 11px',
                    fontSize: '13px',
                    fontWeight: 800,
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  <TextoTotais
                    itens={grupo.itens}
                  />
                </div>
              </div>

              {/* CATEGORIAS */}

              {categoriasOrdenadas.map(
                (categoria) => {
                  const generos =
                    new Map<
                      string,
                      {
                        id: string;
                        nome: string;
                        unidade: Unidade;
                        itens: Estoque[];
                      }
                    >();

                  for (
                    const item of
                    categoria.itens
                  ) {
                    const id =
                      item.genero.id;

                    const atual =
                      generos.get(id);

                    if (atual) {
                      atual.itens.push(
                        item
                      );
                    } else {
                      generos.set(id, {
                        id,
                        nome:
                          item.genero
                            .nome,
                        unidade:
                          item.genero
                            .unidade,
                        itens: [item],
                      });
                    }
                  }

                  const generosOrdenados =
                    Array.from(
                      generos.values()
                    ).sort((a, b) =>
                      a.nome.localeCompare(
                        b.nome,
                        'pt-BR'
                      )
                    );

                  return (
                    <div
                      key={categoria.id}
                      style={{
                        marginBottom:
                          '18px',
                      }}
                    >
                      {/* CABEÇALHO CATEGORIA */}

                      <div
                        style={
                          estiloCategoria
                        }
                      >
                        <div
                          style={
                            estiloResumo
                          }
                        >
                          <strong>
                            {
                              categoria.nome
                            }
                          </strong>

                          <span
                            className="muted"
                            style={{
                              fontSize:
                                '13px',
                            }}
                          >
                            <TextoTotais
                              itens={
                                categoria.itens
                              }
                            />
                          </span>
                        </div>
                      </div>

                      {/* GÊNEROS */}

                      {generosOrdenados.map(
                        (genero) => {
                          const totalGenero =
                            genero.itens.reduce(
                              (
                                total,
                                item
                              ) =>
                                total +
                                Number(
                                  item.quantidade
                                ),
                              0
                            );

                          return (
                            <article
                              key={
                                genero.id
                              }
                              style={
                                estiloGenero
                              }
                            >
                              <div
                                style={{
                                  ...estiloResumo,
                                  marginBottom:
                                    '10px',
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize:
                                        '12px',
                                      color:
                                        '#a9b9af',
                                      marginBottom:
                                        '3px',
                                    }}
                                  >
                                    Gênero
                                  </div>

                                  <strong
                                    style={{
                                      fontSize:
                                        '16px',
                                    }}
                                  >
                                    {
                                      genero.nome
                                    }
                                  </strong>
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      '17px',
                                    fontWeight:
                                      800,
                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {formatarQuantidade(
                                    totalGenero
                                  )}{' '}
                                  {
                                    genero
                                      .unidade
                                      .sigla
                                  }
                                </div>
                              </div>

                              {/* LOCAIS / LOTES */}

                              {genero.itens.map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    key={
                                      item.id
                                    }
                                    style={{
                                      ...estiloLocal,
                                      borderTop:
                                        index ===
                                        0
                                          ? '1px solid rgba(255,255,255,0.08)'
                                          : estiloLocal.borderTop,
                                    }}
                                  >
                                    <div
                                      style={{
                                        minWidth:
                                          0,
                                      }}
                                    >
                                      <strong
                                        style={{
                                          fontSize:
                                            '14px',
                                        }}
                                      >
                                        {
                                          item
                                            .local
                                            .nome
                                        }
                                      </strong>

                                      {item.lote ? (
                                        <div
                                          className="muted"
                                          style={{
                                            marginTop:
                                              '3px',
                                            fontSize:
                                              '13px',
                                          }}
                                        >
                                          Lote{' '}
                                          {
                                            item
                                              .lote
                                              .numero
                                          }

                                          {item
                                            .lote
                                            .validade
                                            ? ` · validade ${new Date(
                                                item.lote.validade
                                              ).toLocaleDateString(
                                                'pt-BR'
                                              )}`
                                            : ''}
                                        </div>
                                      ) : (
                                        <div
                                          className="muted"
                                          style={{
                                            marginTop:
                                              '3px',
                                            fontSize:
                                              '13px',
                                          }}
                                        >
                                          Sem lote
                                        </div>
                                      )}
                                    </div>

                                    <strong
                                      style={{
                                        whiteSpace:
                                          'nowrap',
                                        fontSize:
                                          '14px',
                                      }}
                                    >
                                      {formatarQuantidade(
                                        Number(
                                          item.quantidade
                                        )
                                      )}{' '}
                                      {
                                        genero
                                          .unidade
                                          .sigla
                                      }
                                    </strong>
                                  </div>
                                )
                              )}
                            </article>
                          );
                        }
                      )}
                    </div>
                  );
                }
              )}
            </section>
          );
        })}
    </>
  );
}

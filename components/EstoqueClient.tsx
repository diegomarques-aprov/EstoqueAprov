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
      <div className="tabs">
        <button
          className={
            'tab ' +
            (classe === 'QS'
              ? 'active'
              : '')
          }
          onClick={() =>
            setClasse('QS')
          }
          type="button"
        >
          QS
        </button>

        <button
          className={
            'tab ' +
            (classe === 'QR'
              ? 'active'
              : '')
          }
          onClick={() =>
            setClasse('QR')
          }
          type="button"
        >
          QR
        </button>
      </div>

      {carregando && (
        <div className="card">
          <p className="muted">
            Consultando estoque...
          </p>
        </div>
      )}

      {!carregando && erro && (
        <div className="card">
          <p
            style={{
              color: '#ef4444',
            }}
          >
            {erro}
          </p>
        </div>
      )}

      {!carregando &&
        !erro &&
        registros.length === 0 && (
          <div className="card">
            <p className="muted">
              Nenhum saldo registrado.
            </p>
          </div>
        )}

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
            <div
              className="card"
              key={grupo.id}
            >
              <div
                style={{
                  borderBottom:
                    '2px solid rgba(34, 197, 94, 0.35)',
                  paddingBottom: 12,
                  marginBottom: 16,
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {grupo.nome}
                </h2>

                <div
                  style={{
                    marginTop: 5,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  <TextoTotais
                    itens={grupo.itens}
                  />
                </div>
              </div>

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

                  for (const item of categoria.itens) {
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
                    <section
                      key={categoria.id}
                      style={{
                        marginBottom: 24,
                      }}
                    >
                      <div
                        className="row"
                        style={{
                          background:
                            'rgba(255,255,255,0.04)',
                          borderRadius: 8,
                          padding:
                            '10px 12px',
                          marginBottom: 10,
                        }}
                      >
                        <strong>
                          {
                            categoria.nome
                          }
                        </strong>

                        <span className="muted">
                          Subtotal:{' '}
                          <TextoTotais
                            itens={
                              categoria.itens
                            }
                          />
                        </span>
                      </div>

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
                            <div
                              key={
                                genero.id
                              }
                              style={{
                                marginLeft:
                                  12,
                                marginBottom:
                                  16,
                                paddingLeft:
                                  12,
                                borderLeft:
                                  '3px solid rgba(34, 197, 94, 0.30)',
                              }}
                            >
                              <div
                                className="row"
                                style={{
                                  marginBottom:
                                    6,
                                }}
                              >
                                <strong>
                                  {
                                    genero.nome
                                  }
                                </strong>

                                <strong>
                                  {formatarQuantidade(
                                    totalGenero
                                  )}{' '}
                                  {
                                    genero
                                      .unidade
                                      .sigla
                                  }
                                </strong>
                              </div>

                              {genero.itens.map(
                                (
                                  item
                                ) => (
                                  <div
                                    className="row"
                                    key={
                                      item.id
                                    }
                                    style={{
                                      padding:
                                        '6px 0',
                                    }}
                                  >
                                    <span>
                                      {formatarQuantidade(
                                        Number(
                                          item.quantidade
                                        )
                                      )}{' '}
                                      {
                                        item
                                          .genero
                                          .unidade
                                          .sigla
                                      }{' '}
                                      ·{' '}
                                      {
                                        item
                                          .local
                                          .nome
                                      }
                                    </span>

                                    {item.lote ? (
                                      <span className="muted">
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
                                      </span>
                                    ) : (
                                      <span className="muted">
                                        Sem lote
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          );
                        }
                      )}
                    </section>
                  );
                }
              )}
            </div>
          );
        })}
    </>
  );
}

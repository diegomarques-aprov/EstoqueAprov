'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

type Grupo = {
  id: string;
  nome: string;
};

type Categoria = {
  id: string;
  nome: string;
  grupo: Grupo | null;
};

type G = {
  id: string;
  nome: string;
  classe: 'QS' | 'QR';
  situacao: 'ATIVO' | 'INATIVO';
  estoqueMinimo:
    | number
    | string
    | null;
  unidade: {
    sigla: string;
  };
  categoria: Categoria | null;
};

type E = {
  generoId: string;
  quantidade: number | string;
};

type Item = {
  grupoId: string;
  categoriaId: string;
  generoId: string;
  quantidade: string;
};

const vazio = (): Item => ({
  grupoId: '',
  categoriaId: '',
  generoId: '',
  quantidade: '',
});

const destinos = [
  ['CAFE_DA_MANHA', 'Café da manhã'],
  ['ALMOCO', 'Almoço'],
  ['JANTAR', 'Jantar'],
  ['CEIA', 'Ceia'],
  [
    'SERVICO_DIA_SEGUINTE',
    'Serviço do dia seguinte',
  ],
  ['OUTRO', 'Outro'],
] as const;

const estiloSecao = {
  background: '#0c1811',
  border: '1px solid #284334',
  borderRadius: '14px',
  padding: '16px',
  marginBottom: '14px',
};

export default function SaidaClient() {
  const [classe, setClasse] =
    useState<'QS' | 'QR'>('QS');

  const [generos, setGeneros] =
    useState<G[]>([]);

  const [saldos, setSaldos] =
    useState<Record<string, number>>({});

  const [itens, setItens] =
    useState<Item[]>([vazio()]);

  const [destino, setDestino] =
    useState('ALMOCO');

  const [data, setData] =
    useState(() => {
      const partes =
        new Intl.DateTimeFormat(
          'en-CA',
          {
            timeZone:
              'America/Campo_Grande',
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
    });

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [msg, setMsg] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const [revisar, setRevisar] =
    useState(false);

  async function carregar() {
    const [
      respostaGeneros,
      respostaEstoque,
    ] = await Promise.all([
      fetch(
        '/api/generos?classe=' +
          classe,
        {
          cache: 'no-store',
        }
      ),

      fetch(
        '/api/estoque?classe=' +
          classe,
        {
          cache: 'no-store',
        }
      ),
    ]);

    const dadosGeneros =
      await respostaGeneros.json();

    const dadosEstoque =
      await respostaEstoque.json();

    setGeneros(
      Array.isArray(
        dadosGeneros
      )
        ? dadosGeneros
        : []
    );

    const novosSaldos: Record<
      string,
      number
    > = {};

    if (
      Array.isArray(
        dadosEstoque
      )
    ) {
      for (
        const x of
        dadosEstoque as E[]
      ) {
        novosSaldos[
          x.generoId
        ] =
          (novosSaldos[
            x.generoId
          ] || 0) +
          Number(
            x.quantidade
          );
      }
    }

    setSaldos(
      novosSaldos
    );
  }

  useEffect(() => {
    carregar();
    setItens([vazio()]);
    setRevisar(false);
    setMsg('');
  }, [classe]);

  /*
   * Todos os gêneros ativos permanecem
   * disponíveis na estrutura.
   *
   * Saldo zero não remove gênero,
   * categoria nem grupo da tela.
   */

  const generosAtivos =
    useMemo(
      () =>
        generos.filter(
          (genero) =>
            genero.situacao ===
            'ATIVO'
        ),
      [generos]
    );

  const grupos =
    useMemo(() => {
      const mapa =
        new Map<
          string,
          Grupo
        >();

      for (
        const genero of
        generosAtivos
      ) {
        const grupo =
          genero.categoria
            ?.grupo;

        if (grupo) {
          mapa.set(
            grupo.id,
            grupo
          );
        }
      }

      return Array.from(
        mapa.values()
      ).sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          'pt-BR'
        )
      );
    }, [generosAtivos]);

  function categoriasDoGrupo(
    grupoId: string
  ) {
    const mapa =
      new Map<
        string,
        {
          id: string;
          nome: string;
        }
      >();

    for (
      const genero of
      generosAtivos
    ) {
      const categoria =
        genero.categoria;

      if (
        categoria &&
        categoria.grupo?.id ===
          grupoId
      ) {
        mapa.set(
          categoria.id,
          {
            id:
              categoria.id,
            nome:
              categoria.nome,
          }
        );
      }
    }

    return Array.from(
      mapa.values()
    ).sort((a, b) =>
      a.nome.localeCompare(
        b.nome,
        'pt-BR'
      )
    );
  }

  function generosDaCategoria(
    categoriaId: string
  ) {
    return generosAtivos
      .filter(
        (genero) =>
          genero.categoria
            ?.id ===
          categoriaId
      )
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          'pt-BR'
        )
      );
  }

  function saldoGenero(
    generoId: string
  ) {
    return (
      saldos[generoId] ||
      0
    );
  }

  function categoriaTemEstoque(
    categoriaId: string
  ) {
    return generosDaCategoria(
      categoriaId
    ).some(
      (genero) =>
        saldoGenero(
          genero.id
        ) > 0
    );
  }

  function generoSelecionado(
    id: string
  ) {
    return generos.find(
      (genero) =>
        genero.id === id
    );
  }

  function abaixoDoMinimo(
    genero: G
  ) {
    if (
      genero.estoqueMinimo ==
      null
    ) {
      return false;
    }

    const minimo =
      Number(
        genero.estoqueMinimo
      );

    return (
      saldoGenero(
        genero.id
      ) > 0 &&
      saldoGenero(
        genero.id
      ) < minimo
    );
  }

  function alterarGrupo(
    indice: number,
    grupoId: string
  ) {
    setItens(
      (atuais) =>
        atuais.map(
          (item, n) =>
            n === indice
              ? {
                  ...item,
                  grupoId,
                  categoriaId:
                    '',
                  generoId:
                    '',
                  quantidade:
                    '',
                }
              : item
        )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarCategoria(
    indice: number,
    categoriaId: string
  ) {
    setItens(
      (atuais) =>
        atuais.map(
          (item, n) =>
            n === indice
              ? {
                  ...item,
                  categoriaId,
                  generoId:
                    '',
                  quantidade:
                    '',
                }
              : item
        )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarGenero(
    indice: number,
    generoId: string
  ) {
    setItens(
      (atuais) =>
        atuais.map(
          (item, n) =>
            n === indice
              ? {
                  ...item,
                  generoId,
                  quantidade:
                    '',
                }
              : item
        )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarQuantidade(
    indice: number,
    quantidade: string
  ) {
    setItens(
      (atuais) =>
        atuais.map(
          (item, n) =>
            n === indice
              ? {
                  ...item,
                  quantidade,
                }
              : item
        )
    );

    setRevisar(false);
    setMsg('');
  }

  function validar() {
    const vistos =
      new Set<string>();

    for (
      const item of itens
    ) {
      if (
        !item.grupoId
      ) {
        return 'Selecione o grupo em todos os itens.';
      }

      if (
        !item.categoriaId
      ) {
        return 'Selecione a categoria em todos os itens.';
      }

      const genero =
        generoSelecionado(
          item.generoId
        );

      if (!genero) {
        return 'Selecione o gênero em todos os itens.';
      }

      const disponivel =
        saldoGenero(
          genero.id
        );

      if (
        disponivel <= 0
      ) {
        return `${genero.nome}: sem estoque disponível. Não é possível realizar a saída deste gênero.`;
      }

      if (
        vistos.has(
          item.generoId
        )
      ) {
        return `${genero.nome} foi adicionado mais de uma vez.`;
      }

      vistos.add(
        item.generoId
      );

      const quantidade =
        Number(
          item.quantidade
        );

      if (
        !(quantidade > 0)
      ) {
        return `${genero.nome}: informe uma quantidade válida.`;
      }

      if (
        quantidade >
        disponivel
      ) {
        return `${genero.nome}: solicitado ${quantidade.toLocaleString(
          'pt-BR'
        )} ${
          genero.unidade.sigla
        }, mas há ${disponivel.toLocaleString(
          'pt-BR'
        )} ${
          genero.unidade.sigla
        } disponíveis.`;
      }
    }

    return '';
  }

  async function confirmar() {
    const erro =
      validar();

    if (erro) {
      setMsg(erro);
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      const resposta =
        await fetch(
          '/api/saidas',
          {
            method: 'POST',

            headers: {
              'content-type':
                'application/json',
            },

            body:
              JSON.stringify({
                classe,
                destino,
                data,

                observacao:
                  observacao ||
                  undefined,

                itens:
                  itens.map(
                    (item) => ({
                      generoId:
                        item.generoId,

                      quantidade:
                        Number(
                          item.quantidade
                        ),
                    })
                  ),
              }),
          }
        );

      const dados =
        await resposta.json();

      if (
        !resposta.ok
      ) {
        setMsg(
          dados.error ||
            'Não foi possível concluir a saída.'
        );

        await carregar();
        return;
      }

      setMsg(
        `Saída nº ${dados.numero} confirmada e estoque atualizado.`
      );

      setItens([
        vazio(),
      ]);

      setObservacao('');
      setRevisar(false);

      await carregar();
    } catch {
      setMsg(
        'Não foi possível concluir a saída.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* QS / QR */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '8px',
          marginBottom: '18px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setClasse('QS')
          }
          style={{
            minHeight: '48px',
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
            fontSize: '15px',
            fontWeight: 800,
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
            minHeight: '48px',
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
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          QR
        </button>
      </div>

      {/* MENSAGENS */}

      {msg && (
        <div
          className={
            msg.includes(
              'confirmada'
            )
              ? 'success'
              : 'error'
          }
        >
          {msg}
        </div>
      )}

      {/* DESTINO */}

      <section style={estiloSecao}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              fontSize: '21px',
            }}
          >
            📍
          </span>

          <div>
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Destino da saída
            </strong>

            <div
              className="muted"
              style={{
                fontSize: '13px',
                marginTop: '2px',
              }}
            >
              Informe a finalidade da
              retirada.
            </div>
          </div>
        </div>

        <div className="grid">
          <label>
            Refeição/destino

            <select
              value={destino}
              onChange={(e) => {
                setDestino(
                  e.target.value
                );

                setRevisar(false);
              }}
            >
              {destinos.map(
                ([
                  valor,
                  nome,
                ]) => (
                  <option
                    value={valor}
                    key={valor}
                  >
                    {nome}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Data

            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(
                  e.target.value
                );

                setRevisar(false);
              }}
            />
          </label>
        </div>

        {destino ===
          'SERVICO_DIA_SEGUINTE' && (
          <div
            style={{
              background:
                'rgba(255,255,255,0.04)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: '11px',
              padding: '12px',
              marginBottom: '14px',
            }}
          >
            <p
              className="muted"
              style={{
                margin: 0,
                fontSize: '13px',
              }}
            >
              Esta opção identifica
              apenas a finalidade da
              saída. A data e a hora da
              movimentação serão
              registradas no momento
              real em que o material
              sair do estoque.
            </p>
          </div>
        )}

        <label>
          Observação

          <input
            value={observacao}
            onChange={(e) => {
              setObservacao(
                e.target.value
              );

              setRevisar(false);
            }}
            placeholder="Observação opcional"
          />
        </label>
      </section>

      {/* GÊNEROS */}

      <section style={estiloSecao}>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Gêneros
            </strong>

            <div
              className="muted"
              style={{
                fontSize: '13px',
                marginTop: '3px',
              }}
            >
              Selecione os materiais
              desta saída.
            </div>
          </div>

          <button
            className="linkbtn"
            type="button"
            onClick={() => {
              setItens(
                (atuais) => [
                  ...atuais,
                  vazio(),
                ]
              );

              setRevisar(false);
            }}
            style={{
              minHeight: '38px',
              fontWeight: 700,
            }}
          >
            + Adicionar
          </button>
        </div>

        {itens.map(
          (
            item,
            indice
          ) => {
            const genero =
              generoSelecionado(
                item.generoId
              );

            const categorias =
              categoriasDoGrupo(
                item.grupoId
              );

            const generosCategoria =
              generosDaCategoria(
                item.categoriaId
              );

            const categoriaSemEstoque =
              Boolean(
                item.categoriaId
              ) &&
              !categoriaTemEstoque(
                item.categoriaId
              );

            const saldo =
              genero
                ? saldoGenero(
                    genero.id
                  )
                : 0;

            const estoqueBaixo =
              genero
                ? abaixoDoMinimo(
                    genero
                  )
                : false;

            return (
              <article
                className="itembox"
                key={indice}
                style={{
                  marginBottom: '14px',
                  padding: '15px',
                }}
              >
                {/* CABEÇALHO ITEM */}

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                    gap: '10px',
                    marginBottom:
                      '12px',
                    paddingBottom:
                      '10px',
                    borderBottom:
                      '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <strong>
                    Item {indice + 1}
                  </strong>

                  {itens.length >
                    1 && (
                    <button
                      className="dangerlink"
                      type="button"
                      onClick={() => {
                        setItens(
                          (
                            atuais
                          ) =>
                            atuais.filter(
                              (
                                _,
                                n
                              ) =>
                                n !==
                                indice
                            )
                        );

                        setRevisar(
                          false
                        );
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>

                {/* GRUPO */}

                <label>
                  Grupo

                  <select
                    value={
                      item.grupoId
                    }
                    onChange={(e) =>
                      alterarGrupo(
                        indice,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione...
                    </option>

                    {grupos.map(
                      (grupo) => (
                        <option
                          key={
                            grupo.id
                          }
                          value={
                            grupo.id
                          }
                        >
                          {grupo.nome}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {/* CATEGORIA */}

                <label>
                  Categoria

                  <select
                    value={
                      item.categoriaId
                    }
                    disabled={
                      !item.grupoId
                    }
                    onChange={(e) =>
                      alterarCategoria(
                        indice,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      {item.grupoId
                        ? 'Selecione...'
                        : 'Selecione o grupo primeiro'}
                    </option>

                    {categorias.map(
                      (
                        categoria
                      ) => {
                        const temEstoque =
                          categoriaTemEstoque(
                            categoria.id
                          );

                        return (
                          <option
                            key={
                              categoria.id
                            }
                            value={
                              categoria.id
                            }
                          >
                            {
                              categoria.nome
                            }
                            {!temEstoque
                              ? ' — sem estoque'
                              : ''}
                          </option>
                        );
                      }
                    )}
                  </select>
                </label>

                {categoriaSemEstoque && (
                  <div className="error">
                    Sem estoque
                    disponível nesta
                    categoria.
                  </div>
                )}

                {/* GÊNERO */}

                <label>
                  Gênero

                  <select
                    value={
                      item.generoId
                    }
                    disabled={
                      !item.categoriaId
                    }
                    onChange={(e) =>
                      alterarGenero(
                        indice,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      {item.categoriaId
                        ? 'Selecione...'
                        : 'Selecione a categoria primeiro'}
                    </option>

                    {generosCategoria.map(
                      (
                        generoOpcao
                      ) => {
                        const saldoOpcao =
                          saldoGenero(
                            generoOpcao.id
                          );

                        const baixo =
                          abaixoDoMinimo(
                            generoOpcao
                          );

                        return (
                          <option
                            key={
                              generoOpcao.id
                            }
                            value={
                              generoOpcao.id
                            }
                          >
                            {
                              generoOpcao.nome
                            }{' '}
                            —{' '}
                            {saldoOpcao.toLocaleString(
                              'pt-BR'
                            )}{' '}
                            {
                              generoOpcao
                                .unidade
                                .sigla
                            }
                            {saldoOpcao <=
                            0
                              ? ' — SEM ESTOQUE'
                              : baixo
                              ? ' — ESTOQUE BAIXO'
                              : ''}
                          </option>
                        );
                      }
                    )}
                  </select>
                </label>

                {/* SALDO DESTACADO */}

                {genero && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap: '10px',
                      background:
                        '#102018',
                      border:
                        '1px solid #284334',
                      borderRadius:
                        '11px',
                      padding:
                        '11px 12px',
                      marginBottom:
                        '14px',
                    }}
                  >
                    <span
                      className="muted"
                      style={{
                        fontSize:
                          '13px',
                      }}
                    >
                      Disponível
                    </span>

                    <strong
                      style={{
                        fontSize:
                          '16px',
                      }}
                    >
                      {saldo.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      {
                        genero
                          .unidade
                          .sigla
                      }
                    </strong>
                  </div>
                )}

                {/* QUANTIDADE */}

                <label>
                  Quantidade da saída{' '}
                  {genero &&
                    `(${genero.unidade.sigla})`}

                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    inputMode="decimal"
                    value={
                      item.quantidade
                    }
                    disabled={
                      !genero ||
                      saldo <= 0
                    }
                    onChange={(e) =>
                      alterarQuantidade(
                        indice,
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                </label>

                {/* ALERTAS */}

                {genero &&
                  saldo <= 0 && (
                  <div className="error">
                    Sem estoque
                    disponível para{' '}
                    {genero.nome}. A
                    saída está
                    bloqueada.
                  </div>
                )}

                {genero &&
                  estoqueBaixo && (
                  <div
                    style={{
                      background:
                        'rgba(245,158,11,0.08)',
                      border:
                        '1px solid #f59e0b',
                      borderRadius:
                        '11px',
                      padding:
                        '11px 12px',
                      marginBottom:
                        '12px',
                    }}
                  >
                    <strong>
                      ⚠ Estoque baixo
                    </strong>

                    <div
                      className="muted"
                      style={{
                        marginTop:
                          '4px',
                        fontSize:
                          '13px',
                      }}
                    >
                      O saldo está abaixo
                      do estoque mínimo.
                      A saída continua
                      disponível.
                    </div>
                  </div>
                )}

                {genero &&
                  saldo > 0 && (
                  <div
                    className="muted"
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }}
                  >
                    O sistema utilizará
                    primeiro o lote
                    válido com
                    vencimento mais
                    próximo (PVPS).
                  </div>
                )}
              </article>
            );
          }
        )}
      </section>

      {/* RESUMO */}

      <section style={estiloSecao}>
        <div
          style={{
            marginBottom: '16px',
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Resumo da saída
          </div>

          <strong
            style={{
              display: 'block',
              fontSize: '18px',
            }}
          >
            {
              destinos.find(
                (x) =>
                  x[0] === destino
              )?.[1]
            }{' '}
            · {classe}
          </strong>

          <div
            className="muted"
            style={{
              marginTop: '4px',
              fontSize: '13px',
            }}
          >
            {itens.length}{' '}
            item(ns) na saída
          </div>
        </div>

        {!revisar ? (
          <button
            className="btn"
            type="button"
            style={{
              width: '100%',
            }}
            onClick={() => {
              const erro =
                validar();

              if (erro) {
                setMsg(
                  erro
                );
              } else {
                setMsg('');
                setRevisar(
                  true
                );
              }
            }}
          >
            Revisar saída
          </button>
        ) : (
          <>
            <div
              style={{
                background:
                  'rgba(43,138,87,0.10)',
                border:
                  '1px solid #355143',
                borderRadius:
                  '11px',
                padding: '13px',
                marginBottom:
                  '14px',
              }}
            >
              <strong>
                Confira antes de
                confirmar
              </strong>

              <p
                className="muted"
                style={{
                  margin:
                    '6px 0 0',
                  fontSize: '13px',
                }}
              >
                A confirmação fará a
                baixa automática do
                estoque seguindo o PVPS
                e registrará os lotes e
                locais utilizados.
              </p>
            </div>

            {/* ITENS DA REVISÃO */}

            <div
              style={{
                marginBottom: '14px',
              }}
            >
              {itens.map(
                (
                  item,
                  indice
                ) => {
                  const genero =
                    generoSelecionado(
                      item.generoId
                    );

                  if (!genero) {
                    return null;
                  }

                  return (
                    <div
                      key={
                        item.generoId
                      }
                      style={{
                        padding:
                          '10px 0',
                        borderBottom:
                          '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            '13px',
                          color:
                            '#a9b9af',
                          marginBottom:
                            '3px',
                        }}
                      >
                        {indice + 1}.{' '}
                        {
                          genero
                            .categoria
                            ?.grupo
                            ?.nome
                        }{' '}
                        →{' '}
                        {
                          genero
                            .categoria
                            ?.nome
                        }
                      </div>

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          gap: '10px',
                        }}
                      >
                        <strong>
                          {genero.nome}
                        </strong>

                        <strong
                          style={{
                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {Number(
                            item.quantidade
                          ).toLocaleString(
                            'pt-BR'
                          )}{' '}
                          {
                            genero
                              .unidade
                              .sigla
                          }
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '8px',
              }}
            >
              <button
                className="linkbtn"
                type="button"
                onClick={() =>
                  setRevisar(
                    false
                  )
                }
              >
                Voltar e editar
              </button>

              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={
                  confirmar
                }
              >
                {busy
                  ? 'Confirmando...'
                  : 'Confirmar'}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

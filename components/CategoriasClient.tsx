'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type Situacao = 'ATIVO' | 'INATIVO';

type Grupo = {
  id: string;
  nome: string;
  situacao: Situacao;
};

type Local = {
  id: string;
  nome: string;
  situacao?: Situacao;
};

type Categoria = {
  id: string;
  nome: string;
  grupoId: string | null;
  grupo?: Grupo | null;
  controlaLotePadrao: boolean | null;
  controlaValidadePadrao: boolean | null;
  localPadraoId: string | null;
  localPadrao?: Local | null;
  situacao: Situacao;
  _count?: {
    generos: number;
  };
};

function CampoInfo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="muted"
        style={{
          fontSize: '10px',
          marginBottom: '2px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function CategoriasClient() {
  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [locais, setLocais] =
    useState<Local[]>([]);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarCategorias,
    setMostrarCategorias,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Categoria | null>(null);

  const [nomeEdicao, setNomeEdicao] =
    useState('');

  const [grupoEdicao, setGrupoEdicao] =
    useState('');

  const [loteEdicao, setLoteEdicao] =
    useState(false);

  const [
    validadeEdicao,
    setValidadeEdicao,
  ] = useState(false);

  const [localEdicao, setLocalEdicao] =
    useState('');

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] =
    useState<Situacao>('ATIVO');

  const nomeRef =
    useRef<HTMLInputElement>(null);

  async function carregarDados() {
    try {
      const [
        resCategorias,
        resGrupos,
        resLocais,
      ] = await Promise.all([
        fetch('/api/categorias', {
          cache: 'no-store',
        }),
        fetch('/api/grupos-generos', {
          cache: 'no-store',
        }),
        fetch('/api/locais', {
          cache: 'no-store',
        }),
      ]);

      if (!resCategorias.ok) {
        const dados =
          await resCategorias.json();

        setErro(
          dados.error ||
            'Não foi possível carregar as categorias.'
        );

        return;
      }

      if (!resGrupos.ok) {
        const dados =
          await resGrupos.json();

        setErro(
          dados.error ||
            'Não foi possível carregar os grupos.'
        );

        return;
      }

      if (!resLocais.ok) {
        const dados =
          await resLocais.json();

        setErro(
          dados.error ||
            'Não foi possível carregar os locais.'
        );

        return;
      }

      setCategorias(
        await resCategorias.json()
      );

      setGrupos(
        await resGrupos.json()
      );

      setLocais(
        await resLocais.json()
      );
    } catch {
      setErro(
        'Não foi possível carregar os dados necessários.'
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const gruposAtivos =
    grupos.filter(
      (grupo) =>
        grupo.situacao === 'ATIVO'
    );

  const locaisAtivos =
    locais.filter(
      (local) =>
        !local.situacao ||
        local.situacao === 'ATIVO'
    );

  async function adicionar(
    ev: FormEvent<HTMLFormElement>
  ) {
    ev.preventDefault();

    const form = ev.currentTarget;
    const dados = new FormData(form);

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(
        '/api/categorias',
        {
          method: 'POST',
          headers: {
            'content-type':
              'application/json',
          },
          body: JSON.stringify({
            nome: String(
              dados.get('nome') || ''
            ).trim(),

            grupoId:
              String(
                dados.get('grupoId') ||
                  ''
              ) || null,

            controlaLotePadrao:
              dados.get(
                'controlaLotePadrao'
              ) === 'on',

            controlaValidadePadrao:
              dados.get(
                'controlaValidadePadrao'
              ) === 'on',

            localPadraoId:
              String(
                dados.get(
                  'localPadraoId'
                ) || ''
              ) || null,
          }),
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível cadastrar a categoria.'
        );

        return;
      }

      form.reset();

      setSucesso(
        'Categoria cadastrada com sucesso.'
      );

      await carregarDados();

      nomeRef.current?.focus();
    } catch {
      setErro(
        'Não foi possível cadastrar a categoria.'
      );
    }
  }

  function iniciarEdicao(
    categoria: Categoria
  ) {
    setEditando(categoria);

    setNomeEdicao(
      categoria.nome
    );

    setGrupoEdicao(
      categoria.grupoId || ''
    );

    setLoteEdicao(
      categoria.controlaLotePadrao ===
        true
    );

    setValidadeEdicao(
      categoria.controlaValidadePadrao ===
        true
    );

    setLocalEdicao(
      categoria.localPadraoId || ''
    );

    setSituacaoEdicao(
      categoria.situacao
    );

    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEdicao('');
    setGrupoEdicao('');
    setLoteEdicao(false);
    setValidadeEdicao(false);
    setLocalEdicao('');
    setSituacaoEdicao('ATIVO');
    setErro('');
  }

  async function salvarEdicao(
    ev: FormEvent<HTMLFormElement>
  ) {
    ev.preventDefault();

    if (!editando) {
      return;
    }

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(
        '/api/categorias',
        {
          method: 'PUT',
          headers: {
            'content-type':
              'application/json',
          },
          body: JSON.stringify({
            id: editando.id,
            nome: nomeEdicao.trim(),

            grupoId:
              grupoEdicao || null,

            controlaLotePadrao:
              loteEdicao,

            controlaValidadePadrao:
              validadeEdicao,

            localPadraoId:
              localEdicao || null,

            situacao:
              situacaoEdicao,
          }),
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível alterar a categoria.'
        );

        return;
      }

      setEditando(null);
      setNomeEdicao('');
      setGrupoEdicao('');
      setLoteEdicao(false);
      setValidadeEdicao(false);
      setLocalEdicao('');
      setSituacaoEdicao('ATIVO');

      setSucesso(
        'Categoria atualizada com sucesso.'
      );

      await carregarDados();
    } catch {
      setErro(
        'Não foi possível alterar a categoria.'
      );
    }
  }

  return (
    <>
      <div
        style={{
          padding: '13px',
          borderRadius: '12px',
          background: '#0c1811',
          border: '1px solid #284334',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '15px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Nova categoria
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Defina a organização e os
              padrões sugeridos para os
              gêneros.
            </div>
          </div>

          <span
            style={{
              padding: '5px 8px',
              borderRadius: '999px',
              background: '#183d2a',
              border: '1px solid #284334',
              fontSize: '10px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            CADASTRO
          </span>
        </div>

        <form
          onSubmit={adicionar}
          style={{
            display: 'grid',
            gap: '13px',
          }}
        >
          <label>
            Nome da categoria

            <input
              ref={nomeRef}
              name="nome"
              required
              autoFocus
              maxLength={80}
              placeholder="Ex.: Carne Bovina"
            />
          </label>

          <label>
            Grupo de gêneros

            <select name="grupoId">
              <option value="">
                Não definido
              </option>

              {gruposAtivos.map(
                (grupo) => (
                  <option
                    key={grupo.id}
                    value={grupo.id}
                  >
                    {grupo.nome}
                  </option>
                )
              )}
            </select>
          </label>

          {gruposAtivos.length ===
            0 && (
            <div
              style={{
                padding: '10px',
                borderRadius: '10px',
                background:
                  'rgba(245,158,11,.08)',
                border:
                  '1px solid rgba(245,158,11,.35)',
              }}
            >
              <span
                className="muted"
                style={{
                  fontSize: '11px',
                  lineHeight: 1.45,
                }}
              >
                Nenhum grupo ativo
                cadastrado. Cadastre
                primeiro os grupos de
                gêneros.
              </span>
            </div>
          )}

          <div>
            <div
              style={{
                marginBottom: '7px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Padrões da categoria
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '8px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '11px',
                  background: '#102018',
                  border:
                    '1px solid #284334',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="controlaLotePadrao"
                  style={{
                    width: '18px',
                    height: '18px',
                    margin: 0,
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontSize: '11px',
                    lineHeight: 1.3,
                  }}
                >
                  Controla lote
                </span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '11px',
                  background: '#102018',
                  border:
                    '1px solid #284334',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  name="controlaValidadePadrao"
                  style={{
                    width: '18px',
                    height: '18px',
                    margin: 0,
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontSize: '11px',
                    lineHeight: 1.3,
                  }}
                >
                  Controla validade
                </span>
              </label>
            </div>
          </div>

          <div
            style={{
              padding: '10px 11px',
              borderRadius: '10px',
              background:
                'rgba(43,138,87,.06)',
              border:
                '1px solid rgba(43,138,87,.3)',
            }}
          >
            <span
              className="muted"
              style={{
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              Esses controles serão
              sugeridos automaticamente
              quando um gênero for
              vinculado à categoria.
            </span>
          </div>

          <label>
            Local habitual da categoria

            <select name="localPadraoId">
              <option value="">
                Não definido
              </option>

              {locaisAtivos.map(
                (local) => (
                  <option
                    key={local.id}
                    value={local.id}
                  >
                    {local.nome}
                  </option>
                )
              )}
            </select>
          </label>

          <button
            className="btn"
            type="submit"
            style={{
              width: '100%',
              minHeight: '46px',
            }}
          >
            Adicionar categoria
          </button>

          {sucesso &&
            !editando && (
              <div
                role="status"
                style={{
                  padding: '11px',
                  borderRadius: '10px',
                  background:
                    'rgba(43,138,87,.08)',
                  border:
                    '1px solid rgba(43,138,87,.4)',
                  fontSize: '12px',
                }}
              >
                <strong>
                  ✓ {sucesso}
                </strong>
              </div>
            )}

          {erro && !editando && (
            <div
              className="error"
              role="alert"
            >
              {erro}
            </div>
          )}
        </form>
      </div>

      <div
        style={{
          padding: '13px',
          borderRadius: '12px',
          background: '#0c1811',
          border: '1px solid #284334',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() =>
            setMostrarCategorias(
              !mostrarCategorias
            )
          }
          style={{
            width: '100%',
          }}
        >
          {mostrarCategorias
            ? 'Ocultar categorias cadastradas'
            : `Ver categorias cadastradas (${categorias.length})`}
        </button>

        {mostrarCategorias && (
          <div
            style={{
              display: 'grid',
              gap: '10px',
              marginTop: '14px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <strong>
                Categorias cadastradas
              </strong>

              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                {categorias.length}{' '}
                categoria(s)
              </span>
            </div>

            {categorias.length > 0 ? (
              categorias.map(
                (categoria) => (
                  <article
                    key={categoria.id}
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editando?.id ===
                        categoria.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editando?.id ===
                    categoria.id ? (
                      <form
                        onSubmit={
                          salvarEdicao
                        }
                        style={{
                          display:
                            'grid',
                          gap: '13px',
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize:
                                '15px',
                            }}
                          >
                            Editar categoria
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
                            Altere a
                            organização e os
                            padrões da
                            categoria.
                          </div>
                        </div>

                        <label>
                          Nome

                          <input
                            value={
                              nomeEdicao
                            }
                            onChange={(e) =>
                              setNomeEdicao(
                                e.target
                                  .value
                              )
                            }
                            required
                            maxLength={80}
                            autoFocus
                          />
                        </label>

                        <label>
                          Grupo de gêneros

                          <select
                            value={
                              grupoEdicao
                            }
                            onChange={(e) =>
                              setGrupoEdicao(
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Não definido
                            </option>

                            {gruposAtivos.map(
                              (grupo) => (
                                <option
                                  key={
                                    grupo.id
                                  }
                                  value={
                                    grupo.id
                                  }
                                >
                                  {
                                    grupo.nome
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <div>
                          <div
                            style={{
                              marginBottom:
                                '7px',
                              fontSize:
                                '12px',
                              fontWeight:
                                700,
                            }}
                          >
                            Padrões
                          </div>

                          <div
                            style={{
                              display:
                                'grid',
                              gridTemplateColumns:
                                'repeat(2, minmax(0, 1fr))',
                              gap: '8px',
                            }}
                          >
                            <label
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap: '8px',
                                padding:
                                  '11px',
                                borderRadius:
                                  '11px',
                                background:
                                  '#0c1811',
                                border:
                                  '1px solid #284334',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  loteEdicao
                                }
                                onChange={(
                                  e
                                ) =>
                                  setLoteEdicao(
                                    e.target
                                      .checked
                                  )
                                }
                                style={{
                                  width:
                                    '18px',
                                  height:
                                    '18px',
                                  margin: 0,
                                  flexShrink: 0,
                                }}
                              />

                              <span
                                style={{
                                  fontSize:
                                    '11px',
                                }}
                              >
                                Controla
                                lote
                              </span>
                            </label>

                            <label
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap: '8px',
                                padding:
                                  '11px',
                                borderRadius:
                                  '11px',
                                background:
                                  '#0c1811',
                                border:
                                  '1px solid #284334',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={
                                  validadeEdicao
                                }
                                onChange={(
                                  e
                                ) =>
                                  setValidadeEdicao(
                                    e.target
                                      .checked
                                  )
                                }
                                style={{
                                  width:
                                    '18px',
                                  height:
                                    '18px',
                                  margin: 0,
                                  flexShrink: 0,
                                }}
                              />

                              <span
                                style={{
                                  fontSize:
                                    '11px',
                                }}
                              >
                                Controla
                                validade
                              </span>
                            </label>
                          </div>
                        </div>

                        <label>
                          Local habitual

                          <select
                            value={
                              localEdicao
                            }
                            onChange={(e) =>
                              setLocalEdicao(
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Não definido
                            </option>

                            {locaisAtivos.map(
                              (local) => (
                                <option
                                  key={
                                    local.id
                                  }
                                  value={
                                    local.id
                                  }
                                >
                                  {
                                    local.nome
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </label>

                        <label>
                          Situação

                          <select
                            value={
                              situacaoEdicao
                            }
                            onChange={(e) =>
                              setSituacaoEdicao(
                                e.target
                                  .value as Situacao
                              )
                            }
                          >
                            <option value="ATIVO">
                              Ativo
                            </option>

                            <option value="INATIVO">
                              Inativo
                            </option>
                          </select>
                        </label>

                        {erro && (
                          <div
                            className="error"
                            role="alert"
                          >
                            {erro}
                          </div>
                        )}

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap: '8px',
                          }}
                        >
                          <button
                            className="btn"
                            type="submit"
                          >
                            Salvar
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelarEdicao
                            }
                            style={{
                              minHeight:
                                '44px',
                              borderRadius:
                                '11px',
                              border:
                                '1px solid #284334',
                              background:
                                '#0c1811',
                              color:
                                '#fff',
                              fontWeight:
                                700,
                              cursor:
                                'pointer',
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
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
                              '11px',
                            borderBottom:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize:
                                  '14px',
                              }}
                            >
                              {
                                categoria.nome
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
                              Grupo:{' '}
                              {categoria
                                .grupo
                                ?.nome ||
                                'Não definido'}
                            </div>
                          </div>

                          <span
                            style={{
                              padding:
                                '4px 7px',
                              borderRadius:
                                '999px',
                              background:
                                categoria.situacao ===
                                'ATIVO'
                                  ? 'rgba(43,138,87,.12)'
                                  : 'rgba(245,158,11,.10)',
                              border:
                                categoria.situacao ===
                                'ATIVO'
                                  ? '1px solid rgba(43,138,87,.45)'
                                  : '1px solid rgba(245,158,11,.4)',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              categoria.situacao
                            }
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
                          <CampoInfo
                            titulo="Lote por padrão"
                            valor={
                              categoria.controlaLotePadrao
                                ? 'Sim'
                                : 'Não'
                            }
                          />

                          <CampoInfo
                            titulo="Validade por padrão"
                            valor={
                              categoria.controlaValidadePadrao
                                ? 'Sim'
                                : 'Não'
                            }
                          />

                          <CampoInfo
                            titulo="Local habitual"
                            valor={
                              categoria
                                .localPadrao
                                ?.nome ||
                              'Não definido'
                            }
                          />

                          <CampoInfo
                            titulo="Gêneros vinculados"
                            valor={
                              categoria
                                ._count
                                ?.generos ??
                              0
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              categoria
                            )
                          }
                          style={{
                            width: '100%',
                            marginTop:
                              '12px',
                          }}
                        >
                          Editar categoria
                        </button>
                      </>
                    )}
                  </article>
                )
              )
            ) : (
              <div
                style={{
                  padding: '13px',
                  borderRadius:
                    '11px',
                  background:
                    '#102018',
                  border:
                    '1px solid #284334',
                }}
              >
                <span className="muted">
                  Nenhuma categoria
                  cadastrada.
                </span>
              </div>
            )}

            {sucesso &&
              !editando && (
                <div
                  role="status"
                  style={{
                    padding: '11px',
                    borderRadius:
                      '10px',
                    background:
                      'rgba(43,138,87,.08)',
                    border:
                      '1px solid rgba(43,138,87,.4)',
                    fontSize: '12px',
                  }}
                >
                  <strong>
                    ✓ {sucesso}
                  </strong>
                </div>
              )}
          </div>
        )}
      </div>
    </>
  );
}

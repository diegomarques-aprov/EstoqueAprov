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
  descricao: string | null;
  situacao: Situacao;
  _count?: {
    categorias: number;
  };
};

export default function GruposGenerosClient() {
  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [erro, setErro] =
    useState('');

  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarGrupos,
    setMostrarGrupos,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Grupo | null>(null);

  const [
    nomeEdicao,
    setNomeEdicao,
  ] = useState('');

  const [
    descricaoEdicao,
    setDescricaoEdicao,
  ] = useState('');

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] =
    useState<Situacao>('ATIVO');

  const nomeRef =
    useRef<HTMLInputElement>(null);

  async function carregarDados() {
    try {
      const resposta = await fetch(
        '/api/grupos-generos',
        {
          cache: 'no-store',
        }
      );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível carregar os grupos.'
        );

        return;
      }

      setGrupos(dados);
    } catch {
      setErro(
        'Não foi possível carregar os grupos.'
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function adicionar(
    ev: FormEvent<HTMLFormElement>
  ) {
    ev.preventDefault();

    const form =
      ev.currentTarget;

    const dados =
      new FormData(form);

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(
        '/api/grupos-generos',
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

            descricao:
              String(
                dados.get(
                  'descricao'
                ) || ''
              ).trim() || null,
          }),
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível cadastrar o grupo.'
        );

        return;
      }

      form.reset();

      setSucesso(
        'Grupo cadastrado com sucesso.'
      );

      await carregarDados();

      nomeRef.current?.focus();
    } catch {
      setErro(
        'Não foi possível cadastrar o grupo.'
      );
    }
  }

  function iniciarEdicao(
    grupo: Grupo
  ) {
    setEditando(grupo);

    setNomeEdicao(
      grupo.nome
    );

    setDescricaoEdicao(
      grupo.descricao || ''
    );

    setSituacaoEdicao(
      grupo.situacao
    );

    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEdicao('');
    setDescricaoEdicao('');
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
        '/api/grupos-generos',
        {
          method: 'PUT',
          headers: {
            'content-type':
              'application/json',
          },
          body: JSON.stringify({
            id: editando.id,
            nome:
              nomeEdicao.trim(),

            descricao:
              descricaoEdicao.trim() ||
              null,

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
            'Não foi possível alterar o grupo.'
        );

        return;
      }

      setEditando(null);
      setNomeEdicao('');
      setDescricaoEdicao('');
      setSituacaoEdicao('ATIVO');

      setSucesso(
        'Grupo atualizado com sucesso.'
      );

      await carregarDados();
    } catch {
      setErro(
        'Não foi possível alterar o grupo.'
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
          border:
            '1px solid #284334',
          marginBottom: '16px',
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
            marginBottom: '15px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Novo grupo
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Crie um grupo para
              organizar categorias
              semelhantes do estoque.
            </div>
          </div>

          <span
            style={{
              padding: '5px 8px',
              borderRadius: '999px',
              background: '#183d2a',
              border:
                '1px solid #284334',
              fontSize: '10px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            GRUPO
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
            Nome do grupo

            <input
              ref={nomeRef}
              name="nome"
              required
              autoFocus
              maxLength={80}
              placeholder="Ex.: Carnes"
            />
          </label>

          <label>
            Descrição

            <input
              name="descricao"
              maxLength={200}
              placeholder="Ex.: Carnes bovinas, aves, suínos e peixes"
            />
          </label>

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
              Depois de cadastrar o
              grupo, ele poderá ser
              selecionado no cadastro
              das categorias.
            </span>
          </div>

          <button
            className="btn"
            type="submit"
            style={{
              width: '100%',
              minHeight: '46px',
            }}
          >
            Adicionar grupo
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

          {erro &&
            !editando && (
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
          border:
            '1px solid #284334',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() =>
            setMostrarGrupos(
              !mostrarGrupos
            )
          }
          style={{
            width: '100%',
          }}
        >
          {mostrarGrupos
            ? 'Ocultar grupos cadastrados'
            : `Ver grupos cadastrados (${grupos.length})`}
        </button>

        {mostrarGrupos && (
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
                Grupos cadastrados
              </strong>

              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                {grupos.length}{' '}
                grupo(s)
              </span>
            </div>

            {grupos.length > 0 ? (
              grupos.map(
                (grupo) => (
                  <article
                    key={grupo.id}
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editando?.id ===
                        grupo.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editando?.id ===
                    grupo.id ? (
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
                            Editar grupo
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
                            Atualize os
                            dados e a
                            situação deste
                            grupo.
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
                          Descrição

                          <input
                            value={
                              descricaoEdicao
                            }
                            onChange={(e) =>
                              setDescricaoEdicao(
                                e.target
                                  .value
                              )
                            }
                            maxLength={200}
                          />
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
                          <div
                            style={{
                              minWidth: 0,
                              flex: 1,
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
                              {grupo.nome}
                            </strong>

                            <div
                              className="muted"
                              style={{
                                marginTop:
                                  '4px',
                                fontSize:
                                  '11px',
                                lineHeight:
                                  1.45,
                              }}
                            >
                              {grupo.descricao ||
                                'Sem descrição'}
                            </div>
                          </div>

                          <span
                            style={{
                              padding:
                                '4px 7px',
                              borderRadius:
                                '999px',
                              background:
                                grupo.situacao ===
                                'ATIVO'
                                  ? 'rgba(43,138,87,.12)'
                                  : 'rgba(245,158,11,.10)',
                              border:
                                grupo.situacao ===
                                'ATIVO'
                                  ? '1px solid rgba(43,138,87,.45)'
                                  : '1px solid rgba(245,158,11,.4)',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              grupo.situacao
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            padding:
                              '10px 11px',
                            borderRadius:
                              '10px',
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
                                '10px',
                              marginBottom:
                                '2px',
                            }}
                          >
                            Categorias
                            vinculadas
                          </div>

                          <strong
                            style={{
                              fontSize:
                                '14px',
                            }}
                          >
                            {grupo._count
                              ?.categorias ??
                              0}
                          </strong>
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              grupo
                            )
                          }
                          style={{
                            width: '100%',
                            marginTop:
                              '12px',
                          }}
                        >
                          Editar grupo
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
                  Nenhum grupo
                  cadastrado.
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

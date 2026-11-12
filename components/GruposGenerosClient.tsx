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

const estiloBotaoPequeno = {
  width: 'auto',
  minHeight: '34px',
  padding: '6px 11px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 700,
} as const;

const estiloBotaoSecundario = {
  width: 'auto',
  minHeight: '34px',
  padding: '6px 11px',
  borderRadius: '8px',
  border: '1px solid #284334',
  background: '#0c1811',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
} as const;

const estiloBotaoExcluir = {
  width: 'auto',
  minHeight: '34px',
  padding: '6px 11px',
  borderRadius: '8px',
  border:
    '1px solid rgba(239,68,68,.55)',
  background:
    'rgba(239,68,68,.08)',
  color: '#fca5a5',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
} as const;

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
    excluindoId,
    setExcluindoId,
  ] = useState<string | null>(
    null
  );

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

  useEffect(() => {
    if (!sucesso) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSucesso('');
        },
        4000
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [sucesso]);

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

      await carregarDados();

      setSucesso(
        'Grupo cadastrado com sucesso.'
      );

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

      await carregarDados();

      setSucesso(
        'Grupo atualizado com sucesso.'
      );
    } catch {
      setErro(
        'Não foi possível alterar o grupo.'
      );
    }
  }

  async function excluirGrupo(
    grupo: Grupo
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir o grupo "${grupo.nome}"?\n\nA exclusão somente será realizada se não houver categorias vinculadas a este grupo.`
      );

    if (!confirmar) {
      return;
    }

    setErro('');
    setSucesso('');
    setExcluindoId(grupo.id);

    try {
      const resposta = await fetch(
        '/api/grupos-generos',
        {
          method: 'DELETE',

          headers: {
            'content-type':
              'application/json',
          },

          body: JSON.stringify({
            id: grupo.id,
          }),
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível excluir o grupo.'
        );

        return;
      }

      await carregarDados();

      setSucesso(
        resultado.mensagem ||
          `Grupo "${grupo.nome}" excluído com sucesso.`
      );
    } catch {
      setErro(
        'Não foi possível comunicar com o servidor para excluir o grupo.'
      );
    } finally {
      setExcluindoId(null);
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

          <div>
            <button
              className="btn"
              type="submit"
              style={
                estiloBotaoPequeno
              }
            >
              + Adicionar grupo
            </button>
          </div>

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

      {sucesso && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: '16px',
            padding: '11px 13px',
            borderRadius: '10px',
            background: '#123d27',
            border:
              '1px solid #2f9e62',
            color: '#b9f6cf',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow:
              '0 4px 14px rgba(0,0,0,.18)',
          }}
        >
          ✓ {sucesso}
        </div>
      )}

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
          style={
            estiloBotaoPequeno
          }
        >
          {mostrarGrupos
            ? '− Ocultar grupos'
            : `+ Ver grupos (${grupos.length})`}
        </button>

        {mostrarGrupos && (
          <div
            style={{
              display: 'grid',
              gap: '8px',
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
                      padding: '12px',
                      borderRadius:
                        '11px',
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
                              'flex',
                            flexWrap:
                              'wrap',
                            gap: '8px',
                          }}
                        >
                          <button
                            className="btn"
                            type="submit"
                            style={
                              estiloBotaoPequeno
                            }
                          >
                            ✓ Salvar
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelarEdicao
                            }
                            style={
                              estiloBotaoSecundario
                            }
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

                            {(grupo._count
                              ?.categorias ??
                              0) > 0 && (
                              <div
                                className="muted"
                                style={{
                                  marginTop:
                                    '5px',
                                  fontSize:
                                    '10px',
                                }}
                              >
                                {
                                  grupo
                                    ._count
                                    ?.categorias
                                }{' '}
                                categoria(s)
                                vinculada(s)
                              </div>
                            )}
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
                            display:
                              'flex',
                            flexWrap:
                              'wrap',
                            gap: '7px',
                            marginTop:
                              '9px',
                          }}
                        >
                          <button
                            type="button"
                            className="btn"
                            onClick={() =>
                              iniciarEdicao(
                                grupo
                              )
                            }
                            style={
                              estiloBotaoPequeno
                            }
                          >
                            Editar grupo
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirGrupo(
                                grupo
                              )
                            }
                            disabled={
                              excluindoId ===
                              grupo.id
                            }
                            style={{
                              ...estiloBotaoExcluir,
                              opacity:
                                excluindoId ===
                                grupo.id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {excluindoId ===
                            grupo.id
                              ? 'Excluindo...'
                              : 'Excluir'}
                          </button>
                        </div>
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
          </div>
        )}
      </div>
    </>
  );
}

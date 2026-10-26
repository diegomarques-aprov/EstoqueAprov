'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type Local = {
  id: string;
  nome: string;
  descricao?: string | null;
  situacao?: string;
};

export default function LocaisClient() {
  const [locais, setLocais] =
    useState<Local[]>([]);

  const [erro, setErro] =
    useState('');

  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarLocais,
    setMostrarLocais,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Local | null>(null);

  const [
    nomeEdicao,
    setNomeEdicao,
  ] = useState('');

  const [
    descricaoEdicao,
    setDescricaoEdicao,
  ] = useState('');

  const nomeRef =
    useRef<HTMLInputElement>(null);

  async function carregarLocais() {
    const r = await fetch(
      '/api/locais'
    );

    if (r.ok) {
      setLocais(
        await r.json()
      );
    }
  }

  useEffect(() => {
    carregarLocais();
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

    const r = await fetch(
      '/api/locais',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(dados)
        ),
      }
    );

    const resposta =
      await r.json();

    if (!r.ok) {
      setErro(
        resposta.error ||
          'Não foi possível cadastrar o local. Verifique os dados informados.'
      );

      return;
    }

    form.reset();

    setSucesso(
      'Local cadastrado com sucesso.'
    );

    await carregarLocais();

    nomeRef.current?.focus();
  }

  function iniciarEdicao(
    local: Local
  ) {
    setEditando(local);

    setNomeEdicao(
      local.nome
    );

    setDescricaoEdicao(
      local.descricao || ''
    );

    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEdicao('');
    setDescricaoEdicao('');
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

    const r = await fetch(
      '/api/locais',
      {
        method: 'PUT',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          id: editando.id,
          nome: nomeEdicao,
          descricao:
            descricaoEdicao,
        }),
      }
    );

    const resposta =
      await r.json();

    if (!r.ok) {
      setErro(
        resposta.error ||
          'Não foi possível atualizar o local. Verifique os dados informados.'
      );

      return;
    }

    setEditando(null);
    setNomeEdicao('');
    setDescricaoEdicao('');

    setSucesso(
      'Local atualizado com sucesso.'
    );

    await carregarLocais();
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
              Novo local
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Cadastre um local físico
              utilizado para armazenar
              gêneros alimentícios.
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
            LOCAL
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
            Nome do local

            <input
              ref={nomeRef}
              name="nome"
              required
              autoFocus
              placeholder="Ex.: Câmara de Resfriamento"
            />
          </label>

          <label>
            Descrição

            <input
              name="descricao"
              placeholder="Ex.: Armazenamento de hortifruti / FLV"
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
              O local cadastrado poderá
              ser utilizado nos
              recebimentos, estoque
              inicial e como local
              habitual dos gêneros.
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
            Adicionar local
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
            setMostrarLocais(
              !mostrarLocais
            )
          }
          style={{
            width: '100%',
          }}
        >
          {mostrarLocais
            ? 'Ocultar locais cadastrados'
            : `Ver locais cadastrados (${locais.length})`}
        </button>

        {mostrarLocais && (
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
                Locais cadastrados
              </strong>

              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                {locais.length}{' '}
                local(is)
              </span>
            </div>

            {locais.length ? (
              locais.map(
                (local) => (
                  <article
                    key={local.id}
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editando?.id ===
                        local.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editando?.id ===
                    local.id ? (
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
                            Editar local
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
                            Atualize o nome
                            ou a descrição
                            do local.
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
                          />
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
                              color: '#fff',
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
                              {local.nome}
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
                              {local.descricao ||
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
                                local.situacao ===
                                'INATIVO'
                                  ? 'rgba(245,158,11,.10)'
                                  : 'rgba(43,138,87,.12)',
                              border:
                                local.situacao ===
                                'INATIVO'
                                  ? '1px solid rgba(245,158,11,.4)'
                                  : '1px solid rgba(43,138,87,.45)',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {local.situacao ||
                              'ATIVO'}
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
                                '3px',
                            }}
                          >
                            Uso no estoque
                          </div>

                          <div
                            style={{
                              fontSize:
                                '11px',
                              lineHeight:
                                1.45,
                            }}
                          >
                            Local disponível
                            para armazenamento
                            e movimentação de
                            gêneros.
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              local
                            )
                          }
                          style={{
                            width: '100%',
                            marginTop:
                              '12px',
                          }}
                        >
                          Editar local
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
                  Nenhum local
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

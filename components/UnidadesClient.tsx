'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type Situacao =
  | 'ATIVO'
  | 'INATIVO';

type Unidade = {
  id: string;
  sigla: string;
  nome: string;
  situacao: Situacao;
};

export default function UnidadesClient() {
  const [unidades, setUnidades] =
    useState<Unidade[]>([]);

  const [erro, setErro] =
    useState('');

  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarUnidades,
    setMostrarUnidades,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Unidade | null>(null);

  const [
    siglaEdicao,
    setSiglaEdicao,
  ] = useState('');

  const [
    nomeEdicao,
    setNomeEdicao,
  ] = useState('');

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] = useState<Situacao>(
    'ATIVO'
  );

  const siglaRef =
    useRef<HTMLInputElement>(
      null
    );

  async function carregarUnidades() {
    try {
      const resposta =
        await fetch(
          '/api/unidades',
          {
            cache: 'no-store',
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível carregar as unidades de medida.'
        );

        return;
      }

      setUnidades(dados);
    } catch {
      setErro(
        'Não foi possível carregar as unidades de medida.'
      );
    }
  }

  useEffect(() => {
    carregarUnidades();
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
      const resposta =
        await fetch(
          '/api/unidades',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/json',
            },
            body: JSON.stringify({
              sigla: String(
                dados.get(
                  'sigla'
                ) || ''
              ).trim(),
              nome: String(
                dados.get(
                  'nome'
                ) || ''
              ).trim(),
            }),
          }
        );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível cadastrar a unidade de medida.'
        );

        return;
      }

      form.reset();

      setSucesso(
        'Unidade de medida cadastrada com sucesso.'
      );

      await carregarUnidades();

      siglaRef.current?.focus();
    } catch {
      setErro(
        'Não foi possível cadastrar a unidade de medida.'
      );
    }
  }

  function iniciarEdicao(
    unidade: Unidade
  ) {
    setEditando(unidade);

    setSiglaEdicao(
      unidade.sigla
    );

    setNomeEdicao(
      unidade.nome
    );

    setSituacaoEdicao(
      unidade.situacao
    );

    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setSiglaEdicao('');
    setNomeEdicao('');
    setSituacaoEdicao(
      'ATIVO'
    );
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
      const resposta =
        await fetch(
          '/api/unidades',
          {
            method: 'PUT',
            headers: {
              'content-type':
                'application/json',
            },
            body: JSON.stringify({
              id: editando.id,
              sigla:
                siglaEdicao.trim(),
              nome:
                nomeEdicao.trim(),
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
            'Não foi possível alterar a unidade de medida.'
        );

        return;
      }

      setEditando(null);
      setSiglaEdicao('');
      setNomeEdicao('');
      setSituacaoEdicao(
        'ATIVO'
      );

      setSucesso(
        'Unidade de medida atualizada com sucesso.'
      );

      await carregarUnidades();
    } catch {
      setErro(
        'Não foi possível alterar a unidade de medida.'
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
              Nova unidade
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
                lineHeight: 1.4,
              }}
            >
              Informe a sigla e o
              nome da unidade de
              medida.
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
            UNIDADE
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
            Sigla

            <input
              ref={siglaRef}
              name="sigla"
              required
              autoFocus
              maxLength={10}
              placeholder="Ex.: kg"
            />
          </label>

          <label>
            Nome da unidade

            <input
              name="nome"
              required
              maxLength={60}
              placeholder="Ex.: Quilograma"
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
                display: 'block',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              A unidade cadastrada
              ficará disponível para
              utilização nos gêneros
              QS e QR.
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
            Adicionar unidade
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
            setMostrarUnidades(
              !mostrarUnidades
            )
          }
          style={{
            width: '100%',
          }}
        >
          {mostrarUnidades
            ? 'Ocultar unidades cadastradas'
            : `Ver unidades cadastradas (${unidades.length})`}
        </button>

        {mostrarUnidades && (
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
                Unidades cadastradas
              </strong>

              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                {unidades.length}{' '}
                unidade(s)
              </span>
            </div>

            {unidades.length >
            0 ? (
              unidades.map(
                (unidade) => (
                  <article
                    key={
                      unidade.id
                    }
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editando?.id ===
                        unidade.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editando?.id ===
                    unidade.id ? (
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
                            Editar
                            unidade
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
                            dados ou a
                            situação da
                            unidade.
                          </div>
                        </div>

                        <label>
                          Sigla

                          <input
                            value={
                              siglaEdicao
                            }
                            onChange={(
                              e
                            ) =>
                              setSiglaEdicao(
                                e.target
                                  .value
                              )
                            }
                            required
                            maxLength={
                              10
                            }
                            autoFocus
                          />
                        </label>

                        <label>
                          Nome

                          <input
                            value={
                              nomeEdicao
                            }
                            onChange={(
                              e
                            ) =>
                              setNomeEdicao(
                                e.target
                                  .value
                              )
                            }
                            required
                            maxLength={
                              60
                            }
                          />
                        </label>

                        <label>
                          Situação

                          <select
                            value={
                              situacaoEdicao
                            }
                            onChange={(
                              e
                            ) =>
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

                        <div
                          style={{
                            padding:
                              '10px 11px',
                            borderRadius:
                              '10px',
                            background:
                              situacaoEdicao ===
                              'ATIVO'
                                ? 'rgba(43,138,87,.07)'
                                : 'rgba(245,158,11,.07)',
                            border:
                              situacaoEdicao ===
                              'ATIVO'
                                ? '1px solid rgba(43,138,87,.35)'
                                : '1px solid rgba(245,158,11,.35)',
                          }}
                        >
                          <strong
                            style={{
                              display:
                                'block',
                              fontSize:
                                '11px',
                              marginBottom:
                                '3px',
                            }}
                          >
                            {situacaoEdicao ===
                            'ATIVO'
                              ? 'Unidade ativa'
                              : 'Unidade inativa'}
                          </strong>

                          <span
                            className="muted"
                            style={{
                              display:
                                'block',
                              fontSize:
                                '10px',
                              lineHeight:
                                1.4,
                            }}
                          >
                            {situacaoEdicao ===
                            'ATIVO'
                              ? 'A unidade permanece disponível para utilização nos cadastros.'
                              : 'A unidade ficará marcada como inativa no sistema.'}
                          </span>
                        </div>

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
                              '11px',
                            marginBottom:
                              '11px',
                            borderBottom:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div
                            style={{
                              minWidth:
                                0,
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                gap: '8px',
                                flexWrap:
                                  'wrap',
                              }}
                            >
                              <strong
                                style={{
                                  fontSize:
                                    '18px',
                                }}
                              >
                                {
                                  unidade.sigla
                                }
                              </strong>

                              <span
                                style={{
                                  padding:
                                    '3px 6px',
                                  borderRadius:
                                    '999px',
                                  background:
                                    '#183d2a',
                                  border:
                                    '1px solid #284334',
                                  fontSize:
                                    '9px',
                                  fontWeight:
                                    800,
                                }}
                              >
                                MEDIDA
                              </span>
                            </div>

                            <div
                              className="muted"
                              style={{
                                marginTop:
                                  '4px',
                                fontSize:
                                  '12px',
                              }}
                            >
                              {
                                unidade.nome
                              }
                            </div>
                          </div>

                          <span
                            style={{
                              padding:
                                '4px 7px',
                              borderRadius:
                                '999px',
                              background:
                                unidade.situacao ===
                                'ATIVO'
                                  ? 'rgba(43,138,87,.12)'
                                  : 'rgba(245,158,11,.10)',
                              border:
                                unidade.situacao ===
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
                              unidade.situacao
                            }
                          </span>
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
                          <div
                            style={{
                              padding:
                                '9px',
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
                                  '9px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              SIGLA
                            </div>

                            <strong
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              {
                                unidade.sigla
                              }
                            </strong>
                          </div>

                          <div
                            style={{
                              padding:
                                '9px',
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
                                  '9px',
                                marginBottom:
                                  '3px',
                              }}
                            >
                              SITUAÇÃO
                            </div>

                            <strong
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              {unidade.situacao ===
                              'ATIVO'
                                ? 'Ativa'
                                : 'Inativa'}
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              unidade
                            )
                          }
                          style={{
                            width:
                              '100%',
                            marginTop:
                              '12px',
                          }}
                        >
                          Editar unidade
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
                <span
                  className="muted"
                  style={{
                    fontSize: '12px',
                  }}
                >
                  Nenhuma unidade
                  de medida
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

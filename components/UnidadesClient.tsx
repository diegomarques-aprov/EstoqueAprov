'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type Situacao = 'ATIVO' | 'INATIVO';

type Unidade = {
  id: string;
  sigla: string;
  nome: string;
  situacao: Situacao;
  _count?: {
    generos: number;
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
    excluindoId,
    setExcluindoId,
  ] = useState<string | null>(null);

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
  ] =
    useState<Situacao>('ATIVO');

  const siglaRef =
    useRef<HTMLInputElement>(null);

  async function carregarUnidades() {
    try {
      const resposta = await fetch(
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
        '/api/unidades',
        {
          method: 'POST',

          headers: {
            'content-type':
              'application/json',
          },

          body: JSON.stringify({
            sigla: String(
              dados.get('sigla') || ''
            ).trim(),

            nome: String(
              dados.get('nome') || ''
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

      await carregarUnidades();

      setSucesso(
        'Unidade de medida cadastrada com sucesso.'
      );

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
    setSiglaEdicao(unidade.sigla);
    setNomeEdicao(unidade.nome);
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
      setSituacaoEdicao('ATIVO');

      await carregarUnidades();

      setSucesso(
        'Unidade de medida atualizada com sucesso.'
      );
    } catch {
      setErro(
        'Não foi possível alterar a unidade de medida.'
      );
    }
  }

  async function excluirUnidade(
    unidade: Unidade
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir a unidade "${unidade.sigla} - ${unidade.nome}"?\n\nA exclusão somente será realizada se não houver gêneros vinculados a esta unidade.`
      );

    if (!confirmar) {
      return;
    }

    setErro('');
    setSucesso('');
    setExcluindoId(unidade.id);

    try {
      const resposta = await fetch(
        '/api/unidades',
        {
          method: 'DELETE',

          headers: {
            'content-type':
              'application/json',
          },

          body: JSON.stringify({
            id: unidade.id,
          }),
        }
      );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível excluir a unidade de medida.'
        );

        return;
      }

      await carregarUnidades();

      setSucesso(
        resultado.mensagem ||
          `Unidade "${unidade.sigla} - ${unidade.nome}" excluída com sucesso.`
      );
    } catch {
      setErro(
        'Não foi possível comunicar com o servidor para excluir a unidade de medida.'
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
              Informe a sigla e o nome
              da unidade de medida.
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
              A unidade cadastrada ficará
              disponível para utilização
              nos gêneros QS e QR.
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
              + Adicionar unidade
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
            setMostrarUnidades(
              !mostrarUnidades
            )
          }
          style={
            estiloBotaoPequeno
          }
        >
          {mostrarUnidades
            ? '− Ocultar unidades'
            : `+ Ver unidades (${unidades.length})`}
        </button>

        {mostrarUnidades && (
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

            {unidades.length > 0 ? (
              unidades.map(
                (unidade) => (
                  <article
                    key={unidade.id}
                    style={{
                      padding: '12px',
                      borderRadius:
                        '11px',
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
                            Editar unidade
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
                            onChange={(e) =>
                              setSiglaEdicao(
                                e.target
                                  .value
                              )
                            }
                            required
                            maxLength={10}
                            autoFocus
                          />
                        </label>

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
                            maxLength={60}
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
                            <div
                              style={{
                                display:
                                  'flex',
                                alignItems:
                                  'baseline',
                                gap: '7px',
                                flexWrap:
                                  'wrap',
                              }}
                            >
                              <strong
                                style={{
                                  fontSize:
                                    '15px',
                                }}
                              >
                                {
                                  unidade.sigla
                                }
                              </strong>

                              <span
                                className="muted"
                                style={{
                                  fontSize:
                                    '11px',
                                }}
                              >
                                {
                                  unidade.nome
                                }
                              </span>
                            </div>

                            {(unidade
                              ._count
                              ?.generos ??
                              0) > 0 && (
                              <div
                                className="muted"
                                style={{
                                  marginTop:
                                    '4px',
                                  fontSize:
                                    '10px',
                                }}
                              >
                                {
                                  unidade
                                    ._count
                                    ?.generos
                                }{' '}
                                gênero(s)
                                vinculado(s)
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
                                unidade
                              )
                            }
                            style={
                              estiloBotaoPequeno
                            }
                          >
                            Editar unidade
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirUnidade(
                                unidade
                              )
                            }
                            disabled={
                              excluindoId ===
                              unidade.id
                            }
                            style={{
                              ...estiloBotaoExcluir,

                              opacity:
                                excluindoId ===
                                unidade.id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {excluindoId ===
                            unidade.id
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
                  Nenhuma unidade de
                  medida cadastrada.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

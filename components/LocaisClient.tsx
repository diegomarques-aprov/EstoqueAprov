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

    await carregarLocais();

    setSucesso(
      'Local cadastrado com sucesso.'
    );

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

    await carregarLocais();

    setSucesso(
      'Local atualizado com sucesso.'
    );
  }

  async function excluirLocal(
    local: Local
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir o local "${local.nome}"?\n\nEssa ação somente será realizada se o local ainda não possuir vínculos com gêneros, estoque, recebimentos ou movimentações.`
      );

    if (!confirmar) {
      return;
    }

    setErro('');
    setSucesso('');
    setExcluindoId(local.id);

    try {
      const r = await fetch(
        '/api/locais',
        {
          method: 'DELETE',

          headers: {
            'content-type':
              'application/json',
          },

          body: JSON.stringify({
            id: local.id,
          }),
        }
      );

      const resposta =
        await r.json();

      if (!r.ok) {
        setErro(
          resposta.error ||
            'Não foi possível excluir o local.'
        );

        return;
      }

      await carregarLocais();

      setSucesso(
        resposta.mensagem ||
          `Local "${local.nome}" excluído com sucesso.`
      );
    } catch {
      setErro(
        'Não foi possível comunicar com o servidor para excluir o local.'
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

          <div>
            <button
              className="btn"
              type="submit"
              style={
                estiloBotaoPequeno
              }
            >
              + Adicionar local
            </button>
          </div>

          {erro && (
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
            setMostrarLocais(
              !mostrarLocais
            )
          }
          style={
            estiloBotaoPequeno
          }
        >
          {mostrarLocais
            ? '− Ocultar locais'
            : `+ Ver locais (${locais.length})`}
        </button>

        {mostrarLocais && (
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
                      padding: '12px',
                      borderRadius:
                        '11px',
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
                                local
                              )
                            }
                            style={
                              estiloBotaoPequeno
                            }
                          >
                            Editar local
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirLocal(
                                local
                              )
                            }
                            disabled={
                              excluindoId ===
                              local.id
                            }
                            style={{
                              ...estiloBotaoExcluir,
                              opacity:
                                excluindoId ===
                                local.id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {excluindoId ===
                            local.id
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
                  Nenhum local
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

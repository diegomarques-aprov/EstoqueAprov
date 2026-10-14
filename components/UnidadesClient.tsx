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
};

export default function UnidadesClient() {
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [mostrarUnidades, setMostrarUnidades] =
    useState(false);

  const [editando, setEditando] =
    useState<Unidade | null>(null);

  const [siglaEdicao, setSiglaEdicao] =
    useState('');

  const [nomeEdicao, setNomeEdicao] =
    useState('');

  const [situacaoEdicao, setSituacaoEdicao] =
    useState<Situacao>('ATIVO');

  const siglaRef = useRef<HTMLInputElement>(null);

  async function carregarUnidades() {
    try {
      const resposta = await fetch('/api/unidades', {
        cache: 'no-store',
      });

      const dados = await resposta.json();

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

    const form = ev.currentTarget;
    const dados = new FormData(form);

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch('/api/unidades', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sigla: String(
            dados.get('sigla') || ''
          ).trim(),
          nome: String(
            dados.get('nome') || ''
          ).trim(),
        }),
      });

      const resultado = await resposta.json();

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

  function iniciarEdicao(unidade: Unidade) {
    setEditando(unidade);
    setSiglaEdicao(unidade.sigla);
    setNomeEdicao(unidade.nome);
    setSituacaoEdicao(unidade.situacao);

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
      const resposta = await fetch('/api/unidades', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          id: editando.id,
          sigla: siglaEdicao.trim(),
          nome: nomeEdicao.trim(),
          situacao: situacaoEdicao,
        }),
      });

      const resultado = await resposta.json();

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
      <div className="card">
        <h2>Nova unidade de medida</h2>

        <p className="muted">
          Informe a sigla e o nome da unidade utilizada
          para controlar os gêneros.
        </p>

        <form onSubmit={adicionar}>
          <label>Sigla</label>

          <input
            ref={siglaRef}
            name="sigla"
            required
            autoFocus
            maxLength={10}
            placeholder="Ex.: kg"
          />

          <label>Nome</label>

          <input
            name="nome"
            required
            maxLength={60}
            placeholder="Ex.: Quilograma"
          />

          <button
            className="btn"
            type="submit"
          >
            Adicionar unidade
          </button>

          {sucesso && !editando && (
            <p role="status">
              <strong>
                ✓ {sucesso}
              </strong>
            </p>
          )}

          {erro && !editando && (
            <p
              className="error"
              role="alert"
            >
              {erro}
            </p>
          )}
        </form>
      </div>

      <div className="card">
        <button
          type="button"
          className="linkbtn"
          onClick={() =>
            setMostrarUnidades(
              !mostrarUnidades
            )
          }
        >
          {mostrarUnidades
            ? 'Ocultar unidades cadastradas'
            : `Ver unidades cadastradas (${unidades.length})`}
        </button>

        {mostrarUnidades && (
          <>
            <h2>Unidades cadastradas</h2>

            {unidades.length > 0 ? (
              unidades.map((unidade) => (
                <div
                  className="row"
                  key={unidade.id}
                >
                  {editando?.id ===
                  unidade.id ? (
                    <form
                      onSubmit={salvarEdicao}
                      style={{
                        width: '100%',
                      }}
                    >
                      <h3>
                        Editar unidade
                      </h3>

                      <label>Sigla</label>

                      <input
                        value={siglaEdicao}
                        onChange={(e) =>
                          setSiglaEdicao(
                            e.target.value
                          )
                        }
                        required
                        maxLength={10}
                        autoFocus
                      />

                      <label>Nome</label>

                      <input
                        value={nomeEdicao}
                        onChange={(e) =>
                          setNomeEdicao(
                            e.target.value
                          )
                        }
                        required
                        maxLength={60}
                      />

                      <label>Situação</label>

                      <select
                        value={situacaoEdicao}
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

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          className="btn"
                          type="submit"
                        >
                          Salvar alterações
                        </button>

                        <button
                          className="linkbtn"
                          type="button"
                          onClick={
                            cancelarEdicao
                          }
                        >
                          Cancelar
                        </button>
                      </div>

                      {erro && (
                        <p
                          className="error"
                          role="alert"
                        >
                          {erro}
                        </p>
                      )}
                    </form>
                  ) : (
                    <>
                      <div>
                        <b>
                          {unidade.sigla}
                        </b>

                        <div className="muted">
                          {unidade.nome}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="tag">
                          {unidade.situacao ===
                          'ATIVO'
                            ? 'ATIVO'
                            : 'INATIVO'}
                        </span>

                        <button
                          type="button"
                          className="linkbtn"
                          onClick={() =>
                            iniciarEdicao(
                              unidade
                            )
                          }
                        >
                          Editar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">
                Nenhuma unidade de medida cadastrada.
              </p>
            )}

            {sucesso && !editando && (
              <p role="status">
                <strong>
                  ✓ {sucesso}
                </strong>
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

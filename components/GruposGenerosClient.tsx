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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [mostrarGrupos, setMostrarGrupos] =
    useState(false);

  const [editando, setEditando] =
    useState<Grupo | null>(null);

  const [nomeEdicao, setNomeEdicao] =
    useState('');

  const [descricaoEdicao, setDescricaoEdicao] =
    useState('');

  const [situacaoEdicao, setSituacaoEdicao] =
    useState<Situacao>('ATIVO');

  const nomeRef = useRef<HTMLInputElement>(null);

  async function carregarDados() {
    try {
      const resposta = await fetch(
        '/api/grupos-generos',
        {
          cache: 'no-store',
        }
      );

      const dados = await resposta.json();

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

    const form = ev.currentTarget;
    const dados = new FormData(form);

    setErro('');
    setSucesso('');

    try {
      const resposta = await fetch(
        '/api/grupos-generos',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            nome: String(
              dados.get('nome') || ''
            ).trim(),

            descricao:
              String(
                dados.get('descricao') || ''
              ).trim() || null,
          }),
        }
      );

      const resultado = await resposta.json();

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

  function iniciarEdicao(grupo: Grupo) {
    setEditando(grupo);
    setNomeEdicao(grupo.nome);
    setDescricaoEdicao(grupo.descricao || '');
    setSituacaoEdicao(grupo.situacao);
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
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            id: editando.id,
            nome: nomeEdicao.trim(),
            descricao:
              descricaoEdicao.trim() || null,
            situacao: situacaoEdicao,
          }),
        }
      );

      const resultado = await resposta.json();

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
      <div className="card">
        <h2>Novo grupo</h2>

        <p className="muted">
          Os grupos organizam as categorias do
          estoque em grandes setores, facilitando
          consultas, relatórios e planejamento.
        </p>

        <form onSubmit={adicionar}>
          <label>Nome do grupo</label>

          <input
            ref={nomeRef}
            name="nome"
            required
            autoFocus
            maxLength={80}
            placeholder="Ex.: Carnes"
          />

          <label>Descrição</label>

          <input
            name="descricao"
            maxLength={200}
            placeholder="Ex.: Carnes bovinas, aves, suínos e peixes"
          />

          <button
            className="btn"
            type="submit"
          >
            Adicionar grupo
          </button>

          {sucesso && !editando && (
            <p role="status">
              <strong>✓ {sucesso}</strong>
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
            setMostrarGrupos(!mostrarGrupos)
          }
        >
          {mostrarGrupos
            ? 'Ocultar grupos cadastrados'
            : `Ver grupos cadastrados (${grupos.length})`}
        </button>

        {mostrarGrupos && (
          <>
            <h2>Grupos cadastrados</h2>

            {grupos.length > 0 ? (
              grupos.map((grupo) => (
                <div
                  className="row"
                  key={grupo.id}
                >
                  {editando?.id === grupo.id ? (
                    <form
                      onSubmit={salvarEdicao}
                      style={{
                        width: '100%',
                      }}
                    >
                      <h3>Editar grupo</h3>

                      <label>Nome</label>

                      <input
                        value={nomeEdicao}
                        onChange={(e) =>
                          setNomeEdicao(
                            e.target.value
                          )
                        }
                        required
                        maxLength={80}
                        autoFocus
                      />

                      <label>Descrição</label>

                      <input
                        value={descricaoEdicao}
                        onChange={(e) =>
                          setDescricaoEdicao(
                            e.target.value
                          )
                        }
                        maxLength={200}
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
                          onClick={cancelarEdicao}
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
                        <b>{grupo.nome}</b>

                        <div className="muted">
                          {grupo.descricao ||
                            'Sem descrição'}
                        </div>

                        <div className="muted">
                          Categorias vinculadas:{' '}
                          {grupo._count
                            ?.categorias ?? 0}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="tag">
                          {grupo.situacao}
                        </span>

                        <button
                          type="button"
                          className="linkbtn"
                          onClick={() =>
                            iniciarEdicao(grupo)
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
                Nenhum grupo cadastrado.
              </p>
            )}

            {sucesso && !editando && (
              <p role="status">
                <strong>✓ {sucesso}</strong>
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

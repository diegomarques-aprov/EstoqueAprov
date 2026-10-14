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

export default function CategoriasClient() {
  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [grupos, setGrupos] =
    useState<Grupo[]>([]);

  const [locais, setLocais] =
    useState<Local[]>([]);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [mostrarCategorias, setMostrarCategorias] =
    useState(false);

  const [editando, setEditando] =
    useState<Categoria | null>(null);

  const [nomeEdicao, setNomeEdicao] =
    useState('');

  const [grupoEdicao, setGrupoEdicao] =
    useState('');

  const [loteEdicao, setLoteEdicao] =
    useState(false);

  const [validadeEdicao, setValidadeEdicao] =
    useState(false);

  const [localEdicao, setLocalEdicao] =
    useState('');

  const [situacaoEdicao, setSituacaoEdicao] =
    useState<Situacao>('ATIVO');

  const nomeRef = useRef<HTMLInputElement>(null);

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

  const gruposAtivos = grupos.filter(
    (grupo) =>
      grupo.situacao === 'ATIVO'
  );

  const locaisAtivos = locais.filter(
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
                dados.get('grupoId') || ''
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
    setNomeEdicao(categoria.nome);
    setGrupoEdicao(
      categoria.grupoId || ''
    );

    setLoteEdicao(
      categoria.controlaLotePadrao === true
    );

    setValidadeEdicao(
      categoria.controlaValidadePadrao === true
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
      <div className="card">
        <h2>Nova categoria</h2>

        <p className="muted">
          A categoria pertence a um grupo e pode
          definir padrões sugeridos automaticamente
          no cadastro dos gêneros.
        </p>

        <form onSubmit={adicionar}>
          <label>Nome da categoria</label>

          <input
            ref={nomeRef}
            name="nome"
            required
            autoFocus
            maxLength={80}
            placeholder="Ex.: Carne Bovina"
          />

          <label>Grupo de gêneros</label>

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

          {gruposAtivos.length === 0 && (
            <p className="muted">
              Nenhum grupo ativo cadastrado.
              Cadastre primeiro os grupos de gêneros.
            </p>
          )}

          <div className="checks">
            <label>
              <input
                type="checkbox"
                name="controlaLotePadrao"
              />{' '}
              Controla lote por padrão
            </label>

            <label>
              <input
                type="checkbox"
                name="controlaValidadePadrao"
              />{' '}
              Controla validade por padrão
            </label>
          </div>

          <label>
            Local habitual da categoria
          </label>

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

          <button
            className="btn"
            type="submit"
          >
            Adicionar categoria
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
            setMostrarCategorias(
              !mostrarCategorias
            )
          }
        >
          {mostrarCategorias
            ? 'Ocultar categorias cadastradas'
            : `Ver categorias cadastradas (${categorias.length})`}
        </button>

        {mostrarCategorias && (
          <>
            <h2>
              Categorias cadastradas
            </h2>

            {categorias.length > 0 ? (
              categorias.map(
                (categoria) => (
                  <div
                    className="row"
                    key={categoria.id}
                  >
                    {editando?.id ===
                    categoria.id ? (
                      <form
                        onSubmit={
                          salvarEdicao
                        }
                        style={{
                          width: '100%',
                        }}
                      >
                        <h3>
                          Editar categoria
                        </h3>

                        <label>Nome</label>

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

                        <label>
                          Grupo de gêneros
                        </label>

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

                        <div className="checks">
                          <label>
                            <input
                              type="checkbox"
                              checked={
                                loteEdicao
                              }
                              onChange={(e) =>
                                setLoteEdicao(
                                  e.target
                                    .checked
                                )
                              }
                            />{' '}
                            Controla lote
                            por padrão
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              checked={
                                validadeEdicao
                              }
                              onChange={(e) =>
                                setValidadeEdicao(
                                  e.target
                                    .checked
                                )
                              }
                            />{' '}
                            Controla validade
                            por padrão
                          </label>
                        </div>

                        <label>
                          Local habitual
                        </label>

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

                        <label>
                          Situação
                        </label>

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

                        <div
                          style={{
                            display:
                              'flex',
                            gap: '8px',
                            marginTop:
                              '12px',
                            flexWrap:
                              'wrap',
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
                            {categoria.nome}
                          </b>

                          <div className="muted">
                            Grupo:{' '}
                            {categoria.grupo
                              ?.nome ||
                              'Não definido'}
                          </div>

                          <div className="muted">
                            Lote:{' '}
                            {categoria.controlaLotePadrao
                              ? 'Sim'
                              : 'Não'}
                            {' · '}
                            Validade:{' '}
                            {categoria.controlaValidadePadrao
                              ? 'Sim'
                              : 'Não'}
                          </div>

                          <div className="muted">
                            Local habitual:{' '}
                            {categoria
                              .localPadrao
                              ?.nome ||
                              'Não definido'}
                          </div>

                          <div className="muted">
                            Gêneros vinculados:{' '}
                            {categoria
                              ._count
                              ?.generos ??
                              0}
                          </div>
                        </div>

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
                          <span className="tag">
                            {
                              categoria.situacao
                            }
                          </span>

                          <button
                            type="button"
                            className="linkbtn"
                            onClick={() =>
                              iniciarEdicao(
                                categoria
                              )
                            }
                          >
                            Editar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="muted">
                Nenhuma categoria cadastrada.
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

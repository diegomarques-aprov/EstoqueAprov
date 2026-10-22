'use client';

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type Classe = 'QS' | 'QR';
type Situacao = 'ATIVO' | 'INATIVO';

type Categoria = {
  id: string;
  nome: string;
  controlaLotePadrao: boolean | null;
  controlaValidadePadrao: boolean | null;
  localPadraoId: string | null;
  situacao: Situacao;
};

type Unidade = {
  id: string;
  sigla: string;
  nome: string;
  situacao: Situacao;
};

type Local = {
  id: string;
  nome: string;
  situacao?: Situacao;
};

type Genero = {
  id: string;
  nome: string;
  classe: Classe;
  categoriaId: string | null;
  categoria?: Categoria | null;
  unidadeId: string;
  unidade: Unidade;
  controlaLote: boolean;
  controlaValidade: boolean;
  estoqueMinimo: string | number | null;
  valorUnitarioReferencia:
    | string
    | number
    | null;
  localPadraoId: string | null;
  localPadrao?: Local | null;
  situacao: Situacao;
};

function formatarMoeda(
  valor: string | number
) {
  return Number(valor).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }
  );
}

export default function GenerosClient() {
  const [classe, setClasse] =
    useState<Classe>('QS');

  const [generos, setGeneros] =
    useState<Genero[]>([]);

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [unidades, setUnidades] =
    useState<Unidade[]>([]);

  const [locais, setLocais] =
    useState<Local[]>([]);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] =
    useState('');

  const [
    mostrarGeneros,
    setMostrarGeneros,
  ] = useState(false);

  const [editando, setEditando] =
    useState<Genero | null>(null);

  const [nomeEdicao, setNomeEdicao] =
    useState('');

  const [
    classeEdicao,
    setClasseEdicao,
  ] = useState<Classe>('QS');

  const [
    categoriaEdicao,
    setCategoriaEdicao,
  ] = useState('');

  const [
    unidadeEdicao,
    setUnidadeEdicao,
  ] = useState('');

  const [loteEdicao, setLoteEdicao] =
    useState(false);

  const [
    validadeEdicao,
    setValidadeEdicao,
  ] = useState(false);

  const [
    estoqueMinimoEdicao,
    setEstoqueMinimoEdicao,
  ] = useState('');

  const [
    valorUnitarioEdicao,
    setValorUnitarioEdicao,
  ] = useState('');

  const [localEdicao, setLocalEdicao] =
    useState('');

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] = useState<Situacao>('ATIVO');

  const nomeRef =
    useRef<HTMLInputElement>(null);

  async function carregarDados() {
    setErro('');

    try {
      const [
        respostaGeneros,
        respostaCategorias,
        respostaUnidades,
        respostaLocais,
      ] = await Promise.all([
        fetch(
          `/api/generos?classe=${classe}`,
          {
            cache: 'no-store',
          }
        ),
        fetch('/api/categorias', {
          cache: 'no-store',
        }),
        fetch('/api/unidades', {
          cache: 'no-store',
        }),
        fetch('/api/locais', {
          cache: 'no-store',
        }),
      ]);

      if (respostaGeneros.ok) {
        setGeneros(
          await respostaGeneros.json()
        );
      }

      if (respostaCategorias.ok) {
        const dados =
          await respostaCategorias.json();

        setCategorias(
          dados.filter(
            (item: Categoria) =>
              item.situacao === 'ATIVO'
          )
        );
      }

      if (respostaUnidades.ok) {
        const dados =
          await respostaUnidades.json();

        setUnidades(
          dados.filter(
            (item: Unidade) =>
              item.situacao === 'ATIVO'
          )
        );
      }

      if (respostaLocais.ok) {
        const dados =
          await respostaLocais.json();

        setLocais(
          dados.filter(
            (item: Local) =>
              !item.situacao ||
              item.situacao === 'ATIVO'
          )
        );
      }

      if (!respostaGeneros.ok) {
        const dados =
          await respostaGeneros.json();

        setErro(
          dados.error ||
            'Não foi possível carregar os gêneros.'
        );
      }
    } catch {
      setErro(
        'Não foi possível carregar os dados do cadastro.'
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, [classe]);

  function alterarClasse(
    novaClasse: Classe
  ) {
    setClasse(novaClasse);
    setEditando(null);
    setErro('');
    setSucesso('');
  }

  function aplicarPadraoCategoria(
    categoriaId: string,
    form: HTMLFormElement
  ) {
    const categoria =
      categorias.find(
        (item) =>
          item.id === categoriaId
      );

    if (!categoria) {
      return;
    }

    const lote =
      form.elements.namedItem(
        'controlaLote'
      ) as HTMLInputElement | null;

    const validade =
      form.elements.namedItem(
        'controlaValidade'
      ) as HTMLInputElement | null;

    const local =
      form.elements.namedItem(
        'localPadraoId'
      ) as HTMLSelectElement | null;

    if (
      lote &&
      categoria.controlaLotePadrao !==
        null
    ) {
      lote.checked =
        categoria.controlaLotePadrao;
    }

    if (
      validade &&
      categoria.controlaValidadePadrao !==
        null
    ) {
      validade.checked =
        categoria.controlaValidadePadrao;
    }

    if (
      local &&
      categoria.localPadraoId
    ) {
      local.value =
        categoria.localPadraoId;
    }
  }

  async function adicionar(
    ev: FormEvent<HTMLFormElement>
  ) {
    ev.preventDefault();

    const form = ev.currentTarget;
    const dados =
      new FormData(form);

    setErro('');
    setSucesso('');

    const estoqueMinimo =
      dados.get('estoqueMinimo');

    const valorUnitario =
      dados.get(
        'valorUnitarioReferencia'
      );

    const payload = {
      nome: String(
        dados.get('nome') || ''
      ).trim(),

      classe,

      categoriaId:
        String(
          dados.get('categoriaId') ||
            ''
        ) || null,

      unidadeId: String(
        dados.get('unidadeId') || ''
      ),

      controlaLote:
        dados.get('controlaLote') ===
        'on',

      controlaValidade:
        dados.get(
          'controlaValidade'
        ) === 'on',

      estoqueMinimo:
        estoqueMinimo !== null &&
        String(estoqueMinimo) !== ''
          ? Number(estoqueMinimo)
          : null,

      valorUnitarioReferencia:
        valorUnitario !== null &&
        String(valorUnitario) !== ''
          ? Number(valorUnitario)
          : null,

      localPadraoId:
        String(
          dados.get(
            'localPadraoId'
          ) || ''
        ) || null,
    };

    try {
      const resposta =
        await fetch(
          '/api/generos',
          {
            method: 'POST',
            headers: {
              'content-type':
                'application/json',
            },
            body: JSON.stringify(
              payload
            ),
          }
        );

      const resultado =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          resultado.error ||
            'Não foi possível cadastrar o gênero.'
        );
        return;
      }

      form.reset();

      setSucesso(
        `Gênero ${classe} cadastrado com sucesso.`
      );

      await carregarDados();

      nomeRef.current?.focus();
    } catch {
      setErro(
        'Não foi possível cadastrar o gênero.'
      );
    }
  }

  function iniciarEdicao(
    genero: Genero
  ) {
    setEditando(genero);

    setNomeEdicao(
      genero.nome
    );

    setClasseEdicao(
      genero.classe
    );

    setCategoriaEdicao(
      genero.categoriaId || ''
    );

    setUnidadeEdicao(
      genero.unidadeId
    );

    setLoteEdicao(
      genero.controlaLote
    );

    setValidadeEdicao(
      genero.controlaValidade
    );

    setEstoqueMinimoEdicao(
      genero.estoqueMinimo === null
        ? ''
        : String(
            genero.estoqueMinimo
          )
    );

    setValorUnitarioEdicao(
      genero.valorUnitarioReferencia ===
        null
        ? ''
        : String(
            genero.valorUnitarioReferencia
          )
    );

    setLocalEdicao(
      genero.localPadraoId || ''
    );

    setSituacaoEdicao(
      genero.situacao
    );

    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setErro('');
  }

  function aplicarPadraoCategoriaEdicao(
    categoriaId: string
  ) {
    setCategoriaEdicao(
      categoriaId
    );

    const categoria =
      categorias.find(
        (item) =>
          item.id === categoriaId
      );

    if (!categoria) {
      return;
    }

    if (
      categoria.controlaLotePadrao !==
      null
    ) {
      setLoteEdicao(
        categoria.controlaLotePadrao
      );
    }

    if (
      categoria.controlaValidadePadrao !==
      null
    ) {
      setValidadeEdicao(
        categoria.controlaValidadePadrao
      );
    }

    if (
      categoria.localPadraoId
    ) {
      setLocalEdicao(
        categoria.localPadraoId
      );
    }
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

    const minimo =
      estoqueMinimoEdicao.trim();

    const valorUnitario =
      valorUnitarioEdicao.trim();

    try {
      const resposta =
        await fetch(
          '/api/generos',
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

              classe:
                classeEdicao,

              categoriaId:
                categoriaEdicao ||
                null,

              unidadeId:
                unidadeEdicao,

              controlaLote:
                loteEdicao,

              controlaValidade:
                validadeEdicao,

              estoqueMinimo:
                minimo === ''
                  ? null
                  : Number(minimo),

              valorUnitarioReferencia:
                valorUnitario === ''
                  ? null
                  : Number(
                      valorUnitario
                    ),

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
            'Não foi possível alterar o gênero.'
        );
        return;
      }

      setEditando(null);

      setSucesso(
        'Gênero atualizado com sucesso.'
      );

      if (
        classeEdicao !== classe
      ) {
        setClasse(
          classeEdicao
        );
      } else {
        await carregarDados();
      }
    } catch {
      setErro(
        'Não foi possível alterar o gênero.'
      );
    }
  }

  return (
    <>
      <div className="tabs">
        <button
          type="button"
          className={
            classe === 'QS'
              ? 'tab active'
              : 'tab'
          }
          onClick={() =>
            alterarClasse('QS')
          }
        >
          QS
        </button>

        <button
          type="button"
          className={
            classe === 'QR'
              ? 'tab active'
              : 'tab'
          }
          onClick={() =>
            alterarClasse('QR')
          }
        >
          QR
        </button>
      </div>

      <div className="card">
        <h2>
          Novo gênero {classe}
        </h2>

        <form
          onSubmit={adicionar}
        >
          <label>Nome</label>

          <input
            ref={nomeRef}
            name="nome"
            required
            autoFocus
            maxLength={120}
          />

          <label>
            Categoria
          </label>

          <select
            name="categoriaId"
            onChange={(ev) =>
              aplicarPadraoCategoria(
                ev.target.value,
                ev.currentTarget
                  .form!
              )
            }
          >
            <option value="">
              Sem categoria
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={
                    categoria.id
                  }
                  value={
                    categoria.id
                  }
                >
                  {
                    categoria.nome
                  }
                </option>
              )
            )}
          </select>

          <label>
            Unidade de medida
          </label>

          <select
            name="unidadeId"
            required
          >
            <option value="">
              Selecione
            </option>

            {unidades.map(
              (unidade) => (
                <option
                  key={
                    unidade.id
                  }
                  value={
                    unidade.id
                  }
                >
                  {
                    unidade.sigla
                  }{' '}
                  —{' '}
                  {
                    unidade.nome
                  }
                </option>
              )
            )}
          </select>

          <div className="checks">
            <label>
              <input
                type="checkbox"
                name="controlaLote"
              />{' '}
              Controla lote
            </label>

            <label>
              <input
                type="checkbox"
                name="controlaValidade"
              />{' '}
              Controla validade
            </label>
          </div>

          <label>
            Estoque mínimo
            (opcional)
          </label>

          <input
            name="estoqueMinimo"
            type="number"
            min="0"
            step="0.001"
          />

          <label>
            Valor unitário de
            referência (opcional)
          </label>

          <input
            name="valorUnitarioReferencia"
            type="number"
            min="0"
            step="0.0001"
            placeholder="R$ 0,00"
          />

          <p className="muted">
            Utilizado somente para
            consultas de orçamento
            estimado. Não representa
            crédito, empenho ou saldo
            financeiro.
          </p>

          <label>
            Local habitual
          </label>

          <select
            name="localPadraoId"
          >
            <option value="">
              Não definido
            </option>

            {locais.map(
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
            Salvar gênero {classe}
          </button>

          {sucesso &&
            !editando && (
              <p role="status">
                <strong>
                  ✓ {sucesso}
                </strong>
              </p>
            )}

          {erro &&
            !editando && (
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
            setMostrarGeneros(
              !mostrarGeneros
            )
          }
        >
          {mostrarGeneros
            ? `Ocultar gêneros ${classe}`
            : `Ver gêneros ${classe} cadastrados (${generos.length})`}
        </button>

        {mostrarGeneros && (
          <>
            <h2>
              Gêneros {classe}
            </h2>

            {generos.length >
            0 ? (
              generos.map(
                (genero) => (
                  <div
                    className="row"
                    key={
                      genero.id
                    }
                  >
                    {editando?.id ===
                    genero.id ? (
                      <form
                        onSubmit={
                          salvarEdicao
                        }
                        style={{
                          width:
                            '100%',
                        }}
                      >
                        <h3>
                          Editar
                          gênero
                        </h3>

                        <label>
                          Nome
                        </label>

                        <input
                          value={
                            nomeEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setNomeEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                          required
                          maxLength={
                            120
                          }
                          autoFocus
                        />

                        <label>
                          Classificação
                        </label>

                        <select
                          value={
                            classeEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setClasseEdicao(
                              ev
                                .target
                                .value as Classe
                            )
                          }
                        >
                          <option value="QS">
                            QS
                          </option>

                          <option value="QR">
                            QR
                          </option>
                        </select>

                        <label>
                          Categoria
                        </label>

                        <select
                          value={
                            categoriaEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            aplicarPadraoCategoriaEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Sem
                            categoria
                          </option>

                          {categorias.map(
                            (
                              categoria
                            ) => (
                              <option
                                key={
                                  categoria.id
                                }
                                value={
                                  categoria.id
                                }
                              >
                                {
                                  categoria.nome
                                }
                              </option>
                            )
                          )}
                        </select>

                        <label>
                          Unidade de
                          medida
                        </label>

                        <select
                          value={
                            unidadeEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setUnidadeEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                          required
                        >
                          <option value="">
                            Selecione
                          </option>

                          {unidades.map(
                            (
                              unidade
                            ) => (
                              <option
                                key={
                                  unidade.id
                                }
                                value={
                                  unidade.id
                                }
                              >
                                {
                                  unidade.sigla
                                }{' '}
                                —{' '}
                                {
                                  unidade.nome
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
                              onChange={(
                                ev
                              ) =>
                                setLoteEdicao(
                                  ev
                                    .target
                                    .checked
                                )
                              }
                            />{' '}
                            Controla
                            lote
                          </label>

                          <label>
                            <input
                              type="checkbox"
                              checked={
                                validadeEdicao
                              }
                              onChange={(
                                ev
                              ) =>
                                setValidadeEdicao(
                                  ev
                                    .target
                                    .checked
                                )
                              }
                            />{' '}
                            Controla
                            validade
                          </label>
                        </div>

                        <label>
                          Estoque
                          mínimo
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={
                            estoqueMinimoEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setEstoqueMinimoEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                        />

                        <label>
                          Valor
                          unitário de
                          referência
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={
                            valorUnitarioEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setValorUnitarioEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                          placeholder="R$ 0,00"
                        />

                        <p className="muted">
                          Valor
                          opcional,
                          utilizado
                          somente para
                          orçamento
                          estimado.
                        </p>

                        <label>
                          Local
                          habitual
                        </label>

                        <select
                          value={
                            localEdicao
                          }
                          onChange={(
                            ev
                          ) =>
                            setLocalEdicao(
                              ev
                                .target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Não
                            definido
                          </option>

                          {locais.map(
                            (
                              local
                            ) => (
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
                          onChange={(
                            ev
                          ) =>
                            setSituacaoEdicao(
                              ev
                                .target
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
                            gap:
                              '8px',
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
                            Salvar
                            alterações
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
                            {
                              genero.nome
                            }
                          </b>

                          <div className="muted">
                            {genero
                              .categoria
                              ?.nome ||
                              'Sem categoria'}
                            {' · '}
                            {
                              genero
                                .unidade
                                .sigla
                            }
                          </div>

                          <div className="muted">
                            Lote:{' '}
                            {genero.controlaLote
                              ? 'Sim'
                              : 'Não'}
                            {' · '}
                            Validade:{' '}
                            {genero.controlaValidade
                              ? 'Sim'
                              : 'Não'}
                          </div>

                          <div className="muted">
                            Estoque
                            mínimo:{' '}
                            {genero.estoqueMinimo ===
                            null
                              ? 'Não definido'
                              : `${genero.estoqueMinimo} ${genero.unidade.sigla}`}
                          </div>

                          <div className="muted">
                            Valor
                            unitário de
                            referência:{' '}
                            {genero.valorUnitarioReferencia ===
                            null
                              ? 'Não definido'
                              : `${formatarMoeda(
                                  genero.valorUnitarioReferencia
                                )}/${genero.unidade.sigla}`}
                          </div>

                          <div className="muted">
                            Local
                            habitual:{' '}
                            {genero
                              .localPadrao
                              ?.nome ||
                              'Não definido'}
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap:
                              '8px',
                            flexWrap:
                              'wrap',
                          }}
                        >
                          <span className="tag">
                            {
                              genero.situacao
                            }
                          </span>

                          <button
                            type="button"
                            className="linkbtn"
                            onClick={() =>
                              iniciarEdicao(
                                genero
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
                Nenhum gênero{' '}
                {classe}{' '}
                cadastrado.
              </p>
            )}

            {sucesso &&
              !editando && (
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

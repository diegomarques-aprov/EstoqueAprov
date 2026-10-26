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

function CampoInfo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="muted"
        style={{
          fontSize: '10px',
          marginBottom: '2px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {valor}
      </div>
    </div>
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

  const [
    loteEdicao,
    setLoteEdicao,
  ] = useState(false);

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

  const [
    localEdicao,
    setLocalEdicao,
  ] = useState('');

  const [
    situacaoEdicao,
    setSituacaoEdicao,
  ] =
    useState<Situacao>('ATIVO');

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setNomeEdicao(genero.nome);
    setClasseEdicao(genero.classe);

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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '17px',
        }}
      >
        {(['QS', 'QR'] as Classe[]).map(
          (item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                alterarClasse(item)
              }
              style={{
                minHeight: '52px',
                borderRadius: '12px',
                border:
                  classe === item
                    ? '1px solid rgba(43,138,87,.8)'
                    : '1px solid #284334',
                background:
                  classe === item
                    ? '#2b8a57'
                    : '#102018',
                color: '#fff',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              {item}

              <span
                style={{
                  display: 'block',
                  marginTop: '2px',
                  fontSize: '10px',
                  fontWeight: 500,
                  opacity: 0.8,
                }}
              >
                {item === 'QS'
                  ? 'Cadeia de suprimento'
                  : 'Compra local'}
              </span>
            </button>
          )
        )}
      </div>

      <div
        style={{
          padding: '13px',
          borderRadius: '12px',
          background: '#0c1811',
          border: '1px solid #284334',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Novo gênero {classe}
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '3px',
                fontSize: '11px',
              }}
            >
              Informe os dados de
              controle do gênero.
            </div>
          </div>

          <span
            style={{
              padding: '5px 8px',
              borderRadius: '999px',
              background: '#183d2a',
              border: '1px solid #284334',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {classe}
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
            Nome

            <input
              ref={nomeRef}
              name="nome"
              required
              autoFocus
              maxLength={120}
              placeholder="Nome do gênero"
            />
          </label>

          <label>
            Categoria

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
          </label>

          <label>
            Unidade de medida

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
                    key={unidade.id}
                    value={unidade.id}
                  >
                    {unidade.sigla} —{' '}
                    {unidade.nome}
                  </option>
                )
              )}
            </select>
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '8px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '11px',
                background: '#102018',
                border:
                  '1px solid #284334',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="controlaLote"
                style={{
                  width: '18px',
                  height: '18px',
                  margin: 0,
                }}
              />

              <span
                style={{
                  fontSize: '12px',
                }}
              >
                Controla lote
              </span>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '11px',
                background: '#102018',
                border:
                  '1px solid #284334',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="controlaValidade"
                style={{
                  width: '18px',
                  height: '18px',
                  margin: 0,
                }}
              />

              <span
                style={{
                  fontSize: '12px',
                }}
              >
                Controla validade
              </span>
            </label>
          </div>

          <label>
            Estoque mínimo
            <span className="muted">
              {' '}
              (opcional)
            </span>

            <input
              name="estoqueMinimo"
              type="number"
              min="0"
              step="0.001"
              placeholder="0"
            />
          </label>

          <label>
            Valor unitário de referência
            <span className="muted">
              {' '}
              (opcional)
            </span>

            <input
              name="valorUnitarioReferencia"
              type="number"
              min="0"
              step="0.0001"
              placeholder="R$ 0,00"
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
              O valor unitário é usado
              somente em consultas de
              orçamento estimado. Não
              representa crédito, empenho
              ou saldo financeiro.
            </span>
          </div>

          <label>
            Local habitual

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
          </label>

          <button
            className="btn"
            type="submit"
            style={{
              width: '100%',
              minHeight: '46px',
            }}
          >
            Salvar gênero {classe}
          </button>

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
          border: '1px solid #284334',
        }}
      >
        <button
          type="button"
          className="btn"
          onClick={() =>
            setMostrarGeneros(
              !mostrarGeneros
            )
          }
          style={{
            width: '100%',
          }}
        >
          {mostrarGeneros
            ? `Ocultar gêneros ${classe}`
            : `Ver gêneros ${classe} cadastrados (${generos.length})`}
        </button>

        {mostrarGeneros && (
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
                Gêneros {classe}
              </strong>

              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                {generos.length}{' '}
                cadastrado(s)
              </span>
            </div>

            {generos.length > 0 ? (
              generos.map(
                (genero) => (
                  <article
                    key={genero.id}
                    style={{
                      padding: '13px',
                      borderRadius:
                        '12px',
                      background:
                        '#102018',
                      border:
                        editando?.id ===
                        genero.id
                          ? '1px solid rgba(43,138,87,.75)'
                          : '1px solid #284334',
                    }}
                  >
                    {editando?.id ===
                    genero.id ? (
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
                            Editar gênero
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
                            Atualize os dados
                            necessários.
                          </div>
                        </div>

                        <label>
                          Nome

                          <input
                            value={
                              nomeEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              setNomeEdicao(
                                ev.target
                                  .value
                              )
                            }
                            required
                            maxLength={
                              120
                            }
                            autoFocus
                          />
                        </label>

                        <label>
                          Classificação

                          <select
                            value={
                              classeEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              setClasseEdicao(
                                ev.target
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
                        </label>

                        <label>
                          Categoria

                          <select
                            value={
                              categoriaEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              aplicarPadraoCategoriaEdicao(
                                ev.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Sem categoria
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
                        </label>

                        <label>
                          Unidade de medida

                          <select
                            value={
                              unidadeEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              setUnidadeEdicao(
                                ev.target
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
                        </label>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap: '8px',
                          }}
                        >
                          <label
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '8px',
                              padding:
                                '11px',
                              borderRadius:
                                '11px',
                              background:
                                '#0c1811',
                              border:
                                '1px solid #284334',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                loteEdicao
                              }
                              onChange={(
                                ev
                              ) =>
                                setLoteEdicao(
                                  ev.target
                                    .checked
                                )
                              }
                              style={{
                                width:
                                  '18px',
                                height:
                                  '18px',
                                margin: 0,
                              }}
                            />

                            <span
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              Controla lote
                            </span>
                          </label>

                          <label
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '8px',
                              padding:
                                '11px',
                              borderRadius:
                                '11px',
                              background:
                                '#0c1811',
                              border:
                                '1px solid #284334',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                validadeEdicao
                              }
                              onChange={(
                                ev
                              ) =>
                                setValidadeEdicao(
                                  ev.target
                                    .checked
                                )
                              }
                              style={{
                                width:
                                  '18px',
                                height:
                                  '18px',
                                margin: 0,
                              }}
                            />

                            <span
                              style={{
                                fontSize:
                                  '12px',
                              }}
                            >
                              Controla validade
                            </span>
                          </label>
                        </div>

                        <label>
                          Estoque mínimo

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
                                ev.target
                                  .value
                              )
                            }
                          />
                        </label>

                        <label>
                          Valor unitário de
                          referência

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
                                ev.target
                                  .value
                              )
                            }
                            placeholder="R$ 0,00"
                          />
                        </label>

                        <label>
                          Local habitual

                          <select
                            value={
                              localEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              setLocalEdicao(
                                ev.target
                                  .value
                              )
                            }
                          >
                            <option value="">
                              Não definido
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
                        </label>

                        <label>
                          Situação

                          <select
                            value={
                              situacaoEdicao
                            }
                            onChange={(
                              ev
                            ) =>
                              setSituacaoEdicao(
                                ev.target
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
                              '10px',
                            borderBottom:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize:
                                  '14px',
                              }}
                            >
                              {
                                genero.nome
                              }
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
                          </div>

                          <span
                            style={{
                              padding:
                                '4px 7px',
                              borderRadius:
                                '999px',
                              background:
                                genero.situacao ===
                                'ATIVO'
                                  ? 'rgba(43,138,87,.12)'
                                  : 'rgba(245,158,11,.10)',
                              border:
                                genero.situacao ===
                                'ATIVO'
                                  ? '1px solid rgba(43,138,87,.45)'
                                  : '1px solid rgba(245,158,11,.4)',
                              fontSize:
                                '10px',
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              genero.situacao
                            }
                          </span>
                        </div>

                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(2, minmax(0, 1fr))',
                            gap:
                              '11px 14px',
                          }}
                        >
                          <CampoInfo
                            titulo="Lote"
                            valor={
                              genero.controlaLote
                                ? 'Sim'
                                : 'Não'
                            }
                          />

                          <CampoInfo
                            titulo="Validade"
                            valor={
                              genero.controlaValidade
                                ? 'Sim'
                                : 'Não'
                            }
                          />

                          <CampoInfo
                            titulo="Estoque mínimo"
                            valor={
                              genero.estoqueMinimo ===
                              null
                                ? 'Não definido'
                                : `${genero.estoqueMinimo} ${genero.unidade.sigla}`
                            }
                          />

                          <CampoInfo
                            titulo="Local habitual"
                            valor={
                              genero
                                .localPadrao
                                ?.nome ||
                              'Não definido'
                            }
                          />
                        </div>

                        <div
                          style={{
                            marginTop:
                              '11px',
                            padding:
                              '10px',
                            borderRadius:
                              '10px',
                            background:
                              '#0c1811',
                            border:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <CampoInfo
                            titulo="Valor unitário de referência"
                            valor={
                              genero.valorUnitarioReferencia ===
                              null
                                ? 'Não definido'
                                : `${formatarMoeda(
                                    genero.valorUnitarioReferencia
                                  )}/${genero.unidade.sigla}`
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="btn"
                          onClick={() =>
                            iniciarEdicao(
                              genero
                            )
                          }
                          style={{
                            width: '100%',
                            marginTop:
                              '11px',
                          }}
                        >
                          Editar gênero
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
                  Nenhum gênero{' '}
                  {classe} cadastrado.
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

'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

type Grupo = {
  id: string;
  nome: string;
};

type Categoria = {
  id: string;
  nome: string;
  grupo: Grupo | null;
};

type G = {
  id: string;
  nome: string;
  classe: 'QS' | 'QR';
  situacao: 'ATIVO' | 'INATIVO';
  unidade: {
    sigla: string;
  };
  categoria: Categoria | null;
};

type E = {
  generoId: string;
  quantidade: number | string;
};

type Item = {
  grupoId: string;
  categoriaId: string;
  generoId: string;
  quantidade: string;
};

const vazio = (): Item => ({
  grupoId: '',
  categoriaId: '',
  generoId: '',
  quantidade: '',
});

const destinos = [
  ['CAFE_DA_MANHA', 'Café da manhã'],
  ['ALMOCO', 'Almoço'],
  ['JANTAR', 'Jantar'],
  ['CEIA', 'Ceia'],
  ['OUTRO', 'Outro'],
] as const;

export default function SaidaClient() {
  const [classe, setClasse] =
    useState<'QS' | 'QR'>('QS');

  const [generos, setGeneros] =
    useState<G[]>([]);

  const [saldos, setSaldos] =
    useState<Record<string, number>>({});

  const [itens, setItens] =
    useState<Item[]>([vazio()]);

  const [destino, setDestino] =
    useState('ALMOCO');

  const [data, setData] = useState(
    () =>
      new Date()
        .toISOString()
        .slice(0, 10)
  );

  const [observacao, setObservacao] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const [revisar, setRevisar] =
    useState(false);

  async function carregar() {
    const [respostaGeneros, respostaEstoque] =
      await Promise.all([
        fetch(
          '/api/generos?classe=' +
            classe,
          {
            cache: 'no-store',
          }
        ),
        fetch(
          '/api/estoque?classe=' +
            classe,
          {
            cache: 'no-store',
          }
        ),
      ]);

    const dadosGeneros =
      await respostaGeneros.json();

    const dadosEstoque =
      await respostaEstoque.json();

    setGeneros(
      Array.isArray(dadosGeneros)
        ? dadosGeneros
        : []
    );

    const novosSaldos: Record<
      string,
      number
    > = {};

    if (Array.isArray(dadosEstoque)) {
      for (const x of dadosEstoque as E[]) {
        novosSaldos[x.generoId] =
          (novosSaldos[
            x.generoId
          ] || 0) +
          Number(x.quantidade);
      }
    }

    setSaldos(novosSaldos);
  }

  useEffect(() => {
    carregar();
    setItens([vazio()]);
    setRevisar(false);
    setMsg('');
  }, [classe]);

  const generosDisponiveis =
    useMemo(
      () =>
        generos.filter(
          (genero) =>
            genero.situacao ===
              'ATIVO' &&
            (saldos[genero.id] ||
              0) > 0
        ),
      [generos, saldos]
    );

  const grupos = useMemo(() => {
    const mapa = new Map<
      string,
      Grupo
    >();

    for (const genero of generosDisponiveis) {
      const grupo =
        genero.categoria?.grupo;

      if (grupo) {
        mapa.set(grupo.id, grupo);
      }
    }

    return Array.from(
      mapa.values()
    ).sort((a, b) =>
      a.nome.localeCompare(
        b.nome,
        'pt-BR'
      )
    );
  }, [generosDisponiveis]);

  function categoriasDoGrupo(
    grupoId: string
  ) {
    const mapa = new Map<
      string,
      {
        id: string;
        nome: string;
      }
    >();

    for (const genero of generosDisponiveis) {
      const categoria =
        genero.categoria;

      if (
        categoria &&
        categoria.grupo?.id ===
          grupoId
      ) {
        mapa.set(categoria.id, {
          id: categoria.id,
          nome: categoria.nome,
        });
      }
    }

    return Array.from(
      mapa.values()
    ).sort((a, b) =>
      a.nome.localeCompare(
        b.nome,
        'pt-BR'
      )
    );
  }

  function generosDaCategoria(
    categoriaId: string
  ) {
    return generosDisponiveis
      .filter(
        (genero) =>
          genero.categoria?.id ===
          categoriaId
      )
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          'pt-BR'
        )
      );
  }

  function generoSelecionado(
    id: string
  ) {
    return generos.find(
      (genero) =>
        genero.id === id
    );
  }

  function alterarGrupo(
    indice: number,
    grupoId: string
  ) {
    setItens((atuais) =>
      atuais.map((item, n) =>
        n === indice
          ? {
              ...item,
              grupoId,
              categoriaId: '',
              generoId: '',
              quantidade: '',
            }
          : item
      )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarCategoria(
    indice: number,
    categoriaId: string
  ) {
    setItens((atuais) =>
      atuais.map((item, n) =>
        n === indice
          ? {
              ...item,
              categoriaId,
              generoId: '',
              quantidade: '',
            }
          : item
      )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarGenero(
    indice: number,
    generoId: string
  ) {
    setItens((atuais) =>
      atuais.map((item, n) =>
        n === indice
          ? {
              ...item,
              generoId,
              quantidade: '',
            }
          : item
      )
    );

    setRevisar(false);
    setMsg('');
  }

  function alterarQuantidade(
    indice: number,
    quantidade: string
  ) {
    setItens((atuais) =>
      atuais.map((item, n) =>
        n === indice
          ? {
              ...item,
              quantidade,
            }
          : item
      )
    );

    setRevisar(false);
    setMsg('');
  }

  function validar() {
    const vistos =
      new Set<string>();

    for (const item of itens) {
      if (!item.grupoId) {
        return 'Selecione o grupo em todos os itens.';
      }

      if (!item.categoriaId) {
        return 'Selecione a categoria em todos os itens.';
      }

      const genero =
        generoSelecionado(
          item.generoId
        );

      if (!genero) {
        return 'Selecione o gênero em todos os itens.';
      }

      if (
        vistos.has(
          item.generoId
        )
      ) {
        return `${genero.nome} foi adicionado mais de uma vez.`;
      }

      vistos.add(
        item.generoId
      );

      const quantidade =
        Number(item.quantidade);

      if (!(quantidade > 0)) {
        return `${genero.nome}: informe uma quantidade válida.`;
      }

      const disponivel =
        saldos[item.generoId] ||
        0;

      if (
        quantidade >
        disponivel
      ) {
        return `${genero.nome}: solicitado ${quantidade.toLocaleString(
          'pt-BR'
        )} ${
          genero.unidade.sigla
        }, mas há ${disponivel.toLocaleString(
          'pt-BR'
        )} ${
          genero.unidade.sigla
        } disponíveis.`;
      }
    }

    return '';
  }

  async function confirmar() {
    const erro = validar();

    if (erro) {
      setMsg(erro);
      return;
    }

    setBusy(true);
    setMsg('');

    try {
      const resposta =
        await fetch(
          '/api/saidas',
          {
            method: 'POST',

            headers: {
              'content-type':
                'application/json',
            },

            body: JSON.stringify({
              classe,
              destino,
              data,

              observacao:
                observacao ||
                undefined,

              itens: itens.map(
                (item) => ({
                  generoId:
                    item.generoId,

                  quantidade:
                    Number(
                      item.quantidade
                    ),
                })
              ),
            }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setMsg(
          dados.error ||
            'Não foi possível concluir a saída.'
        );

        await carregar();
        return;
      }

      setMsg(
        `Saída nº ${dados.numero} confirmada e estoque atualizado.`
      );

      setItens([vazio()]);
      setObservacao('');
      setRevisar(false);

      await carregar();
    } catch {
      setMsg(
        'Não foi possível concluir a saída.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="tabs">
        <button
          className={
            'tab ' +
            (classe === 'QS'
              ? 'active'
              : '')
          }
          onClick={() =>
            setClasse('QS')
          }
          type="button"
        >
          QS
        </button>

        <button
          className={
            'tab ' +
            (classe === 'QR'
              ? 'active'
              : '')
          }
          onClick={() =>
            setClasse('QR')
          }
          type="button"
        >
          QR
        </button>
      </div>

      {msg && (
        <div
          className={
            msg.includes(
              'confirmada'
            )
              ? 'success'
              : 'error'
          }
        >
          {msg}
        </div>
      )}

      <div className="card">
        <h2>Destino da saída</h2>

        <div className="grid">
          <label>
            Refeição/destino

            <select
              value={destino}
              onChange={(e) => {
                setDestino(
                  e.target.value
                );
                setRevisar(false);
              }}
            >
              {destinos.map(
                ([valor, nome]) => (
                  <option
                    value={valor}
                    key={valor}
                  >
                    {nome}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Data

            <input
              type="date"
              value={data}
              onChange={(e) => {
                setData(
                  e.target.value
                );
                setRevisar(false);
              }}
            />
          </label>
        </div>

        <label>
          Observação

          <input
            value={observacao}
            onChange={(e) => {
              setObservacao(
                e.target.value
              );
              setRevisar(false);
            }}
          />
        </label>
      </div>

      <div className="card">
        <div className="top">
          <h2>Gêneros</h2>

          <button
            className="linkbtn"
            type="button"
            onClick={() => {
              setItens(
                (atuais) => [
                  ...atuais,
                  vazio(),
                ]
              );

              setRevisar(false);
            }}
          >
            + Adicionar gênero
          </button>
        </div>

        {itens.map(
          (item, indice) => {
            const genero =
              generoSelecionado(
                item.generoId
              );

            const categorias =
              categoriasDoGrupo(
                item.grupoId
              );

            const generosCategoria =
              generosDaCategoria(
                item.categoriaId
              );

            return (
              <div
                className="itembox"
                key={indice}
              >
                <div className="top">
                  <b>
                    Item{' '}
                    {indice + 1}
                  </b>

                  {itens.length >
                    1 && (
                    <button
                      className="dangerlink"
                      type="button"
                      onClick={() => {
                        setItens(
                          (atuais) =>
                            atuais.filter(
                              (
                                _,
                                n
                              ) =>
                                n !==
                                indice
                            )
                        );

                        setRevisar(
                          false
                        );
                      }}
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid">
                  <label>
                    Grupo

                    <select
                      value={
                        item.grupoId
                      }
                      onChange={(e) =>
                        alterarGrupo(
                          indice,
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        Selecione...
                      </option>

                      {grupos.map(
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
                  </label>

                  <label>
                    Categoria

                    <select
                      value={
                        item.categoriaId
                      }
                      disabled={
                        !item.grupoId
                      }
                      onChange={(e) =>
                        alterarCategoria(
                          indice,
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        {item.grupoId
                          ? 'Selecione...'
                          : 'Selecione o grupo primeiro'}
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
                </div>

                <div className="grid">
                  <label>
                    Gênero

                    <select
                      value={
                        item.generoId
                      }
                      disabled={
                        !item.categoriaId
                      }
                      onChange={(e) =>
                        alterarGenero(
                          indice,
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="">
                        {item.categoriaId
                          ? 'Selecione...'
                          : 'Selecione a categoria primeiro'}
                      </option>

                      {generosCategoria.map(
                        (
                          generoOpcao
                        ) => (
                          <option
                            key={
                              generoOpcao.id
                            }
                            value={
                              generoOpcao.id
                            }
                          >
                            {
                              generoOpcao.nome
                            }{' '}
                            —{' '}
                            {(
                              saldos[
                                generoOpcao
                                  .id
                              ] ||
                              0
                            ).toLocaleString(
                              'pt-BR'
                            )}{' '}
                            {
                              generoOpcao
                                .unidade
                                .sigla
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Quantidade{' '}
                    {genero &&
                      `(${genero.unidade.sigla})`}

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={
                        item.quantidade
                      }
                      disabled={
                        !genero
                      }
                      onChange={(e) =>
                        alterarQuantidade(
                          indice,
                          e.target
                            .value
                        )
                      }
                    />
                  </label>
                </div>

                {genero && (
                  <span className="muted">
                    Disponível:{' '}
                    {(
                      saldos[
                        genero.id
                      ] || 0
                    ).toLocaleString(
                      'pt-BR'
                    )}{' '}
                    {
                      genero.unidade
                        .sigla
                    }
                    . O sistema utilizará
                    primeiro o lote válido
                    com vencimento mais
                    próximo (PVPS).
                  </span>
                )}
              </div>
            );
          }
        )}
      </div>

      <div className="card">
        <div className="top">
          <div>
            <b>
              {
                destinos.find(
                  (x) =>
                    x[0] ===
                    destino
                )?.[1]
              }{' '}
              · {classe}
            </b>

            <p className="muted">
              {itens.length}{' '}
              item(ns) na saída
            </p>
          </div>

          {!revisar ? (
            <button
              className="btn"
              type="button"
              onClick={() => {
                const erro =
                  validar();

                if (erro) {
                  setMsg(erro);
                } else {
                  setMsg('');
                  setRevisar(
                    true
                  );
                }
              }}
            >
              Revisar saída
            </button>
          ) : (
            <div className="actions">
              <button
                className="linkbtn"
                type="button"
                onClick={() =>
                  setRevisar(false)
                }
              >
                Voltar e editar
              </button>

              <button
                className="btn"
                type="button"
                disabled={busy}
                onClick={confirmar}
              >
                {busy
                  ? 'Confirmando...'
                  : 'Confirmar saída'}
              </button>
            </div>
          )}
        </div>

        {revisar && (
          <div
            style={{
              marginTop: 14,
            }}
          >
            <p className="muted">
              Confira destino,
              gêneros e quantidades.
              A confirmação fará a
              baixa automática do
              estoque seguindo o PVPS
              e registrará os lotes e
              locais utilizados.
            </p>

            {itens.map(
              (item, indice) => {
                const genero =
                  generoSelecionado(
                    item.generoId
                  );

                if (!genero) {
                  return null;
                }

                return (
                  <div
                    className="row"
                    key={
                      item.generoId
                    }
                  >
                    <span>
                      {indice + 1}.{' '}
                      {
                        genero
                          .categoria
                          ?.grupo
                          ?.nome
                      }{' '}
                      →{' '}
                      {
                        genero
                          .categoria
                          ?.nome
                      }{' '}
                      →{' '}
                      {
                        genero.nome
                      }
                    </span>

                    <strong>
                      {Number(
                        item.quantidade
                      ).toLocaleString(
                        'pt-BR'
                      )}{' '}
                      {
                        genero.unidade
                          .sigla
                      }
                    </strong>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </>
  );
}

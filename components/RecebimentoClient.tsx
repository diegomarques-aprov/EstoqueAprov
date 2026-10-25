'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

type G = {
  id: string;
  nome: string;
  classe: 'QS' | 'QR';
  controlaLote: boolean;
  controlaValidade: boolean;
  unidade: {
    sigla: string;
  };
  localPadraoId?: string | null;
};

type L = {
  id: string;
  nome: string;
};

type Item = {
  generoId: string;
  localId: string;
  quantidade: string;
  valorUnitario: string;
  lote: string;
  validade: string;
};

const vazio = (): Item => ({
  generoId: '',
  localId: '',
  quantidade: '',
  valorUnitario: '',
  lote: '',
  validade: '',
});

const estiloSecao = {
  background: '#0c1811',
  border: '1px solid #284334',
  borderRadius: '14px',
  padding: '16px',
  marginBottom: '14px',
};

const estiloTituloSecao = {
  display: 'flex',
  alignItems: 'center',
  gap: '9px',
  marginBottom: '14px',
};

export default function RecebimentoClient() {
  const [classe, setClasse] =
    useState<'QS' | 'QR'>('QS');

  const [generos, setGeneros] =
    useState<G[]>([]);

  const [locais, setLocais] =
    useState<L[]>([]);

  const [itens, setItens] =
    useState<Item[]>([vazio()]);

  const [data, setData] = useState(
    () =>
      new Date()
        .toISOString()
        .slice(0, 10)
  );

  const [origem, setOrigem] =
    useState('');

  const [documento, setDocumento] =
    useState('');

  const [observacao, setObservacao] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [busy, setBusy] =
    useState(false);

  const [revisar, setRevisar] =
    useState(false);

  useEffect(() => {
    Promise.all([
      fetch(
        '/api/generos?classe=' +
          classe
      ).then((r) => r.json()),

      fetch('/api/locais').then(
        (r) => r.json()
      ),
    ]).then(([g, l]) => {
      setGeneros(g);
      setLocais(l);
      setItens([vazio()]);
      setRevisar(false);
    });
  }, [classe]);

  const gs = (id: string) =>
    generos.find(
      (g) => g.id === id
    );

  const update = (
    i: number,
    k: keyof Item,
    v: string
  ) =>
    setItens((a) =>
      a.map((x, n) =>
        n === i
          ? {
              ...x,
              [k]: v,
            }
          : x
      )
    );

  const total = useMemo(
    () =>
      itens.reduce(
        (s, i) =>
          s +
          (Number(i.quantidade) || 0) *
            (Number(
              i.valorUnitario
            ) || 0),
        0
      ),
    [itens]
  );

  function escolher(
    i: number,
    id: string
  ) {
    const g = gs(id);

    setItens((a) =>
      a.map((x, n) =>
        n === i
          ? {
              ...x,
              generoId: id,
              localId:
                g?.localPadraoId ||
                x.localId,
              lote: '',
              validade: '',
            }
          : x
      )
    );
  }

  function validar() {
    for (const i of itens) {
      const g = gs(i.generoId);

      if (!g) {
        return 'Selecione o gênero em todos os itens.';
      }

      if (
        !(
          Number(i.quantidade) > 0
        )
      ) {
        return `${g.nome}: informe uma quantidade válida.`;
      }

      if (!i.localId) {
        return `${g.nome}: informe o local de armazenamento.`;
      }

      if (
        g.controlaLote &&
        !i.lote.trim()
      ) {
        return `${g.nome}: informe o lote.`;
      }

      if (
        g.controlaValidade &&
        !i.validade
      ) {
        return `${g.nome}: informe a validade.`;
      }
    }

    return '';
  }

  async function confirmar() {
    const e = validar();

    if (e) {
      setMsg(e);
      return;
    }

    setBusy(true);
    setMsg('');

    const r = await fetch(
      '/api/recebimentos',
      {
        method: 'POST',
        headers: {
          'content-type':
            'application/json',
        },
        body: JSON.stringify({
          classe,
          data,
          origem:
            origem || undefined,
          documento:
            documento || undefined,
          observacao:
            observacao || undefined,
          itens: itens.map((i) => ({
            generoId: i.generoId,
            localId: i.localId,
            quantidade: Number(
              i.quantidade
            ),
            valorUnitario:
              i.valorUnitario === ''
                ? null
                : Number(
                    i.valorUnitario
                  ),
            lote: i.lote || null,
            validade:
              i.validade || null,
          })),
        }),
      }
    );

    const j = await r.json();

    setBusy(false);

    if (!r.ok) {
      setMsg(
        j.error ||
          'Não foi possível concluir.'
      );
      return;
    }

    setMsg(
      `Recebimento nº ${j.numero} confirmado e estoque atualizado.`
    );

    setItens([vazio()]);
    setRevisar(false);
    setDocumento('');
    setObservacao('');
  }

  return (
    <>
      {/* QS / QR */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '1fr 1fr',
          gap: '8px',
          marginBottom: '18px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setClasse('QS')
          }
          style={{
            minHeight: '48px',
            borderRadius: '11px',
            border:
              classe === 'QS'
                ? '1px solid #2b8a57'
                : '1px solid #355143',
            background:
              classe === 'QS'
                ? '#2b8a57'
                : '#0c1811',
            color: '#eef7f1',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          QS
        </button>

        <button
          type="button"
          onClick={() =>
            setClasse('QR')
          }
          style={{
            minHeight: '48px',
            borderRadius: '11px',
            border:
              classe === 'QR'
                ? '1px solid #2b8a57'
                : '1px solid #355143',
            background:
              classe === 'QR'
                ? '#2b8a57'
                : '#0c1811',
            color: '#eef7f1',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          QR
        </button>
      </div>

      {/* MENSAGENS */}

      {msg && (
        <div
          className={
            msg.includes(
              'confirmado'
            )
              ? 'success'
              : 'error'
          }
        >
          {msg}
        </div>
      )}

      {/* DADOS DO RECEBIMENTO */}

      <section style={estiloSecao}>
        <div
          style={estiloTituloSecao}
        >
          <span
            style={{
              fontSize: '21px',
            }}
          >
            📝
          </span>

          <div>
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Dados do recebimento
            </strong>

            <div
              className="muted"
              style={{
                fontSize: '13px',
                marginTop: '2px',
              }}
            >
              Entrada {classe}
            </div>
          </div>
        </div>

        <div className="grid">
          <label>
            Data
            <input
              type="date"
              value={data}
              onChange={(e) =>
                setData(
                  e.target.value
                )
              }
            />
          </label>

          <label>
            Origem
            <input
              value={origem}
              onChange={(e) =>
                setOrigem(
                  e.target.value
                )
              }
              placeholder={
                classe === 'QS'
                  ? 'Ex.: B Sup'
                  : 'Ex.: Fornecedor'
              }
            />
          </label>

          <label>
            Documento
            <input
              value={documento}
              onChange={(e) =>
                setDocumento(
                  e.target.value
                )
              }
              placeholder="Relação, NF, documento..."
            />
          </label>
        </div>

        <label>
          Observação
          <input
            value={observacao}
            onChange={(e) =>
              setObservacao(
                e.target.value
              )
            }
            placeholder="Observação opcional"
          />
        </label>
      </section>

      {/* GÊNEROS */}

      <section style={estiloSecao}>
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <div>
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Gêneros recebidos
            </strong>

            <div
              className="muted"
              style={{
                fontSize: '13px',
                marginTop: '3px',
              }}
            >
              Informe os itens desta
              entrada.
            </div>
          </div>

          <button
            type="button"
            className="linkbtn"
            onClick={() =>
              setItens((a) => [
                ...a,
                vazio(),
              ])
            }
            style={{
              minHeight: '38px',
              fontWeight: 700,
            }}
          >
            + Adicionar
          </button>
        </div>

        {itens.map((i, n) => {
          const g = gs(i.generoId);

          return (
            <div
              className="itembox"
              key={n}
              style={{
                marginBottom: '14px',
                padding: '15px',
              }}
            >
              {/* ITEM */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  paddingBottom:
                    '10px',
                  borderBottom:
                    '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <strong>
                  Item {n + 1}
                </strong>

                {itens.length >
                  1 && (
                  <button
                    type="button"
                    className="dangerlink"
                    onClick={() =>
                      setItens((a) =>
                        a.filter(
                          (_, x) =>
                            x !== n
                        )
                      )
                    }
                    style={{
                      padding:
                        '6px 0',
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* GÊNERO */}

              <label>
                Gênero
                <select
                  value={i.generoId}
                  onChange={(e) =>
                    escolher(
                      n,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione...
                  </option>

                  {generos.map(
                    (x) => (
                      <option
                        key={x.id}
                        value={x.id}
                      >
                        {x.nome}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* QUANTIDADE / LOCAL */}

              <div className="grid">
                <label>
                  Quantidade{' '}
                  {g &&
                    `(${g.unidade.sigla})`}
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    inputMode="decimal"
                    value={
                      i.quantidade
                    }
                    onChange={(e) =>
                      update(
                        n,
                        'quantidade',
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                </label>

                <label>
                  Local de
                  armazenamento
                  <select
                    value={i.localId}
                    onChange={(e) =>
                      update(
                        n,
                        'localId',
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione...
                    </option>

                    {locais.map(
                      (x) => (
                        <option
                          key={x.id}
                          value={x.id}
                        >
                          {x.nome}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              {/* LOTE / VALIDADE */}

              {(g?.controlaLote ||
                g?.controlaValidade) && (
                <div className="grid">
                  {g?.controlaLote && (
                    <label>
                      Lote
                      <input
                        value={i.lote}
                        onChange={(e) =>
                          update(
                            n,
                            'lote',
                            e.target
                              .value
                          )
                        }
                        placeholder="Informe o lote"
                      />
                    </label>
                  )}

                  {g?.controlaValidade && (
                    <label>
                      Validade
                      <input
                        type="date"
                        value={
                          i.validade
                        }
                        onChange={(e) =>
                          update(
                            n,
                            'validade',
                            e.target
                              .value
                          )
                        }
                      />
                    </label>
                  )}
                </div>
              )}

              {/* VALOR */}

              <label>
                Valor unitário (R$)
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  inputMode="decimal"
                  value={
                    i.valorUnitario
                  }
                  onChange={(e) =>
                    update(
                      n,
                      'valorUnitario',
                      e.target.value
                    )
                  }
                  placeholder="0,00"
                />
              </label>

              {g &&
                !g.controlaLote && (
                  <div
                    className="muted"
                    style={{
                      fontSize: '13px',
                      paddingTop: '2px',
                    }}
                  >
                    Este gênero não
                    exige lote.
                  </div>
                )}
            </div>
          );
        })}
      </section>

      {/* RESUMO E CONFIRMAÇÃO */}

      <section style={estiloSecao}>
        <div
          style={{
            marginBottom: '16px',
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: '13px',
              marginBottom: '4px',
            }}
          >
            Valor informado do
            recebimento
          </div>

          <div className="big">
            {total.toLocaleString(
              'pt-BR',
              {
                style: 'currency',
                currency: 'BRL',
              }
            )}
          </div>
        </div>

        {!revisar ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              const e = validar();

              if (e) {
                setMsg(e);
              } else {
                setMsg('');
                setRevisar(true);
              }
            }}
            style={{
              width: '100%',
            }}
          >
            Revisar recebimento
          </button>
        ) : (
          <>
            <div
              style={{
                background:
                  'rgba(43,138,87,0.10)',
                border:
                  '1px solid #355143',
                borderRadius: '11px',
                padding: '13px',
                marginBottom: '14px',
              }}
            >
              <strong>
                Confira antes de
                confirmar
              </strong>

              <p
                className="muted"
                style={{
                  margin:
                    '6px 0 0',
                  fontSize: '13px',
                }}
              >
                Verifique os gêneros,
                quantidades, locais,
                lotes, validades e o
                documento. A
                confirmação atualizará
                o estoque.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="linkbtn"
                onClick={() =>
                  setRevisar(false)
                }
              >
                Voltar e editar
              </button>

              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={confirmar}
              >
                {busy
                  ? 'Confirmando...'
                  : 'Confirmar'}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

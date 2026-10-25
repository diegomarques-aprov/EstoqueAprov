'use client';

import { useEffect, useMemo, useState } from 'react';

const nomes: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  OUTRO: 'Outro',
};

type Arranchamento = {
  id: string;
  data: string;
  refeicao: string;
  oficiaisStenSgt: number;
  cabosSoldados: number;
  outrosPrevistos: number;
  totalPrevisto: number;
  margemSegurancaPercent: number | string;
  efetivoPlanejamento: number;
  arranchadosCompareceram: number | null;
  naoArranchadosAtendidos: number;
  totalAtendido: number | null;
  sobraKg: number | string | null;
  fechamentoRealizadoEm: string | null;
  observacao?: string | null;
};

function dataLocal(offsetDias = 0) {
  const agora = new Date();
  agora.setDate(agora.getDate() + offsetDias);

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function numero(valor: string) {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function calcularPlanejamento(
  totalPrevisto: number,
  margem: number
) {
  return (
    totalPrevisto +
    Math.ceil((totalPrevisto * margem) / 100)
  );
}

export default function EfetivoClient() {
  const amanha = dataLocal(1);

  const [data, setData] = useState(amanha);
  const [refeicao, setRefeicao] = useState('ALMOCO');

  const [oficiaisStenSgt, setOficiaisStenSgt] = useState('');
  const [cabosSoldados, setCabosSoldados] = useState('');
  const [outrosPrevistos, setOutrosPrevistos] = useState('');

  const [usarTotalDireto, setUsarTotalDireto] =
    useState(false);

  const [totalDireto, setTotalDireto] = useState('');
  const [margem, setMargem] = useState('10');
  const [observacao, setObservacao] = useState('');

  const [rows, setRows] = useState<Arranchamento[]>([]);
  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const somaCategorias = useMemo(
    () =>
      numero(oficiaisStenSgt) +
      numero(cabosSoldados) +
      numero(outrosPrevistos),
    [oficiaisStenSgt, cabosSoldados, outrosPrevistos]
  );

  const totalPrevisto = usarTotalDireto
    ? numero(totalDireto)
    : somaCategorias;

  const efetivoPlanejamento = calcularPlanejamento(
    totalPrevisto,
    numero(margem)
  );

  async function carregar() {
    const r = await fetch(
      `/api/efetivos?inicio=${data}&fim=${data}`,
      { cache: 'no-store' }
    );

    if (r.ok) {
      setRows(await r.json());
    }
  }

  useEffect(() => {
    carregar();
  }, [data]);

  function limparFormulario() {
    setOficiaisStenSgt('');
    setCabosSoldados('');
    setOutrosPrevistos('');
    setTotalDireto('');
    setObservacao('');
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();

    setMsg('');
    setErro('');

    if (totalPrevisto <= 0) {
      setErro(
        'Para registrar o arranchamento, informe o efetivo previsto da refeição.'
      );
      return;
    }

    setSalvando(true);

    try {
      const body = usarTotalDireto
        ? {
            data,
            refeicao,
            oficiaisStenSgt: 0,
            cabosSoldados: 0,
            outrosPrevistos: 0,
            totalPrevisto,
            margemSegurancaPercent: numero(margem),
            observacao,
          }
        : {
            data,
            refeicao,
            oficiaisStenSgt: numero(oficiaisStenSgt),
            cabosSoldados: numero(cabosSoldados),
            outrosPrevistos: numero(outrosPrevistos),
            margemSegurancaPercent: numero(margem),
            observacao,
          };

      const r = await fetch('/api/efetivos', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const j = await r.json();

      if (!r.ok) {
        setErro(
          j.error ||
            'Não foi possível registrar o arranchamento.'
        );
        return;
      }

      setMsg(
        `Efetivo arranchado relacionado com sucesso. ${j.totalPrevisto} previsto(s); planejamento para ${j.efetivoPlanejamento} refeição(ões).`
      );

      limparFormulario();
      await carregar();
    } catch {
      setErro(
        'Não foi possível comunicar com o sistema. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <form onSubmit={salvar}>
        <div
          style={{
            paddingBottom: '16px',
            marginBottom: '16px',
            borderBottom:
              '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <strong style={{ fontSize: '16px' }}>
            Arranchamento / Efetivo
          </strong>

          <p
            className="muted"
            style={{
              margin: '6px 0 0',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            Informe o efetivo arranchado previsto para
            possibilitar o planejamento e o saque dos
            gêneros do dia seguinte. O saque deverá ser
            planejado para ocorrer até as 15:00 do dia
            anterior.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <label>
            Data da refeição

            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </label>

          <label>
            Refeição

            <select
              value={refeicao}
              onChange={(e) =>
                setRefeicao(e.target.value)
              }
            >
              {Object.entries(nomes).map(
                ([valor, nome]) => (
                  <option key={valor} value={valor}>
                    {nome}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <div
          style={{
            marginTop: '8px',
            marginBottom: '18px',
            padding: '14px',
            background: '#0c1811',
            border: '1px solid #284334',
            borderRadius: '12px',
          }}
        >
          <label
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              cursor: 'pointer',
              margin: 0,
            }}
          >
            <input
              type="checkbox"
              checked={usarTotalDireto}
              onChange={(e) =>
                setUsarTotalDireto(e.target.checked)
              }
              style={{
                width: '20px',
                height: '20px',
                margin: 0,
                flexShrink: 0,
              }}
            />

            <strong>
              Informar somente o total de arranchados
            </strong>
          </label>

          <p
            className="muted"
            style={{
              margin: '9px 0 0 30px',
              fontSize: '13px',
              lineHeight: 1.45,
            }}
          >
            Se os quantitativos por categoria estiverem
            disponíveis, deixe esta opção desmarcada.
            O sistema fará a soma automaticamente.
          </p>
        </div>

        {usarTotalDireto ? (
          <label>
            Total de militares arranchados

            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              required
              value={totalDireto}
              onChange={(e) =>
                setTotalDireto(e.target.value)
              }
              placeholder="0"
            />
          </label>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            <label>
              Of / STen / Sgt

              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={oficiaisStenSgt}
                onChange={(e) =>
                  setOficiaisStenSgt(e.target.value)
                }
                placeholder="0"
              />
            </label>

            <label>
              Cb / Sd

              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={cabosSoldados}
                onChange={(e) =>
                  setCabosSoldados(e.target.value)
                }
                placeholder="0"
              />
            </label>

            <label>
              Outros

              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={outrosPrevistos}
                onChange={(e) =>
                  setOutrosPrevistos(e.target.value)
                }
                placeholder="0"
              />
            </label>
          </div>
        )}

        <div
          style={{
            marginTop: '18px',
            marginBottom: '18px',
            padding: '15px',
            background: '#0c1811',
            border: '1px solid #284334',
            borderRadius: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                lineHeight: 1,
              }}
            >
              ◉
            </span>

            <strong style={{ fontSize: '16px' }}>
              Planejamento do saque
            </strong>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '10px',
              alignItems: 'center',
              padding: '11px 0',
              borderTop:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span
              className="muted"
              style={{ fontSize: '13px' }}
            >
              Efetivo arranchado previsto
            </span>

            <strong style={{ fontSize: '20px' }}>
              {totalPrevisto}
            </strong>
          </div>

          <label style={{ marginTop: '8px' }}>
            Margem de segurança (%)

            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              value={margem}
              onChange={(e) =>
                setMargem(e.target.value)
              }
            />
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '10px',
              alignItems: 'center',
              padding: '12px',
              marginTop: '8px',
              background: '#102018',
              border: '1px solid #284334',
              borderRadius: '11px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                lineHeight: 1.4,
              }}
            >
              Efetivo considerado para planejamento
            </span>

            <strong
              style={{
                fontSize: '22px',
                whiteSpace: 'nowrap',
              }}
            >
              {efetivoPlanejamento}
            </strong>
          </div>

          {totalPrevisto > 0 && (
            <p
              className="muted"
              style={{
                margin: '11px 0 0',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              O cálculo dos gêneros utilizará{' '}
              <strong>{efetivoPlanejamento}</strong>{' '}
              refeição(ões), considerando o efetivo
              previsto e a margem de segurança.
            </p>
          )}
        </div>

        <label htmlFor="observacao-arranchamento">
          Observação

          <textarea
            id="observacao-arranchamento"
            value={observacao}
            onChange={(e) =>
              setObservacao(e.target.value)
            }
            placeholder="Informação complementar, se necessária."
            rows={3}
            style={{
              minHeight: '85px',
              resize: 'vertical',
            }}
          />
        </label>

        {msg && (
          <div
            className="success"
            style={{ marginTop: '14px' }}
          >
            {msg}
          </div>
        )}

        {erro && (
          <div
            className="error"
            style={{ marginTop: '14px' }}
          >
            {erro}
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={salvando}
          style={{
            width: '100%',
            marginTop: '14px',
          }}
        >
          {salvando
            ? 'Salvando...'
            : 'Relacionar efetivo arranchado'}
        </button>
      </form>

      <section
        style={{
          marginTop: '18px',
          paddingTop: '18px',
          borderTop:
            '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div>
            <strong style={{ fontSize: '16px' }}>
              Arranchamentos da data
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
              }}
            >
              Registros para{' '}
              {data
                ? new Date(
                    `${data}T12:00:00`
                  ).toLocaleDateString('pt-BR')
                : ''}
            </div>
          </div>

          <div
            style={{
              minWidth: '32px',
              height: '32px',
              padding: '0 9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              background: '#183d2a',
              border: '1px solid #284334',
              fontWeight: 700,
              fontSize: '13px',
            }}
          >
            {rows.length}
          </div>
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              padding: '18px 14px',
              textAlign: 'center',
              background: '#0c1811',
              border: '1px solid #284334',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                marginBottom: '7px',
              }}
            >
              —
            </div>

            <p
              className="muted"
              style={{
                margin: 0,
                fontSize: '13px',
              }}
            >
              Nenhum efetivo arranchado relacionado
              para esta data.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '10px',
            }}
          >
            {rows.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '13px',
                  background: '#0c1811',
                  border: '1px solid #284334',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: '15px',
                      }}
                    >
                      {nomes[item.refeicao] ||
                        item.refeicao}
                    </strong>

                    <div
                      className="muted"
                      style={{
                        marginTop: '5px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    >
                      Previsto: {item.totalPrevisto}
                      <br />
                      Margem:{' '}
                      {Number(
                        item.margemSegurancaPercent
                      ).toLocaleString('pt-BR')}
                      %
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="muted"
                      style={{
                        fontSize: '11px',
                        marginBottom: '2px',
                      }}
                    >
                      Planejamento
                    </div>

                    <strong
                      style={{
                        fontSize: '20px',
                      }}
                    >
                      {item.efetivoPlanejamento}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '11px',
                    paddingTop: '10px',
                    borderTop:
                      '1px solid rgba(255,255,255,0.07)',
                    fontSize: '13px',
                  }}
                >
                  {item.fechamentoRealizadoEm ? (
                    <span>
                      ✓ Fechamento realizado · Atendidos:{' '}
                      <strong>
                        {item.totalAtendido ?? 0}
                      </strong>
                    </span>
                  ) : (
                    <span
                      className="muted"
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      Fechamento pendente
                    </span>
                  )}
                </div>

                {item.observacao && (
                  <div
                    className="muted"
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      lineHeight: 1.45,
                    }}
                  >
                    Obs.: {item.observacao}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

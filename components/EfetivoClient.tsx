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
    <>
      <div className="card">
        <h2>Arranchamento / Efetivo</h2>

        <p className="muted">
          Informe o efetivo arranchado previsto para possibilitar
          o planejamento e o saque dos gêneros do dia seguinte.
          O saque deverá ser planejado para ocorrer até as 15:00
          do dia anterior.
        </p>

        <form onSubmit={salvar}>
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

          <div
            style={{
              marginTop: 16,
              marginBottom: 16,
              padding: 14,
              border:
                '1px solid rgba(255,255,255,.12)',
              borderRadius: 10,
            }}
          >
            <label
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={usarTotalDireto}
                onChange={(e) =>
                  setUsarTotalDireto(e.target.checked)
                }
                style={{ width: 'auto' }}
              />

              Informar somente o total de arranchados
            </label>

            <p
              className="muted"
              style={{ marginBottom: 0 }}
            >
              Se os quantitativos por categoria estiverem
              disponíveis, deixe esta opção desmarcada e
              informe-os abaixo. O sistema fará a soma
              automaticamente.
            </p>
          </div>

          {usarTotalDireto ? (
            <label>
              Total de militares arranchados
              <input
                type="number"
                min="0"
                step="1"
                required
                value={totalDireto}
                onChange={(e) =>
                  setTotalDireto(e.target.value)
                }
              />
            </label>
          ) : (
            <>
              <label>
                Of / STen / Sgt
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={oficiaisStenSgt}
                  onChange={(e) =>
                    setOficiaisStenSgt(e.target.value)
                  }
                />
              </label>

              <label>
                Cb / Sd
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={cabosSoldados}
                  onChange={(e) =>
                    setCabosSoldados(e.target.value)
                  }
                />
              </label>

              <label>
                Outros
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={outrosPrevistos}
                  onChange={(e) =>
                    setOutrosPrevistos(e.target.value)
                  }
                />
              </label>
            </>
          )}

          <div
            className="card"
            style={{
              marginTop: 18,
              marginBottom: 18,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Planejamento do saque
            </h3>

            <div className="row">
              <span>Efetivo arranchado previsto</span>
              <strong>{totalPrevisto}</strong>
            </div>

            <label>
              Margem de segurança (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={margem}
                onChange={(e) =>
                  setMargem(e.target.value)
                }
              />
            </label>

            <div className="row">
              <span>
                Efetivo considerado para planejamento
              </span>

              <strong>{efetivoPlanejamento}</strong>
            </div>

            {totalPrevisto > 0 && (
              <p
                className="muted"
                style={{ marginBottom: 0 }}
              >
                O cálculo dos gêneros utilizará{' '}
                <strong>
                  {efetivoPlanejamento}
                </strong>{' '}
                refeição(ões), considerando o efetivo
                previsto e a margem de segurança.
              </p>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="observacao-arranchamento"
              style={{
                display: 'block',
                marginBottom: 6,
              }}
            >
              Observação
            </label>

            <textarea
              id="observacao-arranchamento"
              value={observacao}
              onChange={(e) =>
                setObservacao(e.target.value)
              }
              placeholder="Informação complementar, se necessária."
              rows={3}
              style={{
                display: 'block',
                width: '100%',
                minHeight: 80,
                resize: 'vertical',
              }}
            />
          </div>

          {msg && (
            <div className="success">{msg}</div>
          )}

          {erro && (
            <div className="error">{erro}</div>
          )}

          <button
            className="btn"
            type="submit"
            disabled={salvando}
          >
            {salvando
              ? 'Salvando...'
              : 'Relacionar efetivo arranchado'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Arranchamentos da data</h2>

        {rows.length === 0 ? (
          <p className="muted">
            Nenhum efetivo arranchado relacionado para esta
            data.
          </p>
        ) : (
          rows.map((item) => (
            <div
              className="row"
              key={item.id}
              style={{
                alignItems: 'flex-start',
                paddingTop: 12,
                paddingBottom: 12,
              }}
            >
              <div>
                <strong>
                  {nomes[item.refeicao]}
                </strong>

                <div className="muted">
                  Previsto: {item.totalPrevisto}
                </div>

                <div className="muted">
                  Margem:{' '}
                  {Number(
                    item.margemSegurancaPercent
                  ).toLocaleString('pt-BR')}
                  %
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <strong>
                  Planejamento:{' '}
                  {item.efetivoPlanejamento}
                </strong>

                <div className="muted">
                  {item.fechamentoRealizadoEm
                    ? `Atendidos: ${
                        item.totalAtendido ?? 0
                      }`
                    : 'Fechamento pendente'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

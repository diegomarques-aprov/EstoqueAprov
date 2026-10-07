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
  totalPrevisto: number;
  efetivoPlanejamento: number;
  arranchadosCompareceram: number | null;
  naoArranchadosAtendidos: number;
  totalAtendido: number | null;
  sobraKg: number | string | null;
  fechamentoRealizadoEm: string | null;
  observacao?: string | null;
};

type Valores = {
  compareceram: string;
  naoArranchados: string;
  sobraKg: string;
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

function dataBR(data: string) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function FechamentoDiarioClient() {
  /*
   * O fechamento abre inicialmente no dia anterior.
   * Isso facilita o lançamento feito no início do dia
   * seguinte, mas qualquer data poderá ser escolhida.
   */
  const [data, setData] = useState(dataLocal(-1));

  const [rows, setRows] = useState<Arranchamento[]>([]);
  const [valores, setValores] = useState<
    Record<string, Valores>
  >({});

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [msg, setMsg] = useState('');
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setMsg('');
    setErro('');

    try {
      const r = await fetch(
        `/api/efetivos?inicio=${data}&fim=${data}`,
        {
          cache: 'no-store',
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setErro(
          j.error ||
            'Não foi possível consultar os dados do serviço.'
        );

        setRows([]);
        setValores({});
        return;
      }

      setRows(j);

      const iniciais: Record<string, Valores> = {};

      for (const item of j as Arranchamento[]) {
        iniciais[item.id] = {
          compareceram:
            item.arranchadosCompareceram !== null
              ? String(item.arranchadosCompareceram)
              : '',

          naoArranchados:
            item.fechamentoRealizadoEm
              ? String(item.naoArranchadosAtendidos)
              : '0',

          sobraKg:
            item.sobraKg !== null
              ? String(item.sobraKg)
              : '',
        };
      }

      setValores(iniciais);
    } catch {
      setErro(
        'Não foi possível comunicar com o sistema.'
      );

      setRows([]);
      setValores({});
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [data]);

  function alterar(
    id: string,
    campo: keyof Valores,
    valor: string
  ) {
    setMsg('');
    setErro('');

    setValores((anterior) => ({
      ...anterior,

      [id]: {
        ...anterior[id],
        [campo]: valor,
      },
    }));
  }

  const todosFechados =
    rows.length > 0 &&
    rows.every(
      (item) => item.fechamentoRealizadoEm
    );

  const resumo = useMemo(() => {
    let compareceram = 0;
    let naoArranchados = 0;
    let totalAtendido = 0;
    let sobraKg = 0;

    for (const item of rows) {
      const v = valores[item.id];

      if (!v) continue;

      const c = numero(v.compareceram);
      const n = numero(v.naoArranchados);
      const s = numero(v.sobraKg);

      compareceram += c;
      naoArranchados += n;
      totalAtendido += c + n;
      sobraKg += s;
    }

    return {
      compareceram,
      naoArranchados,
      totalAtendido,
      sobraKg,
    };
  }, [rows, valores]);

  function validar() {
    if (rows.length === 0) {
      setErro(
        'Não existem arranchamentos relacionados para esta data.'
      );
      return false;
    }

    for (const item of rows) {
      const v = valores[item.id];

      if (
        !v ||
        v.compareceram.trim() === ''
      ) {
        setErro(
          `Para concluir o fechamento, informe quantos arranchados compareceram no ${nomes[item.refeicao]}.`
        );
        return false;
      }

      if (v.naoArranchados.trim() === '') {
        setErro(
          `Para concluir o fechamento, informe os não arranchados atendidos no ${nomes[item.refeicao]}. Se não houve, informe 0.`
        );
        return false;
      }

      if (v.sobraKg.trim() === '') {
        setErro(
          `Para concluir o fechamento, informe a sobra pesada do ${nomes[item.refeicao]} em kg. Se não houve sobra, informe 0.`
        );
        return false;
      }
    }

    return true;
  }

  async function concluir() {
    setMsg('');
    setErro('');

    if (!validar()) {
      return;
    }

    /*
     * Se todos já estavam fechados, esta operação será
     * uma correção. A API manterá a auditoria dos valores
     * anteriores.
     */
    if (
      todosFechados &&
      !window.confirm(
        'Este dia já possui fechamento realizado. Deseja registrar uma correção dos dados? A alteração ficará registrada na auditoria.'
      )
    ) {
      return;
    }

    setSalvando(true);

    try {
      const itens = rows.map((item) => {
        const v = valores[item.id];

        return {
          id: item.id,

          arranchadosCompareceram:
            numero(v.compareceram),

          naoArranchadosAtendidos:
            numero(v.naoArranchados),

          sobraKg:
            numero(v.sobraKg),
        };
      });

      const r = await fetch(
        '/api/efetivos/fechamento',
        {
          method: 'POST',

          headers: {
            'content-type': 'application/json',
          },

          body: JSON.stringify({
            data,
            itens,
          }),
        }
      );

      const j = await r.json();

      if (!r.ok) {
        setErro(
          j.error ||
            'Não foi possível concluir o fechamento diário.'
        );
        return;
      }

      setMsg(
        `Fechamento do serviço de ${dataBR(
          data
        )} registrado com sucesso. Total atendido: ${
          j.resumo.totalAtendido
        }. Sobra pesada: ${Number(
          j.resumo.sobraKg
        ).toLocaleString('pt-BR', {
          maximumFractionDigits: 3,
        })} kg.`
      );

      await carregar();

      /*
       * carregar() limpa a mensagem.
       * Recolocamos a confirmação após atualizar os dados.
       */
      setMsg(
        `Fechamento do serviço de ${dataBR(
          data
        )} registrado com sucesso. Total atendido: ${
          j.resumo.totalAtendido
        }. Sobra pesada: ${Number(
          j.resumo.sobraKg
        ).toLocaleString('pt-BR', {
          maximumFractionDigits: 3,
        })} kg.`
      );
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
        <h2>Fechamento Diário</h2>

        <p className="muted">
          Registre os dados reais após a conclusão do serviço
          de alimentação do dia. O lançamento pode ser feito
          posteriormente, mantendo sempre a data real do
          serviço para fins de consulta e relatórios.
        </p>

        <label>
          Data do serviço
          <input
            type="date"
            value={data}
            max={dataLocal(0)}
            onChange={(e) =>
              setData(e.target.value)
            }
          />
        </label>

        <p className="muted">
          Data selecionada:{' '}
          <strong>{dataBR(data)}</strong>
        </p>
      </div>

      {carregando ? (
        <div className="card">
          <p className="muted">
            Consultando dados do serviço...
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div
          className="card"
          style={{
            border: '1px solid #f59e0b',
            background:
              'rgba(245, 158, 11, 0.08)',
          }}
        >
          <h2>⚠ Sem lançamento</h2>

          <p>
            Não houve lançamento de arranchamento para o
            serviço de <strong>{dataBR(data)}</strong>.
          </p>

          <p className="muted">
            Caso os dados desse dia precisem constar nos
            relatórios, faça primeiro o lançamento
            correspondente ao serviço dessa data.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>
              Refeições do dia
            </h2>

            {rows.map((item) => {
              const v = valores[item.id] || {
                compareceram: '',
                naoArranchados: '0',
                sobraKg: '',
              };

              const total =
                numero(v.compareceram) +
                numero(v.naoArranchados);

              return (
                <div
                  key={item.id}
                  style={{
                    marginBottom: 22,
                    paddingBottom: 22,
                    borderBottom:
                      '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  <div
                    className="row"
                    style={{
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          marginTop: 0,
                          marginBottom: 5,
                        }}
                      >
                        {nomes[item.refeicao]}
                      </h3>

                      <div className="muted">
                        Arranchados previstos:{' '}
                        {item.totalPrevisto}
                      </div>

                      <div className="muted">
                        Planejamento com margem:{' '}
                        {item.efetivoPlanejamento}
                      </div>
                    </div>

                    <div>
                      {item.fechamentoRealizadoEm ? (
                        <strong>
                          ✓ Fechado
                        </strong>
                      ) : (
                        <strong>
                          Fechamento pendente
                        </strong>
                      )}
                    </div>
                  </div>

                  {item.observacao && (
                    <div
                      style={{
                        marginTop: 12,
                        marginBottom: 12,
                        padding: 10,
                        borderRadius: 8,
                        background:
                          'rgba(255,255,255,.05)',
                      }}
                    >
                      <strong>
                        Observação do planejamento:
                      </strong>

                      <div className="muted">
                        {item.observacao}
                      </div>
                    </div>
                  )}

                  <div
                    className="grid"
                    style={{ marginTop: 15 }}
                  >
                    <label>
                      Arranchados que compareceram
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.compareceram}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'compareceram',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Não arranchados atendidos
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.naoArranchados}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'naoArranchados',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Sobra pesada (kg)
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={v.sobraKg}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'sobraKg',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="row">
                    <span>
                      Total efetivamente atendido
                    </span>

                    <strong>{total}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2>Resumo do fechamento</h2>

            <div className="row">
              <span>
                Arranchados que compareceram
              </span>

              <strong>
                {resumo.compareceram}
              </strong>
            </div>

            <div className="row">
              <span>
                Não arranchados atendidos
              </span>

              <strong>
                {resumo.naoArranchados}
              </strong>
            </div>

            <div className="row">
              <span>
                Total efetivamente atendido
              </span>

              <strong>
                {resumo.totalAtendido}
              </strong>
            </div>

            <div className="row">
              <span>
                Sobra pesada total
              </span>

              <strong>
                {resumo.sobraKg.toLocaleString(
                  'pt-BR',
                  {
                    maximumFractionDigits: 3,
                  }
                )}{' '}
                kg
              </strong>
            </div>

            {msg && (
              <div className="success">
                {msg}
              </div>
            )}

            {erro && (
              <div className="error">
                {erro}
              </div>
            )}

            <button
              type="button"
              className="btn"
              disabled={salvando}
              onClick={concluir}
            >
              {salvando
                ? 'Salvando...'
                : todosFechados
                  ? 'Corrigir fechamento do dia'
                  : 'Concluir fechamento do dia'}
            </button>
          </div>
        </>
      )}

      {!carregando &&
        rows.length === 0 &&
        erro && (
          <div className="error">
            {erro}
          </div>
        )}
    </>
  );
}

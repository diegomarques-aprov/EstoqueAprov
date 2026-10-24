'use client';

import { useEffect, useMemo, useState } from 'react';

const nomes: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE: 'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

type Arranchamento = {
  id: string;
  data: string;
  refeicao: string;
  totalPrevisto: number;
  efetivoPlanejamento: number;
  arranchadosCompareceram: number | null;
  faltas: number | null;
  naoArranchadosAtendidos: number;
  totalAtendido: number | null;
  sobraKg: number | string | null;
  fechamentoRealizadoEm: string | null;
  observacao?: string | null;
};

type Valores = {
  alimentado: string;
  faltas: string;
  militaresDeFora: string;
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
          alimentado:
            item.arranchadosCompareceram !== null
              ? String(item.arranchadosCompareceram)
              : '',

          faltas:
            item.faltas !== null
              ? String(item.faltas)
              : '',

          militaresDeFora:
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
    let previsto = 0;
    let alimentado = 0;
    let faltas = 0;
    let militaresDeFora = 0;
    let totalAtendido = 0;
    let sobraKg = 0;

    for (const item of rows) {
      previsto += item.totalPrevisto;

      const v = valores[item.id];

      if (!v) continue;

      const a = numero(v.alimentado);
      const f = numero(v.faltas);
      const m = numero(v.militaresDeFora);
      const s = numero(v.sobraKg);

      alimentado += a;
      faltas += f;
      militaresDeFora += m;
      totalAtendido += a + m;
      sobraKg += s;
    }

    return {
      previsto,
      alimentado,
      faltas,
      militaresDeFora,
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
      const refeicao =
        nomes[item.refeicao] || item.refeicao;

      if (
        !v ||
        v.alimentado.trim() === ''
      ) {
        setErro(
          `Para concluir o lançamento, informe o efetivo alimentado no ${refeicao}.`
        );
        return false;
      }

      if (v.faltas.trim() === '') {
        setErro(
          `Para concluir o lançamento, informe as faltas no ${refeicao}. Se não houve faltas, informe 0.`
        );
        return false;
      }

      if (v.militaresDeFora.trim() === '') {
        setErro(
          `Para concluir o lançamento, informe os militares de fora atendidos no ${refeicao}. Se não houve, informe 0.`
        );
        return false;
      }

      if (v.sobraKg.trim() === '') {
        setErro(
          `Para concluir o lançamento, informe a sobra pesada do ${refeicao} em kg. Se não houve sobra, informe 0.`
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

    if (
      todosFechados &&
      !window.confirm(
        'Este dia já possui lançamento realizado. Deseja registrar uma correção dos dados? A alteração ficará registrada na auditoria.'
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
            numero(v.alimentado),

          faltas:
            numero(v.faltas),

          naoArranchadosAtendidos:
            numero(v.militaresDeFora),

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
            'Não foi possível registrar o efetivo diário.'
        );
        return;
      }

      await carregar();

      setMsg(
        `Dados do serviço de ${dataBR(
          data
        )} registrados com sucesso. Foram ${
          j.quantidadeRefeicoes
        } refeição${
          j.quantidadeRefeicoes === 1 ? '' : 'ões'
        } registrada${
          j.quantidadeRefeicoes === 1 ? '' : 's'
        }, com ${
          j.resumo.totalAtendido
        } atendimento${
          j.resumo.totalAtendido === 1 ? '' : 's'
        } no total.`
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
        <h2>Efetivo alimentado</h2>

        <p className="muted">
          Registre o efetivo real de cada refeição do dia.
          O efetivo previsto vem do planejamento e serve
          como referência. Informe o efetivo alimentado,
          as faltas e os militares de fora atendidos.
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
            Faça primeiro o planejamento do efetivo para
            essa data.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Efetivo por refeição</h2>

            {rows.map((item) => {
              const v = valores[item.id] || {
                alimentado: '',
                faltas: '',
                militaresDeFora: '0',
                sobraKg: '',
              };

              const total =
                numero(v.alimentado) +
                numero(v.militaresDeFora);

              const refeicao =
                nomes[item.refeicao] ||
                item.refeicao;

              return (
                <div
                  key={item.id}
                  style={{
                    marginBottom: 24,
                    paddingBottom: 24,
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
                        {refeicao}
                      </h3>

                      <div className="muted">
                        Efetivo previsto:{' '}
                        <strong>
                          {item.totalPrevisto}
                        </strong>
                      </div>

                      <div className="muted">
                        Planejamento com margem:{' '}
                        {item.efetivoPlanejamento}
                      </div>
                    </div>

                    <div>
                      {item.fechamentoRealizadoEm ? (
                        <strong>
                          ✓ Registrado
                        </strong>
                      ) : (
                        <strong>
                          Pendente
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
                      Efetivo alimentado
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.alimentado}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'alimentado',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Faltas
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.faltas}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'faltas',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Militares de fora
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={v.militaresDeFora}
                        onChange={(e) =>
                          alterar(
                            item.id,
                            'militaresDeFora',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>

                  <div
                    className="row"
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <span>
                      Total atendido nesta refeição
                    </span>

                    <strong>{total}</strong>
                  </div>

                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop:
                        '1px solid rgba(255,255,255,.08)',
                    }}
                  >
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

                    <p
                      className="muted"
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      Este campo será consolidado como
                      sobra única do serviço diário na
                      próxima atualização.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2>Resumo do dia</h2>

            <div className="row">
              <span>
                Refeições realizadas
              </span>

              <strong>
                {rows.length}
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo previsto
              </span>

              <strong>
                {resumo.previsto}
              </strong>
            </div>

            <div className="row">
              <span>
                Efetivo alimentado
              </span>

              <strong>
                {resumo.alimentado}
              </strong>
            </div>

            <div className="row">
              <span>
                Faltas
              </span>

              <strong>
                {resumo.faltas}
              </strong>
            </div>

            <div className="row">
              <span>
                Militares de fora
              </span>

              <strong>
                {resumo.militaresDeFora}
              </strong>
            </div>

            <div
              className="row"
              style={{
                marginTop: 10,
                paddingTop: 12,
                borderTop:
                  '1px solid rgba(255,255,255,.12)',
              }}
            >
              <span>
                <strong>
                  Total de atendimentos no dia
                </strong>
              </span>

              <strong>
                {resumo.totalAtendido}
              </strong>
            </div>

            <p className="muted">
              O total representa refeições/atendimentos
              servidos no dia. A mesma pessoa pode ter
              participado de mais de uma refeição.
            </p>

            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop:
                  '1px solid rgba(255,255,255,.12)',
              }}
            >
              <h3>Sobras</h3>

              <div className="row">
                <span>
                  Sobra pesada total do dia
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
                  ? 'Corrigir dados do dia'
                  : 'Registrar efetivo do dia'}
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

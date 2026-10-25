'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';

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
  fechamentoRealizadoEm: string | null;
  observacao?: string | null;
};

type Valores = {
  alimentado: string;
  faltas: string;
  militaresDeFora: string;
};

type FechamentoDiario = {
  id: string;
  data: string;
  sobraKg: number;
  observacao: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

function dataLocal(offsetDias = 0) {
  const agora = new Date();

  agora.setDate(
    agora.getDate() + offsetDias
  );

  const ano = agora.getFullYear();

  const mes = String(
    agora.getMonth() + 1
  ).padStart(2, '0');

  const dia = String(
    agora.getDate()
  ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function dataValida(
  valor: string | null
) {
  if (!valor) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(
    valor
  );
}

function numero(
  valor: string
) {
  const n = Number(valor);

  return Number.isFinite(n) &&
    n >= 0
    ? n
    : 0;
}

function dataBR(
  data: string
) {
  const [ano, mes, dia] =
    data.split('-');

  return `${dia}/${mes}/${ano}`;
}

export default function FechamentoDiarioClient() {
  const searchParams =
    useSearchParams();

  const dataRecebida =
    searchParams.get('data');

  const dataInicial =
    dataValida(dataRecebida)
      ? dataRecebida!
      : dataLocal(-1);

  const [data, setData] =
    useState(dataInicial);

  const [rows, setRows] =
    useState<Arranchamento[]>([]);

  const [valores, setValores] =
    useState<
      Record<string, Valores>
    >({});

  const [
    fechamentoExistente,
    setFechamentoExistente,
  ] =
    useState<FechamentoDiario | null>(
      null
    );

  const [sobraKg, setSobraKg] =
    useState('');

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [msg, setMsg] =
    useState('');

  const [erro, setErro] =
    useState('');

  async function carregar() {
    setCarregando(true);
    setMsg('');
    setErro('');

    try {
      const [
        resEfetivos,
        resFechamento,
      ] = await Promise.all([
        fetch(
          `/api/efetivos?inicio=${data}&fim=${data}`,
          {
            cache: 'no-store',
          }
        ),

        fetch(
          `/api/efetivos/fechamento?data=${data}`,
          {
            cache: 'no-store',
          }
        ),
      ]);

      const dadosEfetivos =
        await resEfetivos.json();

      const dadosFechamento =
        await resFechamento.json();

      if (!resEfetivos.ok) {
        setErro(
          dadosEfetivos.error ||
            'Não foi possível consultar os dados do serviço.'
        );

        setRows([]);
        setValores({});
        setFechamentoExistente(
          null
        );
        setSobraKg('');
        setObservacao('');

        return;
      }

      if (!resFechamento.ok) {
        setErro(
          dadosFechamento.error ||
            'Não foi possível consultar o fechamento diário.'
        );

        setRows([]);
        setValores({});
        setFechamentoExistente(
          null
        );
        setSobraKg('');
        setObservacao('');

        return;
      }

      setRows(dadosEfetivos);

      const iniciais: Record<
        string,
        Valores
      > = {};

      for (
        const item of
          dadosEfetivos as Arranchamento[]
      ) {
        iniciais[item.id] = {
          alimentado:
            item.arranchadosCompareceram !==
            null
              ? String(
                  item.arranchadosCompareceram
                )
              : '',

          faltas:
            item.faltas !== null
              ? String(
                  item.faltas
                )
              : '',

          militaresDeFora:
            item.fechamentoRealizadoEm
              ? String(
                  item.naoArranchadosAtendidos
                )
              : '0',
        };
      }

      setValores(iniciais);

      const fechamento =
        dadosFechamento.fechamento as
          | FechamentoDiario
          | null;

      setFechamentoExistente(
        fechamento
      );

      if (fechamento) {
        setSobraKg(
          String(
            fechamento.sobraKg
          )
        );

        setObservacao(
          fechamento.observacao ||
            ''
        );
      } else {
        setSobraKg('');
        setObservacao('');
      }
    } catch {
      setErro(
        'Não foi possível comunicar com o sistema.'
      );

      setRows([]);
      setValores({});
      setFechamentoExistente(
        null
      );
      setSobraKg('');
      setObservacao('');
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

    setValores(
      (anterior) => ({
        ...anterior,

        [id]: {
          ...anterior[id],
          [campo]: valor,
        },
      })
    );
  }

  const todosFechados =
    rows.length > 0 &&
    rows.every(
      (item) =>
        item.fechamentoRealizadoEm
    );

  const fechamentoConcluido =
    todosFechados &&
    fechamentoExistente !== null;

  const resumo =
    useMemo(() => {
      let previsto = 0;
      let alimentado = 0;
      let faltas = 0;
      let militaresDeFora = 0;
      let totalAtendido = 0;

      for (
        const item of rows
      ) {
        previsto +=
          item.totalPrevisto;

        const v =
          valores[item.id];

        if (!v) {
          continue;
        }

        const a =
          numero(
            v.alimentado
          );

        const f =
          numero(
            v.faltas
          );

        const m =
          numero(
            v.militaresDeFora
          );

        alimentado += a;
        faltas += f;
        militaresDeFora += m;

        totalAtendido +=
          a + m;
      }

      return {
        previsto,
        alimentado,
        faltas,
        militaresDeFora,
        totalAtendido,
      };
    }, [rows, valores]);

  function validar() {
    if (
      rows.length === 0
    ) {
      setErro(
        'Não existem arranchamentos relacionados para esta data.'
      );

      return false;
    }

    for (
      const item of rows
    ) {
      const v =
        valores[item.id];

      const refeicao =
        nomes[
          item.refeicao
        ] ||
        item.refeicao;

      if (
        !v ||
        v.alimentado.trim() ===
          ''
      ) {
        setErro(
          `Para concluir o lançamento, informe o efetivo alimentado no ${refeicao}.`
        );

        return false;
      }

      if (
        v.faltas.trim() ===
        ''
      ) {
        setErro(
          `Para concluir o lançamento, informe as faltas no ${refeicao}. Se não houve faltas, informe 0.`
        );

        return false;
      }

      if (
        v.militaresDeFora.trim() ===
        ''
      ) {
        setErro(
          `Para concluir o lançamento, informe os militares de fora atendidos no ${refeicao}. Se não houve, informe 0.`
        );

        return false;
      }
    }

    if (
      sobraKg.trim() === ''
    ) {
      setErro(
        'Para concluir o fechamento, informe a sobra pesada total do serviço em kg. Se não houve sobra, informe 0.'
      );

      return false;
    }

    if (
      !Number.isFinite(
        Number(sobraKg)
      ) ||
      Number(sobraKg) < 0
    ) {
      setErro(
        'Informe um valor válido para a sobra pesada total do serviço.'
      );

      return false;
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
      fechamentoConcluido &&
      !window.confirm(
        'Este serviço já possui fechamento registrado. Deseja corrigir os dados? A alteração ficará registrada na auditoria.'
      )
    ) {
      return;
    }

    setSalvando(true);

    try {
      const itens =
        rows.map(
          (item) => {
            const v =
              valores[item.id];

            return {
              id:
                item.id,

              arranchadosCompareceram:
                numero(
                  v.alimentado
                ),

              faltas:
                numero(
                  v.faltas
                ),

              naoArranchadosAtendidos:
                numero(
                  v.militaresDeFora
                ),
            };
          }
        );

      const r =
        await fetch(
          '/api/efetivos/fechamento',
          {
            method: 'POST',

            headers: {
              'content-type':
                'application/json',
            },

            body:
              JSON.stringify({
                data,
                itens,

                sobraKg:
                  numero(
                    sobraKg
                  ),

                observacao:
                  observacao.trim() ||
                  null,
              }),
          }
        );

      const j =
        await r.json();

      if (!r.ok) {
        setErro(
          j.error ||
            'Não foi possível registrar o fechamento diário.'
        );

        return;
      }

      await carregar();

      setMsg(
        `Fechamento do serviço de ${dataBR(
          data
        )} registrado com sucesso. Total de ${
          j.resumo
            .totalAtendido
        } atendimentos e ${
          j.resumo.sobraKg
        } kg de sobra.`
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
    <div>
      {/* DATA DO SERVIÇO */}

      <section
        style={{
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
          }}
        >
          <strong
            style={{
              fontSize: '17px',
            }}
          >
            Efetivo alimentado
          </strong>

          <p
            className="muted"
            style={{
              margin: '5px 0 0',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            Registre o efetivo real de cada
            refeição. O efetivo previsto serve
            como referência de planejamento e
            pode ser ultrapassado quando houver
            atendimento de militares não
            previstos.
          </p>
        </div>

        {dataValida(
          dataRecebida
        ) && (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '11px',
              border:
                '1px solid #f59e0b',
              background:
                'rgba(245,158,11,.08)',
            }}
          >
            <strong>
              ⚠ Fechamento selecionado pelo
              Painel de Avisos
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '5px',
                fontSize: '13px',
              }}
            >
              Data pendente:{' '}
              <strong>
                {dataBR(data)}
              </strong>
            </div>
          </div>
        )}

        <label>
          Data do serviço

          <input
            type="date"
            value={data}
            max={dataLocal(0)}
            onChange={(e) =>
              setData(
                e.target.value
              )
            }
          />
        </label>

        <div
          style={{
            marginTop: '10px',
            padding: '10px 12px',
            background: '#0c1811',
            border:
              '1px solid #284334',
            borderRadius: '10px',
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            className="muted"
            style={{
              fontSize: '13px',
            }}
          >
            Data selecionada
          </span>

          <strong>
            {dataBR(data)}
          </strong>
        </div>

        {fechamentoConcluido && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px',
              borderRadius: '11px',
              border:
                '1px solid #315846',
              background:
                'rgba(34,197,94,.08)',
            }}
          >
            <strong>
              ✓ Serviço fechado
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Os dados abaixo correspondem ao
              fechamento já registrado. Eles
              podem ser corrigidos, se
              necessário.
            </div>
          </div>
        )}
      </section>

      {/* CARREGAMENTO / SEM LANÇAMENTO */}

      {carregando ? (
        <div
          style={{
            padding: '18px',
            textAlign: 'center',
            background: '#0c1811',
            border:
              '1px solid #284334',
            borderRadius: '12px',
          }}
        >
          <p
            className="muted"
            style={{ margin: 0 }}
          >
            Consultando dados do serviço...
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: '16px',
            border:
              '1px solid #f59e0b',
            background:
              'rgba(245,158,11,.08)',
            borderRadius: '12px',
          }}
        >
          <strong>
            ⚠ Sem lançamento
          </strong>

          <p
            style={{
              marginBottom: '6px',
            }}
          >
            Não houve lançamento de
            arranchamento para o serviço de{' '}
            <strong>
              {dataBR(data)}
            </strong>.
          </p>

          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: '13px',
            }}
          >
            Faça primeiro o planejamento do
            efetivo para essa data.
          </p>
        </div>
      ) : (
        <>
          {/* REFEIÇÕES */}

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
                justifyContent:
                  'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: '17px',
                  }}
                >
                  Efetivo por refeição
                </strong>

                <div
                  className="muted"
                  style={{
                    marginTop: '3px',
                    fontSize: '13px',
                  }}
                >
                  Informe os dados reais de
                  cada refeição.
                </div>
              </div>

              <div
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 9px',
                  borderRadius: '16px',
                  background: '#183d2a',
                  border:
                    '1px solid #284334',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  fontWeight: 700,
                }}
              >
                {rows.length}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '12px',
              }}
            >
              {rows.map(
                (item) => {
                  const v =
                    valores[
                      item.id
                    ] || {
                      alimentado:
                        '',
                      faltas: '',
                      militaresDeFora:
                        '0',
                    };

                  const total =
                    numero(
                      v.alimentado
                    ) +
                    numero(
                      v.militaresDeFora
                    );

                  const refeicao =
                    nomes[
                      item.refeicao
                    ] ||
                    item.refeicao;

                  return (
                    <div
                      key={
                        item.id
                      }
                      style={{
                        padding:
                          '14px',
                        background:
                          '#0c1811',
                        border:
                          '1px solid #284334',
                        borderRadius:
                          '13px',
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'flex-start',
                          gap: '12px',
                          paddingBottom:
                            '12px',
                          marginBottom:
                            '13px',
                          borderBottom:
                            '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize:
                                '16px',
                            }}
                          >
                            {
                              refeicao
                            }
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '5px',
                              fontSize:
                                '12px',
                              lineHeight:
                                1.5,
                            }}
                          >
                            Previsto:{' '}
                            <strong>
                              {
                                item.totalPrevisto
                              }
                            </strong>
                            <br />
                            Planejamento
                            com margem:{' '}
                            {
                              item.efetivoPlanejamento
                            }
                          </div>
                        </div>

                        <div
                          style={{
                            flexShrink:
                              0,
                            padding:
                              '5px 8px',
                            borderRadius:
                              '8px',
                            background:
                              item.fechamentoRealizadoEm
                                ? 'rgba(34,197,94,.10)'
                                : 'rgba(245,158,11,.08)',
                            border:
                              item.fechamentoRealizadoEm
                                ? '1px solid #315846'
                                : '1px solid rgba(245,158,11,.35)',
                            fontSize:
                              '11px',
                            fontWeight:
                              700,
                          }}
                        >
                          {item.fechamentoRealizadoEm
                            ? '✓ Registrado'
                            : 'Pendente'}
                        </div>
                      </div>

                      {item.observacao && (
                        <div
                          style={{
                            marginBottom:
                              '13px',
                            padding:
                              '10px',
                            borderRadius:
                              '9px',
                            background:
                              'rgba(255,255,255,.04)',
                            border:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <strong
                            style={{
                              fontSize:
                                '12px',
                            }}
                          >
                            Observação do
                            planejamento
                          </strong>

                          <div
                            className="muted"
                            style={{
                              marginTop:
                                '4px',
                              fontSize:
                                '12px',
                              lineHeight:
                                1.45,
                            }}
                          >
                            {
                              item.observacao
                            }
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(135px, 1fr))',
                          gap: '9px',
                        }}
                      >
                        <label>
                          Efetivo alimentado

                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            placeholder="0"
                            value={
                              v.alimentado
                            }
                            onChange={(
                              e
                            ) =>
                              alterar(
                                item.id,
                                'alimentado',
                                e.target
                                  .value
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
                            inputMode="numeric"
                            placeholder="0"
                            value={
                              v.faltas
                            }
                            onChange={(
                              e
                            ) =>
                              alterar(
                                item.id,
                                'faltas',
                                e.target
                                  .value
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
                            inputMode="numeric"
                            placeholder="0"
                            value={
                              v.militaresDeFora
                            }
                            onChange={(
                              e
                            ) =>
                              alterar(
                                item.id,
                                'militaresDeFora',
                                e.target
                                  .value
                              )
                            }
                          />
                        </label>
                      </div>

                      <div
                        style={{
                          marginTop:
                            '11px',
                          padding:
                            '10px 12px',
                          background:
                            '#102018',
                          border:
                            '1px solid #284334',
                          borderRadius:
                            '10px',
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: '10px',
                        }}
                      >
                        <span
                          className="muted"
                          style={{
                            fontSize:
                              '13px',
                          }}
                        >
                          Total atendido
                          nesta refeição
                        </span>

                        <strong
                          style={{
                            fontSize:
                              '20px',
                          }}
                        >
                          {total}
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* SOBRA E OBSERVAÇÃO */}

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
                marginBottom: '14px',
              }}
            >
              <strong
                style={{
                  fontSize: '17px',
                }}
              >
                Fechamento do serviço diário
              </strong>

              <p
                className="muted"
                style={{
                  margin: '5px 0 0',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              >
                Após o encerramento do serviço
                de alimentação, informe uma
                única vez a sobra pesada total
                do dia.
              </p>
            </div>

            <label>
              Sobra pesada total do serviço (kg)

              <input
                type="number"
                min="0"
                step="0.001"
                inputMode="decimal"
                value={sobraKg}
                onChange={(e) => {
                  setSobraKg(
                    e.target.value
                  );

                  setMsg('');
                  setErro('');
                }}
                placeholder="Ex.: 12.500"
              />
            </label>

            <label
              style={{
                display: 'block',
                marginTop: '14px',
              }}
            >
              Observação do fechamento
              (opcional)

              <textarea
                value={
                  observacao
                }
                maxLength={1000}
                onChange={(e) => {
                  setObservacao(
                    e.target.value
                  );

                  setMsg('');
                  setErro('');
                }}
                placeholder="Informe alguma ocorrência ou observação relevante sobre o serviço do dia."
                rows={4}
                style={{
                  minHeight:
                    '95px',
                  resize:
                    'vertical',
                }}
              />
            </label>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                textAlign:
                  'right',
                fontSize: '12px',
              }}
            >
              {
                observacao.length
              }
              /1000
            </div>
          </section>

          {/* RESUMO */}

          <section
            style={{
              marginTop: '18px',
              padding: '15px',
              background: '#0c1811',
              border:
                '1px solid #284334',
              borderRadius: '13px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '13px',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                }}
              >
                ≡
              </span>

              <strong
                style={{
                  fontSize: '17px',
                }}
              >
                Resumo do dia
              </strong>
            </div>

            <LinhaResumo
              titulo="Refeições realizadas"
              valor={rows.length}
            />

            <LinhaResumo
              titulo="Efetivo previsto"
              valor={resumo.previsto}
            />

            <LinhaResumo
              titulo="Efetivo alimentado"
              valor={resumo.alimentado}
            />

            <LinhaResumo
              titulo="Faltas"
              valor={resumo.faltas}
            />

            <LinhaResumo
              titulo="Militares de fora"
              valor={
                resumo.militaresDeFora
              }
            />

            <div
              style={{
                marginTop: '10px',
                padding:
                  '12px',
                background:
                  '#102018',
                border:
                  '1px solid #284334',
                borderRadius:
                  '10px',
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                gap: '10px',
              }}
            >
              <strong
                style={{
                  fontSize: '13px',
                }}
              >
                Total de atendimentos no dia
              </strong>

              <strong
                style={{
                  fontSize: '22px',
                }}
              >
                {
                  resumo.totalAtendido
                }
              </strong>
            </div>

            <p
              className="muted"
              style={{
                margin:
                  '9px 0 0',
                fontSize: '12px',
                lineHeight: 1.45,
              }}
            >
              O total representa atendimentos
              realizados nas refeições do dia.
              A mesma pessoa pode participar de
              mais de uma refeição.
            </p>

            <div
              style={{
                marginTop: '14px',
                paddingTop: '13px',
                borderTop:
                  '1px solid rgba(255,255,255,.10)',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                gap: '10px',
              }}
            >
              <strong
                style={{
                  fontSize: '13px',
                }}
              >
                Sobra pesada total do serviço
              </strong>

              <strong
                style={{
                  fontSize: '18px',
                  whiteSpace:
                    'nowrap',
                }}
              >
                {sobraKg.trim() ===
                ''
                  ? '—'
                  : `${Number(
                      sobraKg
                    ).toLocaleString(
                      'pt-BR',
                      {
                        maximumFractionDigits:
                          3,
                      }
                    )} kg`}
              </strong>
            </div>

            {msg && (
              <div
                className="success"
                style={{
                  marginTop: '14px',
                }}
              >
                {msg}
              </div>
            )}

            {erro && (
              <div
                className="error"
                style={{
                  marginTop: '14px',
                }}
              >
                {erro}
              </div>
            )}

            <button
              type="button"
              className="btn"
              disabled={
                salvando
              }
              onClick={
                concluir
              }
              style={{
                width: '100%',
                marginTop: '15px',
              }}
            >
              {salvando
                ? 'Salvando...'
                : fechamentoConcluido
                  ? 'Corrigir fechamento do dia'
                  : 'Registrar fechamento do dia'}
            </button>
          </section>
        </>
      )}

      {!carregando &&
        rows.length === 0 &&
        erro && (
          <div
            className="error"
            style={{
              marginTop: '14px',
            }}
          >
            {erro}
          </div>
        )}
    </div>
  );
}

function LinhaResumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div
      style={{
        minHeight: '38px',
        display: 'flex',
        justifyContent:
          'space-between',
        alignItems: 'center',
        gap: '10px',
        borderBottom:
          '1px solid rgba(255,255,255,.07)',
      }}
    >
      <span
        className="muted"
        style={{
          fontSize: '13px',
        }}
      >
        {titulo}
      </span>

      <strong>
        {valor}
      </strong>
    </div>
  );
}

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
  SERVICO_DIA_SEGUINTE:
    'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

type Arranchamento = {
  id: string;
  data: string;
  refeicao: string;
  totalPrevisto: number;
  efetivoPlanejamento: number;
  arranchadosCompareceram:
    | number
    | null;
  faltas: number | null;
  naoArranchadosAtendidos: number;
  totalAtendido: number | null;
  fechamentoRealizadoEm:
    | string
    | null;
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

function dataLocal(
  offsetDias = 0
) {
  const agora = new Date();

  agora.setDate(
    agora.getDate() + offsetDias
  );

  const ano =
    agora.getFullYear();

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

  /*
   * Quando o usuário vem do
   * Painel de Avisos:
   *
   * /efetivo/fechamento?data=2026-10-23
   *
   * a tela já abre exatamente
   * naquela data.
   *
   * Sem parâmetro, mantém o
   * comportamento normal:
   * abre no dia anterior.
   */
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
    <>
      <div className="card">
        <h2>
          Efetivo alimentado
        </h2>

        <p className="muted">
          Registre o efetivo real
          de cada refeição. O
          efetivo previsto serve
          como referência de
          planejamento e pode ser
          ultrapassado quando
          houver atendimento de
          militares não previstos.
        </p>

        {dataValida(
          dataRecebida
        ) && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 10,
              border:
                '1px solid #f59e0b',
              background:
                'rgba(245,158,11,.08)',
            }}
          >
            <strong>
              ⚠ Fechamento
              selecionado pelo
              Painel de Avisos
            </strong>

            <div
              className="muted"
              style={{
                marginTop: 4,
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

        <p className="muted">
          Data selecionada:{' '}
          <strong>
            {dataBR(data)}
          </strong>
        </p>

        {fechamentoConcluido && (
          <div
            style={{
              marginTop: 15,
              padding: 12,
              borderRadius: 10,
              border:
                '1px solid #315846',
              background:
                'rgba(34,197,94,.08)',
            }}
          >
            <strong>
              ✓ Serviço fechado
            </strong>

            <div className="muted">
              Os dados abaixo
              correspondem ao
              fechamento já
              registrado. Eles
              podem ser corrigidos,
              se necessário.
            </div>
          </div>
        )}
      </div>

      {carregando ? (
        <div className="card">
          <p className="muted">
            Consultando dados do
            serviço...
          </p>
        </div>
      ) : rows.length ===
        0 ? (
        <div
          className="card"
          style={{
            border:
              '1px solid #f59e0b',
            background:
              'rgba(245,158,11,.08)',
          }}
        >
          <h2>
            ⚠ Sem lançamento
          </h2>

          <p>
            Não houve lançamento
            de arranchamento para o
            serviço de{' '}
            <strong>
              {dataBR(data)}
            </strong>.
          </p>

          <p className="muted">
            Faça primeiro o
            planejamento do efetivo
            para essa data.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>
              Efetivo por refeição
            </h2>

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
                      marginBottom:
                        24,
                      paddingBottom:
                        24,
                      borderBottom:
                        '1px solid rgba(255,255,255,.12)',
                    }}
                  >
                    <div
                      className="row"
                      style={{
                        alignItems:
                          'flex-start',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            marginTop:
                              0,
                            marginBottom:
                              5,
                          }}
                        >
                          {
                            refeicao
                          }
                        </h3>

                        <div className="muted">
                          Efetivo
                          previsto:{' '}
                          <strong>
                            {
                              item.totalPrevisto
                            }
                          </strong>
                        </div>

                        <div className="muted">
                          Planejamento
                          com margem:{' '}
                          {
                            item.efetivoPlanejamento
                          }
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
                          marginTop:
                            12,
                          marginBottom:
                            12,
                          padding: 10,
                          borderRadius:
                            8,
                          background:
                            'rgba(255,255,255,.05)',
                        }}
                      >
                        <strong>
                          Observação do
                          planejamento:
                        </strong>

                        <div className="muted">
                          {
                            item.observacao
                          }
                        </div>
                      </div>
                    )}

                    <div
                      className="grid"
                      style={{
                        marginTop:
                          15,
                      }}
                    >
                      <label>
                        Efetivo
                        alimentado

                        <input
                          type="number"
                          min="0"
                          step="1"
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
                        Militares de
                        fora

                        <input
                          type="number"
                          min="0"
                          step="1"
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
                      className="row"
                      style={{
                        marginTop:
                          12,
                      }}
                    >
                      <span>
                        Total atendido
                        nesta refeição
                      </span>

                      <strong>
                        {total}
                      </strong>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="card">
            <h2>
              Fechamento do serviço
              diário
            </h2>

            <p className="muted">
              Após o encerramento
              do serviço de
              alimentação, informe
              uma única vez a sobra
              pesada total do dia.
            </p>

            <label>
              Sobra pesada total do
              serviço (kg)

              <input
                type="number"
                min="0"
                step="0.001"
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
                marginTop: 16,
              }}
            >
              Observação do
              fechamento (opcional)

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
                style={{
                  width: '100%',
                  minHeight:
                    '90px',
                  boxSizing:
                    'border-box',
                  padding:
                    '14px 16px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #315846',
                  background:
                    '#071a12',
                  color:
                    '#f8fafc',
                  fontSize:
                    '16px',
                  lineHeight:
                    '1.5',
                  resize:
                    'vertical',
                }}
              />
            </label>

            <div
              className="muted"
              style={{
                textAlign:
                  'right',
              }}
            >
              {
                observacao.length
              }
              /1000
            </div>
          </div>

          <div className="card">
            <h2>
              Resumo do dia
            </h2>

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
                {
                  resumo.alimentado
                }
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
                {
                  resumo.militaresDeFora
                }
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
                  Total de
                  atendimentos no
                  dia
                </strong>
              </span>

              <strong>
                {
                  resumo.totalAtendido
                }
              </strong>
            </div>

            <p className="muted">
              O total representa
              atendimentos
              realizados nas
              refeições do dia. A
              mesma pessoa pode
              participar de mais de
              uma refeição.
            </p>

            <div
              className="row"
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop:
                  '1px solid rgba(255,255,255,.12)',
              }}
            >
              <span>
                <strong>
                  Sobra pesada total
                  do serviço
                </strong>
              </span>

              <strong>
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
              disabled={
                salvando
              }
              onClick={
                concluir
              }
            >
              {salvando
                ? 'Salvando...'
                : fechamentoConcluido
                  ? 'Corrigir fechamento do dia'
                  : 'Registrar fechamento do dia'}
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

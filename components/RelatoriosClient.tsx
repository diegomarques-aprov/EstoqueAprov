'use client';

import { useEffect, useState } from 'react';

const nomesMovimentacao: Record<string, string> = {
  SALDO_INICIAL: 'Saldo inicial',
  RECEBIMENTO: 'Recebimentos',
  SAIDA: 'Saídas / consumo',
  DEVOLUCAO: 'Devoluções',
  PERDA: 'Perdas / descartes',
  CORRECAO: 'Correções',
  TRANSFERENCIA: 'Transferências',
};

const nomesRefeicao: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  OUTRO: 'Outro',
};

function dataLocal(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(valor: string) {
  return new Date(valor).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

function formatarNumero(valor: number) {
  return Number(valor).toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

function gerarDias(inicio: string, fim: string) {
  const resultado: string[] = [];

  const atual = new Date(
    `${inicio.slice(0, 10)}T12:00:00.000Z`
  );

  const final = new Date(
    `${fim.slice(0, 10)}T12:00:00.000Z`
  );

  while (atual <= final) {
    resultado.push(
      atual.toISOString().slice(0, 10)
    );

    atual.setUTCDate(atual.getUTCDate() + 1);
  }

  return resultado;
}

export default function RelatoriosClient() {
  const hoje = dataLocal(0);

  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [classe, setClasse] = useState('TODOS');

  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] =
    useState(false);

  async function carregar() {
    if (!inicio || !fim) {
      setErro(
        'Informe a data inicial e a data final.'
      );
      return;
    }

    if (inicio > fim) {
      setErro(
        'A data inicial não pode ser posterior à data final.'
      );
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      const resposta = await fetch(
        `/api/relatorios?inicio=${inicio}&fim=${fim}&classe=${classe}`
      );

      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error || 'Erro ao gerar relatório.'
        );
        return;
      }

      setDados(json);
    } catch {
      setErro(
        'Não foi possível gerar o relatório.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dias =
    dados && inicio && fim
      ? gerarDias(inicio, fim)
      : [];

  const arranchamentos =
    dados?.arranchamentos || dados?.efetivos || [];

  const totalPrevisto = arranchamentos.reduce(
    (total: number, item: any) =>
      total + Number(item.totalPrevisto || 0),
    0
  );

  const totalPlanejamento =
    arranchamentos.reduce(
      (total: number, item: any) =>
        total +
        Number(item.efetivoPlanejamento || 0),
      0
    );

  /*
   * Somente registros efetivamente fechados
   * entram nos cálculos de atendimento e sobra.
   *
   * Assim, um fechamento pendente nunca é
   * interpretado como valor zero.
   */
  const registrosFechados =
    arranchamentos.filter(
      (item: any) =>
        Boolean(item.fechamentoRealizadoEm)
    );

  const existeFechamento =
    registrosFechados.length > 0;

  const totalAtendido =
    registrosFechados.reduce(
      (total: number, item: any) =>
        total + Number(item.totalAtendido ?? 0),
      0
    );

  const totalSobras =
    registrosFechados.reduce(
      (total: number, item: any) =>
        total + Number(item.sobraKg ?? 0),
      0
    );

  const urlExcel =
    `/api/relatorios/excel?inicio=${encodeURIComponent(
      inicio
    )}&fim=${encodeURIComponent(
      fim
    )}&classe=${encodeURIComponent(classe)}`;

  return (
    <>
      <div className="card">
        <h2>Período do relatório</h2>

        <div className="grid">
          <label>
            Início
            <input
              type="date"
              value={inicio}
              onChange={(e) =>
                setInicio(e.target.value)
              }
            />
          </label>

          <label>
            Fim
            <input
              type="date"
              value={fim}
              onChange={(e) =>
                setFim(e.target.value)
              }
            />
          </label>

          <label>
            Classe
            <select
              value={classe}
              onChange={(e) =>
                setClasse(e.target.value)
              }
            >
              <option value="TODOS">
                QS + QR
              </option>

              <option value="QS">
                QS
              </option>

              <option value="QR">
                QR
              </option>
            </select>
          </label>
        </div>

        <div
          className="actions"
          style={{
            marginTop: 14,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn"
            onClick={carregar}
            disabled={carregando}
          >
            {carregando
              ? 'Gerando...'
              : 'Visualizar relatório'}
          </button>

          <a
            className="btn secondary"
            href={urlExcel}
            download
          >
            Baixar Excel
          </a>
        </div>

        {erro && (
          <div className="error">
            {erro}
          </div>
        )}
      </div>

      {dados && (
        <>
          <div className="card">
            <h2>Resumo do período</h2>

            <div className="grid">
              <div>
                <span className="muted">
                  Efetivo previsto
                </span>

                <div className="big">
                  {totalPrevisto}
                </div>
              </div>

              <div>
                <span className="muted">
                  Planejamento
                </span>

                <div className="big">
                  {totalPlanejamento}
                </div>
              </div>

              <div>
                <span className="muted">
                  Total atendido
                </span>

                <div className="big">
                  {existeFechamento
                    ? totalAtendido
                    : '—'}
                </div>
              </div>

              <div>
                <span className="muted">
                  Sobras pesadas
                </span>

                <div className="big">
                  {existeFechamento
                    ? `${formatarNumero(
                        totalSobras
                      )} kg`
                    : '—'}
                </div>
              </div>
            </div>

            {!existeFechamento &&
              arranchamentos.length > 0 && (
                <p
                  style={{
                    color: '#facc15',
                    marginBottom: 0,
                  }}
                >
                  ⚠ Existem lançamentos com fechamento
                  pendente. Atendimento e sobras ainda não
                  foram apurados.
                </p>
              )}
          </div>

          <div className="card">
            <h2>
              Arranchamento / Efetivo alimentado
            </h2>

            <p className="muted">
              O relatório diferencia dias fechados,
              pendentes e dias sem lançamento.
            </p>

            {dias.map((dia) => {
              const registrosDoDia =
                arranchamentos.filter(
                  (item: any) =>
                    String(item.data).slice(0, 10) ===
                    dia
                );

              if (
                registrosDoDia.length === 0
              ) {
                return (
                  <div
                    key={dia}
                    className="card"
                    style={{
                      border:
                        '1px solid #f59e0b',
                    }}
                  >
                    <div className="row">
                      <strong>
                        {formatarData(dia)}
                      </strong>

                      <strong>
                        Sem lançamento
                      </strong>
                    </div>

                    <p className="muted">
                      Não existe arranchamento
                      registrado para esta data.
                    </p>
                  </div>
                );
              }

              const diaFechado =
                registrosDoDia.every(
                  (item: any) =>
                    Boolean(
                      item.fechamentoRealizadoEm
                    )
                );

              return (
                <div
                  key={dia}
                  className="card"
                  style={{
                    border: diaFechado
                      ? '1px solid #22c55e'
                      : '1px solid #f59e0b',
                  }}
                >
                  <div className="row">
                    <strong>
                      {formatarData(dia)}
                    </strong>

                    {diaFechado ? (
                      <strong>
                        ✓ Fechado
                      </strong>
                    ) : (
                      <strong
                        style={{
                          color: '#facc15',
                        }}
                      >
                        ⚠ Pendente
                      </strong>
                    )}
                  </div>

                  {registrosDoDia.map(
                    (item: any) => {
                      const fechado = Boolean(
                        item.fechamentoRealizadoEm
                      );

                      return (
                        <div
                          key={item.id}
                          style={{
                            marginTop: 16,
                            paddingTop: 14,
                            borderTop:
                              '1px solid rgba(255,255,255,0.12)',
                          }}
                        >
                          <h3>
                            {nomesRefeicao[
                              item.refeicao
                            ] ||
                              item.refeicao.replaceAll(
                                '_',
                                ' '
                              )}
                          </h3>

                          <div className="row">
                            <span>
                              Efetivo previsto
                            </span>

                            <strong>
                              {
                                item.totalPrevisto
                              }
                            </strong>
                          </div>

                          <div className="row">
                            <span>
                              Margem de segurança
                            </span>

                            <strong>
                              {formatarNumero(
                                item.margemSegurancaPercent
                              )}
                              %
                            </strong>
                          </div>

                          <div className="row">
                            <span>
                              Efetivo para
                              planejamento
                            </span>

                            <strong>
                              {
                                item.efetivoPlanejamento
                              }
                            </strong>
                          </div>

                          {fechado ? (
                            <>
                              <div className="row">
                                <span>
                                  Arranchados que
                                  compareceram
                                </span>

                                <strong>
                                  {
                                    item.arranchadosCompareceram
                                  }
                                </strong>
                              </div>

                              <div className="row">
                                <span>
                                  Não arranchados
                                  atendidos
                                </span>

                                <strong>
                                  {
                                    item.naoArranchadosAtendidos
                                  }
                                </strong>
                              </div>

                              <div className="row">
                                <span>
                                  Total atendido
                                </span>

                                <strong>
                                  {
                                    item.totalAtendido
                                  }
                                </strong>
                              </div>

                              <div className="row">
                                <span>
                                  Sobra pesada
                                </span>

                                <strong>
                                  {formatarNumero(
                                    item.sobraKg
                                  )}{' '}
                                  kg
                                </strong>
                              </div>

                              <div className="row">
                                <span>
                                  Situação
                                </span>

                                <strong>
                                  Fechado
                                </strong>
                              </div>
                            </>
                          ) : (
                            <div className="row">
                              <span>
                                Situação
                              </span>

                              <strong
                                style={{
                                  color:
                                    '#facc15',
                                }}
                              >
                                Fechamento pendente
                              </strong>
                            </div>
                          )}

                          {item.observacao && (
                            <p className="muted">
                              <strong>
                                Observação:
                              </strong>{' '}
                              {item.observacao}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>

          <div className="card">
            <h2>
              Movimentações de estoque
            </h2>

            <div className="grid">
              {Object.entries(
                dados.resumo
              ).map(([chave, valor]: any) => (
                <div
                  className="card"
                  key={chave}
                >
                  <span className="muted">
                    {nomesMovimentacao[chave] ||
                      chave}
                  </span>

                  <div className="big">
                    {formatarNumero(valor)}
                  </div>
                </div>
              ))}
            </div>

            {dados.movimentacoes.length ? (
              <div style={{ marginTop: 16 }}>
                {dados.movimentacoes.map(
                  (item: any) => (
                    <div
                      className="row"
                      key={item.id}
                    >
                      <b>
                        {nomesMovimentacao[
                          item.tipo
                        ] || item.tipo}{' '}
                        · {item.genero.nome}
                      </b>

                      <span>
                        {formatarNumero(
                          item.quantidade
                        )}{' '}
                        {
                          item.genero.unidade
                            .sigla
                        }{' '}
                        ·{' '}
                        {new Date(
                          item.criadoEm
                        ).toLocaleString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="muted">
                Nenhuma movimentação registrada
                no período.
              </p>
            )}
          </div>

          <div className="card">
            <h2>Alertas de estoque</h2>

            {dados.estoqueBaixo.length ===
              0 &&
            dados.validade.length === 0 ? (
              <p className="muted">
                Sem alertas nos critérios
                atuais.
              </p>
            ) : (
              <>
                {dados.estoqueBaixo.map(
                  (item: any) => (
                    <div
                      className="row"
                      key={`baixo-${item.id}`}
                    >
                      <b>
                        Estoque baixo ·{' '}
                        {item.nome}
                      </b>

                      <span>
                        {formatarNumero(
                          item.qtd
                        )}{' '}
                        {item.unidade} · mínimo{' '}
                        {formatarNumero(
                          item.min
                        )}
                      </span>
                    </div>
                  )
                )}

                {dados.validade.map(
                  (
                    item: any,
                    indice: number
                  ) => (
                    <div
                      className="row"
                      key={`validade-${indice}`}
                    >
                      <b>
                        Validade ·{' '}
                        {item.genero}
                      </b>

                      <span>
                        Lote {item.lote} ·{' '}
                        {new Date(
                          item.validade
                        ).toLocaleDateString(
                          'pt-BR'
                        )}{' '}
                        ·{' '}
                        {formatarNumero(
                          item.quantidade
                        )}{' '}
                        {item.unidade}
                      </span>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

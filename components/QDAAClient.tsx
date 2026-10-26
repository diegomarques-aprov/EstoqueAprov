'use client';

import {
  useEffect,
  useState,
} from 'react';

const meses = [
  { valor: 1, nome: 'Janeiro' },
  { valor: 2, nome: 'Fevereiro' },
  { valor: 3, nome: 'Março' },
  { valor: 4, nome: 'Abril' },
  { valor: 5, nome: 'Maio' },
  { valor: 6, nome: 'Junho' },
  { valor: 7, nome: 'Julho' },
  { valor: 8, nome: 'Agosto' },
  { valor: 9, nome: 'Setembro' },
  { valor: 10, nome: 'Outubro' },
  { valor: 11, nome: 'Novembro' },
  { valor: 12, nome: 'Dezembro' },
];

function formatarNumero(
  valor: unknown
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return '—';
  }

  return Number(
    valor
  ).toLocaleString(
    'pt-BR',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  );
}

function numeroCampo(
  valor: string
) {
  const convertido = Number(
    valor.replace(',', '.')
  );

  return Number.isFinite(
    convertido
  )
    ? convertido
    : null;
}

function diferente(
  a: number,
  b: number
) {
  return (
    Math.abs(a - b) >
    0.0005
  );
}

function origemTexto(
  origem: string
) {
  if (
    origem ===
    'HISTORICO_ESTOQUEAPROV'
  ) {
    return 'Histórico do EstoqueAprov';
  }

  if (
    origem ===
    'REFERENCIA_INICIAL'
  ) {
    return 'Referência inicial';
  }

  return 'Sem base de cálculo';
}

type DecisaoPlanejamento = {
  quantidade: string;
  justificativa: string;
};

function BlocoIndicador({
  titulo,
  valor,
  destaque,
}: {
  titulo: string;
  valor: unknown;
  destaque?: boolean;
}) {
  return (
    <div
      style={{
        padding: '13px',
        borderRadius: '12px',
        background:
          destaque
            ? 'rgba(245,158,11,.08)'
            : '#0c1811',
        border:
          destaque
            ? '1px solid rgba(245,158,11,.45)'
            : '1px solid #284334',
      }}
    >
      <div
        className="muted"
        style={{
          fontSize: '12px',
          lineHeight: 1.35,
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          marginTop: '5px',
          fontSize: '23px',
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {String(valor)}
      </div>
    </div>
  );
}

function Dado({
  titulo,
  valor,
  forte = false,
}: {
  titulo: string;
  valor: React.ReactNode;
  forte?: boolean;
}) {
  return (
    <div>
      <div
        className="muted"
        style={{
          fontSize: '11px',
          marginBottom: '3px',
        }}
      >
        {titulo}
      </div>

      <div
        style={{
          fontSize: '14px',
          fontWeight:
            forte ? 800 : 600,
          lineHeight: 1.35,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

export default function QDAAClient() {
  const hoje = new Date();

  const [ano, setAno] =
    useState(
      hoje.getFullYear()
    );

  const [mes, setMes] =
    useState(
      hoje.getMonth() + 1
    );

  const [dados, setDados] =
    useState<any>(null);

  const [erro, setErro] =
    useState('');

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    ressuprimento,
    setRessuprimento,
  ] = useState<any>(null);

  const [
    carregandoRessuprimento,
    setCarregandoRessuprimento,
  ] = useState(false);

  const [
    erroRessuprimento,
    setErroRessuprimento,
  ] = useState('');

  const [
    mesesHistorico,
    setMesesHistorico,
  ] = useState(2);

  const [
    mesesCiclo,
    setMesesCiclo,
  ] = useState(2);

  const [
    margemSeguranca,
    setMargemSeguranca,
  ] = useState(10);

  const [
    decisoes,
    setDecisoes,
  ] = useState<
    Record<
      string,
      DecisaoPlanejamento
    >
  >({});

  const [
    planejamentoId,
    setPlanejamentoId,
  ] = useState<
    string | null
  >(null);

  const [
    statusPlanejamento,
    setStatusPlanejamento,
  ] = useState<
    | 'NOVO'
    | 'RASCUNHO'
    | 'FINALIZADO'
  >('NOVO');

  const [
    observacaoPlanejamento,
    setObservacaoPlanejamento,
  ] = useState('');

  const [
    salvandoPlanejamento,
    setSalvandoPlanejamento,
  ] = useState(false);

  const [
    erroPlanejamento,
    setErroPlanejamento,
  ] = useState('');

  const [
    mensagemPlanejamento,
    setMensagemPlanejamento,
  ] = useState('');

  const [
    generoReferencia,
    setGeneroReferencia,
  ] = useState<any>(null);

  const [
    tipoReferencia,
    setTipoReferencia,
  ] = useState<
    'MENSAL' | 'BIMESTRAL'
  >('BIMESTRAL');

  const [
    quantidadeReferencia,
    setQuantidadeReferencia,
  ] = useState('');

  const [
    observacaoReferencia,
    setObservacaoReferencia,
  ] = useState('');

  const [
    salvandoReferencia,
    setSalvandoReferencia,
  ] = useState(false);

  const [
    mensagemReferencia,
    setMensagemReferencia,
  ] = useState('');

  const [
    erroReferencia,
    setErroReferencia,
  ] = useState('');

  async function carregarQDAA() {
    setErro('');
    setCarregando(true);

    try {
      const resposta =
        await fetch(
          `/api/relatorios/qdaa?ano=${ano}&mes=${mes}`
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Erro ao gerar apoio ao QDAA.'
        );

        return;
      }

      setDados(json);
    } catch {
      setErro(
        'Não foi possível gerar o apoio ao QDAA.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRessuprimento() {
    setErroRessuprimento('');
    setErroPlanejamento('');
    setMensagemPlanejamento('');
    setCarregandoRessuprimento(
      true
    );

    try {
      const params =
        new URLSearchParams({
          historico:
            String(
              mesesHistorico
            ),
          ciclo:
            String(
              mesesCiclo
            ),
          margem:
            String(
              margemSeguranca
            ),
        });

      const resposta =
        await fetch(
          `/api/relatorios/ressuprimento-qs?${params.toString()}`
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroRessuprimento(
          json.error ||
            'Não foi possível calcular o ressuprimento QS.'
        );

        return;
      }

      setRessuprimento(json);

      const novasDecisoes:
        Record<
          string,
          DecisaoPlanejamento
        > = {};

      for (
        const item of json.itens
      ) {
        if (
          item.quantidadeSugerida !==
          null
        ) {
          novasDecisoes[
            item.generoId
          ] = {
            quantidade:
              String(
                item.quantidadeSugerida
              ),
            justificativa: '',
          };
        }
      }

      setDecisoes(
        novasDecisoes
      );

      setPlanejamentoId(null);
      setStatusPlanejamento(
        'NOVO'
      );
      setObservacaoPlanejamento(
        ''
      );
    } catch {
      setErroRessuprimento(
        'Não foi possível calcular o ressuprimento QS.'
      );
    } finally {
      setCarregandoRessuprimento(
        false
      );
    }
  }

  function abrirReferencia(
    item: any
  ) {
    setGeneroReferencia(item);

    setTipoReferencia(
      item.referenciaInicial
        ?.tipo ||
        'BIMESTRAL'
    );

    setQuantidadeReferencia(
      item.referenciaInicial
        ? String(
            item
              .referenciaInicial
              .quantidade
          )
        : ''
    );

    setObservacaoReferencia(
      item.referenciaInicial
        ?.observacao || ''
    );

    setMensagemReferencia('');
    setErroReferencia('');
  }

  function abrirReferenciaEPular(
    item: any
  ) {
    abrirReferencia(item);

    setTimeout(() => {
      document
        .getElementById(
          'referencia-inicial-qs'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  }

  function fecharReferencia() {
    setGeneroReferencia(null);
    setQuantidadeReferencia('');
    setObservacaoReferencia('');
    setMensagemReferencia('');
    setErroReferencia('');
  }

  async function salvarReferencia() {
    if (!generoReferencia) {
      return;
    }

    const quantidade =
      numeroCampo(
        quantidadeReferencia
      );

    if (
      quantidade === null ||
      quantidade <= 0
    ) {
      setErroReferencia(
        'Informe uma quantidade maior que zero.'
      );

      return;
    }

    setErroReferencia('');
    setMensagemReferencia('');
    setSalvandoReferencia(
      true
    );

    try {
      const resposta =
        await fetch(
          '/api/relatorios/referencia-consumo-qs',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                generoId:
                  generoReferencia
                    .generoId,

                tipo:
                  tipoReferencia,

                quantidade,

                observacao:
                  observacaoReferencia
                    .trim() ||
                  null,
              }),
          }
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroReferencia(
          json.error ||
            'Não foi possível salvar a referência.'
        );

        return;
      }

      setMensagemReferencia(
        json.mensagem ||
          'Referência registrada.'
      );

      await carregarRessuprimento();

      setTimeout(() => {
        fecharReferencia();
      }, 800);
    } catch {
      setErroReferencia(
        'Não foi possível salvar a referência.'
      );
    } finally {
      setSalvandoReferencia(
        false
      );
    }
  }

  function alterarQuantidade(
    generoId: string,
    valor: string
  ) {
    setDecisoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          quantidade: valor,

          justificativa:
            atual[generoId]
              ?.justificativa ||
            '',
        },
      })
    );

    setMensagemPlanejamento(
      ''
    );

    setErroPlanejamento('');
  }

  function alterarJustificativa(
    generoId: string,
    valor: string
  ) {
    setDecisoes(
      (atual) => ({
        ...atual,

        [generoId]: {
          quantidade:
            atual[generoId]
              ?.quantidade ||
            '',

          justificativa:
            valor,
        },
      })
    );

    setMensagemPlanejamento(
      ''
    );

    setErroPlanejamento('');
  }

  async function salvarPlanejamento(
    finalizar: boolean
  ) {
    if (!ressuprimento) {
      return;
    }

    const itensCalculados =
      ressuprimento.itens.filter(
        (item: any) =>
          item.quantidadeSugerida !==
            null &&
          item.mediaMensalUtilizada !==
            null &&
          item.consumoProjetado !==
            null &&
          item.estoqueSeguranca !==
            null
      );

    if (
      itensCalculados.length ===
      0
    ) {
      setErroPlanejamento(
        'Para salvar o planejamento, informe primeiro a referência de consumo dos gêneros QS sem base de cálculo.'
      );

      return;
    }

    if (
      finalizar &&
      ressuprimento.itens.some(
        (item: any) =>
          item.quantidadeSugerida ===
          null
      )
    ) {
      setErroPlanejamento(
        'Para finalizar o planejamento, ainda existem gêneros QS sem histórico ou referência inicial de consumo.'
      );

      return;
    }

    const itens: any[] = [];

    for (
      const item of itensCalculados
    ) {
      const decisao =
        decisoes[
          item.generoId
        ];

      const quantidadePlanejada =
        numeroCampo(
          decisao?.quantidade ||
            ''
        );

      if (
        quantidadePlanejada ===
          null ||
        quantidadePlanejada < 0
      ) {
        setErroPlanejamento(
          `Informe uma quantidade planejada válida para ${item.genero}.`
        );

        return;
      }

      const alterado =
        diferente(
          quantidadePlanejada,
          Number(
            item
              .quantidadeSugerida
          )
        );

      const justificativa =
        decisao
          ?.justificativa
          ?.trim() || '';

      if (
        alterado &&
        !justificativa
      ) {
        setErroPlanejamento(
          `A quantidade planejada de ${item.genero} foi alterada. Informe a justificativa.`
        );

        return;
      }

      itens.push({
        generoId:
          item.generoId,

        origemMedia:
          item.origemMedia,

        mediaMensalUtilizada:
          Number(
            item
              .mediaMensalUtilizada
          ),

        consumoProjetado:
          Number(
            item
              .consumoProjetado
          ),

        estoqueSeguranca:
          Number(
            item
              .estoqueSeguranca
          ),

        estoqueDisponivel:
          Number(
            item
              .estoqueDisponivel
          ),

        previstoReceber:
          Number(
            item
              .previstoReceber ||
              0
          ),

        quantidadeSugerida:
          Number(
            item
              .quantidadeSugerida
          ),

        quantidadePlanejada,

        justificativaAlteracao:
          alterado
            ? justificativa
            : null,
      });
    }

    if (
      finalizar &&
      !window.confirm(
        'Confirma a finalização do Planejamento de Ressuprimento QS? Após finalizar, este planejamento ficará preservado no histórico e não poderá ser alterado.'
      )
    ) {
      return;
    }

    setErroPlanejamento('');
    setMensagemPlanejamento(
      ''
    );

    setSalvandoPlanejamento(
      true
    );

    try {
      const resposta =
        await fetch(
          '/api/relatorios/planejamento-ressuprimento-qs',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                planejamentoId,

                mesesHistorico,

                mesesCiclo,

                margemSegurancaPercent:
                  margemSeguranca,

                observacao:
                  observacaoPlanejamento
                    .trim() ||
                  null,

                finalizar,

                itens,
              }),
          }
        );

      const json =
        await resposta.json();

      if (!resposta.ok) {
        setErroPlanejamento(
          json.error ||
            'Não foi possível salvar o planejamento.'
        );

        return;
      }

      setPlanejamentoId(
        json.planejamentoId
      );

      setStatusPlanejamento(
        json.status
      );

      setMensagemPlanejamento(
        json.mensagem ||
          'Planejamento registrado.'
      );
    } catch {
      setErroPlanejamento(
        'Não foi possível salvar o planejamento de Ressuprimento QS.'
      );
    } finally {
      setSalvandoPlanejamento(
        false
      );
    }
  }

  useEffect(() => {
    carregarQDAA();
    carregarRessuprimento();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nomeMes =
    meses.find(
      (item) =>
        item.valor === mes
    )?.nome || '';

  const quantidadeSemBase =
    ressuprimento
      ?.itens?.filter(
        (item: any) =>
          item.quantidadeSugerida ===
          null
      ).length || 0;

  return (
    <>
      {/* QDAA */}

      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              lineHeight: 1,
            }}
          >
            ▤
          </span>

          <div>
            <strong>
              Apoio ao QDAA
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              Consolidação mensal dos
              gêneros classificados como
              QS e recebidos pela cadeia
              de suprimento.
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
          }}
        >
          <label>
            Mês

            <select
              value={mes}
              onChange={(e) =>
                setMes(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              {meses.map(
                (item) => (
                  <option
                    key={
                      item.valor
                    }
                    value={
                      item.valor
                    }
                  >
                    {item.nome}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Ano

            <input
              type="number"
              min="2000"
              max="2100"
              value={ano}
              onChange={(e) =>
                setAno(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="btn"
          onClick={
            carregarQDAA
          }
          disabled={
            carregando
          }
          style={{
            width: '100%',
            marginTop: '13px',
          }}
        >
          {carregando
            ? 'Gerando...'
            : 'Gerar apoio ao QDAA'}
        </button>

        {erro && (
          <div
            className="error"
            style={{
              marginTop:
                '12px',
            }}
          >
            {erro}
          </div>
        )}
      </section>

      {dados && (
        <>
          <section
            style={{
              marginTop: '18px',
              paddingTop: '18px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <div
              style={{
                marginBottom:
                  '12px',
              }}
            >
              <strong
                style={{
                  fontSize:
                    '17px',
                }}
              >
                {nomeMes}/{ano} — QS
              </strong>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '8px',
              }}
            >
              <BlocoIndicador
                titulo="Gêneros QS cadastrados"
                valor={
                  dados
                    .estatisticas
                    .generosCadastrados
                }
              />

              <BlocoIndicador
                titulo="Com movimentação"
                valor={
                  dados
                    .estatisticas
                    .generosComMovimento
                }
              />

              <BlocoIndicador
                titulo="Sem movimentação"
                valor={
                  dados
                    .estatisticas
                    .generosSemMovimento
                }
              />
            </div>
          </section>

          <section
            style={{
              marginTop: '18px',
              paddingTop: '18px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Controle mensal por
              gênero QS
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 13px',
                fontSize:
                  '12px',
                lineHeight:
                  1.5,
              }}
            >
              Estoque inicial + entradas
              + devoluções − consumo −
              perdas ± correções =
              estoque final.
            </p>

            {dados.itens.length ===
            0 ? (
              <p className="muted">
                Nenhum gênero QS
                cadastrado.
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '9px',
                }}
              >
                {dados.itens.map(
                  (item: any) => (
                    <article
                      key={
                        item.generoId
                      }
                      style={{
                        padding:
                          '13px',
                        background:
                          '#0c1811',
                        border:
                          '1px solid #284334',
                        borderRadius:
                          '12px',
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
                          gap: '10px',
                          paddingBottom:
                            '10px',
                          marginBottom:
                            '10px',
                          borderBottom:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <strong>
                          {item.genero}
                        </strong>

                        <span
                          className="muted"
                          style={{
                            fontSize:
                              '12px',
                          }}
                        >
                          {item.unidade}
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
                        <Dado
                          titulo="Estoque inicial"
                          valor={formatarNumero(
                            item.estoqueInicial
                          )}
                        />

                        <Dado
                          titulo="Entradas"
                          valor={formatarNumero(
                            item.recebimentos
                          )}
                        />

                        <Dado
                          titulo="Devoluções"
                          valor={formatarNumero(
                            item.devolucoes
                          )}
                        />

                        <Dado
                          titulo="Consumo"
                          valor={formatarNumero(
                            item.consumo
                          )}
                        />

                        <Dado
                          titulo="Perdas"
                          valor={formatarNumero(
                            item.perdas
                          )}
                        />

                        <Dado
                          titulo="Ajustes"
                          valor={formatarNumero(
                            item.correcoes
                          )}
                        />
                      </div>

                      <div
                        style={{
                          marginTop:
                            '11px',
                          paddingTop:
                            '10px',
                          borderTop:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <Dado
                          titulo="Estoque final"
                          valor={formatarNumero(
                            item
                              .estoqueFinalCalculado
                          )}
                          forte
                        />
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* CONFIGURAÇÃO DO RESSUPRIMENTO */}

      <section
        style={{
          marginTop: '20px',
          paddingTop: '18px',
          borderTop:
            '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontSize: '20px',
            }}
          >
            ⇄
          </span>

          <div>
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Planejamento do
              Ressuprimento QS
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 0',
                fontSize:
                  '13px',
                lineHeight:
                  1.5,
              }}
            >
              Estimativa dos
              quantitativos para o
              próximo ciclo da cadeia
              de suprimento.
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: '13px',
            padding: '11px',
            borderRadius: '11px',
            background: '#0c1811',
            border:
              '1px solid #284334',
          }}
        >
          <p
            className="muted"
            style={{
              margin: 0,
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            O EstoqueAprov utiliza o
            histórico real de consumo.
            Na ausência de histórico,
            poderá ser utilizada uma
            referência inicial informada
            pelo Administrador.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginTop: '13px',
          }}
        >
          <label>
            Histórico utilizado

            <select
              value={
                mesesHistorico
              }
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
              }
              onChange={(e) =>
                setMesesHistorico(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={1}>
                1 mês
              </option>

              <option value={2}>
                2 meses
              </option>

              <option value={3}>
                3 meses
              </option>

              <option value={6}>
                6 meses
              </option>
            </select>
          </label>

          <label>
            Próximo ciclo

            <select
              value={
                mesesCiclo
              }
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
              }
              onChange={(e) =>
                setMesesCiclo(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={1}>
                1 mês
              </option>

              <option value={2}>
                2 meses
              </option>

              <option value={3}>
                3 meses
              </option>
            </select>
          </label>

          <label>
            Margem de segurança (%)

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={
                margemSeguranca
              }
              disabled={
                statusPlanejamento ===
                'FINALIZADO'
              }
              onChange={(e) =>
                setMargemSeguranca(
                  Number(
                    e.target.value
                  )
                )
              }
            />
          </label>
        </div>

        <button
          type="button"
          className="btn"
          onClick={
            carregarRessuprimento
          }
          disabled={
            carregandoRessuprimento ||
            statusPlanejamento ===
              'FINALIZADO'
          }
          style={{
            width: '100%',
            marginTop: '13px',
          }}
        >
          {carregandoRessuprimento
            ? 'Calculando...'
            : 'Calcular / recalcular'}
        </button>

        {erroRessuprimento && (
          <div
            className="error"
            style={{
              marginTop:
                '12px',
            }}
          >
            {erroRessuprimento}
          </div>
        )}
      </section>

      {/* RESULTADO DO RESSUPRIMENTO */}

      {ressuprimento && (
        <>
          <section
            style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Situação da base de
              cálculo
            </strong>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(105px, 1fr))',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              <BlocoIndicador
                titulo="Histórico do sistema"
                valor={
                  ressuprimento
                    .estatisticas
                    .usandoHistoricoEstoqueAprov
                }
              />

              <BlocoIndicador
                titulo="Referência inicial"
                valor={
                  ressuprimento
                    .estatisticas
                    .usandoReferenciaInicial
                }
              />

              <BlocoIndicador
                titulo="Sem base de cálculo"
                valor={
                  ressuprimento
                    .estatisticas
                    .semBaseCalculo
                }
                destaque={
                  quantidadeSemBase >
                  0
                }
              />
            </div>

            <p
              className="muted"
              style={{
                marginTop:
                  '12px',
                fontSize:
                  '12px',
              }}
            >
              Período histórico:{' '}
              {
                ressuprimento
                  .parametros
                  .inicioHistorico
              }{' '}
              a{' '}
              {
                ressuprimento
                  .parametros
                  .fimHistorico
              }
              .
            </p>

            <div
              style={{
                marginTop: '13px',
                padding: '13px',
                border:
                  '1px solid #284334',
                borderRadius:
                  '12px',
                background:
                  '#0c1811',
              }}
            >
              <strong
                style={{
                  fontSize: '14px',
                }}
              >
                Entenda a base de
                cálculo
              </strong>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  marginTop:
                    '11px',
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize:
                        '13px',
                    }}
                  >
                    Histórico do
                    EstoqueAprov
                  </strong>

                  <div
                    className="muted"
                    style={{
                      marginTop:
                        '3px',
                      fontSize:
                        '12px',
                      lineHeight:
                        1.45,
                    }}
                  >
                    Utiliza o consumo
                    real registrado no
                    sistema para calcular
                    a média mensal.
                  </div>
                </div>

                <div>
                  <strong
                    style={{
                      fontSize:
                        '13px',
                    }}
                  >
                    Referência inicial
                  </strong>

                  <div
                    className="muted"
                    style={{
                      marginTop:
                        '3px',
                      fontSize:
                        '12px',
                      lineHeight:
                        1.45,
                    }}
                  >
                    Utiliza uma
                    quantidade de consumo
                    informada pelo
                    Administrador quando
                    ainda não há histórico
                    suficiente.
                  </div>
                </div>

                <div>
                  <strong
                    style={{
                      fontSize:
                        '13px',
                    }}
                  >
                    Sem base de cálculo
                  </strong>

                  <div
                    className="muted"
                    style={{
                      marginTop:
                        '3px',
                      fontSize:
                        '12px',
                      lineHeight:
                        1.45,
                    }}
                  >
                    O gênero ainda não
                    possui histórico nem
                    referência suficiente
                    para o cálculo.
                  </div>
                </div>
              </div>
            </div>

            {quantidadeSemBase >
              0 && (
              <div
                style={{
                  marginTop:
                    '13px',
                  padding:
                    '13px',
                  border:
                    '1px solid #facc15',
                  borderRadius:
                    '12px',
                  background:
                    'rgba(250,204,21,.07)',
                }}
              >
                <strong>
                  ⚠ Base de cálculo
                  incompleta
                </strong>

                <p
                  style={{
                    margin:
                      '7px 0',
                    fontSize:
                      '13px',
                    lineHeight:
                      1.45,
                  }}
                >
                  {quantidadeSemBase}{' '}
                  gênero(s) QS ainda
                  não possuem histórico
                  suficiente nem
                  referência inicial.
                </p>

                <p
                  className="muted"
                  style={{
                    fontSize:
                      '12px',
                  }}
                >
                  Selecione o gênero
                  abaixo para informar
                  a referência.
                </p>

                <div
                  style={{
                    display:
                      'grid',
                    gap: '7px',
                    marginTop:
                      '10px',
                  }}
                >
                  {ressuprimento.itens
                    .filter(
                      (
                        item: any
                      ) =>
                        item
                          .quantidadeSugerida ===
                        null
                    )
                    .map(
                      (
                        item: any
                      ) => (
                        <button
                          key={
                            item.generoId
                          }
                          type="button"
                          onClick={() =>
                            abrirReferenciaEPular(
                              item
                            )
                          }
                          style={{
                            width:
                              '100%',
                            cursor:
                              'pointer',
                            padding:
                              '11px',
                            textAlign:
                              'left',
                            borderRadius:
                              '10px',
                            border:
                              '1px solid #facc15',
                            background:
                              'rgba(250,204,21,.08)',
                            color:
                              'inherit',
                            fontWeight:
                              700,
                          }}
                        >
                          {item.genero}{' '}
                          → informar
                          referência
                        </button>
                      )
                    )}
                </div>
              </div>
            )}
          </section>

          {/* NECESSIDADE POR GÊNERO */}

          <section
            style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Necessidade por gênero QS
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 13px',
                fontSize:
                  '12px',
                lineHeight:
                  1.5,
              }}
            >
              Quantidade sugerida =
              consumo projetado +
              estoque de segurança −
              estoque disponível −
              quantidade prevista para
              receber.
            </p>

            <div
              style={{
                display: 'grid',
                gap: '10px',
              }}
            >
              {ressuprimento.itens.map(
                (item: any) => {
                  const decisao =
                    decisoes[
                      item.generoId
                    ];

                  const planejado =
                    numeroCampo(
                      decisao
                        ?.quantidade ||
                        ''
                    );

                  const foiAlterado =
                    planejado !==
                      null &&
                    item.quantidadeSugerida !==
                      null &&
                    diferente(
                      planejado,
                      Number(
                        item
                          .quantidadeSugerida
                      )
                    );

                  const semBase =
                    item.quantidadeSugerida ===
                    null;

                  return (
                    <article
                      key={
                        item.generoId
                      }
                      style={{
                        padding:
                          '13px',
                        borderRadius:
                          '13px',
                        background:
                          semBase
                            ? 'rgba(245,158,11,.06)'
                            : '#0c1811',
                        border:
                          semBase
                            ? '1px solid rgba(245,158,11,.5)'
                            : '1px solid #284334',
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
                          gap: '10px',
                          marginBottom:
                            '11px',
                          paddingBottom:
                            '10px',
                          borderBottom:
                            '1px solid rgba(255,255,255,.07)',
                        }}
                      >
                        <div>
                          <strong>
                            {item.genero}
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
                            {origemTexto(
                              item.origemMedia
                            )}
                          </div>
                        </div>

                        <span
                          style={{
                            flexShrink: 0,
                            fontSize:
                              '12px',
                            fontWeight:
                              700,
                          }}
                        >
                          {item.unidade}
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
                        <Dado
                          titulo="Média/mês"
                          valor={formatarNumero(
                            item
                              .mediaMensalUtilizada
                          )}
                        />

                        <Dado
                          titulo="Projeção"
                          valor={formatarNumero(
                            item
                              .consumoProjetado
                          )}
                        />

                        <Dado
                          titulo="Segurança"
                          valor={formatarNumero(
                            item
                              .estoqueSeguranca
                          )}
                        />

                        <Dado
                          titulo="Estoque"
                          valor={formatarNumero(
                            item
                              .estoqueDisponivel
                          )}
                        />

                        <Dado
                          titulo="Prev. receber"
                          valor={formatarNumero(
                            item
                              .previstoReceber
                          )}
                        />

                        <Dado
                          titulo="Sugerido"
                          valor={formatarNumero(
                            item
                              .quantidadeSugerida
                          )}
                          forte
                        />
                      </div>

                      {semBase ? (
                        <div
                          style={{
                            marginTop:
                              '12px',
                            paddingTop:
                              '11px',
                            borderTop:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <div
                            className="muted"
                            style={{
                              marginBottom:
                                '8px',
                              fontSize:
                                '12px',
                            }}
                          >
                            Para calcular
                            este gênero,
                            informe uma
                            referência
                            inicial.
                          </div>

                          <button
                            type="button"
                            className="btn"
                            disabled={
                              statusPlanejamento ===
                              'FINALIZADO'
                            }
                            onClick={() =>
                              abrirReferencia(
                                item
                              )
                            }
                            style={{
                              width:
                                '100%',
                            }}
                          >
                            {item.possuiReferenciaInicial
                              ? 'Alterar referência'
                              : 'Informar referência'}
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop:
                              '12px',
                            paddingTop:
                              '11px',
                            borderTop:
                              '1px solid rgba(255,255,255,.07)',
                          }}
                        >
                          <label>
                            Quantidade
                            planejada

                            <input
                              type="text"
                              inputMode="decimal"
                              value={
                                decisao
                                  ?.quantidade ||
                                ''
                              }
                              disabled={
                                statusPlanejamento ===
                                'FINALIZADO'
                              }
                              onChange={(
                                e
                              ) =>
                                alterarQuantidade(
                                  item.generoId,
                                  e
                                    .target
                                    .value
                                )
                              }
                            />
                          </label>

                          {foiAlterado && (
                            <label
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '9px',
                              }}
                            >
                              Justificativa
                              da alteração

                              <input
                                type="text"
                                value={
                                  decisao
                                    ?.justificativa ||
                                  ''
                                }
                                disabled={
                                  statusPlanejamento ===
                                  'FINALIZADO'
                                }
                                onChange={(
                                  e
                                ) =>
                                  alterarJustificativa(
                                    item.generoId,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Obrigatória"
                              />
                            </label>
                          )}

                          <button
                            type="button"
                            className="btn secondary"
                            disabled={
                              statusPlanejamento ===
                              'FINALIZADO'
                            }
                            onClick={() =>
                              abrirReferencia(
                                item
                              )
                            }
                            style={{
                              width:
                                '100%',
                              marginTop:
                                '9px',
                            }}
                          >
                            {item.possuiReferenciaInicial
                              ? 'Alterar referência inicial'
                              : 'Informar referência inicial'}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          </section>

          {/* DECISÃO */}

          <section
            style={{
              marginTop: '20px',
              paddingTop: '18px',
              borderTop:
                '1px solid rgba(255,255,255,.08)',
            }}
          >
            <strong
              style={{
                fontSize: '16px',
              }}
            >
              Decisão do Ressuprimento
              QS
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 14px',
                fontSize:
                  '12px',
                lineHeight:
                  1.5,
              }}
            >
              Revise os quantitativos
              antes de finalizar. A
              quantidade planejada pode
              ser diferente da sugestão
              do EstoqueAprov, desde que
              seja registrada a
              justificativa.
            </p>

            <label>
              Observação geral do
              planejamento

              <textarea
                value={
                  observacaoPlanejamento
                }
                disabled={
                  statusPlanejamento ===
                  'FINALIZADO'
                }
                onChange={(e) =>
                  setObservacaoPlanejamento(
                    e.target.value
                  )
                }
                placeholder="Ex.: previsão de exercício, aumento de efetivo, missão extraordinária ou outra consideração operacional."
                rows={4}
                style={{
                  width: '100%',
                  minHeight:
                    '110px',
                  resize:
                    'vertical',
                  boxSizing:
                    'border-box',
                }}
              />
            </label>

            <div
              style={{
                marginTop: '13px',
                padding: '12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                Situação
              </div>

              <strong
                style={{
                  display: 'block',
                  marginTop: '4px',
                }}
              >
                {statusPlanejamento ===
                'NOVO'
                  ? 'Novo planejamento'
                  : statusPlanejamento ===
                      'RASCUNHO'
                    ? 'Rascunho salvo'
                    : 'Planejamento finalizado'}
              </strong>

              {planejamentoId && (
                <div
                  className="muted"
                  style={{
                    marginTop:
                      '7px',
                    fontSize:
                      '11px',
                    wordBreak:
                      'break-all',
                  }}
                >
                  Identificação:{' '}
                  {planejamentoId}
                </div>
              )}
            </div>

            {erroPlanejamento && (
              <div
                className="error"
                style={{
                  marginTop:
                    '12px',
                }}
              >
                {erroPlanejamento}
              </div>
            )}

            {mensagemPlanejamento && (
              <div
                className="success"
                style={{
                  marginTop:
                    '12px',
                }}
              >
                {mensagemPlanejamento}
              </div>
            )}

            {statusPlanejamento !==
              'FINALIZADO' && (
              <div
                style={{
                  display: 'grid',
                  gap: '8px',
                  marginTop:
                    '13px',
                }}
              >
                <button
                  type="button"
                  className="btn secondary"
                  disabled={
                    salvandoPlanejamento
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      false
                    )
                  }
                  style={{
                    width: '100%',
                  }}
                >
                  {salvandoPlanejamento
                    ? 'Salvando...'
                    : 'Salvar rascunho'}
                </button>

                <button
                  type="button"
                  className="btn"
                  disabled={
                    salvandoPlanejamento ||
                    quantidadeSemBase >
                      0
                  }
                  onClick={() =>
                    salvarPlanejamento(
                      true
                    )
                  }
                  style={{
                    width: '100%',
                  }}
                >
                  Finalizar planejamento
                </button>
              </div>
            )}

            {quantidadeSemBase >
              0 && (
              <div
                style={{
                  marginTop:
                    '11px',
                  padding:
                    '10px 12px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid rgba(245,158,11,.5)',
                  background:
                    'rgba(245,158,11,.07)',
                }}
              >
                <span
                  className="muted"
                  style={{
                    fontSize:
                      '12px',
                    lineHeight:
                      1.45,
                  }}
                >
                  Para finalizar,
                  informe a referência
                  inicial dos gêneros
                  que ainda estão sem
                  base de cálculo.
                </span>
              </div>
            )}

            {statusPlanejamento ===
              'FINALIZADO' && (
              <div
                className="success"
                style={{
                  marginTop:
                    '12px',
                }}
              >
                ✓ Planejamento
                finalizado. Os dados e
                a memória do cálculo
                foram preservados no
                histórico.
              </div>
            )}
          </section>
        </>
      )}

      {/* REFERÊNCIA INICIAL */}

      {generoReferencia && (
        <section
          id="referencia-inicial-qs"
          style={{
            marginTop: '20px',
            padding: '15px',
            scrollMarginTop:
              '20px',
            borderRadius: '13px',
            background:
              'rgba(245,158,11,.06)',
            border:
              '1px solid rgba(245,158,11,.55)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
              }}
            >
              ◈
            </span>

            <div>
              <strong
                style={{
                  fontSize: '16px',
                }}
              >
                Referência inicial
              </strong>

              <div
                style={{
                  marginTop: '3px',
                  fontWeight: 700,
                }}
              >
                {
                  generoReferencia.genero
                }
              </div>
            </div>
          </div>

          <p
            style={{
              margin:
                '13px 0 5px',
              fontSize: '13px',
              lineHeight: 1.5,
            }}
          >
            Informe o consumo conhecido
            antes da implantação do
            EstoqueAprov.
          </p>

          <p
            className="muted"
            style={{
              margin:
                '0 0 13px',
              fontSize: '12px',
              lineHeight: 1.5,
            }}
          >
            A referência ficará
            registrada com responsável
            e data. Quando houver
            histórico real suficiente,
            o histórico do sistema será
            utilizado no cálculo.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
            }}
          >
            <label>
              Tipo de referência

              <select
                value={
                  tipoReferencia
                }
                onChange={(e) =>
                  setTipoReferencia(
                    e.target
                      .value as
                      | 'MENSAL'
                      | 'BIMESTRAL'
                  )
                }
              >
                <option value="MENSAL">
                  Consumo médio mensal
                </option>

                <option value="BIMESTRAL">
                  Consumo bimestral
                </option>
              </select>
            </label>

            <label>
              Quantidade (
              {
                generoReferencia.unidade
              }
              )

              <input
                type="text"
                inputMode="decimal"
                value={
                  quantidadeReferencia
                }
                onChange={(e) =>
                  setQuantidadeReferencia(
                    e.target.value
                  )
                }
                placeholder="Ex.: 800"
              />
            </label>
          </div>

          {tipoReferencia ===
            'BIMESTRAL' &&
            (numeroCampo(
              quantidadeReferencia
            ) || 0) >
              0 && (
              <div
                style={{
                  marginTop:
                    '11px',
                  padding:
                    '10px 12px',
                  borderRadius:
                    '10px',
                  background:
                    '#0c1811',
                  border:
                    '1px solid #284334',
                }}
              >
                <div
                  className="muted"
                  style={{
                    fontSize:
                      '11px',
                  }}
                >
                  Média mensal
                  equivalente
                </div>

                <strong
                  style={{
                    display:
                      'block',
                    marginTop:
                      '3px',
                  }}
                >
                  {formatarNumero(
                    Number(
                      numeroCampo(
                        quantidadeReferencia
                      )
                    ) / 2
                  )}{' '}
                  {
                    generoReferencia.unidade
                  }
                  /mês
                </strong>
              </div>
            )}

          <label
            style={{
              display: 'block',
              marginTop: '11px',
            }}
          >
            Observação

            <textarea
              value={
                observacaoReferencia
              }
              onChange={(e) =>
                setObservacaoReferencia(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Ex.: referência baseada no controle anterior da OM."
              style={{
                width: '100%',
                resize: 'vertical',
                boxSizing:
                  'border-box',
              }}
            />
          </label>

          {erroReferencia && (
            <div
              className="error"
              style={{
                marginTop:
                  '11px',
              }}
            >
              {erroReferencia}
            </div>
          )}

          {mensagemReferencia && (
            <div
              className="success"
              style={{
                marginTop:
                  '11px',
              }}
            >
              {mensagemReferencia}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gap: '8px',
              marginTop: '13px',
            }}
          >
            <button
              className="btn"
              type="button"
              onClick={
                salvarReferencia
              }
              disabled={
                salvandoReferencia
              }
              style={{
                width: '100%',
              }}
            >
              {salvandoReferencia
                ? 'Salvando...'
                : 'Salvar referência'}
            </button>

            <button
              className="btn secondary"
              type="button"
              onClick={
                fecharReferencia
              }
              disabled={
                salvandoReferencia
              }
              style={{
                width: '100%',
              }}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}
    </>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ConferenciaFLVClient from '@/components/ConferenciaFLVClient';
import NavegacaoInferior from '@/components/NavegacaoInferior';

function inicioDoDiaUTC(
  data: Date
) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      0,
      0,
      0,
      0
    )
  );
}

function fimDoDiaUTC(
  data: Date
) {
  return new Date(
    Date.UTC(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      23,
      59,
      59,
      999
    )
  );
}

function dataISO(
  data: Date
) {
  return data
    .toISOString()
    .slice(0, 10);
}

function dataBR(
  data: string
) {
  const [ano, mes, dia] =
    data.split('-');

  return `${dia}/${mes}/${ano}`;
}

export default async function AvisosPage() {
  const usuario =
    await currentUser();

  if (!usuario) {
    redirect('/login');
  }

  const administrador =
    usuario.perfil ===
      'ADMIN_PRINCIPAL' ||
    usuario.perfil ===
      'ADMINISTRADOR';

  const chefeDeposito =
    usuario.perfil ===
    'CHEFE_DEPOSITO';

  const graduadoServico =
    usuario.perfil ===
    'GRADUADO_SERVICO';

  const podeVerEfetivo =
    administrador ||
    graduadoServico;

  const podeVerEstoque =
    administrador ||
    chefeDeposito ||
    graduadoServico;

  const hoje = new Date();

  const inicioHoje =
    inicioDoDiaUTC(hoje);

  const amanha =
    new Date(hoje);

  amanha.setDate(
    amanha.getDate() + 1
  );

  const inicioAmanha =
    inicioDoDiaUTC(amanha);

  const fimAmanha =
    fimDoDiaUTC(amanha);

  const [
    estoques,
    arranchamentosAmanha,
    fechamentosPendentes,
  ] = await Promise.all([
    prisma.estoqueLocal.findMany({
      where: {
        quantidade: {
          gt: 0,
        },
      },

      select: {
        generoId: true,
        quantidade: true,

        genero: {
          select: {
            nome: true,
            estoqueMinimo: true,
          },
        },

        lote: {
          select: {
            validade: true,
          },
        },
      },
    }),

    prisma.arranchamento.findMany({
      where: {
        data: {
          gte: inicioAmanha,
          lte: fimAmanha,
        },
      },

      select: {
        totalPrevisto: true,
        efetivoPlanejamento: true,
        refeicao: true,
      },

      orderBy: {
        refeicao: 'asc',
      },
    }),

    prisma.arranchamento.findMany({
      where: {
        data: {
          lt: inicioHoje,
        },

        fechamentoRealizadoEm:
          null,
      },

      select: {
        data: true,
        refeicao: true,
      },

      orderBy: [
        {
          data: 'asc',
        },
        {
          refeicao: 'asc',
        },
      ],
    }),
  ]);

  /*
   * ESTOQUE ABAIXO DO MÍNIMO
   */

  const saldosPorGenero =
    new Map<
      string,
      {
        nome: string;
        quantidade: number;
        minimo: number;
      }
    >();

  for (
    const estoque of estoques
  ) {
    if (
      estoque.genero
        .estoqueMinimo == null
    ) {
      continue;
    }

    const atual =
      saldosPorGenero.get(
        estoque.generoId
      );

    if (atual) {
      atual.quantidade +=
        Number(
          estoque.quantidade
        );
    } else {
      saldosPorGenero.set(
        estoque.generoId,
        {
          nome:
            estoque.genero.nome,

          quantidade:
            Number(
              estoque.quantidade
            ),

          minimo:
            Number(
              estoque.genero
                .estoqueMinimo
            ),
        }
      );
    }
  }

  const baixos =
    Array.from(
      saldosPorGenero.values()
    ).filter(
      (item) =>
        item.quantidade <
        item.minimo
    );

  /*
   * VALIDADES
   */

  const agora =
    hoje.getTime();

  const limiteValidade =
    agora +
    30 * 86400000;

  let quantidadeVencidos = 0;

  let quantidadeProximosDaValidade =
    0;

  for (
    const estoque of estoques
  ) {
    if (
      !estoque.lote?.validade
    ) {
      continue;
    }

    const validade =
      new Date(
        estoque.lote.validade
      ).getTime();

    if (validade < agora) {
      quantidadeVencidos += 1;
      continue;
    }

    if (
      validade <=
      limiteValidade
    ) {
      quantidadeProximosDaValidade +=
        1;
    }
  }

  /*
   * EFETIVO DO DIA SEGUINTE
   */

  const efetivoAmanhaInformado =
    arranchamentosAmanha.length >
    0;

  const totalPrevistoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total +
        item.totalPrevisto,
      0
    );

  const totalPlanejamentoAmanha =
    arranchamentosAmanha.reduce(
      (total, item) =>
        total +
        item.efetivoPlanejamento,
      0
    );

  /*
   * FECHAMENTOS PENDENTES
   */

  const pendenciasPorDia =
    new Map<
      string,
      number
    >();

  for (
    const item of fechamentosPendentes
  ) {
    const data =
      dataISO(item.data);

    pendenciasPorDia.set(
      data,
      (
        pendenciasPorDia.get(
          data
        ) || 0
      ) + 1
    );
  }

  const diasPendentes =
    Array.from(
      pendenciasPorDia.entries()
    ).map(
      ([
        data,
        quantidadeRefeicoes,
      ]) => ({
        data,
        quantidadeRefeicoes,
      })
    );

  const quantidadeDiasPendentes =
    diasPendentes.length;

  /*
   * CARDÁPIO SEMANAL
   */

  const diaDaSemana =
    hoje.getDay();

  const exibirLembreteCardapio =
    administrador &&
    diaDaSemana === 5;

  /*
   * QDAA
   */

  const diaDoMes =
    hoje.getDate();

  const exibirLembreteQDAA =
    administrador &&
    diaDoMes >= 23 &&
    diaDoMes <= 25;

  const diasParaQDAA =
    25 - diaDoMes;

  const semOutrasPendencias =
    baixos.length === 0 &&
    quantidadeProximosDaValidade ===
      0 &&
    quantidadeVencidos === 0 &&
    fechamentosPendentes.length ===
      0 &&
    efetivoAmanhaInformado &&
    !exibirLembreteCardapio &&
    !exibirLembreteQDAA;

  return (
    <main>
      <Link
        href="/inicio"
        className="back"
      >
        ← Início
      </Link>

      <header
        style={{
          marginTop: '18px',
          marginBottom: '18px',
        }}
      >
        <h1
          style={{
            marginBottom: '6px',
          }}
        >
          Painel de Avisos
        </h1>

        <p
          className="muted"
          style={{
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Acompanhe diariamente
          alertas, pendências e
          lembretes operacionais do
          Aprovisionamento.
        </p>
      </header>

      <section
        className="card"
        style={{
          marginBottom: '16px',
          border:
            '1px solid rgba(245,158,11,.35)',
          background:
            'rgba(245,158,11,.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '11px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '11px',
              background:
                'rgba(245,158,11,.10)',
              border:
                '1px solid rgba(245,158,11,.3)',
              fontSize: '18px',
            }}
          >
            !
          </div>

          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Consulta diária
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '4px 0 0',
                fontSize: '11px',
                lineHeight: 1.5,
              }}
            >
              Este painel concentra
              informações que podem
              exigir providências antes
              da execução das atividades
              do rancho.
            </p>
          </div>
        </div>
      </section>

      {/* FLV */}

      {podeVerEstoque && (
        <ConferenciaFLVClient />
      )}

      {/* FECHAMENTOS PENDENTES */}

      {podeVerEfetivo &&
        quantidadeDiasPendentes >
          0 && (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(239,68,68,.6)',
              background:
                'rgba(239,68,68,.07)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems:
                  'flex-start',
                gap: '10px',
                marginBottom:
                  '12px',
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                }}
              >
                ⚠
              </span>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      '17px',
                  }}
                >
                  Fechamento Diário
                  pendente
                </h2>

                <p
                  className="muted"
                  style={{
                    margin:
                      '4px 0 0',
                    fontSize:
                      '11px',
                  }}
                >
                  Regularize os dias
                  anteriores antes de
                  manter o controle
                  diário atualizado.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '11px',
                borderRadius:
                  '10px',
                background:
                  'rgba(0,0,0,.14)',
                marginBottom:
                  '10px',
              }}
            >
              Existem{' '}
              <strong>
                {
                  quantidadeDiasPendentes
                }{' '}
                {quantidadeDiasPendentes ===
                1
                  ? 'dia'
                  : 'dias'}
              </strong>{' '}
              com fechamento do
              efetivo alimentado
              pendente.
            </div>

            <div
              style={{
                display: 'grid',
                gap: '9px',
              }}
            >
              {diasPendentes.map(
                (pendencia) => (
                  <div
                    key={
                      pendencia.data
                    }
                    style={{
                      padding:
                        '12px',
                      borderRadius:
                        '11px',
                      background:
                        '#102018',
                      border:
                        '1px solid rgba(239,68,68,.3)',
                    }}
                  >
                    <div
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          'repeat(2, minmax(0, 1fr))',
                        gap: '8px',
                        marginBottom:
                          '10px',
                      }}
                    >
                      <div>
                        <div
                          className="muted"
                          style={{
                            fontSize:
                              '9px',
                          }}
                        >
                          DATA
                        </div>

                        <strong
                          style={{
                            fontSize:
                              '12px',
                          }}
                        >
                          {dataBR(
                            pendencia.data
                          )}
                        </strong>
                      </div>

                      <div>
                        <div
                          className="muted"
                          style={{
                            fontSize:
                              '9px',
                          }}
                        >
                          REFEIÇÕES
                        </div>

                        <strong
                          style={{
                            fontSize:
                              '12px',
                          }}
                        >
                          {
                            pendencia.quantidadeRefeicoes
                          }
                        </strong>
                      </div>
                    </div>

                    <Link
                      className="btn"
                      href={`/efetivo/fechamento?data=${pendencia.data}`}
                      style={{
                        width:
                          '100%',
                        textAlign:
                          'center',
                      }}
                    >
                      Realizar fechamento
                    </Link>
                  </div>
                )
              )}
            </div>
          </section>
        )}

      {/* EFETIVO DO DIA SEGUINTE */}

      {podeVerEfetivo &&
        (!efetivoAmanhaInformado ? (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(245,158,11,.55)',
              background:
                'rgba(245,158,11,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '17px',
              }}
            >
              ⚠ Efetivo de amanhã
            </h2>

            <p
              style={{
                marginBottom:
                  '6px',
              }}
            >
              O efetivo arranchado
              previsto para amanhã
              ainda não foi informado.
            </p>

            <p
              className="muted"
              style={{
                fontSize: '11px',
                lineHeight: 1.5,
              }}
            >
              O planejamento deve estar
              disponível para que o
              saque dos gêneros ocorra
              antes das 15:00 do dia
              anterior.
            </p>

            <Link
              className="btn"
              href="/efetivo"
              style={{
                display:
                  'block',
                width: '100%',
                textAlign:
                  'center',
                marginTop:
                  '12px',
              }}
            >
              Informar efetivo de amanhã
            </Link>
          </section>
        ) : (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(43,138,87,.55)',
              background:
                'rgba(43,138,87,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '17px',
              }}
            >
              ✓ Efetivo de amanhã
              informado
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(3, minmax(0, 1fr))',
                gap: '7px',
                marginTop: '12px',
              }}
            >
              <div
                style={{
                  padding:
                    '10px 7px',
                  borderRadius:
                    '10px',
                  background:
                    '#102018',
                  border:
                    '1px solid #284334',
                  textAlign:
                    'center',
                }}
              >
                <div
                  className="muted"
                  style={{
                    fontSize: '8px',
                  }}
                >
                  REFEIÇÕES
                </div>

                <strong
                  style={{
                    display:
                      'block',
                    marginTop:
                      '3px',
                  }}
                >
                  {
                    arranchamentosAmanha.length
                  }
                </strong>
              </div>

              <div
                style={{
                  padding:
                    '10px 7px',
                  borderRadius:
                    '10px',
                  background:
                    '#102018',
                  border:
                    '1px solid #284334',
                  textAlign:
                    'center',
                }}
              >
                <div
                  className="muted"
                  style={{
                    fontSize: '8px',
                  }}
                >
                  PREVISTO
                </div>

                <strong
                  style={{
                    display:
                      'block',
                    marginTop:
                      '3px',
                  }}
                >
                  {
                    totalPrevistoAmanha
                  }
                </strong>
              </div>

              <div
                style={{
                  padding:
                    '10px 7px',
                  borderRadius:
                    '10px',
                  background:
                    '#102018',
                  border:
                    '1px solid #284334',
                  textAlign:
                    'center',
                }}
              >
                <div
                  className="muted"
                  style={{
                    fontSize: '8px',
                  }}
                >
                  PLANEJADO
                </div>

                <strong
                  style={{
                    display:
                      'block',
                    marginTop:
                      '3px',
                  }}
                >
                  {
                    totalPlanejamentoAmanha
                  }
                </strong>
              </div>
            </div>
          </section>
        ))}

      {/* ESTOQUE ABAIXO DO MÍNIMO */}

      {podeVerEstoque &&
        baixos.length > 0 && (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(245,158,11,.55)',
              background:
                'rgba(245,158,11,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '17px',
              }}
            >
              ⚠ Estoque abaixo do mínimo
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                gap: '10px',
                padding: '11px',
                borderRadius:
                  '10px',
                background:
                  '#102018',
                border:
                  '1px solid #284334',
              }}
            >
              <span
                className="muted"
                style={{
                  fontSize: '11px',
                }}
              >
                Gêneros abaixo do
                mínimo
              </span>

              <strong
                style={{
                  fontSize: '18px',
                }}
              >
                {baixos.length}
              </strong>
            </div>

            <Link
              className="btn"
              href={
                administrador
                  ? '/relatorios'
                  : '/estoque'
              }
              style={{
                display:
                  'block',
                width: '100%',
                textAlign:
                  'center',
                marginTop:
                  '12px',
              }}
            >
              Consultar estoque
            </Link>
          </section>
        )}

      {/* VALIDADE PRÓXIMA */}

      {podeVerEstoque &&
        quantidadeProximosDaValidade >
          0 && (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(245,158,11,.55)',
              background:
                'rgba(245,158,11,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '17px',
              }}
            >
              ⏳ Validade próxima
            </h2>

            <p>
              <strong>
                {
                  quantidadeProximosDaValidade
                }
              </strong>{' '}
              lote(s) vencem em até
              30 dias.
            </p>

            <Link
              className="btn"
              href={
                administrador
                  ? '/relatorios'
                  : '/estoque'
              }
              style={{
                display:
                  'block',
                width: '100%',
                textAlign:
                  'center',
              }}
            >
              Consultar lotes
            </Link>
          </section>
        )}

      {/* LOTES VENCIDOS */}

      {podeVerEstoque &&
        quantidadeVencidos >
          0 && (
          <section
            className="card"
            style={{
              border:
                '1px solid rgba(239,68,68,.6)',
              background:
                'rgba(239,68,68,.07)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: '17px',
              }}
            >
              ⚠ Lote vencido
            </h2>

            <p>
              Existem{' '}
              <strong>
                {
                  quantidadeVencidos
                }
              </strong>{' '}
              lote(s) vencido(s) com
              saldo registrado.
            </p>

            <Link
              className="btn"
              href={
                administrador
                  ? '/relatorios'
                  : '/estoque'
              }
              style={{
                display:
                  'block',
                width: '100%',
                textAlign:
                  'center',
              }}
            >
              Verificar agora
            </Link>
          </section>
        )}

      {/* CARDÁPIO */}

      {exibirLembreteCardapio && (
        <section
          className="card"
          style={{
            border:
              '1px solid rgba(59,130,246,.55)',
            background:
              'rgba(59,130,246,.07)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: '17px',
            }}
          >
            📅 Cardápio da próxima
            semana
          </h2>

          <p>
            <strong>
              Hoje é sexta-feira.
            </strong>
          </p>

          <p
            className="muted"
            style={{
              fontSize: '11px',
              lineHeight: 1.5,
            }}
          >
            Verifique e cadastre o
            cardápio previsto para a
            próxima semana. Esse
            planejamento auxilia a
            organização do
            Aprovisionamento e o
            consumo dos gêneros,
            especialmente os FLV.
          </p>

          <Link
            className="btn"
            href="/cardapio"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            Acessar Cardápio
          </Link>
        </section>
      )}

      {/* QDAA */}

      {exibirLembreteQDAA && (
        <section
          className="card"
          style={{
            border:
              '1px solid rgba(59,130,246,.55)',
            background:
              'rgba(59,130,246,.07)',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: '17px',
            }}
          >
            📋 Lembrete QDAA
          </h2>

          {diaDoMes === 25 ? (
            <p>
              <strong>
                O QDAA deve ser
                realizado hoje.
              </strong>
            </p>
          ) : (
            <p>
              O QDAA deve ser
              realizado no dia 25.
              Faltam{' '}
              <strong>
                {diasParaQDAA}{' '}
                {diasParaQDAA === 1
                  ? 'dia'
                  : 'dias'}
              </strong>
              .
            </p>
          )}

          <Link
            className="btn"
            href="/qdaa"
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            Acessar QDAA /
            Ressuprimento QS
          </Link>
        </section>
      )}

      {/* SEM PENDÊNCIAS */}

      {semOutrasPendencias && (
        <section
          className="card"
          style={{
            border:
              '1px solid rgba(43,138,87,.45)',
            background:
              'rgba(43,138,87,.06)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'flex-start',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
              }}
            >
              ✓
            </span>

            <div>
              <strong
                style={{
                  fontSize: '15px',
                }}
              >
                Situação operacional
              </strong>

              <p
                className="muted"
                style={{
                  margin:
                    '4px 0 0',
                  fontSize:
                    '11px',
                  lineHeight: 1.5,
                }}
              >
                Nenhuma outra
                pendência operacional
                identificada no
                momento.
              </p>
            </div>
          </div>
        </section>
      )}

      <NavegacaoInferior />
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

const TIME_ZONE = 'America/Campo_Grande';

const nomesRefeicao: Record<string, string> = {
  CAFE_DA_MANHA: 'Café da manhã',
  ALMOCO: 'Almoço',
  JANTAR: 'Jantar',
  CEIA: 'Ceia',
  SERVICO_DIA_SEGUINTE: 'Serviço do dia seguinte',
  OUTRO: 'Outro',
};

type OpcoesRelatorio = {
  efetivo: boolean;
  refeicoes: boolean;
  entradas: boolean;
  saidas: boolean;
  devolucoes: boolean;
  estoque: boolean;
};

const opcoesIniciais: OpcoesRelatorio = {
  efetivo: true,
  refeicoes: true,
  entradas: true,
  saidas: true,
  devolucoes: true,
  estoque: true,
};

function dataHojeLocal() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const ano =
    partes.find((p) => p.type === 'year')?.value || '';

  const mes =
    partes.find((p) => p.type === 'month')?.value || '';

  const dia =
    partes.find((p) => p.type === 'day')?.value || '';

  return `${ano}-${mes}-${dia}`;
}

function formatarData(valor: string) {
  if (!valor) return '—';

  const data = valor.slice(0, 10);
  const [ano, mes, dia] = data.split('-');

  if (!ano || !mes || !dia) {
    return valor;
  }

  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(valor: string) {
  if (!valor) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(valor));
}

function formatarNumero(valor: number | null | undefined) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    maximumFractionDigits: 3,
  });
}

function parametrosOpcoes(opcoes: OpcoesRelatorio) {
  const p = new URLSearchParams();

  if (opcoes.efetivo) p.set('efetivo', '1');
  if (opcoes.refeicoes) p.set('refeicoes', '1');
  if (opcoes.entradas) p.set('entradas', '1');
  if (opcoes.saidas) p.set('saidas', '1');
  if (opcoes.devolucoes) p.set('devolucoes', '1');
  if (opcoes.estoque) p.set('estoque', '1');

  return p;
}

function TabelaMovimentos({
  titulo,
  itens,
  mostrarDestino = false,
}: {
  titulo: string;
  itens: any[];
  mostrarDestino?: boolean;
}) {
  return (
    <div className="card">
      <h2>{titulo}</h2>

      {itens.length === 0 ? (
        <p className="muted">
          Nenhum registro no período selecionado.
        </p>
      ) : (
        <div
          style={{
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 850,
            }}
          >
            <thead>
              <tr>
                <th style={th}>Gênero</th>
                <th style={th}>Grupo</th>
                <th style={th}>Categoria</th>
                <th style={th}>Classe</th>
                <th style={th}>Quantidade</th>
                <th style={th}>Data / hora</th>

                {mostrarDestino && (
                  <th style={th}>Finalidade</th>
                )}
              </tr>
            </thead>

            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td style={td}>
                    <strong>{item.genero}</strong>
                  </td>

                  <td style={td}>{item.grupo}</td>

                  <td style={td}>{item.categoria}</td>

                  <td style={td}>{item.classe}</td>

                  <td style={td}>
                    <strong>
                      {formatarNumero(item.quantidade)}{' '}
                      {item.unidade}
                    </strong>
                  </td>

                  <td style={td}>
                    {formatarDataHora(item.dataHora)}
                  </td>

                  {mostrarDestino && (
                    <td style={td}>
                      {item.observacao
                        ? item.observacao.replace(
                            /^Destino:\s*/i,
                            ''
                          )
                        : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px',
  borderBottom: '1px solid rgba(255,255,255,.18)',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid rgba(255,255,255,.08)',
  verticalAlign: 'top',
};

export default function RelatoriosClient() {
  const hoje = dataHojeLocal();

  const [inicio, setInicio] = useState(hoje);
  const [fim, setFim] = useState(hoje);
  const [classe, setClasse] = useState('TODOS');

  const [opcoes, setOpcoes] =
    useState<OpcoesRelatorio>(opcoesIniciais);

  const [dados, setDados] = useState<any>(null);

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] =
    useState(false);

  async function carregar() {
    setErro('');

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

    setCarregando(true);

    try {
      const params = new URLSearchParams({
        inicio,
        fim,
        classe,
      });

      const resposta = await fetch(
        `/api/relatorios?${params.toString()}`,
        {
          cache: 'no-store',
        }
      );

      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error ||
            'Não foi possível gerar o relatório.'
        );

        setDados(null);
        return;
      }

      setDados(json);
    } catch {
      setErro(
        'Não foi possível comunicar com o sistema.'
      );

      setDados(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterarOpcao(
    campo: keyof OpcoesRelatorio
  ) {
    setOpcoes((anterior) => ({
      ...anterior,
      [campo]: !anterior[campo],
    }));
  }

  function urlExportacao(tipo: 'pdf' | 'excel') {
    const params = parametrosOpcoes(opcoes);

    params.set('inicio', inicio);
    params.set('fim', fim);
    params.set('classe', classe);

    return `/api/relatorios/${tipo}?${params.toString()}`;
  }

  const estoqueAgrupado = useMemo(() => {
    if (!dados?.posicaoEstoque) {
      return [];
    }

    const grupos = new Map<string, any>();

    for (const item of dados.posicaoEstoque) {
      const grupoNome =
        item.grupo || 'Sem grupo';

      if (!grupos.has(grupoNome)) {
        grupos.set(grupoNome, {
          nome: grupoNome,
          categorias: new Map<string, any>(),
        });
      }

      const grupo = grupos.get(grupoNome);

      const categoriaNome =
        item.categoria || 'Sem categoria';

      if (!grupo.categorias.has(categoriaNome)) {
        grupo.categorias.set(categoriaNome, {
          nome: categoriaNome,
          itens: [],
        });
      }

      grupo.categorias
        .get(categoriaNome)
        .itens.push(item);
    }

    return Array.from(grupos.values())
      .sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      )
      .map((grupo) => ({
        ...grupo,

        categorias: Array.from(
          grupo.categorias.values()
        )
          .sort((a: any, b: any) =>
            a.nome.localeCompare(
              b.nome,
              'pt-BR'
            )
          )
          .map((categoria: any) => ({
            ...categoria,

            itens: categoria.itens.sort(
              (a: any, b: any) =>
                a.nome.localeCompare(
                  b.nome,
                  'pt-BR'
                )
            ),
          })),
      }));
  }, [dados]);

  return (
    <>
      <div className="card">
        <h2>Relatório operacional</h2>

        <p className="muted">
          Consulte as informações do estoque e escolha
          quais seções deseja incluir no relatório.
        </p>

        <div className="grid">
          <label>
            Data inicial
            <input
              type="date"
              value={inicio}
              onChange={(e) =>
                setInicio(e.target.value)
              }
            />
          </label>

          <label>
            Data final
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

              <option value="QS">QS</option>

              <option value="QR">QR</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          className="btn"
          disabled={carregando}
          onClick={carregar}
        >
          {carregando
            ? 'Consultando...'
            : 'Visualizar relatório'}
        </button>

        {erro && (
          <div className="error">{erro}</div>
        )}
      </div>

      <div className="card">
        <h2>O que incluir no relatório</h2>

        <p className="muted">
          Marque as informações que deseja visualizar e
          exportar. Os alertas de estoque são sempre
          incluídos.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={opcoes.efetivo}
              onChange={() =>
                alterarOpcao('efetivo')
              }
            />{' '}
            Efetivo por refeição
          </label>

          <label>
            <input
              type="checkbox"
              checked={opcoes.refeicoes}
              onChange={() =>
                alterarOpcao('refeicoes')
              }
            />{' '}
            Refeições relacionadas
          </label>

          <label>
            <input
              type="checkbox"
              checked={opcoes.entradas}
              onChange={() =>
                alterarOpcao('entradas')
              }
            />{' '}
            Entradas
          </label>

          <label>
            <input
              type="checkbox"
              checked={opcoes.saidas}
              onChange={() =>
                alterarOpcao('saidas')
              }
            />{' '}
            Saídas
          </label>

          <label>
            <input
              type="checkbox"
              checked={opcoes.devolucoes}
              onChange={() =>
                alterarOpcao('devolucoes')
              }
            />{' '}
            Devoluções
          </label>

          <label>
            <input
              type="checkbox"
              checked={opcoes.estoque}
              onChange={() =>
                alterarOpcao('estoque')
              }
            />{' '}
            Posição do estoque
          </label>
        </div>
      </div>

      {dados && (
        <>
          <div
            className="row"
            style={{
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <a
              className="btn"
              href={urlExportacao('pdf')}
              target="_blank"
              rel="noreferrer"
            >
              Baixar PDF
            </a>

            <a
              className="btn"
              href={urlExportacao('excel')}
            >
              Baixar Excel
            </a>
          </div>

          {opcoes.efetivo && (
            <div className="card">
              <h2>Efetivo por refeição</h2>

              {dados.efetivos.length === 0 ? (
                <p className="muted">
                  Nenhum efetivo registrado no período.
                </p>
              ) : (
                <>
                  <div
                    style={{
                      overflowX: 'auto',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        minWidth: 900,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={th}>Data</th>
                          <th style={th}>Refeição</th>
                          <th style={th}>
                            Efetivo previsto
                          </th>
                          <th style={th}>
                            Efetivo alimentado
                          </th>
                          <th style={th}>Faltas</th>
                          <th style={th}>
                            Militares de fora
                          </th>
                          <th style={th}>
                            Total atendido
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {dados.efetivos.map(
                          (item: any) => (
                            <tr key={item.id}>
                              <td style={td}>
                                {formatarData(
                                  item.data
                                )}
                              </td>

                              <td style={td}>
                                <strong>
                                  {nomesRefeicao[
                                    item.refeicao
                                  ] ||
                                    item.refeicao}
                                </strong>
                              </td>

                              <td style={td}>
                                {item.totalPrevisto}
                              </td>

                              <td style={td}>
                                {item.efetivoAlimentado ??
                                  '—'}
                              </td>

                              <td style={td}>
                                {item.faltas ?? '—'}
                              </td>

                              <td style={td}>
                                {item.militaresDeFora ??
                                  '—'}
                              </td>

                              <td style={td}>
                                <strong>
                                  {item.totalAtendido ??
                                    '—'}
                                </strong>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div
                    className="grid"
                    style={{
                      marginTop: 18,
                    }}
                  >
                    <div className="card">
                      <span className="muted">
                        Refeições realizadas
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .refeicoes
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="card">
                      <span className="muted">
                        Efetivo previsto
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .efetivoPrevisto
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="card">
                      <span className="muted">
                        Efetivo alimentado
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .efetivoAlimentado
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="card">
                      <span className="muted">
                        Faltas
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .faltas
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="card">
                      <span className="muted">
                        Militares de fora
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .militaresDeFora
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="card">
                      <span className="muted">
                        Total de atendimentos
                      </span>

                      <div>
                        <strong>
                          {
                            dados.resumoEfetivo
                              .totalAtendido
                          }
                        </strong>
                      </div>
                    </div>
                  </div>

                  <p className="muted">
                    O total de atendimentos representa as
                    refeições servidas no período. A mesma
                    pessoa pode ter participado de mais de
                    uma refeição.
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
                        Sobra pesada total no período
                      </span>

                      <strong>
                        {formatarNumero(
                          dados.resumoEfetivo.sobraKg
                        )}{' '}
                        kg
                      </strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {opcoes.refeicoes && (
            <div className="card">
              <h2>Refeições relacionadas</h2>

              <p className="muted">
                Refeições identificadas pelas saídas
                físicas de gêneros no período.
              </p>

              {dados.refeicoesRelacionadas.length ===
              0 ? (
                <p className="muted">
                  Nenhuma refeição relacionada às saídas
                  do período.
                </p>
              ) : (
                dados.refeicoesRelacionadas.map(
                  (item: any, indice: number) => (
                    <div
                      key={`${item.data}-${item.destino}-${indice}`}
                      className="row"
                      style={{
                        padding: '10px 0',
                        borderBottom:
                          '1px solid rgba(255,255,255,.08)',
                      }}
                    >
                      <div>
                        <strong>{item.nome}</strong>

                        <div className="muted">
                          {formatarData(item.data)}
                        </div>
                      </div>

                      <strong>
                        {item.referencia}
                      </strong>
                    </div>
                  )
                )
              )}

              <div
                className="row"
                style={{
                  marginTop: 14,
                }}
              >
                <span>
                  Total de refeições relacionadas
                </span>

                <strong>
                  {dados.refeicoesRelacionadas.length}
                </strong>
              </div>
            </div>
          )}

          {opcoes.entradas && (
            <TabelaMovimentos
              titulo="Entradas"
              itens={dados.entradas}
            />
          )}

          {opcoes.saidas && (
            <TabelaMovimentos
              titulo="Saídas"
              itens={dados.saidas}
              mostrarDestino
            />
          )}

          {opcoes.devolucoes && (
            <TabelaMovimentos
              titulo="Devoluções"
              itens={dados.devolucoes}
            />
          )}

          {opcoes.estoque && (
            <div className="card">
              <h2>Posição do estoque</h2>

              <p className="muted">
                Saldo atual dos gêneros organizado por
                grupo e categoria. Quantidades de unidades
                diferentes não são somadas entre si.
              </p>

              {estoqueAgrupado.map(
                (grupo: any) => (
                  <section
                    key={grupo.nome}
                    style={{
                      marginTop: 22,
                    }}
                  >
                    <h3>{grupo.nome}</h3>

                    {grupo.categorias.map(
                      (categoria: any) => (
                        <div
                          key={categoria.nome}
                          style={{
                            marginTop: 16,
                            padding: 14,
                            border:
                              '1px solid rgba(255,255,255,.10)',
                            borderRadius: 12,
                          }}
                        >
                          <strong>
                            {categoria.nome}
                          </strong>

                          <div
                            style={{
                              marginTop: 10,
                            }}
                          >
                            {categoria.itens.map(
                              (item: any) => (
                                <div
                                  key={item.generoId}
                                  className="row"
                                  style={{
                                    padding:
                                      '8px 0',
                                    borderBottom:
                                      '1px solid rgba(255,255,255,.06)',
                                  }}
                                >
                                  <div>
                                    <strong>
                                      {item.nome}
                                    </strong>

                                    <div className="muted">
                                      {item.classe}
                                    </div>
                                  </div>

                                  <strong>
                                    {formatarNumero(
                                      item.quantidade
                                    )}{' '}
                                    {item.unidade}
                                  </strong>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </section>
                )
              )}
            </div>
          )}

          <div className="card">
            <h2>Alertas de estoque</h2>

            <p className="muted">
              Esta seção é sempre exibida no relatório.
            </p>

            {dados.estoqueBaixo.length === 0 &&
            dados.validade.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border:
                    '1px solid rgba(34,197,94,.35)',
                  background:
                    'rgba(34,197,94,.06)',
                }}
              >
                ✓ Nenhum alerta de estoque.
              </div>
            ) : (
              <>
                {dados.estoqueBaixo.map(
                  (item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 14,
                        marginTop: 10,
                        borderRadius: 12,
                        border: item.zerado
                          ? '2px solid #ef4444'
                          : '2px solid #f59e0b',
                        background: item.zerado
                          ? 'rgba(239,68,68,.10)'
                          : 'rgba(245,158,11,.10)',
                      }}
                    >
                      <div className="row">
                        <strong>
                          {item.zerado
                            ? '⛔ ESTOQUE ZERADO'
                            : '⚠ ESTOQUE BAIXO'}
                        </strong>

                        <strong>{item.nome}</strong>
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        Saldo atual:{' '}
                        <strong>
                          {formatarNumero(item.qtd)}{' '}
                          {item.unidade}
                        </strong>

                        {' · '}

                        Estoque mínimo:{' '}
                        <strong>
                          {formatarNumero(item.min)}{' '}
                          {item.unidade}
                        </strong>
                      </div>
                    </div>
                  )
                )}

                {dados.validade.map(
                  (item: any, indice: number) => (
                    <div
                      key={`${item.genero}-${item.lote}-${indice}`}
                      style={{
                        padding: 14,
                        marginTop: 10,
                        borderRadius: 12,
                        border: item.vencido
                          ? '2px solid #ef4444'
                          : '2px solid #f59e0b',
                        background: item.vencido
                          ? 'rgba(239,68,68,.10)'
                          : 'rgba(245,158,11,.10)',
                      }}
                    >
                      <strong>
                        {item.vencido
                          ? '⛔ LOTE VENCIDO'
                          : '⚠ VALIDADE PRÓXIMA'}
                      </strong>

                      <div
                        style={{
                          marginTop: 8,
                        }}
                      >
                        <strong>{item.genero}</strong>
                        {' · '}
                        Lote {item.lote || '—'}
                      </div>

                      <div className="muted">
                        Validade:{' '}
                        {formatarData(item.validade)}
                        {' · '}
                        {formatarNumero(
                          item.quantidade
                        )}{' '}
                        {item.unidade}
                      </div>
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

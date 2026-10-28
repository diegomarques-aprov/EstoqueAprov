'use client';

import Link from 'next/link';
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

type TipoReferencia =
  | 'MENSAL'
  | 'BIMESTRAL';

type ItemRessuprimento = {
  generoId: string;
  genero: string;
  unidade: string;

  quantidadeSugerida:
    | number
    | null;

  possuiReferenciaInicial?:
    boolean;

  referenciaInicial?: {
    tipo:
      | 'MENSAL'
      | 'BIMESTRAL';

    quantidade: number;

    observacao?:
      | string
      | null;
  } | null;
};

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

function ReferenciaQSContent() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  const generoId =
    searchParams.get(
      'generoId'
    );

  const historico =
    Number(
      searchParams.get(
        'historico'
      ) || 2
    );

  const ciclo =
    Number(
      searchParams.get(
        'ciclo'
      ) || 2
    );

  const margem =
    Number(
      searchParams.get(
        'margem'
      ) || 10
    );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    itens,
    setItens,
  ] = useState<
    ItemRessuprimento[]
  >([]);

  const [
    genero,
    setGenero,
  ] = useState<
    ItemRessuprimento | null
  >(null);

  const [
    tipoReferencia,
    setTipoReferencia,
  ] = useState<TipoReferencia>(
    'BIMESTRAL'
  );

  const [
    quantidade,
    setQuantidade,
  ] = useState('');

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [
    erro,
    setErro,
  ] = useState('');

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  function enderecoPlanejamento() {
    const params =
      new URLSearchParams({
        historico:
          String(historico),

        ciclo:
          String(ciclo),

        margem:
          String(margem),
      });

    return (
      '/qdaa/planejamento?' +
      params.toString()
    );
  }

  function enderecoReferencia(
    id: string
  ) {
    const params =
      new URLSearchParams({
        generoId: id,

        historico:
          String(historico),

        ciclo:
          String(ciclo),

        margem:
          String(margem),
      });

    return (
      '/qdaa/referencia?' +
      params.toString()
    );
  }

  async function carregar() {
    if (!generoId) {
      setErro(
        'Nenhum gênero foi informado.'
      );

      setCarregando(false);

      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const params =
        new URLSearchParams({
          historico:
            String(historico),

          ciclo:
            String(ciclo),

          margem:
            String(margem),
        });

      const resposta =
        await fetch(
          `/api/relatorios/ressuprimento-qs?${params.toString()}`,
          {
            cache: 'no-store',
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível carregar os dados do gênero.'
        );

        return;
      }

      const lista:
        ItemRessuprimento[] =
          dados.itens || [];

      setItens(lista);

      const encontrado =
        lista.find(
          (item) =>
            item.generoId ===
            generoId
        ) || null;

      if (!encontrado) {
        setErro(
          'O gênero selecionado não foi encontrado no Ressuprimento QS.'
        );

        return;
      }

      setGenero(encontrado);

      if (
        encontrado
          .referenciaInicial
      ) {
        setTipoReferencia(
          encontrado
            .referenciaInicial
            .tipo
        );

        setQuantidade(
          String(
            encontrado
              .referenciaInicial
              .quantidade
          )
        );

        setObservacao(
          encontrado
            .referenciaInicial
            .observacao || ''
        );
      } else {
        setTipoReferencia(
          'BIMESTRAL'
        );

        setQuantidade('');
        setObservacao('');
      }
    } catch {
      setErro(
        'Não foi possível carregar os dados do gênero.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    generoId,
    historico,
    ciclo,
    margem,
  ]);

  const pendentes =
    useMemo(
      () =>
        itens.filter(
          (item) =>
            item.quantidadeSugerida ===
            null
        ),
      [itens]
    );

  const indiceAtual =
    useMemo(
      () =>
        pendentes.findIndex(
          (item) =>
            item.generoId ===
            generoId
        ),
      [
        pendentes,
        generoId,
      ]
    );

  const anterior =
    indiceAtual > 0
      ? pendentes[
          indiceAtual - 1
        ]
      : null;

  const proximo =
    indiceAtual >= 0 &&
    indiceAtual <
      pendentes.length - 1
      ? pendentes[
          indiceAtual + 1
        ]
      : null;

  async function salvar() {
    if (!genero) {
      return;
    }

    const valor =
      numeroCampo(
        quantidade
      );

    if (
      valor === null ||
      valor <= 0
    ) {
      setErro(
        'Informe uma quantidade maior que zero.'
      );

      return;
    }

    setSalvando(true);
    setErro('');
    setMensagem('');

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
                  genero.generoId,

                tipo:
                  tipoReferencia,

                quantidade:
                  valor,

                observacao:
                  observacao
                    .trim() ||
                  null,
              }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível salvar a referência.'
        );

        return;
      }

      setMensagem(
        dados.mensagem ||
          'Referência registrada com sucesso.'
      );

      const params =
        new URLSearchParams({
          historico:
            String(historico),

          ciclo:
            String(ciclo),

          margem:
            String(margem),
        });

      const respostaAtualizada =
        await fetch(
          `/api/relatorios/ressuprimento-qs?${params.toString()}`,
          {
            cache: 'no-store',
          }
        );

      const dadosAtualizados =
        await respostaAtualizada
          .json();

      if (
        respostaAtualizada.ok
      ) {
        const novaLista:
          ItemRessuprimento[] =
            dadosAtualizados
              .itens || [];

        setItens(novaLista);

        const novosPendentes =
          novaLista.filter(
            (item) =>
              item
                .quantidadeSugerida ===
              null
          );

        const proximoPendente =
          novosPendentes.find(
            (item) =>
              item.generoId !==
              genero.generoId
          );

        if (
          proximoPendente
        ) {
          setTimeout(() => {
            router.push(
              enderecoReferencia(
                proximoPendente
                  .generoId
              )
            );
          }, 700);

          return;
        }
      }

      setTimeout(() => {
        router.push(
          enderecoPlanejamento()
        );
      }, 700);
    } catch {
      setErro(
        'Não foi possível salvar a referência.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="narrow">
        <Link
          href={
            enderecoPlanejamento()
          }
          className="back"
        >
          ← Planejamento
        </Link>

        <div className="card">
          <h1>
            Referência de
            Consumo QS
          </h1>

          <p className="muted">
            Carregando gênero...
          </p>
        </div>
      </main>
    );
  }

  if (
    erro &&
    !genero
  ) {
    return (
      <main className="narrow">
        <Link
          href={
            enderecoPlanejamento()
          }
          className="back"
        >
          ← Planejamento
        </Link>

        <div className="card">
          <h1>
            Referência de
            Consumo QS
          </h1>

          <div className="error">
            {erro}
          </div>
        </div>
      </main>
    );
  }

  if (!genero) {
    return null;
  }

  const valorNumerico =
    numeroCampo(
      quantidade
    );

  return (
    <main className="narrow">
      <div
        style={{
          display: 'flex',
          gap: '7px',
          flexWrap: 'wrap',
          marginBottom:
            '12px',
        }}
      >
        <Link
          href={
            enderecoPlanejamento()
          }
          className="back"
        >
          ← Planejamento
        </Link>

        <Link
          href="/inicio"
          className="back"
        >
          ← Início
        </Link>
      </div>

      <div className="card">
        <span className="tag">
          QS
        </span>

        <h1>
          Referência de
          Consumo
        </h1>

        <p className="muted">
          Informe a referência
          necessária para o cálculo
          do Ressuprimento QS.
        </p>
      </div>

      <div
        className="card"
        style={{
          border:
            '1px solid rgba(245,158,11,.55)',

          background:
            'rgba(245,158,11,.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'flex-start',
            gap: '12px',
          }}
        >
          <div>
            <div
              className="muted"
              style={{
                marginBottom:
                  '3px',
              }}
            >
              Gênero
            </div>

            <strong
              style={{
                fontSize:
                  '19px',
              }}
            >
              {genero.genero}
            </strong>
          </div>

          <span className="tag">
            {genero.unidade}
          </span>
        </div>

        <div
          style={{
            marginTop: '13px',
            padding: '11px',
            borderRadius:
              '10px',
            background:
              '#0c1811',
            border:
              '1px solid #284334',
          }}
        >
          <strong>
            Por que informar?
          </strong>

          <p
            className="muted"
            style={{
              marginBottom: 0,
            }}
          >
            Este gênero ainda não
            possui histórico
            suficiente no
            EstoqueAprov. A
            referência será usada
            temporariamente até que
            exista consumo real
            suficiente.
          </p>
        </div>
      </div>

      <div className="card">
        <h2>
          Dados da referência
        </h2>

        <label>
          Tipo de referência

          <select
            value={
              tipoReferencia
            }
            onChange={(event) =>
              setTipoReferencia(
                event.target
                  .value as
                  TipoReferencia
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
          {genero.unidade})

          <input
            type="text"
            inputMode="decimal"
            value={quantidade}
            onChange={(event) =>
              setQuantidade(
                event.target.value
              )
            }
            placeholder="Ex.: 800"
          />
        </label>

        {tipoReferencia ===
          'BIMESTRAL' &&
          valorNumerico !==
            null &&
          valorNumerico >
            0 && (
            <div
              className="itembox"
              style={{
                marginTop: 0,
              }}
            >
              <div className="muted">
                Média mensal
                equivalente
              </div>

              <strong
                style={{
                  display:
                    'block',
                  marginTop:
                    '4px',
                  fontSize:
                    '18px',
                }}
              >
                {formatarNumero(
                  valorNumerico /
                    2
                )}{' '}
                {genero.unidade}
                /mês
              </strong>
            </div>
          )}

        <label>
          Observação

          <textarea
            value={observacao}
            onChange={(event) =>
              setObservacao(
                event.target.value
              )
            }
            rows={3}
            placeholder="Ex.: referência baseada no controle anterior da OM."
          />
        </label>

        {erro && (
          <div className="error">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="success">
            {mensagem}
          </div>
        )}

        <button
          type="button"
          className="btn"
          disabled={salvando}
          onClick={salvar}
          style={{
            width: 'auto',
          }}
        >
          {salvando
            ? 'Salvando...'
            : 'Salvar referência'}
        </button>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '10px',
            alignItems:
              'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong>
              Navegação
            </strong>

            <div
              className="muted"
              style={{
                marginTop:
                  '3px',
              }}
            >
              {indiceAtual >= 0
                ? `Referência ${
                    indiceAtual +
                    1
                  } de ${
                    pendentes.length
                  }`
                : 'Referência QS'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '7px',
              flexWrap: 'wrap',
            }}
          >
            {anterior && (
              <Link
                href={enderecoReferencia(
                  anterior.generoId
                )}
                className="navigation-footer-link"
              >
                ← Anterior
              </Link>
            )}

            {proximo && (
              <Link
                href={enderecoReferencia(
                  proximo.generoId
                )}
                className="navigation-footer-link"
              >
                Avançar →
              </Link>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop:
              '1px solid rgba(255,255,255,.08)',
          }}
        >
          <Link
            href={
              enderecoPlanejamento()
            }
            className="navigation-footer-link"
          >
            ← Voltar ao planejamento
          </Link>
        </div>
      </div>
    </main>
  );
}

function CarregandoReferencia() {
  return (
    <main className="narrow">
      <div className="card">
        <h1>
          Referência de Consumo QS
        </h1>

        <p className="muted">
          Carregando...
        </p>
      </div>
    </main>
  );
}

export default function ReferenciaQSPage() {
  return (
    <Suspense
      fallback={
        <CarregandoReferencia />
      }
    >
      <ReferenciaQSContent />
    </Suspense>
  );
}

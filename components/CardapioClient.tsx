'use client';

import {
  useEffect,
  useState,
} from 'react';

type Usuario = {
  id: string;
  nome: string;
  postoGraduacao?: string | null;
  funcao?: string | null;
};

type Cardapio = {
  id: string;
  data: string;
  cafe?: string | null;
  almoco?: string | null;
  jantar?: string | null;
  ceia?: string | null;
  observacao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuario: Usuario;
};

type Props = {
  podeEditar: boolean;
};

const estiloCampo = {
  width: '100%',
  minHeight: '125px',
  boxSizing: 'border-box' as const,
  padding: '14px 16px',
  borderRadius: '10px',
  border: '1px solid #315846',
  background: '#071a12',
  color: '#f8fafc',
  fontSize: '16px',
  lineHeight: '1.5',
  resize: 'vertical' as const,
};

const estiloObservacao = {
  ...estiloCampo,
  minHeight: '90px',
};

const estiloBlocoRefeicao = {
  marginTop: '20px',
};

const estiloLabel = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 700,
  fontSize: '15px',
};

const estiloContador = {
  textAlign: 'right' as const,
  fontSize: '12px',
  marginTop: '5px',
  marginBottom: '4px',
};

function hojeLocal() {
  const agora = new Date();

  const ano =
    agora.getFullYear();

  const mes =
    String(
      agora.getMonth() + 1
    ).padStart(2, '0');

  const dia =
    String(
      agora.getDate()
    ).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function formatarData(
  valor: string
) {
  const partes =
    valor.split('-');

  if (partes.length !== 3) {
    return valor;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export default function CardapioClient({
  podeEditar,
}: Props) {
  const [data, setData] =
    useState(hojeLocal());

  const [cafe, setCafe] =
    useState('');

  const [almoco, setAlmoco] =
    useState('');

  const [jantar, setJantar] =
    useState('');

  const [ceia, setCeia] =
    useState('');

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [
    cardapio,
    setCardapio,
  ] = useState<Cardapio | null>(
    null
  );

  const [
    carregando,
    setCarregando,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  const [
    erro,
    setErro,
  ] = useState('');

  function limparCampos() {
    setCafe('');
    setAlmoco('');
    setJantar('');
    setCeia('');
    setObservacao('');
    setCardapio(null);
  }

  async function consultar(
    dataConsulta: string
  ) {
    if (!dataConsulta) {
      limparCampos();
      return;
    }

    setCarregando(true);
    setErro('');
    setMensagem('');

    try {
      const resposta =
        await fetch(
          `/api/cardapio?data=${encodeURIComponent(
            dataConsulta
          )}`,
          {
            cache: 'no-store',
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        limparCampos();

        setErro(
          dados.error ||
            'Não foi possível consultar o cardápio.'
        );

        return;
      }

      if (
        !dados.encontrado ||
        !dados.cardapio
      ) {
        limparCampos();
        return;
      }

      const encontrado =
        dados.cardapio as Cardapio;

      setCardapio(encontrado);
      setCafe(encontrado.cafe || '');
      setAlmoco(encontrado.almoco || '');
      setJantar(encontrado.jantar || '');
      setCeia(encontrado.ceia || '');
      setObservacao(
        encontrado.observacao || ''
      );
    } catch (error) {
      console.error(error);

      limparCampos();

      setErro(
        'Não foi possível consultar o cardápio.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    consultar(data);
  }, [data]);

  async function salvar() {
    if (!podeEditar) {
      return;
    }

    if (!data) {
      setErro(
        'Informe a data do cardápio.'
      );
      return;
    }

    if (
      !cafe.trim() &&
      !almoco.trim() &&
      !jantar.trim() &&
      !ceia.trim()
    ) {
      setErro(
        'Para cadastrar o cardápio, informe pelo menos uma refeição.'
      );
      return;
    }

    setSalvando(true);
    setErro('');
    setMensagem('');

    try {
      const resposta =
        await fetch(
          '/api/cardapio',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              data,
              cafe,
              almoco,
              jantar,
              ceia,
              observacao,
            }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível salvar o cardápio.'
        );

        return;
      }

      setMensagem(
        dados.mensagem ||
          'Cardápio salvo com sucesso.'
      );

      if (dados.cardapio) {
        const salvo =
          dados.cardapio as Cardapio;

        setCardapio(salvo);
        setCafe(salvo.cafe || '');
        setAlmoco(salvo.almoco || '');
        setJantar(salvo.jantar || '');
        setCeia(salvo.ceia || '');
        setObservacao(
          salvo.observacao || ''
        );
      }
    } catch (error) {
      console.error(error);

      setErro(
        'Não foi possível salvar o cardápio.'
      );
    } finally {
      setSalvando(false);
    }
  }

  function alterarDia(
    quantidade: number
  ) {
    if (!data) {
      return;
    }

    const partes =
      data.split('-').map(Number);

    if (
      partes.length !== 3 ||
      !partes[0] ||
      !partes[1] ||
      !partes[2]
    ) {
      return;
    }

    const novaData =
      new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
      );

    novaData.setDate(
      novaData.getDate() +
        quantidade
    );

    const ano =
      novaData.getFullYear();

    const mes =
      String(
        novaData.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        novaData.getDate()
      ).padStart(2, '0');

    setData(
      `${ano}-${mes}-${dia}`
    );
  }

  const nomeUsuario =
    cardapio?.usuario
      ? [
          cardapio.usuario
            .postoGraduacao,
          cardapio.usuario.nome,
        ]
          .filter(Boolean)
          .join(' ')
      : '';

  return (
    <>
      <div className="card">
        <h2>
          Cadastro / Consulta de
          Cardápio
        </h2>

        <p className="muted">
          Selecione a data desejada.
          Caso já exista um cardápio,
          ele será apresentado para
          consulta ou alteração.
        </p>

        <label>
          Data do cardápio
        </label>

        <input
          type="date"
          value={data}
          onChange={(e) =>
            setData(e.target.value)
          }
          disabled={
            carregando ||
            salvando
          }
        />

        <div
          className="actions"
          style={{
            marginTop: 12,
          }}
        >
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              alterarDia(-1)
            }
            disabled={
              carregando ||
              salvando
            }
          >
            ← Dia anterior
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setData(hojeLocal())
            }
            disabled={
              carregando ||
              salvando
            }
          >
            Hoje
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              alterarDia(1)
            }
            disabled={
              carregando ||
              salvando
            }
          >
            Próximo dia →
          </button>
        </div>
      </div>

      {carregando && (
        <div className="card">
          <p className="muted">
            Consultando cardápio...
          </p>
        </div>
      )}

      {!carregando && data && (
        <div
          className="card"
          style={
            cardapio
              ? {
                  border:
                    '1px solid #22c55e',
                  background:
                    'rgba(34, 197, 94, 0.06)',
                }
              : {
                  border:
                    '1px solid #f59e0b',
                  background:
                    'rgba(245, 158, 11, 0.06)',
                }
          }
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            {cardapio
              ? '✓ Cardápio cadastrado'
              : 'Cardápio ainda não cadastrado'}
          </h2>

          <p>
            <strong>
              {formatarData(data)}
            </strong>
          </p>

          {cardapio &&
            nomeUsuario && (
              <p className="muted">
                Último registro por:{' '}
                {nomeUsuario}
                {cardapio.usuario
                  .funcao
                  ? ` · ${cardapio.usuario.funcao}`
                  : ''}
              </p>
            )}

          {!cardapio &&
            !podeEditar && (
              <p className="muted">
                Ainda não existe
                cardápio cadastrado
                para esta data.
              </p>
            )}
        </div>
      )}

      {!carregando && (
        <div className="card">
          <h2>
            Cardápio do dia{' '}
            {formatarData(data)}
          </h2>

          <p className="muted">
            Relacione as preparações
            previstas para cada
            refeição.
          </p>

          <div
            style={
              estiloBlocoRefeicao
            }
          >
            <label
              style={estiloLabel}
            >
              ☕ Café
            </label>

            <textarea
              value={cafe}
              onChange={(e) =>
                setCafe(
                  e.target.value
                )
              }
              maxLength={1000}
              disabled={
                !podeEditar ||
                salvando
              }
              style={estiloCampo}
              placeholder={
                podeEditar
                  ? 'Ex.: Café com leite\nPão com margarina\nFrutas'
                  : 'Não informado'
              }
            />

            <div
              className="muted"
              style={
                estiloContador
              }
            >
              {cafe.length}/1000
            </div>
          </div>

          <div
            style={
              estiloBlocoRefeicao
            }
          >
            <label
              style={estiloLabel}
            >
              🍽️ Almoço
            </label>

            <textarea
              value={almoco}
              onChange={(e) =>
                setAlmoco(
                  e.target.value
                )
              }
              maxLength={1000}
              disabled={
                !podeEditar ||
                salvando
              }
              style={estiloCampo}
              placeholder={
                podeEditar
                  ? 'Ex.: Arroz\nFeijão\nCarne com mandioca\nSalada'
                  : 'Não informado'
              }
            />

            <div
              className="muted"
              style={
                estiloContador
              }
            >
              {almoco.length}/1000
            </div>
          </div>

          <div
            style={
              estiloBlocoRefeicao
            }
          >
            <label
              style={estiloLabel}
            >
              🍲 Jantar
            </label>

            <textarea
              value={jantar}
              onChange={(e) =>
                setJantar(
                  e.target.value
                )
              }
              maxLength={1000}
              disabled={
                !podeEditar ||
                salvando
              }
              style={estiloCampo}
              placeholder={
                podeEditar
                  ? 'Informe o cardápio do jantar'
                  : 'Não informado'
              }
            />

            <div
              className="muted"
              style={
                estiloContador
              }
            >
              {jantar.length}/1000
            </div>
          </div>

          <div
            style={
              estiloBlocoRefeicao
            }
          >
            <label
              style={estiloLabel}
            >
              🌙 Ceia
            </label>

            <textarea
              value={ceia}
              onChange={(e) =>
                setCeia(
                  e.target.value
                )
              }
              maxLength={1000}
              disabled={
                !podeEditar ||
                salvando
              }
              style={estiloCampo}
              placeholder={
                podeEditar
                  ? 'Informe o cardápio da ceia'
                  : 'Não informado'
              }
            />

            <div
              className="muted"
              style={
                estiloContador
              }
            >
              {ceia.length}/1000
            </div>
          </div>

          <div
            style={
              estiloBlocoRefeicao
            }
          >
            <label
              style={estiloLabel}
            >
              📝 Observação
            </label>

            <textarea
              value={observacao}
              onChange={(e) =>
                setObservacao(
                  e.target.value
                )
              }
              maxLength={1000}
              disabled={
                !podeEditar ||
                salvando
              }
              style={
                estiloObservacao
              }
              placeholder={
                podeEditar
                  ? 'Observação opcional'
                  : 'Sem observação'
              }
            />

            <div
              className="muted"
              style={
                estiloContador
              }
            >
              {observacao.length}
              /1000
            </div>
          </div>

          {erro && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                border:
                  '1px solid #ef4444',
                borderRadius: 8,
                background:
                  'rgba(239, 68, 68, 0.08)',
              }}
            >
              {erro}
            </div>
          )}

          {mensagem && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                border:
                  '1px solid #22c55e',
                borderRadius: 8,
                background:
                  'rgba(34, 197, 94, 0.08)',
              }}
            >
              {mensagem}
            </div>
          )}

          {podeEditar && (
            <div
              className="actions"
              style={{
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={salvar}
                disabled={
                  salvando ||
                  carregando
                }
              >
                {salvando
                  ? 'Salvando...'
                  : cardapio
                    ? 'Salvar alterações'
                    : 'Cadastrar cardápio'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

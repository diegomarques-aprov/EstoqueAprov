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

type CampoRefeicaoProps = {
  titulo: string;
  icone: string;
  valor: string;
  onChange: (
    valor: string
  ) => void;
  placeholder: string;
  podeEditar: boolean;
  salvando: boolean;
  menor?: boolean;
};

function CampoRefeicao({
  titulo,
  icone,
  valor,
  onChange,
  placeholder,
  podeEditar,
  salvando,
  menor = false,
}: CampoRefeicaoProps) {
  return (
    <div
      style={{
        padding: '14px',
        background: '#0c1811',
        border: '1px solid #284334',
        borderRadius: '13px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '9px',
        }}
      >
        <span
          style={{
            fontSize: '19px',
            lineHeight: 1,
          }}
        >
          {icone}
        </span>

        <strong
          style={{
            fontSize: '15px',
          }}
        >
          {titulo}
        </strong>
      </div>

      <textarea
        value={valor}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        maxLength={1000}
        disabled={
          !podeEditar ||
          salvando
        }
        placeholder={
          podeEditar
            ? placeholder
            : valor
              ? ''
              : 'Não informado'
        }
        rows={
          menor ? 3 : 5
        }
        style={{
          width: '100%',
          minHeight:
            menor
              ? '85px'
              : '115px',
          boxSizing:
            'border-box',
          resize:
            'vertical',
        }}
      />

      <div
        className="muted"
        style={{
          marginTop: '5px',
          textAlign: 'right',
          fontSize: '11px',
        }}
      >
        {valor.length}/1000
      </div>
    </div>
  );
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
      setCafe(
        encontrado.cafe || ''
      );
      setAlmoco(
        encontrado.almoco || ''
      );
      setJantar(
        encontrado.jantar || ''
      );
      setCeia(
        encontrado.ceia || ''
      );
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
        setCafe(
          salvo.cafe || ''
        );
        setAlmoco(
          salvo.almoco || ''
        );
        setJantar(
          salvo.jantar || ''
        );
        setCeia(
          salvo.ceia || ''
        );
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
    <div>
      {/* SELEÇÃO DA DATA */}

      <section>
        <div
          style={{
            marginBottom: '14px',
          }}
        >
          <strong
            style={{
              fontSize: '16px',
            }}
          >
            Cadastro / Consulta
          </strong>

          <p
            className="muted"
            style={{
              margin: '5px 0 0',
              fontSize: '13px',
              lineHeight: 1.45,
            }}
          >
            Selecione a data desejada.
            Caso já exista um cardápio,
            ele será apresentado para
            consulta ou alteração.
          </p>
        </div>

        <label>
          Data do cardápio

          <input
            type="date"
            value={data}
            onChange={(e) =>
              setData(
                e.target.value
              )
            }
            disabled={
              carregando ||
              salvando
            }
          />
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              '1fr auto 1fr',
            gap: '7px',
            marginTop: '10px',
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
            style={{
              padding:
                '10px 8px',
              fontSize: '12px',
            }}
          >
            ← Anterior
          </button>

          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setData(
                hojeLocal()
              )
            }
            disabled={
              carregando ||
              salvando
            }
            style={{
              padding:
                '10px 12px',
              fontSize: '12px',
            }}
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
            style={{
              padding:
                '10px 8px',
              fontSize: '12px',
            }}
          >
            Próximo →
          </button>
        </div>
      </section>

      {/* CARREGANDO */}

      {carregando && (
        <div
          style={{
            marginTop: '16px',
            padding: '17px',
            textAlign: 'center',
            background: '#0c1811',
            border:
              '1px solid #284334',
            borderRadius: '12px',
          }}
        >
          <p
            className="muted"
            style={{
              margin: 0,
            }}
          >
            Consultando cardápio...
          </p>
        </div>
      )}

      {/* SITUAÇÃO */}

      {!carregando &&
        data && (
          <section
            style={{
              marginTop: '16px',
              padding: '13px',
              borderRadius:
                '12px',
              border: cardapio
                ? '1px solid #315846'
                : '1px solid #f59e0b',
              background:
                cardapio
                  ? 'rgba(34,197,94,.07)'
                  : 'rgba(245,158,11,.07)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'flex-start',
                gap: '10px',
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize:
                      '14px',
                  }}
                >
                  {cardapio
                    ? '✓ Cardápio cadastrado'
                    : 'Cardápio ainda não cadastrado'}
                </strong>

                <div
                  style={{
                    marginTop:
                      '4px',
                    fontSize:
                      '16px',
                    fontWeight:
                      700,
                  }}
                >
                  {formatarData(
                    data
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize:
                    '20px',
                  lineHeight: 1,
                }}
              >
                {cardapio
                  ? '✓'
                  : '○'}
              </span>
            </div>

            {cardapio &&
              nomeUsuario && (
                <div
                  className="muted"
                  style={{
                    marginTop:
                      '9px',
                    paddingTop:
                      '9px',
                    borderTop:
                      '1px solid rgba(255,255,255,.08)',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.45,
                  }}
                >
                  Último registro por:{' '}
                  <strong>
                    {nomeUsuario}
                  </strong>

                  {cardapio.usuario
                    .funcao
                    ? ` · ${cardapio.usuario.funcao}`
                    : ''}
                </div>
              )}

            {!cardapio &&
              !podeEditar && (
                <p
                  className="muted"
                  style={{
                    margin:
                      '9px 0 0',
                    fontSize:
                      '12px',
                  }}
                >
                  Ainda não existe
                  cardápio cadastrado
                  para esta data.
                </p>
              )}
          </section>
        )}

      {/* CARDÁPIO */}

      {!carregando && (
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
                '14px',
            }}
          >
            <strong
              style={{
                fontSize: '17px',
              }}
            >
              Cardápio do dia{' '}
              {formatarData(
                data
              )}
            </strong>

            <p
              className="muted"
              style={{
                margin:
                  '5px 0 0',
                fontSize:
                  '13px',
                lineHeight:
                  1.45,
              }}
            >
              {podeEditar
                ? 'Relacione as preparações previstas para cada refeição.'
                : 'Preparações previstas para as refeições do dia.'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '11px',
            }}
          >
            <CampoRefeicao
              titulo="Café"
              icone="☕"
              valor={cafe}
              onChange={
                setCafe
              }
              placeholder={
                'Ex.: Café com leite\nPão com margarina\nFrutas'
              }
              podeEditar={
                podeEditar
              }
              salvando={
                salvando
              }
            />

            <CampoRefeicao
              titulo="Almoço"
              icone="🍽️"
              valor={almoco}
              onChange={
                setAlmoco
              }
              placeholder={
                'Ex.: Arroz\nFeijão\nCarne com mandioca\nSalada'
              }
              podeEditar={
                podeEditar
              }
              salvando={
                salvando
              }
            />

            <CampoRefeicao
              titulo="Jantar"
              icone="🍲"
              valor={jantar}
              onChange={
                setJantar
              }
              placeholder="Informe o cardápio do jantar"
              podeEditar={
                podeEditar
              }
              salvando={
                salvando
              }
            />

            <CampoRefeicao
              titulo="Ceia"
              icone="🌙"
              valor={ceia}
              onChange={
                setCeia
              }
              placeholder="Informe o cardápio da ceia"
              podeEditar={
                podeEditar
              }
              salvando={
                salvando
              }
            />

            <CampoRefeicao
              titulo="Observação"
              icone="📝"
              valor={
                observacao
              }
              onChange={
                setObservacao
              }
              placeholder="Observação opcional"
              podeEditar={
                podeEditar
              }
              salvando={
                salvando
              }
              menor
            />
          </div>

          {erro && (
            <div
              className="error"
              style={{
                marginTop:
                  '14px',
              }}
            >
              {erro}
            </div>
          )}

          {mensagem && (
            <div
              className="success"
              style={{
                marginTop:
                  '14px',
              }}
            >
              {mensagem}
            </div>
          )}

          {podeEditar && (
            <button
              type="button"
              className="btn"
              onClick={salvar}
              disabled={
                salvando ||
                carregando
              }
              style={{
                width: '100%',
                marginTop:
                  '16px',
              }}
            >
              {salvando
                ? 'Salvando...'
                : cardapio
                  ? 'Salvar alterações'
                  : 'Cadastrar cardápio'}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

'use client';

import {
  useEffect,
  useState,
} from 'react';

type UsuarioConferencia = {
  id: string;
  nome: string;
  postoGraduacao?: string | null;
  funcao?: string | null;
};

type Conferencia = {
  id: string;
  data: string;
  observacao?: string | null;
  criadoEm: string;
  usuario: UsuarioConferencia;
};

export default function ConferenciaFLVClient() {
  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    conferencia,
    setConferencia,
  ] = useState<Conferencia | null>(
    null
  );

  const [
    observacao,
    setObservacao,
  ] = useState('');

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  const [erro, setErro] =
    useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const resposta =
        await fetch(
          '/api/flv/conferencia',
          {
            cache: 'no-store',
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível consultar a conferência FLV.'
        );

        return;
      }

      setConferencia(
        dados.conferencia ||
          null
      );
    } catch {
      setErro(
        'Não foi possível consultar a conferência FLV.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function confirmar() {
    setSalvando(true);
    setErro('');
    setMensagem('');

    try {
      const resposta =
        await fetch(
          '/api/flv/conferencia',
          {
            method: 'POST',

            headers: {
              'content-type':
                'application/json',
            },

            body: JSON.stringify({
              observacao:
                observacao.trim() ||
                null,
            }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.error ||
            'Não foi possível registrar a conferência FLV.'
        );

        return;
      }

      setConferencia(
        dados.conferencia
      );

      setObservacao('');

      setMensagem(
        dados.mensagem ||
          'Conferência FLV registrada com sucesso.'
      );
    } catch {
      setErro(
        'Não foi possível registrar a conferência FLV.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <section
        className="card"
        style={{
          border:
            '1px solid rgba(245,158,11,.45)',
          background:
            'rgba(245,158,11,.06)',
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
          <div
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              borderRadius:
                '11px',
              background:
                'rgba(245,158,11,.10)',
              border:
                '1px solid rgba(245,158,11,.3)',
              fontSize: '18px',
            }}
          >
            🥬
          </div>

          <div>
            <strong
              style={{
                fontSize: '15px',
              }}
            >
              Conferência diária FLV
            </strong>

            <div
              className="muted"
              style={{
                marginTop: '4px',
                fontSize: '11px',
              }}
            >
              Verificando a
              conferência de hoje...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (conferencia) {
    const identificacao =
      [
        conferencia.usuario
          .postoGraduacao,
        conferencia.usuario.nome,
      ]
        .filter(Boolean)
        .join(' ');

    return (
      <section
        className="card"
        style={{
          border:
            '1px solid rgba(43,138,87,.55)',
          background:
            'rgba(43,138,87,.07)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems:
              'flex-start',
            gap: '10px',
            marginBottom: '13px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              flexShrink: 0,
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              borderRadius:
                '11px',
              background:
                'rgba(43,138,87,.12)',
              border:
                '1px solid rgba(43,138,87,.35)',
              fontSize: '18px',
            }}
          >
            ✓
          </div>

          <div>
            <strong
              style={{
                display: 'block',
                fontSize: '15px',
              }}
            >
              Conferência FLV
              realizada
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                marginTop: '4px',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              Os gêneros FLV já
              foram conferidos hoje.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: '11px',
              borderRadius: '10px',
              background: '#102018',
              border:
                '1px solid #284334',
            }}
          >
            <div
              className="muted"
              style={{
                fontSize: '9px',
                marginBottom: '3px',
              }}
            >
              CONFERIDO POR
            </div>

            <strong
              style={{
                fontSize: '12px',
                lineHeight: 1.4,
              }}
            >
              {identificacao}
            </strong>
          </div>

          {conferencia.usuario
            .funcao && (
            <div
              style={{
                padding: '11px',
                borderRadius:
                  '10px',
                background:
                  '#102018',
                border:
                  '1px solid #284334',
              }}
            >
              <div
                className="muted"
                style={{
                  fontSize: '9px',
                  marginBottom:
                    '3px',
                }}
              >
                FUNÇÃO
              </div>

              <strong
                style={{
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                {
                  conferencia.usuario
                    .funcao
                }
              </strong>
            </div>
          )}
        </div>

        {conferencia.observacao && (
          <div
            style={{
              marginTop: '10px',
              padding: '11px',
              borderRadius: '10px',
              background:
                '#0c1811',
              border:
                '1px solid #284334',
            }}
          >
            <div
              className="muted"
              style={{
                fontSize: '9px',
                marginBottom: '5px',
              }}
            >
              OBSERVAÇÃO
            </div>

            <p
              style={{
                margin: 0,
                fontSize: '12px',
                lineHeight: 1.5,
                whiteSpace:
                  'pre-wrap',
              }}
            >
              {
                conferencia.observacao
              }
            </p>
          </div>
        )}

        {mensagem && (
          <div
            role="status"
            style={{
              marginTop: '11px',
              padding: '10px',
              borderRadius: '10px',
              background:
                'rgba(43,138,87,.10)',
              border:
                '1px solid rgba(43,138,87,.35)',
              fontSize: '11px',
              lineHeight: 1.4,
            }}
          >
            <strong>
              ✓ {mensagem}
            </strong>
          </div>
        )}
      </section>
    );
  }

  return (
    <section
      className="card"
      style={{
        border:
          '1px solid rgba(245,158,11,.55)',
        background:
          'rgba(245,158,11,.07)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems:
            'flex-start',
          gap: '10px',
          marginBottom: '13px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            flexShrink: 0,
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            borderRadius: '11px',
            background:
              'rgba(245,158,11,.10)',
            border:
              '1px solid rgba(245,158,11,.3)',
            fontSize: '18px',
          }}
        >
          🥬
        </div>

        <div>
          <strong
            style={{
              display: 'block',
              fontSize: '15px',
            }}
          >
            Conferência diária FLV
          </strong>

          <span
            style={{
              display: 'block',
              marginTop: '4px',
              fontSize: '11px',
              lineHeight: 1.45,
            }}
          >
            A conferência dos
            gêneros FLV ainda não
            foi registrada hoje.
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '12px',
          borderRadius: '11px',
          background: '#102018',
          border:
            '1px solid #284334',
          marginBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '9px',
            alignItems:
              'flex-start',
          }}
        >
          <span
            style={{
              fontSize: '16px',
            }}
          >
            ❄
          </span>

          <div>
            <strong
              style={{
                display: 'block',
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              Câmara de Resfriamento
            </strong>

            <span
              className="muted"
              style={{
                display: 'block',
                fontSize: '10px',
                lineHeight: 1.5,
              }}
            >
              Verifique fisicamente
              frutas, legumes e
              verduras, observando
              quantidade disponível,
              conservação, qualidade
              e condições para
              consumo.
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '11px',
          borderRadius: '10px',
          background:
            'rgba(245,158,11,.05)',
          border:
            '1px solid rgba(245,158,11,.25)',
          marginBottom: '14px',
        }}
      >
        <strong
          style={{
            display: 'block',
            fontSize: '11px',
            marginBottom: '4px',
          }}
        >
          Prioridade de consumo
        </strong>

        <span
          className="muted"
          style={{
            display: 'block',
            fontSize: '10px',
            lineHeight: 1.5,
          }}
        >
          Caso algum FLV apresente
          amadurecimento avançado ou
          condição que exija consumo
          prioritário, registre a
          informação abaixo.
        </span>
      </div>

      <label
        style={{
          display: 'block',
          fontWeight: 700,
          fontSize: '12px',
        }}
      >
        Observação da conferência{' '}
        <span
          className="muted"
          style={{
            fontWeight: 400,
          }}
        >
          (opcional)
        </span>

        <textarea
          value={observacao}
          maxLength={500}
          onChange={(event) =>
            setObservacao(
              event.target.value
            )
          }
          placeholder="Ex.: tomate com amadurecimento avançado; priorizar consumo."
          style={{
            width: '100%',
            minHeight: '110px',
            boxSizing:
              'border-box',
            marginTop: '7px',
            padding: '13px',
            borderRadius: '11px',
            border:
              '1px solid #315846',
            background: '#071a12',
            color: '#f8fafc',
            fontSize: '16px',
            lineHeight: 1.5,
            resize: 'vertical',
          }}
        />
      </label>

      <div
        className="muted"
        style={{
          marginTop: '5px',
          textAlign: 'right',
          fontSize: '10px',
        }}
      >
        {observacao.length}/500
      </div>

      {erro && (
        <div
          role="alert"
          style={{
            marginTop: '12px',
            padding: '11px',
            borderRadius: '10px',
            background:
              'rgba(239,68,68,.07)',
            border:
              '1px solid rgba(239,68,68,.5)',
            color: '#ef4444',
            fontSize: '11px',
            lineHeight: 1.45,
          }}
        >
          {erro}
        </div>
      )}

      <button
        type="button"
        className="btn"
        disabled={salvando}
        onClick={confirmar}
        style={{
          width: '100%',
          minHeight: '46px',
          marginTop: '14px',
        }}
      >
        {salvando
          ? 'Registrando...'
          : 'Confirmar conferência FLV'}
      </button>
    </section>
  );
}

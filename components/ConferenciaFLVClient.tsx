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
  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [conferencia, setConferencia] =
    useState<Conferencia | null>(null);

  const [observacao, setObservacao] =
    useState('');

  const [mensagem, setMensagem] =
    useState('');

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
        dados.conferencia || null
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
      <div
        className="card"
        style={{
          border:
            '1px solid #f59e0b',
          background:
            'rgba(245, 158, 11, 0.08)',
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          🥬 Conferência diária FLV
        </h2>

        <p className="muted">
          Verificando a conferência de
          hoje...
        </p>
      </div>
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
      <div
        className="card"
        style={{
          border:
            '1px solid #22c55e',
          background:
            'rgba(34, 197, 94, 0.07)',
        }}
      >
        <h2
          style={{
            marginTop: 0,
          }}
        >
          ✓ Conferência FLV realizada
        </h2>

        <p>
          Os gêneros FLV já foram
          conferidos hoje.
        </p>

        <div className="row">
          <span>
            Conferido por
          </span>

          <strong>
            {identificacao}
          </strong>
        </div>

        {conferencia.usuario
          .funcao && (
          <div className="row">
            <span>Função</span>

            <strong>
              {
                conferencia.usuario
                  .funcao
              }
            </strong>
          </div>
        )}

        {conferencia.observacao && (
          <div
            style={{
              marginTop: 12,
            }}
          >
            <span className="muted">
              Observação
            </span>

            <p
              style={{
                marginBottom: 0,
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
            className="success"
            style={{
              marginTop: 14,
            }}
          >
            {mensagem}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        border:
          '1px solid #f59e0b',
        background:
          'rgba(245, 158, 11, 0.08)',
      }}
    >
      <h2
        style={{
          marginTop: 0,
        }}
      >
        ⚠ Conferência diária FLV
      </h2>

      <p>
        A conferência dos gêneros
        FLV ainda não foi registrada
        hoje.
      </p>

      <p className="muted">
        Verifique fisicamente frutas,
        legumes e verduras,
        principalmente as condições de
        conservação, qualidade e
        quantidade disponível na Câmara
        de Resfriamento.
      </p>

      <label>
        Observação da conferência
        (opcional)

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
            minHeight: 80,
          }}
        />
      </label>

      {erro && (
        <div
          className="error"
          style={{
            marginTop: 12,
          }}
        >
          {erro}
        </div>
      )}

      <div
        className="actions"
        style={{
          marginTop: 14,
        }}
      >
        <button
          type="button"
          className="btn"
          disabled={salvando}
          onClick={confirmar}
        >
          {salvando
            ? 'Registrando...'
            : 'Confirmar conferência FLV'}
        </button>
      </div>
    </div>
  );
}

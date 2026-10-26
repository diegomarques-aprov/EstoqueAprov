'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

type Unidade = {
  sigla: string;
};

type Genero = {
  id: string;
  nome: string;
  unidade: Unidade;
  controlaLote: boolean;
  controlaValidade: boolean;
};

type Local = {
  id: string;
  nome: string;
};

export default function EstoqueInicialClient() {
  const [
    classe,
    setClasse,
  ] = useState<'QS' | 'QR'>(
    'QS'
  );

  const [
    generos,
    setGeneros,
  ] = useState<Genero[]>([]);

  const [
    locais,
    setLocais,
  ] = useState<Local[]>([]);

  const [
    generoId,
    setGeneroId,
  ] = useState('');

  const [
    localId,
    setLocalId,
  ] = useState('');

  const [
    quantidade,
    setQuantidade,
  ] = useState('');

  const [
    lote,
    setLote,
  ] = useState('');

  const [
    validade,
    setValidade,
  ] = useState('');

  const [
    mensagem,
    setMensagem,
  ] = useState('');

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const genero =
    generos.find(
      (item) =>
        item.id === generoId
    );

  async function carregar() {
    setMensagem('');

    const [
      respostaGeneros,
      respostaLocais,
    ] = await Promise.all([
      fetch(
        `/api/generos?classe=${classe}`
      ),
      fetch('/api/locais'),
    ]);

    const dadosGeneros =
      await respostaGeneros.json();

    const dadosLocais =
      await respostaLocais.json();

    setGeneros(
      Array.isArray(dadosGeneros)
        ? dadosGeneros
        : []
    );

    setLocais(
      Array.isArray(dadosLocais)
        ? dadosLocais
        : []
    );
  }

  useEffect(() => {
    setGeneroId('');
    setLote('');
    setValidade('');

    carregar();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classe]);

  async function salvar(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setMensagem('');
    setSalvando(true);

    try {
      const resposta =
        await fetch(
          '/api/estoque-inicial',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              generoId,
              localId,
              quantidade:
                Number(
                  quantidade
                ),
              lote:
                lote || null,
              validade:
                validade || null,
            }),
          }
        );

      const dados =
        await resposta.json();

      if (!resposta.ok) {
        setMensagem(
          dados.error ||
            'Não foi possível registrar o saldo inicial.'
        );

        return;
      }

      setMensagem(
        'Saldo inicial registrado com sucesso.'
      );

      setQuantidade('');
      setLote('');
      setValidade('');
    } catch {
      setMensagem(
        'Não foi possível registrar o saldo inicial.'
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '17px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            setClasse('QS')
          }
          style={{
            minHeight: '52px',
            borderRadius: '12px',
            border:
              classe === 'QS'
                ? '1px solid rgba(43,138,87,.8)'
                : '1px solid #284334',
            background:
              classe === 'QS'
                ? '#2b8a57'
                : '#102018',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          QS
          <span
            style={{
              display: 'block',
              marginTop: '2px',
              fontSize: '10px',
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Cadeia de suprimento
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setClasse('QR')
          }
          style={{
            minHeight: '52px',
            borderRadius: '12px',
            border:
              classe === 'QR'
                ? '1px solid rgba(43,138,87,.8)'
                : '1px solid #284334',
            background:
              classe === 'QR'
                ? '#2b8a57'
                : '#102018',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          QR
          <span
            style={{
              display: 'block',
              marginTop: '2px',
              fontSize: '10px',
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Compra local
          </span>
        </button>
      </div>

      <div
        style={{
          padding: '11px 12px',
          marginBottom: '16px',
          borderRadius: '11px',
          background: '#0c1811',
          border: '1px solid #284334',
        }}
      >
        <div
          className="muted"
          style={{
            fontSize: '11px',
            marginBottom: '3px',
          }}
        >
          Classe selecionada
        </div>

        <strong
          style={{
            fontSize: '14px',
          }}
        >
          {classe === 'QS'
            ? 'QS — Cadeia de suprimento'
            : 'QR — Compra local'}
        </strong>
      </div>

      <form
        onSubmit={salvar}
        style={{
          display: 'grid',
          gap: '14px',
        }}
      >
        <label>
          Gênero

          <select
            value={generoId}
            onChange={(evento) => {
              setGeneroId(
                evento.target.value
              );

              setLote('');
              setValidade('');
              setMensagem('');
            }}
            required
          >
            <option value="">
              Selecione o gênero
            </option>

            {generos.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.nome} ·{' '}
                  {item.unidade.sigla}
                </option>
              )
            )}
          </select>
        </label>

        {genero && (
          <div
            style={{
              padding: '11px 12px',
              borderRadius: '11px',
              background:
                'rgba(43,138,87,.07)',
              border:
                '1px solid rgba(43,138,87,.35)',
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
                <div
                  className="muted"
                  style={{
                    fontSize: '10px',
                  }}
                >
                  Gênero selecionado
                </div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '2px',
                    fontSize: '13px',
                  }}
                >
                  {genero.nome}
                </strong>
              </div>

              <span
                style={{
                  flexShrink: 0,
                  padding: '4px 7px',
                  borderRadius:
                    '999px',
                  background:
                    '#183d2a',
                  border:
                    '1px solid #284334',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                {genero.unidade.sigla}
              </span>
            </div>

            <div
              className="muted"
              style={{
                marginTop: '8px',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              {genero.controlaLote
                ? 'Lote obrigatório'
                : 'Sem controle de lote'}

              {' · '}

              {genero.controlaValidade
                ? 'Validade obrigatória'
                : 'Sem controle de validade'}
            </div>
          </div>
        )}

        <label>
          Local de armazenamento

          <select
            value={localId}
            onChange={(evento) =>
              setLocalId(
                evento.target.value
              )
            }
            required
          >
            <option value="">
              Selecione o local
            </option>

            {locais.map(
              (local) => (
                <option
                  key={local.id}
                  value={local.id}
                >
                  {local.nome}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Quantidade

          <input
            type="number"
            step="0.001"
            min="0.001"
            value={quantidade}
            onChange={(evento) =>
              setQuantidade(
                evento.target.value
              )
            }
            placeholder={
              genero
                ? `Quantidade em ${genero.unidade.sigla}`
                : 'Informe a quantidade'
            }
            required
          />
        </label>

        {genero?.controlaLote && (
          <label>
            Lote

            <input
              value={lote}
              onChange={(evento) =>
                setLote(
                  evento.target.value
                )
              }
              placeholder="Informe o lote"
              required
            />
          </label>
        )}

        {genero?.controlaValidade && (
          <label>
            Validade

            <input
              type="date"
              value={validade}
              onChange={(evento) =>
                setValidade(
                  evento.target.value
                )
              }
              required
            />
          </label>
        )}

        {genero &&
          !genero.controlaLote && (
            <div
              style={{
                padding: '11px 12px',
                borderRadius:
                  '11px',
                background:
                  '#0c1811',
                border:
                  '1px solid #284334',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              <span className="muted">
                O gênero selecionado não
                exige informação de lote.
              </span>
            </div>
          )}

        <button
          type="submit"
          className="btn"
          disabled={salvando}
          style={{
            width: '100%',
            minHeight: '46px',
          }}
        >
          {salvando
            ? 'Registrando...'
            : 'Registrar saldo inicial'}
        </button>

        {mensagem && (
          <div
            style={{
              padding: '12px',
              borderRadius: '11px',
              background:
                mensagem.includes(
                  'sucesso'
                )
                  ? 'rgba(43,138,87,.08)'
                  : 'rgba(245,158,11,.08)',
              border:
                mensagem.includes(
                  'sucesso'
                )
                  ? '1px solid rgba(43,138,87,.45)'
                  : '1px solid rgba(245,158,11,.45)',
              fontSize: '12px',
              lineHeight: 1.45,
            }}
          >
            {mensagem}
          </div>
        )}
      </form>
    </>
  );
}

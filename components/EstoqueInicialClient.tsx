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

  useEffect(() => {
    if (
      !mensagem.includes(
        'sucesso'
      )
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setMensagem('');
        },
        4000
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [mensagem]);

  function alterarClasse(
    novaClasse: 'QS' | 'QR'
  ) {
    setClasse(novaClasse);
    setGeneroId('');
    setLote('');
    setValidade('');
    setMensagem('');
  }

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
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() =>
            alterarClasse('QS')
          }
          style={{
            minHeight: '38px',
            padding: '6px 16px',
            borderRadius: '9px',
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
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          QS
          <span
            style={{
              marginLeft: '6px',
              fontSize: '9px',
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
            alterarClasse('QR')
          }
          style={{
            minHeight: '38px',
            padding: '6px 16px',
            borderRadius: '9px',
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
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          QR
          <span
            style={{
              marginLeft: '6px',
              fontSize: '9px',
              fontWeight: 500,
              opacity: 0.8,
            }}
          >
            Compra local
          </span>
        </button>
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
              padding: '10px 12px',
              borderRadius: '10px',
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
                <strong
                  style={{
                    display: 'block',
                    fontSize: '13px',
                  }}
                >
                  {genero.nome}
                </strong>

                <div
                  className="muted"
                  style={{
                    marginTop: '4px',
                    fontSize: '10px',
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

        <div>
          <button
            type="submit"
            className="btn"
            disabled={salvando}
            style={{
              width: 'auto',
              minHeight: '36px',
              padding: '7px 13px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {salvando
              ? 'Registrando...'
              : '+ Registrar saldo inicial'}
          </button>
        </div>

        {mensagem && (
          <div
            role={
              mensagem.includes(
                'sucesso'
              )
                ? 'status'
                : 'alert'
            }
            style={{
              padding: '11px 12px',
              borderRadius: '10px',

              background:
                mensagem.includes(
                  'sucesso'
                )
                  ? '#123d27'
                  : 'rgba(245,158,11,.08)',

              border:
                mensagem.includes(
                  'sucesso'
                )
                  ? '1px solid #2f9e62'
                  : '1px solid rgba(245,158,11,.45)',

              color:
                mensagem.includes(
                  'sucesso'
                )
                  ? '#b9f6cf'
                  : undefined,

              fontSize: '12px',
              lineHeight: 1.45,
              fontWeight:
                mensagem.includes(
                  'sucesso'
                )
                  ? 800
                  : 400,
            }}
          >
            {mensagem.includes(
              'sucesso'
            )
              ? `✓ ${mensagem}`
              : mensagem}
          </div>
        )}
      </form>
    </>
  );
}

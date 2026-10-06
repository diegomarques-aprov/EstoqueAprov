'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Local = {
  id: string;
  nome: string;
  descricao?: string | null;
  situacao?: string;
};

export default function LocaisClient() {
  const [locais, setLocais] = useState<Local[]>([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarLocais, setMostrarLocais] = useState(false);
  const [editando, setEditando] = useState<Local | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [descricaoEdicao, setDescricaoEdicao] = useState('');
  const nomeRef = useRef<HTMLInputElement>(null);

  async function carregarLocais() {
    const r = await fetch('/api/locais');

    if (r.ok) {
      setLocais(await r.json());
    }
  }

  useEffect(() => {
    carregarLocais();
  }, []);

  async function adicionar(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const form = ev.currentTarget;
    const dados = new FormData(form);

    setErro('');
    setSucesso('');

    const r = await fetch('/api/locais', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(dados)),
    });

    const resposta = await r.json();

    if (!r.ok) {
      setErro(
        resposta.error ||
          'Não foi possível cadastrar o local. Verifique os dados informados.'
      );
      return;
    }

    form.reset();
    setSucesso('Local cadastrado com sucesso.');

    await carregarLocais();

    nomeRef.current?.focus();
  }

  function iniciarEdicao(local: Local) {
    setEditando(local);
    setNomeEdicao(local.nome);
    setDescricaoEdicao(local.descricao || '');
    setErro('');
    setSucesso('');
  }

  function cancelarEdicao() {
    setEditando(null);
    setNomeEdicao('');
    setDescricaoEdicao('');
    setErro('');
  }

  async function salvarEdicao(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (!editando) return;

    setErro('');
    setSucesso('');

    const r = await fetch('/api/locais', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        id: editando.id,
        nome: nomeEdicao,
        descricao: descricaoEdicao,
      }),
    });

    const resposta = await r.json();

    if (!r.ok) {
      setErro(
        resposta.error ||
          'Não foi possível atualizar o local. Verifique os dados informados.'
      );
      return;
    }

    setEditando(null);
    setNomeEdicao('');
    setDescricaoEdicao('');
    setSucesso('Local atualizado com sucesso.');

    await carregarLocais();
  }

  return (
    <>
      <div className="card">
        <h2>Novo local</h2>

        <form onSubmit={adicionar}>
          <label>Nome</label>
          <input
            ref={nomeRef}
            name="nome"
            required
            autoFocus
          />

          <label>Descrição</label>
          <input name="descricao" />

          <button className="btn" type="submit">
            Adicionar local
          </button>

          {sucesso && !editando && (
            <p role="status">
              <strong>✓ {sucesso}</strong>
            </p>
          )}

          {erro && !editando && (
            <p className="error" role="alert">
              {erro}
            </p>
          )}
        </form>
      </div>

      <div className="card">
        <button
          type="button"
          className="linkbtn"
          onClick={() => setMostrarLocais(!mostrarLocais)}
        >
          {mostrarLocais
            ? 'Ocultar locais cadastrados'
            : `Ver locais cadastrados (${locais.length})`}
        </button>

        {mostrarLocais && (
          <>
            <h2>Locais cadastrados</h2>

            {locais.length ? (
              locais.map((local) => (
                <div className="row" key={local.id}>
                  {editando?.id === local.id ? (
                    <form onSubmit={salvarEdicao} style={{ width: '100%' }}>
                      <h3>Editar local</h3>

                      <label>Nome</label>
                      <input
                        value={nomeEdicao}
                        onChange={(e) => setNomeEdicao(e.target.value)}
                        required
                        autoFocus
                      />

                      <label>Descrição</label>
                      <input
                        value={descricaoEdicao}
                        onChange={(e) => setDescricaoEdicao(e.target.value)}
                      />

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '12px',
                        }}
                      >
                        <button className="btn" type="submit">
                          Salvar alterações
                        </button>

                        <button
                          className="linkbtn"
                          type="button"
                          onClick={cancelarEdicao}
                        >
                          Cancelar
                        </button>
                      </div>

                      {erro && (
                        <p className="error" role="alert">
                          {erro}
                        </p>
                      )}
                    </form>
                  ) : (
                    <>
                      <div>
                        <b>{local.nome}</b>

                        <div className="muted">
                          {local.descricao || 'Sem descrição'}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span className="tag">
                          {local.situacao || 'ATIVO'}
                        </span>

                        <button
                          type="button"
                          className="linkbtn"
                          onClick={() => iniciarEdicao(local)}
                        >
                          Editar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">Nenhum local cadastrado.</p>
            )}

            {sucesso && !editando && (
              <p role="status">
                <strong>✓ {sucesso}</strong>
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}

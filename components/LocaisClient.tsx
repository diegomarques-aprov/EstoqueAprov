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

          {sucesso && (
            <p role="status">
              <strong>✓ {sucesso}</strong>
            </p>
          )}

          {erro && (
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
                  <div>
                    <b>{local.nome}</b>
                    <div className="muted">
                      {local.descricao || 'Sem descrição'}
                    </div>
                  </div>

                  <span className="tag">
                    {local.situacao || 'ATIVO'}
                  </span>
                </div>
              ))
            ) : (
              <p className="muted">Nenhum local cadastrado.</p>
            )}
          </>
        )}
      </div>
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupForm() {
  const router = useRouter();

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] =
    useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCarregando(true);
    setErro('');

    const form = new FormData(
      event.currentTarget
    );

    const resposta = await fetch(
      '/api/setup/admin',
      {
        method: 'POST',

        headers: {
          'content-type':
            'application/json',
        },

        body: JSON.stringify(
          Object.fromEntries(form)
        ),
      }
    );

    const json =
      await resposta.json();

    setCarregando(false);

    if (!resposta.ok) {
      setErro(json.error);
      return;
    }

    router.push('/inicio');
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <label>
        Nome completo
      </label>

      <input
        name="nome"
        required
      />

      <label>
        Posto/Graduação
      </label>

      <input
        name="postoGraduacao"
        placeholder="Ex.: Sgt"
      />

      <label>
        Função
      </label>

      <input
        name="funcao"
        placeholder="Ex.: Adj Aprov"
      />

      <label>
        Login
      </label>

      <input
        name="login"
        required
        minLength={3}
      />

      <label>
        Senha
      </label>

      <input
        name="senha"
        type="password"
        required
        minLength={8}
      />

      {erro && (
        <p className="error">
          {erro}
        </p>
      )}

      <button
        className="btn"
        disabled={carregando}
      >
        {carregando
          ? 'Salvando...'
          : 'Criar Administrador Principal'}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErro('');
    setCarregando(true);

    const form = new FormData(event.currentTarget);

    try {
      const resposta = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(
          Object.fromEntries(form)
        ),
      });

      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(
          json.error || 'Não foi possível entrar.'
        );
        return;
      }

      router.push('/inicio');
      router.refresh();
    } catch {
      setErro(
        'Não foi possível entrar no sistema.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>Usuário</label>

      <input
        name="login"
        autoComplete="username"
        required
      />

      <label>Senha</label>

      <input
        name="senha"
        type="password"
        autoComplete="current-password"
        required
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
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function sair() {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    router.push('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      aria-label="Sair do EstoqueAprov"
      style={{
        position: 'fixed',
        left: '16px',
        bottom:
          'calc(16px + env(safe-area-inset-bottom))',
        zIndex: 100,
        minHeight: '38px',
        padding: '8px 14px',
        borderRadius: '10px',
        border: '1px solid #315846',
        background: '#102018',
        color: '#f8fafc',
        fontSize: '12px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow:
          '0 5px 16px rgba(0, 0, 0, 0.25)',
        WebkitTapHighlightColor:
          'transparent',
        touchAction: 'manipulation',
      }}
    >
      Sair
    </button>
  );
}

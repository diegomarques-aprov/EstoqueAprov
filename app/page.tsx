import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      <Link
        href="/login"
        aria-label="Entrar no EstoqueAprov"
        title="Entrar no EstoqueAprov"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      >
        <img
          src="/abertura-estoqueaprov.jpg.jpeg"
          alt="EstoqueAprov - Entrar"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            display: 'block',
          }}
        />
      </Link>
    </main>
  );
}

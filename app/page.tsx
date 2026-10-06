import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        zIndex: 9999,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <Link
        href="/login"
        aria-label="Entrar no EstoqueAprov"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          margin: 0,
          padding: 0,
        }}
      >
        <img
          src="/abertura-estoqueaprov.jpg.jpeg"
          alt="EstoqueAprov"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            objectFit: 'cover',
            objectPosition: 'center',
            margin: 0,
            padding: 0,
            display: 'block',
          }}
        />
      </Link>
    </div>
  );
}

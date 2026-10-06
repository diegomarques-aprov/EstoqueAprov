import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main
      style={{
        width: '100vw',
        height: '100dvh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      <img
        src="/abertura-estoqueaprov.jpg"
        alt="EstoqueAprov"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />

      <Link
        href="/login"
        aria-label="Entrar no EstoqueAprov"
        title="Entrar"
        style={{
          position: 'absolute',
          left: '40.5%',
          top: '44%',
          width: '19%',
          height: '10%',
          display: 'block',
          borderRadius: '18px',
          cursor: 'pointer',
        }}
      />
    </main>
  );
}

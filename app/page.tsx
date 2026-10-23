import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100dvh',
        margin: 0,
        padding: 0,
        zIndex: 9999,
        background: '#07110b',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/abertura-estoqueaprov.jpg.jpeg"
        alt="EstoqueAprov"
        draggable={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          margin: 0,
          padding: 0,
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      <Link
        href="/login"
        aria-label="Entrar no EstoqueAprov"
        className="botao-entrar"
      >
        <span className="texto-acessivel">
          Entrar
        </span>
      </Link>

      <style>{`
        .botao-entrar {
          position: absolute;

          left: 50%;
          top: 48.4%;

          width: 22%;
          max-width: 330px;
          min-width: 190px;

          height: 8.5%;
          max-height: 78px;
          min-height: 52px;

          transform: translate(-50%, -50%);

          display: block;

          margin: 0;
          padding: 0;

          border: 0;
          border-radius: 16px;

          background: transparent;

          cursor: pointer;
          z-index: 10000;

          text-decoration: none;

          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;

          transition:
            transform 90ms ease,
            filter 90ms ease;
        }

        .botao-entrar:active {
          transform:
            translate(-50%, calc(-50% + 6px))
            scale(0.98);

          filter: brightness(0.82);
        }

        .botao-entrar:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 3px;
        }

        .texto-acessivel {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (max-width: 600px) {
          .botao-entrar {
            width: 48vw;
            max-width: 290px;
            min-width: 170px;

            height: 64px;
            min-height: 56px;
          }
        }
      `}</style>
    </div>
  );
}

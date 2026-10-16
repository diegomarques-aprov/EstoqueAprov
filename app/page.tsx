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
      <img
        src="/abertura-estoqueaprov.jpg.jpeg"
        alt="EstoqueAprov"
        draggable={false}
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
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      <Link
        href="/login"
        aria-label="Entrar no EstoqueAprov"
        className="botao-entrar"
      >
        Entrar
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

          display: flex;
          align-items: center;
          justify-content: center;

          box-sizing: border-box;

          border: 2px solid #d7c94b;
          border-radius: 16px;

          background:
            linear-gradient(
              180deg,
              #164d35 0%,
              #0d3c2a 100%
            );

          color: #ffffff;

          font-size: clamp(22px, 2vw, 31px);
          font-weight: 700;
          line-height: 1;

          text-decoration: none;
          text-shadow:
            0 2px 3px rgba(0, 0, 0, 0.65);

          box-shadow:
            0 7px 0 #08291d,
            0 10px 16px rgba(0, 0, 0, 0.35);

          cursor: pointer;
          z-index: 10000;

          user-select: none;
          -webkit-user-select: none;

          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;

          transition:
            transform 80ms ease,
            box-shadow 80ms ease,
            filter 80ms ease;
        }

        .botao-entrar:hover {
          filter: brightness(1.06);
        }

        /*
         * Agora o botão VISÍVEL realmente
         * desce ao ser pressionado.
         */
        .botao-entrar:active {
          transform:
            translate(-50%, calc(-50% + 7px));

          box-shadow:
            0 1px 0 #08291d,
            0 3px 7px rgba(0, 0, 0, 0.28);

          filter: brightness(0.9);
        }

        .botao-entrar:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 4px;
        }

        @media (max-width: 600px) {
          .botao-entrar {
            width: 46vw;
            max-width: 290px;
            min-width: 170px;

            height: 64px;
            min-height: 56px;

            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}

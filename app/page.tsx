import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="splash">
      <img
        src="/abertura-estoqueaprov.jpg.jpeg"
        alt="EstoqueAprov"
        className="splashImage"
        draggable={false}
      />

      <Link
        href="/login"
        className="entrar"
        aria-label="Entrar no EstoqueAprov"
      >
        <span className="srOnly">
          Entrar
        </span>
      </Link>

      <style>{`
        .splash {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: #000;
          z-index: 9999;
        }

        .splashImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: none;
          object-fit: cover;
          object-position: center;
          display: block;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }

        /*
         * Área clicável posicionada
         * exclusivamente sobre o botão
         * ENTRAR da imagem.
         */
        .entrar {
          position: absolute;

          left: 50%;
          top: 77%;

          transform:
            translate(-50%, -50%);

          width: min(42vw, 320px);
          height: clamp(55px, 8vh, 78px);

          display: block;

          border-radius: 18px;

          cursor: pointer;

          z-index: 10000;

          background:
            rgba(255,255,255,0.001);

          -webkit-tap-highlight-color:
            transparent;

          touch-action: manipulation;

          transition:
            transform 100ms ease,
            filter 100ms ease;
        }

        /*
         * Efeito de pressionar o botão.
         */
        .entrar:active {
          transform:
            translate(-50%, calc(-50% + 7px))
            scale(0.97);

          filter: brightness(0.8);
        }

        .entrar:focus-visible {
          outline: 3px solid #fff;
          outline-offset: 4px;
        }

        .srOnly {
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

        /*
         * Ajuste para telas menores,
         * principalmente iPhone.
         */
        @media (max-width: 600px) {
          .entrar {
            top: 78%;
            width: min(55vw, 300px);
            height: 64px;
          }
        }
      `}</style>
    </main>
  );
}

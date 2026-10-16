import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
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
          inset: 0,
          width: '100%',
          height: '100%',
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
        style={{
          position: 'absolute',

          /*
           * O botão fica sobre a região
           * "ENTRAR" existente na imagem.
           *
           * Somente esta área é clicável.
           */
          left: '50%',
          bottom: '12.5%',
          transform: 'translateX(-50%)',

          width: 'clamp(190px, 20vw, 300px)',
          height: 'clamp(52px, 7vh, 72px)',

          borderRadius: 14,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          /*
           * O botão da própria arte
           * continua visível.
           */
          background: 'transparent',

          textDecoration: 'none',
          WebkitTapHighlightColor: 'transparent',

          /*
           * Dá sensação de botão real.
           */
          cursor: 'pointer',

          zIndex: 2,
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            transition:
              'transform 90ms ease, box-shadow 90ms ease',
          }}
        />

        <span
          style={{
            /*
             * Texto invisível apenas para
             * acessibilidade. O texto ENTRAR
             * já está desenhado na imagem.
             */
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Entrar
        </span>
      </Link>

      <style>
        {`
          a[aria-label="Entrar no EstoqueAprov"] {
            transition:
              transform 90ms ease,
              filter 90ms ease;
          }

          a[aria-label="Entrar no EstoqueAprov"]:hover {
            filter: brightness(1.08);
          }

          a[aria-label="Entrar no EstoqueAprov"]:active {
            transform:
              translateX(-50%)
              translateY(6px)
              scale(0.98);

            filter: brightness(0.88);
          }

          a[aria-label="Entrar no EstoqueAprov"]:focus-visible {
            outline: 3px solid white;
            outline-offset: 4px;
          }
        `}
      </style>
    </div>
  );
}

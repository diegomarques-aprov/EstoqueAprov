import Link from 'next/link';

type Props = {
  voltarHref?: string;
  voltarTexto?: string;
  mostrarInicio?: boolean;
};

export default function NavegacaoInferior({
  voltarHref,
  voltarTexto = 'Voltar',
  mostrarInicio = true,
}: Props) {
  return (
    <nav
      aria-label="Navegação inferior"
      style={{
        marginTop: 32,
        paddingTop: 20,
        paddingBottom:
          'calc(20px + env(safe-area-inset-bottom))',
        borderTop:
          '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {voltarHref && (
          <Link
            href={voltarHref}
            className="btn"
            style={{
              flex: '1 1 140px',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            ← {voltarTexto}
          </Link>
        )}

        {mostrarInicio && (
          <Link
            href="/inicio"
            className="btn"
            style={{
              flex: '1 1 140px',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            ⌂ Início
          </Link>
        )}
      </div>
    </nav>
  );
}

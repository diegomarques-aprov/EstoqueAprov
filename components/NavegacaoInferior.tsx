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
  const estiloBotao = {
    flex: '1 1 140px',
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    textDecoration: 'none',
    background: '#7a4b27',
    border: '1px solid #a86f3d',
    color: '#fff4e8',
    borderRadius: 10,
    padding: '11px 17px',
    fontWeight: 800,
  };

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
            style={estiloBotao}
          >
            ← {voltarTexto}
          </Link>
        )}

        {mostrarInicio && (
          <Link
            href="/inicio"
            style={estiloBotao}
          >
            ⌂ Início
          </Link>
        )}
      </div>
    </nav>
  );
}

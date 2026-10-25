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
  const estiloLink = {
    display: 'inline-block',
    color: '#d6a56d',
    textDecoration: 'none',
    fontWeight: 700,
  };

  return (
    <nav
      aria-label="Navegação inferior"
      style={{
        marginTop: 28,
        paddingTop: 16,
        paddingBottom:
          'calc(12px + env(safe-area-inset-bottom))',
        borderTop:
          '1px solid rgba(255,255,255,0.10)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          flexWrap: 'wrap',
        }}
      >
        {voltarHref && (
          <Link
            href={voltarHref}
            style={estiloLink}
          >
            ← {voltarTexto}
          </Link>
        )}

        {mostrarInicio && (
          <Link
            href="/inicio"
            style={estiloLink}
          >
            ← Início
          </Link>
        )}
      </div>
    </nav>
  );
}

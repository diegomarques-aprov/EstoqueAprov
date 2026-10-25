import Link from 'next/link';

type Props = {
  voltarHref?: string;
  voltarTexto?: string;
};

export default function NavegacaoInferior({
  voltarHref,
  voltarTexto = 'Voltar',
}: Props) {
  return (
    <nav
      className="navigation-footer"
      aria-label="Navegação inferior"
    >
      <div className="navigation-footer-inner">
        {voltarHref && (
          <Link
            href={voltarHref}
            className="navigation-footer-link"
          >
            ← {voltarTexto}
          </Link>
        )}

        <Link
          href="/inicio"
          className="navigation-footer-link"
        >
          ← Início
        </Link>
      </div>
    </nav>
  );
}

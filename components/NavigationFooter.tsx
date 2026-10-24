'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationFooter() {
  const pathname = usePathname();

  /*
   * Telas que não precisam
   * de navegação inferior.
   */
  const ocultar =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/inicio';

  if (ocultar) {
    return null;
  }

  return (
    <footer className="navigation-footer">
      <div className="navigation-footer-inner">
        <Link
          href="/inicio"
          className="navigation-footer-link"
        >
          ← Início
        </Link>
      </div>
    </footer>
  );
}

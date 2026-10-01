import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'EstoqueAprov',
  description: 'Sistema de Controle do Aprovisionamento',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'EstoqueAprov', statusBarStyle: 'black-translucent' },
};
export const viewport: Viewport = { themeColor: '#1f6f3d', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="pt-BR"><body>{children}</body></html>
}

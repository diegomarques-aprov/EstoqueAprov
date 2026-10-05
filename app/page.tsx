import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  if ((await prisma.usuario.count()) === 0) {
    redirect('/configuracao-inicial');
  }

  if (await currentUser()) {
    redirect('/dashboard');
  }

  redirect('/login');
}

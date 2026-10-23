import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    'AUTH_SECRET não está configurado. Defina uma chave segura nas variáveis de ambiente.'
  );
}

const secret = new TextEncoder().encode(
  authSecret
);

const COOKIE =
  'estoqueaprov_session';

export async function createSession(
  userId: string
) {
  const token = await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: 'HS256',
    })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret);

  const store = await cookies();

  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure:
      process.env.NODE_ENV ===
      'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSession() {
  const store = await cookies();

  store.delete(COOKIE);
}

export async function currentUser() {
  const store = await cookies();

  const token =
    store.get(COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        secret
      );

    if (!payload.userId) {
      return null;
    }

    return prisma.usuario.findFirst({
      where: {
        id: String(
          payload.userId
        ),
        situacao: 'ATIVO',
      },

      select: {
        id: true,
        nome: true,
        postoGraduacao: true,
        funcao: true,
        login: true,
        perfil: true,
      },
    });
  } catch {
    return null;
  }
}

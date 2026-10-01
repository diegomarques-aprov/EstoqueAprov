import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'troque-esta-chave-em-producao');
const COOKIE = 'estoqueaprov_session';

export async function createSession(userId:string){
  const token = await new SignJWT({ userId }).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('12h').sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*12});
}
export async function clearSession(){ (await cookies()).delete(COOKIE); }
export async function currentUser(){
  const token=(await cookies()).get(COOKIE)?.value; if(!token) return null;
  try { const {payload}=await jwtVerify(token,secret); if(!payload.userId) return null;
    return prisma.usuario.findFirst({where:{id:String(payload.userId),situacao:'ATIVO'},select:{id:true,nome:true,postoGraduacao:true,funcao:true,login:true,perfil:true}});
  } catch { return null; }
}

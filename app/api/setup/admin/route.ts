import bcrypt from 'bcryptjs'; import { z } from 'zod'; import { prisma } from '@/lib/prisma'; import { createSession } from '@/lib/auth';
const schema=z.object({nome:z.string().min(3),postoGraduacao:z.string().optional(),funcao:z.string().optional(),login:z.string().min(3),senha:z.string().min(8)});
export async function POST(req:Request){
  if(await prisma.usuario.count()>0) return Response.json({error:'A configuração inicial já foi concluída.'},{status:409});
  const parsed=schema.safeParse(await req.json()); if(!parsed.success) return Response.json({error:'Confira os campos. A senha deve ter pelo menos 8 caracteres.'},{status:400});
  const {senha,...data}=parsed.data; const senhaHash=await bcrypt.hash(senha,12);
  const user=await prisma.$transaction(async tx=>{const u=await tx.usuario.create({data:{...data,senhaHash,perfil:'ADMIN_PRINCIPAL'}}); await tx.auditoria.create({data:{usuarioId:u.id,acao:'CRIAR',entidade:'Usuario',entidadeId:u.id,dadosNovos:{perfil:'ADMIN_PRINCIPAL'}}}); return u;});
  await createSession(user.id); return Response.json({ok:true});
}

import { currentUser } from './auth';
export async function requireAdmin(){const u=await currentUser(); if(!u) return {error:Response.json({error:'Sessão expirada. Entre novamente.'},{status:401})}; if(!['ADMIN_PRINCIPAL','ADMINISTRADOR'].includes(u.perfil)) return {error:Response.json({error:'Esta operação exige perfil de Administrador.'},{status:403})}; return {user:u};}

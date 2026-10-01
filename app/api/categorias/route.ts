import { prisma } from '@/lib/prisma'; import { requireAdmin } from '@/lib/guard';
export async function GET(){const g=await requireAdmin();if(g.error)return g.error;return Response.json(await prisma.categoria.findMany({where:{situacao:'ATIVO'},include:{localPadrao:true},orderBy:{nome:'asc'}}));}

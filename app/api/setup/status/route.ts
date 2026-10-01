import { prisma } from '@/lib/prisma';
export async function GET(){ const count=await prisma.usuario.count(); return Response.json({needsSetup:count===0}); }

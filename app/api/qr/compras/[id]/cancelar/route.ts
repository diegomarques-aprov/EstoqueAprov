import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {requireAdmin} from '@/lib/guard';

const body=z.object({motivo:z.string().trim().min(3,'Informe o motivo do cancelamento.')});

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
  const g=await requireAdmin(); if(g.error)return g.error;
  const p=body.safeParse(await req.json());
  if(!p.success)return Response.json({error:'Para cancelar o empenho, informe o motivo.'},{status:400});
  const {id}=await params;
  try{
    const r=await prisma.$transaction(async tx=>{
      const compra=await tx.compraQR.findUnique({where:{id},include:{recebimentos:{select:{id:true}}}});
      if(!compra)throw new Error('NAO_ENCONTRADA');
      if(compra.status==='CANCELADA')throw new Error('JA_CANCELADA');
      if(compra.recebimentos.length>0)throw new Error('COM_RECEBIMENTO');
      const estornoExistente=await tx.movimentacaoFinanceiraQR.findFirst({where:{compraId:id,tipo:'ESTORNO'}});
      if(estornoExistente)throw new Error('JA_ESTORNADA');
      const ult=await tx.movimentacaoFinanceiraQR.findFirst({orderBy:[{criadoEm:'desc'},{id:'desc'}]});
      const anterior=ult?Number(ult.saldoResultante):0;
      const valor=Number(compra.valorEmpenhado);
      const mov=await tx.movimentacaoFinanceiraQR.create({data:{tipo:'ESTORNO',valor,saldoAnterior:anterior,saldoResultante:anterior+valor,documento:compra.documento,observacao:`Cancelamento da compra QR nº ${compra.numero}: ${p.data.motivo}`,compraId:id,usuarioId:g.user!.id}});
      await tx.compraQR.update({where:{id},data:{status:'CANCELADA',canceladaEm:new Date(),motivoCancelamento:p.data.motivo}});
      return {numero:compra.numero,valorEstornado:valor,saldoAnterior:anterior,saldoResultante:Number(mov.saldoResultante)};
    });
    return Response.json(r);
  }catch(e:any){
    const m=String(e?.message||e);
    if(m.includes('NAO_ENCONTRADA'))return Response.json({error:'Compra QR não encontrada.'},{status:404});
    if(m.includes('JA_CANCELADA')||m.includes('JA_ESTORNADA'))return Response.json({error:'Este empenho QR já foi cancelado/estornado.'},{status:400});
    if(m.includes('COM_RECEBIMENTO'))return Response.json({error:'Este empenho já possui recebimento físico. Para preservar a rastreabilidade, regularize o saldo pendente em vez de cancelar toda a compra.'},{status:400});
    throw e;
  }
}

import {z} from 'zod';
import {prisma} from '@/lib/prisma';
import {requireAdmin} from '@/lib/guard';

const body=z.object({
  classe:z.enum(['QS','QR']),
  destino:z.enum(['CAFE_DA_MANHA','ALMOCO','JANTAR','CEIA','OUTRO']),
  data:z.string(),
  observacao:z.string().optional(),
  itens:z.array(z.object({generoId:z.string(),quantidade:z.number().positive()})).min(1)
});

export async function POST(req:Request){
  const guard=await requireAdmin(); if(guard.error)return guard.error;
  const parsed=body.safeParse(await req.json());
  if(!parsed.success)return Response.json({error:'Revise os dados da saída e as quantidades informadas.'},{status:400});
  const ids=[...new Set(parsed.data.itens.map(i=>i.generoId))];
  if(ids.length!==parsed.data.itens.length)return Response.json({error:'O mesmo gênero foi informado mais de uma vez. Some as quantidades em um único item.'},{status:400});
  const generos=await prisma.genero.findMany({where:{id:{in:ids},situacao:'ATIVO'},include:{unidade:true}});
  for(const item of parsed.data.itens){const g=generos.find(x=>x.id===item.generoId);if(!g||g.classe!==parsed.data.classe)return Response.json({error:'Há gênero incompatível com a classificação da saída.'},{status:400});}

  try{
    const saida=await prisma.$transaction(async tx=>{
      const out=await tx.saida.create({data:{classe:parsed.data.classe,destino:parsed.data.destino,data:new Date(parsed.data.data),observacao:parsed.data.observacao,criadoPorId:guard.user!.id}});
      for(const item of parsed.data.itens){
        const genero=generos.find(x=>x.id===item.generoId)!;
        const rows=await tx.estoqueLocal.findMany({where:{generoId:item.generoId,quantidade:{gt:0}},include:{lote:true},orderBy:[{lote:{validade:'asc'}},{atualizadoEm:'asc'}]});
        const disponivel=rows.reduce((s,r)=>s+Number(r.quantidade),0);
        if(disponivel+1e-9<item.quantidade)throw new Error(`ESTOQUE:${genero.nome}:${disponivel}:${genero.unidade.sigla}`);
        let restante=item.quantidade;
        for(const row of rows){
          if(restante<=1e-9)break;
          if(row.lote?.validade && row.lote.validade < new Date(new Date().toDateString())) continue;
          const atual=Number(row.quantidade); const retirar=Math.min(atual,restante); if(retirar<=0)continue;
          await tx.estoqueLocal.update({where:{id:row.id},data:{quantidade:{decrement:retirar}}});
          await tx.movimentacaoEstoque.create({data:{tipo:'SAIDA',classe:parsed.data.classe,generoId:item.generoId,loteId:row.loteId,localOrigemId:row.localId,quantidade:retirar,referenciaTipo:'Saida',referenciaId:out.id,observacao:`Destino: ${parsed.data.destino}`,usuarioId:guard.user!.id}});
          restante-=retirar;
        }
        if(restante>1e-9)throw new Error(`VALIDADE:${genero.nome}:${genero.unidade.sigla}`);
        await tx.itemSaida.create({data:{saidaId:out.id,generoId:item.generoId,quantidade:item.quantidade}});
      }
      return out;
    });
    return Response.json({id:saida.id,numero:saida.numero});
  }catch(e){
    const m=e instanceof Error?e.message:'';
    if(m.startsWith('ESTOQUE:')){const[,nome,saldo,un]=m.split(':');return Response.json({error:`Estoque insuficiente para ${nome}. Disponível: ${Number(saldo).toLocaleString('pt-BR')} ${un}.`},{status:409});}
    if(m.startsWith('VALIDADE:')){const[,nome]=m.split(':');return Response.json({error:`${nome}: o saldo disponível está em lote vencido ou bloqueado para consumo.`},{status:409});}
    console.error(e);return Response.json({error:'Não foi possível confirmar a saída. Nenhuma baixa foi efetivada.'},{status:500});
  }
}

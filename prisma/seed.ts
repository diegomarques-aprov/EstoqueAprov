import { PrismaClient } from '@prisma/client'; const p=new PrismaClient();
async function main(){
 const camara=await p.localArmazenamento.upsert({where:{nome:'Câmara de Resfriamento'},update:{},create:{nome:'Câmara de Resfriamento',descricao:'Local habitual para hortifruti/FLV'}});
 await p.unidadeMedida.upsert({where:{sigla:'kg'},update:{},create:{sigla:'kg',nome:'Quilograma'}}); await p.unidadeMedida.upsert({where:{sigla:'L'},update:{},create:{sigla:'L',nome:'Litro'}}); await p.unidadeMedida.upsert({where:{sigla:'un'},update:{},create:{sigla:'un',nome:'Unidade'}});
 await p.categoria.upsert({where:{nome:'FLV'},update:{localPadraoId:camara.id,controlaLotePadrao:false},create:{nome:'FLV',controlaLotePadrao:false,controlaValidadePadrao:false,localPadraoId:camara.id}});
 await p.categoria.upsert({where:{nome:'Carnes'},update:{},create:{nome:'Carnes',controlaLotePadrao:true,controlaValidadePadrao:true}});
}
main().finally(()=>p.$disconnect());

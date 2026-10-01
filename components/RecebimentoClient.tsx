'use client';
import {useEffect,useMemo,useState} from 'react';
type G={id:string,nome:string,classe:'QS'|'QR',controlaLote:boolean,controlaValidade:boolean,unidade:{sigla:string},localPadraoId?:string|null};
type L={id:string,nome:string};
type Item={generoId:string,localId:string,quantidade:string,valorUnitario:string,lote:string,validade:string};
const vazio=():Item=>({generoId:'',localId:'',quantidade:'',valorUnitario:'',lote:'',validade:''});
export default function RecebimentoClient(){
 const[classe,setClasse]=useState<'QS'|'QR'>('QS'); const[generos,setGeneros]=useState<G[]>([]); const[locais,setLocais]=useState<L[]>([]); const[itens,setItens]=useState<Item[]>([vazio()]);
 const[data,setData]=useState(()=>new Date().toISOString().slice(0,10)); const[origem,setOrigem]=useState(''); const[documento,setDocumento]=useState(''); const[observacao,setObservacao]=useState(''); const[msg,setMsg]=useState(''); const[busy,setBusy]=useState(false); const[revisar,setRevisar]=useState(false);
 useEffect(()=>{Promise.all([fetch('/api/generos?classe='+classe).then(r=>r.json()),fetch('/api/locais').then(r=>r.json())]).then(([g,l])=>{setGeneros(g);setLocais(l);setItens([vazio()]);setRevisar(false)})},[classe]);
 const gs=(id:string)=>generos.find(g=>g.id===id); const update=(i:number,k:keyof Item,v:string)=>setItens(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x));
 const total=useMemo(()=>itens.reduce((s,i)=>s+(Number(i.quantidade)||0)*(Number(i.valorUnitario)||0),0),[itens]);
 function escolher(i:number,id:string){const g=gs(id);setItens(a=>a.map((x,n)=>n===i?{...x,generoId:id,localId:g?.localPadraoId||x.localId,lote:'',validade:''}:x))}
 function validar(){for(const i of itens){const g=gs(i.generoId);if(!g)return 'Selecione o gênero em todos os itens.';if(!(Number(i.quantidade)>0))return `${g.nome}: informe uma quantidade válida.`;if(!i.localId)return `${g.nome}: informe o local de armazenamento.`;if(g.controlaLote&&!i.lote.trim())return `${g.nome}: informe o lote.`;if(g.controlaValidade&&!i.validade)return `${g.nome}: informe a validade.`;}return ''}
 async function confirmar(){const e=validar();if(e){setMsg(e);return}setBusy(true);setMsg('');const r=await fetch('/api/recebimentos',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({classe,data,origem:origem||undefined,documento:documento||undefined,observacao:observacao||undefined,itens:itens.map(i=>({generoId:i.generoId,localId:i.localId,quantidade:Number(i.quantidade),valorUnitario:i.valorUnitario===''?null:Number(i.valorUnitario),lote:i.lote||null,validade:i.validade||null}))})});const j=await r.json();setBusy(false);if(!r.ok){setMsg(j.error||'Não foi possível concluir.');return}setMsg(`Recebimento nº ${j.numero} confirmado e estoque atualizado.`);setItens([vazio()]);setRevisar(false);setDocumento('');setObservacao('')}
 return <>
  <div className="tabs"><button className={'tab '+(classe==='QS'?'active':'')} onClick={()=>setClasse('QS')}>QS</button><button className={'tab '+(classe==='QR'?'active':'')} onClick={()=>setClasse('QR')}>QR</button></div>
  {msg&&<div className={msg.includes('confirmado')?'success':'error'}>{msg}</div>}
  <div className="card"><h2>Dados do recebimento {classe}</h2><div className="grid"><label>Data<input type="date" value={data} onChange={e=>setData(e.target.value)}/></label><label>Origem<input value={origem} onChange={e=>setOrigem(e.target.value)} placeholder={classe==='QS'?'Ex.: B Sup':'Ex.: Fornecedor'}/></label><label>Documento<input value={documento} onChange={e=>setDocumento(e.target.value)} placeholder="Relação, NF, documento..."/></label></div><label>Observação<input value={observacao} onChange={e=>setObservacao(e.target.value)}/></label></div>
  <div className="card"><div className="top"><h2>Gêneros recebidos</h2><button className="linkbtn" onClick={()=>setItens(a=>[...a,vazio()])}>+ Adicionar gênero</button></div>
   {itens.map((i,n)=>{const g=gs(i.generoId);return <div className="itembox" key={n}><div className="top"><b>Item {n+1}</b>{itens.length>1&&<button className="dangerlink" onClick={()=>setItens(a=>a.filter((_,x)=>x!==n))}>Remover</button>}</div><div className="grid">
    <label>Gênero<select value={i.generoId} onChange={e=>escolher(n,e.target.value)}><option value="">Selecione...</option>{generos.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
    <label>Quantidade {g&&`(${g.unidade.sigla})`}<input type="number" min="0" step="0.001" value={i.quantidade} onChange={e=>update(n,'quantidade',e.target.value)}/></label>
    <label>Local<select value={i.localId} onChange={e=>update(n,'localId',e.target.value)}><option value="">Selecione...</option>{locais.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></label>
    {g?.controlaLote&&<label>Lote<input value={i.lote} onChange={e=>update(n,'lote',e.target.value)}/></label>}
    {g?.controlaValidade&&<label>Validade<input type="date" value={i.validade} onChange={e=>update(n,'validade',e.target.value)}/></label>}
    <label>Valor unitário (R$)<input type="number" min="0" step="0.0001" value={i.valorUnitario} onChange={e=>update(n,'valorUnitario',e.target.value)}/></label>
   </div>{g&&!g.controlaLote&&<span className="muted">Este gênero não exige lote.</span>}</div>})}
  </div>
  <div className="card"><div className="top"><div><b>Valor informado do recebimento</b><div className="big">{total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div></div>{!revisar?<button className="btn" onClick={()=>{const e=validar();if(e)setMsg(e);else{setMsg('');setRevisar(true)}}}>Revisar recebimento</button>:<div className="actions"><button className="linkbtn" onClick={()=>setRevisar(false)}>Voltar e editar</button><button className="btn" disabled={busy} onClick={confirmar}>{busy?'Confirmando...':'Confirmar recebimento'}</button></div>}</div>{revisar&&<p className="muted">Confira os gêneros, quantidades, locais, lotes/validade quando aplicáveis e o documento antes de confirmar. A confirmação atualizará o estoque.</p>}</div>
 </>
}

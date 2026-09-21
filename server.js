import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, audit, hashPassword, verifyPassword } from './database/db.js';
import { registerFinanceiroRoutes } from './routes/financeiro.js';
import { registerPlanejamentoQrRoutes } from './routes/planejamentoQr.js';
import { registerEstoqueRoutes } from './routes/estoque.js';
import { registerFechamentoRoutes } from './routes/fechamento.js';
import { registerAlertasRoutes } from './routes/alertas.js';
import { registerRelatoriosRoutes } from './routes/relatorios.js';
import { registerInventarioRoutes } from './routes/inventarios.js';
import { registerLembretesRoutes } from './routes/lembretes.js';
import { registerQdaaRoutes } from './routes/qdaa.js';
import { registerCardapioRoutes } from './routes/cardapio.js';
import { registerAdminDashboardRoutes } from './routes/adminDashboard.js';
import { registerGestorDashboardRoutes } from './routes/gestorDashboard.js';
import { registerDiagnosticoRoutes } from './routes/diagnostico.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function localDate(value){ return value ? String(value).slice(0,10) : new Date().toISOString().slice(0,10); }
function dayStatus(data){ return db.prepare('SELECT * FROM fechamento_diario WHERE data_movimento=?').get(data); }
function ensureDayEditable(data){
  const f=dayStatus(data);
  if (f && ['ENVIADO','FECHADO'].includes(f.status)) { const err=new Error('Movimentação do dia está bloqueada para conferência/fechamento'); err.status=409; throw err; }
}

const PERMS={
  'Administrador': new Set(['dashboard','usuarios','fornecedores','generos','recebimentos','saidas','correcoes','fechamento_enviar','fechamento_decidir','auditoria','relatorios','inventario','cardapio','perdas','devolucoes','financeiro','lembretes']),
  'Gestor de Estoque': new Set(['dashboard','fornecedores','generos','recebimentos','saidas','correcoes','relatorios','inventario','perdas','devolucoes','lembretes']),
  'Graduado de Serviço': new Set(['dashboard','fechamento_enviar','relatorio_diario'])
};
function auth(req,res,next){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');
  if(!token) return res.status(401).json({erro:'Acesso não autenticado'});
  const row=db.prepare(`SELECT s.*,u.id uid,u.nome,u.funcao,u.perfil,u.login,u.ativo FROM sessoes s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token=?`).get(token);
  if(!row || !row.ativo || new Date(row.expira_em)<new Date()) return res.status(401).json({erro:'Sessão expirada ou inválida'});
  req.user={id:row.uid,nome:row.nome,funcao:row.funcao,perfil:row.perfil,login:row.login};
  next();
}
function requirePerm(perm){ return (req,res,next)=>{ if(!PERMS[req.user.perfil]?.has(perm)) return res.status(403).json({erro:'Seu perfil não possui permissão para esta ação'}); next(); }; }

app.post('/api/login',(req,res)=>{
  const {login,password}=req.body;
  const u=db.prepare('SELECT * FROM usuarios WHERE login=? AND ativo=1').get(String(login||'').trim());
  if(!u || !verifyPassword(String(password||''),u.senha_hash)) return res.status(401).json({erro:'Usuário ou senha inválidos'});
  const token=crypto.randomBytes(32).toString('hex');
  const expira=new Date(Date.now()+12*60*60*1000).toISOString();
  db.prepare('INSERT INTO sessoes(token,usuario_id,expira_em) VALUES(?,?,?)').run(token,u.id,expira);
  audit(u.nome,'LOGIN','Acesso ao sistema');
  res.json({token,user:{id:u.id,nome:u.nome,funcao:u.funcao,perfil:u.perfil,login:u.login}});
});
app.post('/api/logout',auth,(req,res)=>{
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/,'');
  db.prepare('DELETE FROM sessoes WHERE token=?').run(token);
  audit(req.user.nome,'LOGOUT','Saída do sistema');
  res.json({ok:true});
});
app.get('/api/me',auth,(req,res)=>res.json(req.user));

app.get('/api/dashboard',auth,requirePerm('dashboard'),(req,res) => {
  const generos = db.prepare('SELECT COUNT(*) c FROM generos WHERE ativo=1').get().c;
  const saldo = db.prepare('SELECT COALESCE(SUM(quantidade),0) q FROM lotes').get().q;
  const baixo = db.prepare(`SELECT COUNT(*) c FROM (SELECT g.id, COALESCE(SUM(l.quantidade),0) saldo, g.estoque_minimo FROM generos g LEFT JOIN lotes l ON l.genero_id=g.id WHERE g.ativo=1 GROUP BY g.id HAVING saldo <= g.estoque_minimo)`).get().c;
  const vencendo = db.prepare(`SELECT COUNT(*) c FROM lotes WHERE quantidade > 0 AND validade IS NOT NULL AND date(validade) <= date('now','+30 day')`).get().c;
  const hoje = new Date().toISOString().slice(0,10);
  const saidasHoje = db.prepare(`SELECT COUNT(*) c FROM movimentacoes WHERE tipo='SAIDA' AND date(data_retirada)=date(?)`).get(hoje).c;
  const programadasHoje = db.prepare(`SELECT COUNT(*) c FROM movimentacoes WHERE tipo='SAIDA' AND date(data_consumo)=date(?)`).get(hoje).c;
  res.json({generos, saldo, baixo, vencendo, saidasHoje, programadasHoje});
});

app.get('/api/usuarios',auth,requirePerm('usuarios'),(req,res)=>res.json(db.prepare('SELECT id,nome,funcao,perfil,login,ativo,criado_em FROM usuarios ORDER BY ativo DESC,perfil,nome').all()));
app.post('/api/usuarios',auth,requirePerm('usuarios'),(req,res)=>{
  const {nome,funcao='',perfil,login,password}=req.body;
  if(!nome?.trim()||!perfil||!login?.trim()||String(password||'').length<6) return res.status(400).json({erro:'Nome, perfil, login e senha com pelo menos 6 caracteres são obrigatórios'});
  if(!PERMS[perfil]) return res.status(400).json({erro:'Perfil inválido'});
  try{
    const r=db.prepare('INSERT INTO usuarios(nome,funcao,perfil,login,senha_hash) VALUES(?,?,?,?,?)').run(nome.trim(),funcao.trim(),perfil,login.trim(),hashPassword(password));
    audit(req.user.nome,'CADASTRO_USUARIO',`${nome.trim()} • ${perfil}`);
    res.status(201).json({id:r.lastInsertRowid});
  }catch(e){ if(String(e.message).includes('UNIQUE')) return res.status(409).json({erro:'Login já cadastrado'}); throw e; }
});
app.patch('/api/usuarios/:id/status',auth,requirePerm('usuarios'),(req,res)=>{
  const id=Number(req.params.id); if(id===req.user.id) return res.status(400).json({erro:'Você não pode inativar o próprio usuário'});
  const ativo=req.body.ativo?1:0; const u=db.prepare('SELECT * FROM usuarios WHERE id=?').get(id); if(!u) return res.status(404).json({erro:'Usuário não encontrado'});
  db.prepare('UPDATE usuarios SET ativo=? WHERE id=?').run(ativo,id); audit(req.user.nome,ativo?'REATIVOU_USUARIO':'INATIVOU_USUARIO',u.nome); res.json({ok:true});
});

app.get('/api/fornecedores',auth,(req,res)=>res.json(db.prepare('SELECT * FROM fornecedores ORDER BY nome').all()));
app.post('/api/fornecedores',auth,requirePerm('fornecedores'),(req,res)=>{
  const {nome,contato='',observacoes=''}=req.body; if(!nome?.trim()) return res.status(400).json({erro:'Nome obrigatório'});
  const r=db.prepare('INSERT INTO fornecedores(nome,contato,observacoes) VALUES(?,?,?)').run(nome.trim(),contato.trim(),observacoes.trim()); audit(req.user.nome,'CADASTRO_FORNECEDOR',nome.trim()); res.status(201).json({id:r.lastInsertRowid});
});

registerAdminDashboardRoutes(app,{db,auth,requirePerm});
registerGestorDashboardRoutes(app,{db,auth});
registerDiagnosticoRoutes(app,{db,auth,requirePerm});
registerEstoqueRoutes(app,{db,auth,requirePerm,audit,localDate,ensureDayEditable});
registerFechamentoRoutes(app,{db,auth,requirePerm,audit,dayStatus});
registerAlertasRoutes(app,{db,auth,requirePerm});
registerRelatoriosRoutes(app,{db,auth,requirePerm,PERMS,dayStatus});
registerInventarioRoutes(app,{db,auth,requirePerm,audit});
registerLembretesRoutes(app,{db,auth,requirePerm,audit});
registerQdaaRoutes(app,{db,auth,requirePerm});
registerCardapioRoutes(app,{db,auth,requirePerm,audit});
registerFinanceiroRoutes(app,{db,auth,requirePerm,audit,localDate});
registerPlanejamentoQrRoutes(app,{db,auth,requirePerm});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(err.status||500).json({erro:err.message||'Erro interno'});
});

app.listen(3000,()=>console.log('Estoque Aprov v1.0.0 em http://localhost:3000'));

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const contaRoutes = require('./src/routes/contaRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
app.use(express.json({limit:'8mb'}));
app.use(express.urlencoded({extended:true,limit:'8mb'}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'cantina-cmd-dev-secret',
  resave:false,
  saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:'lax',maxAge:1000*60*60*8}
}));

app.use('/public',express.static(path.join(__dirname,'public')));
app.use(async(req,res,next)=>{
  if(!req.path.endsWith('.html'))return next();
  const tipo=req.path.startsWith('/cantina-')?'adm':req.path.startsWith('/aluno-')?'aluno':req.path.startsWith('/responsavel-')?'responsavel':null;
  if(!tipo)return next();const u=req.session.usuario;
  if(!u)return res.redirect('/inde.html');
  if(u.tipo!==tipo)return res.redirect('/'+({adm:'cantina-painel.html',aluno:'aluno-home.html',responsavel:'responsavel-home.html'}[u.tipo]||'inde.html'));
  if(tipo==='adm')return require('./src/middlewares/authMiddleware').somenteAdm(req,res,next);
  next();
});
app.use(express.static(path.join(__dirname,'Html')));
app.use('/api/gestao',require('./src/routes/gestaoRoutes'));
app.use('/api/admin',require('./src/routes/adminRoutes'));
app.use('/api/auth',authRoutes);
app.use('/api/usuarios',usuarioRoutes);
app.use('/api/produtos',produtoRoutes);
app.use('/api/contas',contaRoutes);
app.use('/api/pedidos',pedidoRoutes);
app.use('/api/dashboard',dashboardRoutes);

app.get('/teste-banco', async (_req,res)=>{
  try{const [resultado]=await db.query('SELECT 1 AS teste');res.json({sucesso:true,mensagem:'Banco SQLite funcionando!',resultado});}
  catch(erro){console.error(erro);res.status(500).json({sucesso:false,mensagem:'Erro ao abrir o banco SQLite.',erro:erro.message});}
});
app.get('/',(_req,res)=>res.redirect('/inde.html'));

app.use((erro,req,res,next)=>{console.error(erro);res.status(500).json({sucesso:false,mensagem:'Não foi possível concluir a operação. Verifique o banco de dados.'});});
const PORT=process.env.PORT||3000;
if(require.main===module) app.listen(PORT,()=>console.log(`Servidor rodando em http://localhost:${PORT}`));
module.exports=app;

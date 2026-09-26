const r=require('express').Router();
const db=require('../config/database');
const c=require('../controllers/contaController');
const {verificarLogin,somenteResponsavel}=require('../middlewares/authMiddleware');
r.use(verificarLogin);
async function dono(req,res,next){const u=req.session.usuario;const id=Number(req.params.idAluno||u.id);if(!Number.isSafeInteger(id)||id<=0)return res.status(400).json({sucesso:false,mensagem:'Aluno inválido.'});if(u.tipo==='aluno'&&id===u.id)return next();if(u.tipo==='adm')return require('../middlewares/authMiddleware').somenteAdm(req,res,next);if(u.tipo==='responsavel'&&req.params.idAluno){try{const [r]=await db.execute('SELECT idAluno FROM aluno_respo WHERE idAluno=? AND idResp=?',[id,u.id]);if(r.length)return next();}catch(e){return res.status(503).json({sucesso:false,mensagem:'Não foi possível verificar o vínculo.'});}}return res.status(403).json({sucesso:false,mensagem:'Esta conta não está vinculada ao seu perfil.'});}
r.get('/minha',dono,c.obter);r.get('/minha/movimentos',dono,c.movimentos);r.get('/:idAluno',dono,c.obter);r.get('/:idAluno/movimentos',dono,c.movimentos);r.post('/:idAluno/credito',somenteResponsavel,dono,c.credito);r.patch('/:idAluno/limite',somenteResponsavel,dono,c.limite);module.exports=r;

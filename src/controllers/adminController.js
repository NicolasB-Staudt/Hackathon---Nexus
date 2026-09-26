const bcrypt = require('bcrypt');
const db = require('../config/database');
async function solicitar(req,res) {
  const {nome,email,senha}=req.body;
  if(typeof nome!=='string'||!nome.trim()||nome.trim().length>100||typeof email!=='string'||email.length>120||!/^\S+@\S+\.\S+$/.test(email)||typeof senha!=='string'||senha.length<8||Buffer.byteLength(senha)>72)
    return res.status(400).json({sucesso:false,mensagem:'Informe nome, e-mail válido e senha de 8 a 72 bytes.'});
  try {
    const hash=await bcrypt.hash(senha,10);
    await db.execute("INSERT INTO usuario_Adm (nome,email,senha,status) VALUES (?,?,?,'PENDENTE')",[nome.trim(),email.trim().toLowerCase(),hash]);
    res.status(201).json({sucesso:true,mensagem:'Solicitação enviada. Aguarde a aprovação de um administrador.'});
  } catch(e) {
    res.status(e.code==='ER_DUP_ENTRY'?409:500).json({sucesso:false,mensagem:e.code==='ER_DUP_ENTRY'?'Já existe uma conta ou solicitação com este e-mail.':'Não foi possível enviar a solicitação.'});
  }
}
async function listar(req,res) {
  try {
    const [solicitacoes]=await db.query("SELECT idUsuarioAdm,nome,email,dataSolicitacao FROM usuario_Adm WHERE status='PENDENTE' ORDER BY dataSolicitacao,idUsuarioAdm");
    res.json({sucesso:true,solicitacoes});
  } catch(e) { res.status(500).json({sucesso:false,mensagem:'Não foi possível carregar as solicitações.'}); }
}
function decidir(status) { return async(req,res)=>{
  const id=Number(req.params.id);
  if(!Number.isSafeInteger(id)||id<=0||id===req.session.usuario.id) return res.status(400).json({sucesso:false,mensagem:'Solicitação inválida. Você não pode aprovar a si mesmo.'});
  try {
    const [r]=await db.execute("UPDATE usuario_Adm SET status=?,aprovadoPor=?,dataAprovacao=NOW() WHERE idUsuarioAdm=? AND status='PENDENTE'",[status,req.session.usuario.id,id]);
    if(!r.affectedRows) return res.status(409).json({sucesso:false,mensagem:'Solicitação inexistente ou já analisada. Atualize a lista.'});
    res.json({sucesso:true,mensagem:status==='APROVADO'?'Administrador aprovado.':'Solicitação rejeitada.'});
  } catch(e) { res.status(500).json({sucesso:false,mensagem:'Não foi possível registrar a decisão.'}); }
}; }
module.exports={solicitar,listar,aprovar:decidir('APROVADO'),rejeitar:decidir('REJEITADO')};

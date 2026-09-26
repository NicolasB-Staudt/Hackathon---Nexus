const bcrypt = require('bcrypt');
const db = require('../config/database');

async function listarAlunos(req,res){
  try{
    const [rows]=await db.query(`SELECT a.idAluno,a.nome,a.email,a.turma,a.foto,c.idConta,c.saldo,c.limiteNegativo,c.limiteDiario FROM usuario_Aluno a LEFT JOIN conta_Aluno c ON c.idAluno=a.idAluno ORDER BY a.nome`);
    res.json({sucesso:true,alunos:rows});
  }catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao listar alunos.'});}
}

async function cadastrarAluno(req,res){
  const {nome,email,senha,turma,foto,idResp}=req.body;
  if(!nome||!email||!senha||!turma) return res.status(400).json({sucesso:false,mensagem:'Preencha nome, e-mail, turma e senha.'});
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const hash=await bcrypt.hash(senha,10);
    const [r]=await conn.execute('INSERT INTO usuario_Aluno (nome,email,senha,turma,foto) VALUES (?,?,?,?,?)',[nome,email,hash,turma,foto||null]);
    await conn.execute('INSERT INTO conta_Aluno (idAluno,saldo,limiteNegativo,limiteDiario) VALUES (?,0,250,25)',[r.insertId]);
    if(idResp && req.session.usuario?.tipo!=='adm')throw new Error('Vínculo só pode ser atribuído pela administração.');
    if(idResp) await conn.execute('INSERT IGNORE INTO aluno_respo (idAluno,idResp) VALUES (?,?)',[r.insertId,idResp]);
    await conn.commit();
    res.status(201).json({sucesso:true,mensagem:'Aluno cadastrado com sucesso.',idAluno:r.insertId});
  }catch(e){await conn.rollback(); console.error(e); res.status(e.code==='ER_DUP_ENTRY'?409:500).json({sucesso:false,mensagem:e.code==='ER_DUP_ENTRY'?'E-mail já cadastrado.':'Erro ao cadastrar aluno.'});}
  finally{conn.release();}
}

async function editarAluno(req,res){
  const {nome,email,turma,foto,senha}=req.body;
  try{
    const campos=['nome=?','email=?','turma=?','foto=?']; const valores=[nome,email,turma,foto||null];
    if(senha){campos.push('senha=?'); valores.push(await bcrypt.hash(senha,10));}
    valores.push(req.params.id);
    await db.execute(`UPDATE usuario_Aluno SET ${campos.join(', ')} WHERE idAluno=?`,valores);
    res.json({sucesso:true,mensagem:'Aluno atualizado.'});
  }catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao atualizar aluno.'});}
}

async function excluirAluno(req,res){
  try{await db.execute('DELETE FROM usuario_Aluno WHERE idAluno=?',[req.params.id]);res.json({sucesso:true,mensagem:'Aluno excluído.'});}
  catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Não foi possível excluir o aluno.'});}
}

async function cadastrarResponsavel(req,res){
  const {nome,email,senha,cpf,telefone,codigoAluno,foto}=req.body;
  if(!nome||!email||!senha) return res.status(400).json({sucesso:false,mensagem:'Preencha nome, e-mail e senha.'});
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const hash=await bcrypt.hash(senha,10);
    const [r]=await conn.execute('INSERT INTO usuario_Resp (nome,email,senha,cpf,telefone,foto) VALUES (?,?,?,?,?,?)',[nome,email,hash,cpf||null,telefone||null,foto||null]);
    if(codigoAluno)throw new Error('Solicite à cantina o vínculo com o aluno após o cadastro.');
    if(false){
      const [alunos]=await conn.execute('SELECT idAluno FROM usuario_Aluno WHERE idAluno=?',[codigoAluno]);
      if(!alunos.length) throw new Error('ALUNO_NAO_ENCONTRADO');
      await conn.execute('INSERT IGNORE INTO aluno_respo (idAluno,idResp) VALUES (?,?)',[codigoAluno,r.insertId]);
    }
    await conn.commit();
    res.status(201).json({sucesso:true,mensagem:'Responsável cadastrado com sucesso.',idResp:r.insertId});
  }catch(e){await conn.rollback();console.error(e);let msg='Erro ao cadastrar responsável.';if(e.code==='ER_DUP_ENTRY')msg='E-mail já cadastrado.';if(e.message==='ALUNO_NAO_ENCONTRADO')msg='Código do aluno não encontrado.';res.status(400).json({sucesso:false,mensagem:msg});}
  finally{conn.release();}
}

async function meusAlunos(req,res){
  try{
    const [rows]=await db.execute(`SELECT a.idAluno,a.nome,a.email,a.turma,a.foto,c.idConta,c.saldo,c.limiteNegativo,c.limiteDiario FROM aluno_respo ar JOIN usuario_Aluno a ON a.idAluno=ar.idAluno LEFT JOIN conta_Aluno c ON c.idAluno=a.idAluno WHERE ar.idResp=? ORDER BY a.nome`,[req.session.usuario.id]);
    res.json({sucesso:true,alunos:rows});
  }catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao carregar alunos.'});}
}

async function perfil(req,res){
  try{
    const u=req.session.usuario; let sql,params=[u.id];
    if(u.tipo==='aluno') sql=`SELECT a.idAluno id,a.nome,a.email,a.turma,a.foto,c.saldo,c.limiteNegativo,c.limiteDiario FROM usuario_Aluno a LEFT JOIN conta_Aluno c ON c.idAluno=a.idAluno WHERE a.idAluno=?`;
    else if(u.tipo==='responsavel') sql=`SELECT idResp id,nome,email,cpf,telefone,foto FROM usuario_Resp WHERE idResp=?`;
    else sql=`SELECT idUsuarioAdm id,nome,email,foto FROM usuario_Adm WHERE idUsuarioAdm=?`;
    const [rows]=await db.execute(sql,params); res.json({sucesso:true,perfil:rows[0]||null,tipo:u.tipo});
  }catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao carregar perfil.'});}
}

async function atualizarPerfil(req,res){
  const u=req.session.usuario; const {nome,email,foto,telefone,cpf,turma}=req.body;
  try{
    if(u.tipo==='aluno') await db.execute('UPDATE usuario_Aluno SET nome=?,email=?,turma=?,foto=? WHERE idAluno=?',[nome,email,turma,foto||null,u.id]);
    else if(u.tipo==='responsavel') await db.execute('UPDATE usuario_Resp SET nome=?,email=?,cpf=?,telefone=?,foto=? WHERE idResp=?',[nome,email,cpf||null,telefone||null,foto||null,u.id]);
    else await db.execute('UPDATE usuario_Adm SET nome=?,email=?,foto=? WHERE idUsuarioAdm=?',[nome,email,foto||null,u.id]);
    req.session.usuario.nome=nome;
    res.json({sucesso:true,mensagem:'Perfil atualizado.'});
  }catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao atualizar perfil.'});}
}

module.exports={listarAlunos,cadastrarAluno,editarAluno,excluirAluno,cadastrarResponsavel,meusAlunos,perfil,atualizarPerfil};

require('dotenv').config();
const bcrypt=require('bcrypt');
const db=require('../src/config/database');
(async()=>{
  try{
    const {ADMIN_EMAIL:email,ADMIN_PASSWORD:senha,ADMIN_NAME:nome='Administrador'}=process.env;
    if(!email||!senha||senha.length<5||Buffer.byteLength(senha)>72) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (5 a 72 bytes) no .env.');
    const hash=await bcrypt.hash(senha,10);
    await db.execute("INSERT INTO usuario_Adm (nome,email,senha,status,dataAprovacao) VALUES (?,?,?,'APROVADO',CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET nome=excluded.nome,senha=excluded.senha,status='APROVADO',dataAprovacao=CURRENT_TIMESTAMP,aprovadoPor=NULL",[nome,email.trim().toLowerCase(),hash]);
    console.log('Administrador inicial aprovado: '+email);
  }catch(e){console.error(e.message);process.exitCode=1;}finally{await db.end();}
})();

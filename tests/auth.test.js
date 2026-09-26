process.env.DEMO_PASSWORD_RESET='false';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const bcrypt=require('bcrypt');
let server,base,admins=[],approvedCookie,studentCookie,guardianCookie,queries=[];
const users={usuario_Aluno:{idAluno:11,nome:'Aluno de teste',email:'aluno@test.local'},usuario_Resp:{idResp:21,nome:'Responsável de teste',email:'resp@test.local'}};
const db={async query(sql){return this.execute(sql,[]);},async execute(sql,args=[]){
  queries.push({sql,args});
  if(sql.includes('FROM usuario_Adm WHERE idUsuarioAdm'))return [admins.filter(a=>a.idUsuarioAdm===Number(args[0])).map(a=>({status:a.status}))];
  if(sql.includes('FROM usuario_Adm')&&sql.includes('email = ?'))return [admins.filter(a=>a.email===args[0])];
  if(sql.includes('FROM usuario_Adm')&&sql.includes("status='PENDENTE'"))return [admins.filter(a=>a.status==='PENDENTE').map(({senha,...a})=>a)];
  if(sql.startsWith('INSERT INTO usuario_Adm')){if(admins.some(a=>a.email===args[1]))throw Object.assign(new Error('duplicate'),{code:'ER_DUP_ENTRY'});admins.push({idUsuarioAdm:admins.length+1,nome:args[0],email:args[1],senha:args[2],status:'PENDENTE'});return [{insertId:admins.length}];}
  if(sql.startsWith('UPDATE usuario_Adm SET status')){const a=admins.find(a=>a.idUsuarioAdm===args[2]&&a.status==='PENDENTE');if(a){a.status=args[0];a.aprovadoPor=args[1];a.dataAprovacao=new Date();}return [{affectedRows:a?1:0}];}
  for(const [table,u] of Object.entries(users))if(sql.includes('FROM '+table)&&sql.includes('email = ?'))return [u.email===args[0]?[u]:[]];
  if(sql.startsWith('SELECT idAluno FROM aluno_respo'))return [Number(args[0])===11&&args[1]===21?[{idAluno:11}]:[]];
  if(sql.includes('FROM usuario_Aluno a JOIN conta_Aluno'))return [[{idAluno:11,saldo:'0.00',limiteDiario:'25.00'}]];
  throw new Error('Consulta inesperada no teste: '+sql);
},async end(){}};
before(async()=>{
  const senha=await bcrypt.hash('SenhaTeste123',4);admins=[{idUsuarioAdm:1,nome:'Inicial',email:'admin@test.local',senha,status:'APROVADO'}];Object.values(users).forEach(u=>u.senha=senha);
  const dbPath=require.resolve('../src/config/database');require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:db};
  const app=require('../server');await new Promise(resolve=>{server=app.listen(0,'127.0.0.1',resolve);});base='http://127.0.0.1:'+server.address().port;
});
after(async()=>{await new Promise(resolve=>server.close(resolve));});
async function request(path,{method='GET',body,cookie}={}){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
const login=(tipo,email)=>request('/api/auth/login',{method:'POST',body:{tipo,email,senha:'SenhaTeste123'}});
test('login exige escolha de perfil e rejeita perfil desconhecido',async()=>{for(const tipo of [undefined,'constructor','invalido'])assert.equal((await login(tipo,'admin@test.local')).status,400);});
test('perfil escolhido não procura conta em outra tabela',async()=>assert.equal((await login('aluno','admin@test.local')).status,401));
test('administrador aprovado entra e recebe sessão',async()=>{const r=await login('adm','admin@test.local');assert.equal(r.status,200);assert.equal(r.data.tipo,'adm');assert.ok(r.cookie);approvedCookie=r.cookie;});
test('solicitação pública sempre fica pendente e não cria sessão',async()=>{const r=await request('/api/admin/solicitar',{method:'POST',body:{nome:'Candidato',email:'novo@test.local',senha:'SenhaTeste123',status:'APROVADO',aprovadoPor:1}});assert.equal(r.status,201);assert.equal(r.cookie,undefined);assert.equal(admins[1].status,'PENDENTE');assert.ok(await bcrypt.compare('SenhaTeste123',admins[1].senha));});
test('e-mail duplicado retorna conflito',async()=>assert.equal((await request('/api/admin/solicitar',{method:'POST',body:{nome:'Candidato',email:'novo@test.local',senha:'SenhaTeste123'}})).status,409));
test('senha curta na solicitação é recusada',async()=>assert.equal((await request('/api/admin/solicitar',{method:'POST',body:{nome:'Candidato',email:'curto@test.local',senha:'123'}})).status,400));
test('pendente não entra; senha incorreta não expõe status',async()=>{assert.equal((await login('adm','novo@test.local')).status,403);assert.equal((await request('/api/auth/login',{method:'POST',body:{tipo:'adm',email:'novo@test.local',senha:'errada'}})).status,401);});
test('visitante não lista nem aprova solicitações',async()=>{assert.equal((await request('/api/admin/solicitacoes')).status,401);assert.equal((await request('/api/admin/2/aprovar',{method:'PATCH'})).status,401);});
test('aluno e responsável não podem aprovar',async()=>{studentCookie=(await login('aluno','aluno@test.local')).cookie;guardianCookie=(await login('responsavel','resp@test.local')).cookie;for(const cookie of [studentCookie,guardianCookie]){assert.equal((await request('/api/admin/solicitacoes',{cookie})).status,403);assert.equal((await request('/api/admin/2/aprovar',{method:'PATCH',cookie})).status,403);}});
test('lista de pendências não contém hash de senha',async()=>{const r=await request('/api/admin/solicitacoes',{cookie:approvedCookie});assert.equal(r.status,200);assert.equal(r.data.solicitacoes.length,1);assert.equal(r.data.solicitacoes[0].senha,undefined);});
test('aprovação registra aprovador e libera login',async()=>{assert.equal((await request('/api/admin/2/aprovar',{method:'PATCH',cookie:approvedCookie})).status,200);assert.equal(admins[1].aprovadoPor,1);assert.ok(admins[1].dataAprovacao);assert.equal((await login('adm','novo@test.local')).status,200);});
test('decisão repetida e autoaprovação são bloqueadas',async()=>{assert.equal((await request('/api/admin/2/rejeitar',{method:'PATCH',cookie:approvedCookie})).status,409);assert.equal((await request('/api/admin/1/aprovar',{method:'PATCH',cookie:approvedCookie})).status,400);});
test('rejeição bloqueia login',async()=>{await request('/api/admin/solicitar',{method:'POST',body:{nome:'Outro',email:'outro@test.local',senha:'SenhaTeste123'}});assert.equal((await request('/api/admin/3/rejeitar',{method:'PATCH',cookie:approvedCookie})).status,200);assert.equal((await login('adm','outro@test.local')).status,403);});
test('sessão antiga não evita rechecagem da aprovação',async()=>{admins[0].status='PENDENTE';assert.equal((await request('/api/admin/solicitacoes',{cookie:approvedCookie})).status,403);admins[0].status='APROVADO';});
test('aluno só consulta sua conta; responsável exige vínculo',async()=>{assert.equal((await request('/api/contas/12',{cookie:studentCookie})).status,403);assert.equal((await request('/api/contas/12',{cookie:guardianCookie})).status,403);assert.equal((await request('/api/contas/11',{cookie:guardianCookie})).status,200);});
test('responsável não pode se passar por aluno para comprar',async()=>assert.equal((await request('/api/pedidos',{method:'POST',cookie:guardianCookie,body:{itens:[{idProd:1,quantidade:1}]}})).status,403));
test('quantidades negativas, fracionárias e itens duplicados são recusados',async()=>{for(const itens of [[{idProd:1,quantidade:-1}],[{idProd:1,quantidade:1.5}],[{idProd:1,quantidade:1},{idProd:1,quantidade:1}]])assert.equal((await request('/api/pedidos',{method:'POST',cookie:studentCookie,body:{itens,idIntervalo:1}})).status,400);});
test('crédito inválido e limite negativo são recusados',async()=>{assert.equal((await request('/api/contas/11/credito',{method:'POST',cookie:guardianCookie,body:{valor:'abc'}})).status,400);assert.equal((await request('/api/contas/11/limite',{method:'PATCH',cookie:guardianCookie,body:{limiteDiario:-1}})).status,400);});
test('recuperação demonstrativa desabilitada por padrão',async()=>assert.equal((await request('/api/auth/solicitar-redefinicao',{method:'POST',body:{email:'admin@test.local'}})).status,503));
test('logout invalida a sessão',async()=>{assert.equal((await request('/api/auth/logout',{method:'POST',cookie:studentCookie})).status,200);assert.equal((await request('/api/auth/me',{cookie:studentCookie})).status,401);});

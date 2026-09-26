const {test}=require('node:test');const assert=require('node:assert/strict');
let calls=[],currentStatus='PENDENTE',saldo=50,stock=10;
const conn={async beginTransaction(){calls.push('BEGIN');},async commit(){calls.push('COMMIT');},async rollback(){calls.push('ROLLBACK');},release(){},async execute(sql,args){calls.push({sql,args});
 if(sql.startsWith('SELECT idIntervalo'))return [[{idIntervalo:1}]];
 if(sql.startsWith('SELECT * FROM conta_Aluno'))return [[{idConta:1,saldo,limiteNegativo:0,limiteDiario:100}]];
 if(sql.startsWith('SELECT p.idProd'))return [[{idProd:1,nome:'Produto teste',preco:5,disponivel:'S',quantidade:stock}]];
 if(sql.startsWith('SELECT COALESCE'))return [[{total:0}]];
 if(sql.startsWith('INSERT INTO pedido'))return [{insertId:7}];
 if(sql.startsWith('SELECT * FROM pedido'))return [[{idPedido:7,idAluno:11,valorTotal:10,status:currentStatus}]];
 if(sql.startsWith('SELECT idConta'))return [[{idConta:1}]];
 if(sql.startsWith('SELECT idProd,quantidade'))return [[{idProd:1,quantidade:2}]];
 if(sql.startsWith('UPDATE pedido SET status'))currentStatus=args[0];
 return [{affectedRows:1}];
}};
const dbPath=require.resolve('../src/config/database');require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{async getConnection(){return conn;}}};const c=require('../src/controllers/pedidoController');
function response(){return {code:200,status(n){this.code=n;return this;},json(data){this.data=data;return this;}};}
function req(body){return {session:{usuario:{id:11,tipo:'aluno'}},params:{id:7},body};}
test('compra usa preço do banco, debita conta e estoque na mesma transação',async()=>{calls=[];const res=response();await c.criar(req({idIntervalo:1,itens:[{idProd:1,quantidade:2,preco:0.01}]}),res);assert.equal(res.code,201);assert.equal(res.data.valorTotal,10);assert.ok(calls.includes('COMMIT'));assert.ok(calls.some(x=>x.sql?.startsWith('UPDATE conta_Aluno')&&x.args[0]===40));assert.ok(calls.some(x=>x.sql?.startsWith('UPDATE estoque')&&x.args[0]===2));});
test('estoque insuficiente desfaz compra',async()=>{calls=[];stock=1;const res=response();await c.criar(req({idIntervalo:1,itens:[{idProd:1,quantidade:2}]}),res);stock=10;assert.equal(res.code,400);assert.ok(calls.includes('ROLLBACK'));assert.ok(!calls.includes('COMMIT'));});
test('saldo insuficiente desfaz compra',async()=>{calls=[];saldo=0;const res=response();await c.criar(req({idIntervalo:1,itens:[{idProd:1,quantidade:2}]}),res);saldo=50;assert.equal(res.code,400);assert.ok(calls.includes('ROLLBACK'));});
test('cancelamento estorna saldo e repõe estoque',async()=>{calls=[];currentStatus='PENDENTE';const res=response();await c.status(req({status:'CANCELADO'}),res);assert.equal(res.code,200);assert.ok(calls.some(x=>x.sql?.includes("'ESTORNO'")&&x.args[1]===10));assert.ok(calls.some(x=>x.sql?.includes('quantidade=quantidade+?')&&x.args[0]===2));assert.ok(calls.includes('COMMIT'));});
test('cancelamento repetido não duplica estorno',async()=>{calls=[];currentStatus='CANCELADO';const res=response();await c.status(req({status:'CANCELADO'}),res);assert.equal(res.code,409);assert.ok(!calls.some(x=>x.sql?.includes("'ESTORNO'")));assert.ok(calls.includes('ROLLBACK'));});
test('pedido pendente não pode ser marcado diretamente como retirado',async()=>{calls=[];currentStatus='PENDENTE';const res=response();await c.status(req({status:'RETIRADO'}),res);assert.equal(res.code,409);assert.ok(calls.includes('ROLLBACK'));});

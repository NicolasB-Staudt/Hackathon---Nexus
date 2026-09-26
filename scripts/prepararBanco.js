require('dotenv').config();
const db = require('../src/config/database');
(async()=>{try{await db.inicializar();console.log('Banco SQLite pronto em: '+db.arquivoBanco);}catch(e){console.error('Erro ao preparar SQLite:',e.message);process.exitCode=1;}finally{await db.end();}})();

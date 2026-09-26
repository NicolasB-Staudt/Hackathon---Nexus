require('dotenv').config();
const db = require('../src/config/database');
(async()=>{
  try {
    const [tabelas] = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const [admins] = await db.execute('SELECT email,status FROM usuario_Adm ORDER BY idUsuarioAdm');
    if (tabelas.length < 10) throw new Error('Estrutura incompleta. Execute npm run db:init.');
    console.log(`SQLite funcionando: ${tabelas.length} tabelas.`);
    console.log('Administradores:', admins.length ? admins : 'nenhum');
  } catch (e) {
    console.error('Falha na verificação:', e.message);
    process.exitCode = 1;
  } finally { await db.end(); }
})();

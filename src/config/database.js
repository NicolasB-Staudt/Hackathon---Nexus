const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const arquivoBanco = path.resolve(__dirname, '../../', process.env.DB_FILE || 'database/cantina.sqlite');
let bancoPromise;
let bloqueado = false;
const espera = [];

async function obterBanco() {
  if (!bancoPromise) bancoPromise = (async () => {
    const SQL = await initSqlJs({ locateFile: file => path.join(path.dirname(require.resolve('sql.js')), file) });
    const bytes = fs.existsSync(arquivoBanco) ? fs.readFileSync(arquivoBanco) : undefined;
    const banco = bytes?.length ? new SQL.Database(bytes) : new SQL.Database();
    banco.run('PRAGMA foreign_keys = ON');
    banco.exec(fs.readFileSync(path.resolve(__dirname, '../../database/cantina_sqlite.sql'), 'utf8'));
    salvar(banco);
    return banco;
  })();
  return bancoPromise;
}

function salvar(banco) {
  fs.mkdirSync(path.dirname(arquivoBanco), { recursive: true });
  const temporario = arquivoBanco + '.tmp';
  fs.writeFileSync(temporario, Buffer.from(banco.export()));
  fs.renameSync(temporario, arquivoBanco);
}

async function adquirir() {
  if (!bloqueado) { bloqueado = true; return; }
  await new Promise(resolve => espera.push(resolve));
}

function liberar() {
  const proximo = espera.shift();
  if (proximo) proximo(); else bloqueado = false;
}

function normalizar(sql) {
  return sql
    .replace(/\s+FOR UPDATE\b/gi, '')
    .replace(/NOW\(\)/gi, 'CURRENT_TIMESTAMP')
    .replace(/CURDATE\(\)/gi, "date('now','localtime')")
    .replace(/DATE_FORMAT\(([^,]+),\s*'%Y-%m'\)/gi, "strftime('%Y-%m',$1)")
    .replace(/INSERT\s+IGNORE/gi, 'INSERT OR IGNORE')
    .replace(/IF\(\?\s*>\s*0,\s*'S',\s*'N'\)/gi, "CASE WHEN ? > 0 THEN 'S' ELSE 'N' END");
}

function executarDireto(banco, sqlOriginal, params = []) {
  const sql = normalizar(sqlOriginal);
  const consulta = /^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql);
  if (consulta) {
    const stmt = banco.prepare(sql);
    try {
      stmt.bind(params.map(v => v === undefined ? null : v));
      const linhas = [];
      while (stmt.step()) linhas.push(stmt.getAsObject());
      return [linhas, []];
    } finally { stmt.free(); }
  }
  banco.run(sql, params.map(v => v === undefined ? null : v));
  const id = banco.exec('SELECT last_insert_rowid() AS id')[0]?.values?.[0]?.[0] || 0;
  return [{ affectedRows: banco.getRowsModified(), insertId: id }, []];
}

async function execute(sql, params = []) {
  await adquirir();
  try {
    const banco = await obterBanco();
    const resultado = executarDireto(banco, sql, params);
    if (!/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql)) salvar(banco);
    return resultado;
  } finally { liberar(); }
}

async function getConnection() {
  let emTransacao = false;
  return {
    async beginTransaction() {
      await adquirir();
      const banco = await obterBanco();
      banco.run('BEGIN IMMEDIATE');
      emTransacao = true;
    },
    async execute(sql, params = []) {
      if (!emTransacao) return execute(sql, params);
      return executarDireto(await obterBanco(), sql, params);
    },
    async query(sql, params = []) { return this.execute(sql, params); },
    async commit() {
      if (!emTransacao) return;
      const banco = await obterBanco();
      banco.run('COMMIT'); salvar(banco); emTransacao = false; liberar();
    },
    async rollback() {
      if (!emTransacao) return;
      const banco = await obterBanco();
      banco.run('ROLLBACK'); emTransacao = false; liberar();
    },
    release() {
      if (emTransacao) obterBanco().then(banco => banco.run('ROLLBACK')).finally(() => { emTransacao = false; liberar(); });
    }
  };
}

async function end() { const banco = await obterBanco(); salvar(banco); }

module.exports = { execute, query: execute, getConnection, end, arquivoBanco, inicializar: obterBanco };

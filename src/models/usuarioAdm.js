const conexao = require("../config/database");

async function buscarPorEmail(email) {

    const sql = `
        SELECT
            idUsuarioAdm,
            nome,
            email,
            senha
        FROM usuario_Adm
        WHERE email = ?
        LIMIT 1
    `;

    const [resultado] = await conexao.execute(
        sql,
        [email]
    );

    return resultado[0];
}

module.exports = {
    buscarPorEmail
};
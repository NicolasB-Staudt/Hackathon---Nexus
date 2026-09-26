const conexao = require("../config/database");

async function buscarPorEmail(email) {

    const sql = `
        SELECT
            idResp,
            nome,
            email,
            senha
        FROM usuario_Resp
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
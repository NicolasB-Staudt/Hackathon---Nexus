const conexao = require("../config/database");

async function buscarPorEmail(email) {

    const sql = `
        SELECT
            idAluno,
            nome,
            email,
            senha,
            turma
        FROM usuario_Aluno
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
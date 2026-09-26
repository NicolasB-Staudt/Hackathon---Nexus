const db = require('../config/database');
function verificarLogin(req, res, next) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Usuário não autenticado."
        });

    }

    next();
}

async function somenteAdm(req,res,next) {
    const u=req.session.usuario;
    if(!u) return res.status(401).json({sucesso:false,mensagem:'Usuário não autenticado.'});
    if(u.tipo!=='adm') return res.status(403).json({sucesso:false,mensagem:'Acesso permitido apenas para administrador.'});
    try {
        const [rows]=await db.execute('SELECT status FROM usuario_Adm WHERE idUsuarioAdm=?',[u.id]);
        if(rows[0]?.status!=='APROVADO') return res.status(403).json({sucesso:false,mensagem:'Administrador sem aprovação ativa.'});
        next();
    } catch(e) { res.status(503).json({sucesso:false,mensagem:'Não foi possível verificar a autorização.'}); }
}

function somenteResponsavel(req, res, next) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Usuário não autenticado."
        });

    }

    if (req.session.usuario.tipo !== "responsavel") {

        return res.status(403).json({
            sucesso: false,
            mensagem: "Acesso permitido apenas para responsáveis."
        });

    }

    next();
}

function somenteAluno(req, res, next) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Usuário não autenticado."
        });

    }

    if (req.session.usuario.tipo !== "aluno") {

        return res.status(403).json({
            sucesso: false,
            mensagem: "Acesso permitido apenas para alunos."
        });

    }

    next();
}

module.exports = {
    verificarLogin,
    somenteAdm,
    somenteResponsavel,
    somenteAluno
};
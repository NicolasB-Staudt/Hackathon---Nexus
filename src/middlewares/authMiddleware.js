function verificarLogin(req, res, next) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Usuário não autenticado."
        });

    }

    next();
}

function somenteAdm(req, res, next) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Usuário não autenticado."
        });

    }

    if (req.session.usuario.tipo !== "adm") {

        return res.status(403).json({
            sucesso: false,
            mensagem: "Acesso permitido apenas para administrador."
        });

    }

    next();
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
const bcrypt = require("bcrypt");

const usuarioAdm = require("../models/usuarioAdm");
const usuarioAluno = require("../models/usuarioAluno");
const usuarioResponsavel = require("../models/usuarioResponsavel");

async function login(req, res) {

    try {

        const { email, senha } = req.body;

        if (!email || !senha) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Preencha o email e a senha."
            });

        }



        const adm = await usuarioAdm.buscarPorEmail(email);

        if (adm) {

            const senhaCorreta = await bcrypt.compare(
                senha,
                adm.senha
            );

            if (senhaCorreta) {

                req.session.usuario = {
                    id: adm.idUsuarioAdm,
                    nome: adm.nome,
                    tipo: "adm"
                };

                return res.json({
                    sucesso: true,
                    mensagem: "Login realizado com sucesso.",
                    tipo: "adm",
                    nome: adm.nome
                });

            }

        }


        const responsavel =
            await usuarioResponsavel.buscarPorEmail(email);

        if (responsavel) {

            const senhaCorreta = await bcrypt.compare(
                senha,
                responsavel.senha
            );

            if (senhaCorreta) {

                req.session.usuario = {
                    id: responsavel.idResp,
                    nome: responsavel.nome,
                    tipo: "responsavel"
                };

                return res.json({
                    sucesso: true,
                    mensagem: "Login realizado com sucesso.",
                    tipo: "responsavel",
                    nome: responsavel.nome
                });

            }

        }

        const aluno =
            await usuarioAluno.buscarPorEmail(email);

        if (aluno) {

            const senhaCorreta = await bcrypt.compare(
                senha,
                aluno.senha
            );

            if (senhaCorreta) {

                req.session.usuario = {
                    id: aluno.idAluno,
                    nome: aluno.nome,
                    tipo: "aluno"
                };

                return res.json({
                    sucesso: true,
                    mensagem: "Login realizado com sucesso.",
                    tipo: "aluno",
                    nome: aluno.nome
                });

            }

        }


        return res.status(401).json({
            sucesso: false,
            mensagem: "Email ou senha incorretos."
        });

    } catch (erro) {

        console.error(erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro interno do servidor."
        });

    }

}

module.exports = {
    login
};

function logout(req, res) {

    req.session.destroy((erro) => {

        if (erro) {

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao sair do sistema."
            });

        }

        res.clearCookie("connect.sid");

        return res.json({
            sucesso: true,
            mensagem: "Logout realizado com sucesso."
        });

    });

}

function usuarioLogado(req, res) {

    if (!req.session.usuario) {

        return res.status(401).json({
            sucesso: false,
            mensagem: "Nenhum usuário está logado."
        });

    }

    return res.json({
        sucesso: true,
        usuario: req.session.usuario
    });

}

module.exports = {
    login,
    logout,
    usuarioLogado
};
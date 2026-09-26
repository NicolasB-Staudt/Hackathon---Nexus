const bcrypt = require("bcrypt");

const usuarioAdm = require("../models/usuarioAdm");
const usuarioAluno = require("../models/usuarioAluno");
const usuarioResponsavel = require("../models/usuarioResponsavel");


const db = require('../config/database');
const codigosRedefinicao = new Map();

async function solicitarRedefinicao(req, res) {
    if(process.env.DEMO_PASSWORD_RESET!=='true') return res.status(503).json({sucesso:false,mensagem:'Recuperação automática não configurada. Contate a administração.'});
    const email = String(req.body.email || '').trim();
    if (!email) return res.status(400).json({ sucesso:false, mensagem:'Informe o e-mail.' });
    try {
        let tipo = null;
        for (const [tabela, campo, nome] of [['usuario_Adm','idUsuarioAdm','adm'],['usuario_Resp','idResp','responsavel'],['usuario_Aluno','idAluno','aluno']]) {
            const [r] = await db.execute(`SELECT ${campo} id FROM ${tabela} WHERE email=? LIMIT 1`, [email]);
            if (r.length) { tipo = {tabela, id:r[0].id, nome}; break; }
        }
        if (!tipo) return res.status(404).json({ sucesso:false, mensagem:'E-mail não encontrado.' });
        const codigo = String(Math.floor(100000 + Math.random()*900000));
        codigosRedefinicao.set(email, { codigo, ...tipo, expira: Date.now()+10*60*1000 });
        console.log(`[DEMO] Código de redefinição para ${email}: ${codigo}`);
        res.json({ sucesso:true, mensagem:'Código gerado para demonstração.', codigoDemo:codigo });
    } catch (e) { console.error(e); res.status(500).json({sucesso:false,mensagem:'Erro ao gerar código.'}); }
}

async function redefinirSenha(req, res) {
    const {email,codigo,novaSenha} = req.body;
    const item = codigosRedefinicao.get(String(email||'').trim());
    if (!item || item.codigo !== String(codigo) || item.expira < Date.now()) return res.status(400).json({sucesso:false,mensagem:'Código inválido ou expirado.'});
    if (!novaSenha || novaSenha.length < 4) return res.status(400).json({sucesso:false,mensagem:'A nova senha precisa ter pelo menos 4 caracteres.'});
    try {
        const hash = await bcrypt.hash(novaSenha,10);
        const campo = item.nome==='adm'?'idUsuarioAdm':item.nome==='responsavel'?'idResp':'idAluno';
        await db.execute(`UPDATE ${item.tabela} SET senha=? WHERE ${campo}=?`,[hash,item.id]);
        codigosRedefinicao.delete(email);
        res.json({sucesso:true,mensagem:'Senha redefinida com sucesso.'});
    } catch(e){console.error(e);res.status(500).json({sucesso:false,mensagem:'Erro ao redefinir senha.'});}
}

async function senhaValida(senha, hash) {
    if (!hash) return false;
    if (String(hash).startsWith('$2')) return bcrypt.compare(senha, hash);
    return senha === hash;
}

async function login(req, res) {
    try {
        const { email, senha, tipo } = req.body;
        const perfis = { adm: [usuarioAdm, 'idUsuarioAdm'], responsavel: [usuarioResponsavel, 'idResp'], aluno: [usuarioAluno, 'idAluno'] };
        if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha || !Object.hasOwn(perfis, tipo))
            return res.status(400).json({sucesso:false,mensagem:'Informe e-mail, senha e um perfil válido.'});
        const [modelo, campo] = perfis[tipo];
        const usuario = await modelo.buscarPorEmail(email.trim());
        if (!usuario || !await senhaValida(senha, usuario.senha))
            return res.status(401).json({sucesso:false,mensagem:'E-mail ou senha incorretos para este perfil.'});
        if (tipo === 'adm' && usuario.status !== 'APROVADO')
            return res.status(403).json({sucesso:false,mensagem:usuario.status === 'REJEITADO' ? 'Sua solicitação de administrador foi rejeitada.' : 'Seu acesso de administrador aguarda aprovação.'});
        await new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));
        req.session.usuario = {id:usuario[campo],nome:usuario.nome,tipo};
        await new Promise((resolve,reject)=>req.session.save(e=>e?reject(e):resolve()));
        return res.json({sucesso:true,mensagem:'Login realizado.',tipo,nome:usuario.nome});
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({sucesso:false,mensagem:'Erro ao entrar. Verifique a conexão e a migração do banco.'});
    }
}

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
    usuarioLogado,
    solicitarRedefinicao,
    redefinirSenha
};
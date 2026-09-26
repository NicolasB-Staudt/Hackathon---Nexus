const express = require("express");

const router = express.Router();

const authController = require(
    "../controllers/authController"
);

const {
    verificarLogin
} = require(
    "../middlewares/authMiddleware"
);


router.post(
    "/login",
    authController.login
);


router.post(
    "/logout",
    authController.logout
);


router.get(
    "/me",
    verificarLogin,
    authController.usuarioLogado
);


router.post('/solicitar-redefinicao', authController.solicitarRedefinicao);
router.post('/redefinir', authController.redefinirSenha);

module.exports = router;
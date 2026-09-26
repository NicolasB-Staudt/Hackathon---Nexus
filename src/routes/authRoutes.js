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


module.exports = router;
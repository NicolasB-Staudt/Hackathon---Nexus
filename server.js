const express = require("express");
const session = require("express-session");

require("dotenv").config();

const conexao = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


app.use(
    session({

        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 8
        }

    })
);


app.use(
    "/api/auth",
    authRoutes
);


app.get("/", (req, res) => {

    res.send(
        "Servidor da Cantina CMD funcionando!"
    );

});


app.get("/teste-banco", async (req, res) => {

    try {

        const [resultado] =
            await conexao.query(
                "SELECT 1 AS teste"
            );

        res.json({
            sucesso: true,
            mensagem: "Node conectado ao MySQL!",
            resultado
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao conectar com o MySQL."
        });

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );

});
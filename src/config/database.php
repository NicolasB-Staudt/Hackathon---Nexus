<?php

class Database{
    private string $host = "localhost";
    private string $banco = "Cantina_CMD";
    private string $usuario = "root";
    private string $senha = "12345";

    public function conectar(){
        try {

            $conexao = new PDO(
                "mysql:host={$this->host};dbname={$this->banco};charset=utf8mb4",
                $this->usuario,
                $this->senha
            );

            $conexao->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            return $conexao;

        } catch (PDOException $erro) {

            die(
                "Erro na conexão com o banco: "
                . $erro->getMessage()
            );
        }
    }
}
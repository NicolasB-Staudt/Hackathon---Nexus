-- Execute uma única vez no banco da versão Hackathon-Cantina-final.
-- Faça backup antes. Contas existentes ficam pendentes por segurança.
-- Depois execute npm run seed:admin com credenciais definidas no .env.
USE Cantina_CMD;
ALTER TABLE usuario_Adm
 ADD COLUMN status ENUM('PENDENTE','APROVADO','REJEITADO') NOT NULL DEFAULT 'PENDENTE',
 ADD COLUMN dataSolicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 ADD COLUMN dataAprovacao DATETIME NULL,
 ADD COLUMN aprovadoPor INT NULL,
 ADD CONSTRAINT fk_adm_aprovador FOREIGN KEY (aprovadoPor) REFERENCES usuario_Adm(idUsuarioAdm);
-- Não exclui produtos, alunos, pedidos ou movimentações existentes.

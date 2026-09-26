# Cantina Escolar — SQLite

Esta versão não precisa de MySQL, SQL Server, XAMPP ou Workbench. O banco fica no arquivo local `database/cantina.sqlite` e é criado automaticamente.

## Como iniciar

Requisito: Node.js 20 ou superior.

1. Copie `.env.example` para `.env`.
2. No terminal, dentro da pasta do projeto, execute:

```cmd
npm install
npm run db:init
npm run seed:admin
npm start
```

3. Abra http://localhost:3000.
4. Escolha **Administrador** e entre com as credenciais do `.env`.

A configuração entregue usa:

```env
ADMIN_EMAIL=admin@cantina.com
ADMIN_PASSWORD=12345
ADMIN_NAME=Administrador
```

Troque a senha antes de publicar a aplicação na internet.

## Banco de dados

`npm run db:init` cria as tabelas sem dados falsos. Contas novas começam com saldo zero. Produtos, alunos, responsáveis, pedidos e movimentações só aparecem depois de cadastrados.

Para começar novamente com um banco vazio, pare o servidor e mova o arquivo `database/cantina.sqlite` para uma pasta de backup. Ao executar `npm run db:init`, um novo arquivo será criado. Não apague esse arquivo se quiser preservar os cadastros.

O arquivo `database/cantina_sqlite.sql` contém a estrutura atual. Os arquivos SQL antigos do MySQL foram mantidos apenas como referência histórica e não são usados nesta versão.

## Ordem recomendada

1. Entre como administrador.
2. Em **Cadastros**, crie os intervalos e responsáveis.
3. Em **Alunos**, cadastre alunos.
4. Em **Cadastros**, vincule cada responsável aos seus alunos.
5. Em **Cardápio**, cadastre produtos, imagens e estoque.
6. O responsável adiciona crédito e define o limite diário.
7. O aluno monta o pedido e acompanha o código de retirada.
8. A cantina prepara, entrega ou cancela pedidos.

Administradores novos começam como PENDENTE e precisam ser aprovados em **Aprovações**.

## CSS e acesso

Extraia o ZIP inteiro, mantendo `Html` e `public` como pastas irmãs. Para usar login e banco, execute `npm start` e abra http://localhost:3000. Abrir o HTML diretamente ou usar somente Live Server não executa o backend.

## Testes

```cmd
npm test
```

A aplicação foi testada com autenticação, aprovação de administradores, permissões, compra, estoque, saldo e estorno. O banco SQLite também foi verificado com criação real das tabelas e do administrador inicial.

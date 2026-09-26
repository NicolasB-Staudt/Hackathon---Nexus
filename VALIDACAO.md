# Verificação da entrega

- 20 testes HTTP de autenticação, aprovação, autorização, sessão e validações: aprovados.
- 6 testes de compra e transição de pedidos: aprovados.
- Testes usam adaptadores de banco simulados, sem tocar em dados do usuário.
- Sintaxe de todos os arquivos JavaScript revisada com node --check.
- Login inspecionado no navegador em desktop e em 390 px de largura.
- Inspeção de painel vazio, formulário de responsável, aluno sem produtos, carrinho sem intervalos e responsável sem vínculos, com respostas locais de teste.
- Banco SQLite real criado com 13 tabelas, sem servidor externo.
- Administrador inicial criado e login HTTP validado com sucesso.
- Fluxo completo validado: aluno, responsável, vínculo, intervalo, produto, crédito, pedido, cancelamento, reposição de estoque e estorno de saldo.

Os dados temporários da inspeção não estão incluídos no código-fonte. A versão pronta usa `sql.js` e grava os dados em `database/cantina.sqlite`.

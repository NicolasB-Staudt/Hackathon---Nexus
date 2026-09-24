# Guia de Git e GitHub pelo CMD do Windows (fluxo profissional)

Este guia usa somente o **Prompt de Comando (CMD)** do Windows, sem Git Bash e sem GitHub Desktop. Uma observação importante: o programa **Git precisa estar instalado**, porque `git clone`, `git push` e todos os outros comandos são comandos do Git. O que muda é que você digita tudo no CMD, e não no terminal do Git Bash.

A ordem de trabalho deste guia é a que profissionais seguem quando entram num projeto que já existe no GitHub: **primeiro definir a pasta no seu computador, depois clonar o repositório**, e só então começar a trabalhar. Faça sempre nessa ordem, e o histórico do GitHub não será apagado.

---

## 1. Por que clonar primeiro protege os commits do GitHub

Quando você dá `git clone`, o Git baixa **todo o histórico** do repositório e já configura o endereço do GitHub (o `origin`). A partir daí, sua pasta e o GitHub compartilham a mesma história, e cada `git push` apenas **acrescenta** commits novos por cima.

O erro clássico de quem está começando é o caminho inverso: criar uma pasta, rodar `git init`, fazer commits e tentar enviar para um repositório que já tinha commits. O GitHub recusa, porque as duas histórias são diferentes, e a "solução" que muita gente encontra na internet é `git push --force`, que **substitui a história do GitHub pela sua e apaga os commits dos colegas**. Clonar primeiro elimina esse problema na origem.

Três regras que valem durante todo o hackathon:

1. Nunca rode `git init` numa pasta cujo projeto já existe no GitHub. Use `git clone`.
2. Nunca use `git push --force` (nem `-f`). Se o push for rejeitado, a resposta é `git pull`, nunca força.
3. Antes de começar qualquer tarefa e antes de cada push, traga as novidades com `git pull`.

---

## 2. Comandos básicos do CMD que você vai usar

| Comando | O que faz | Exemplo |
|---|---|---|
| `cd pasta` | Entra numa pasta | `cd Projetos` |
| `cd ..` | Sobe um nível | `cd ..` |
| `cd /d D:\Pasta` | Troca de unidade (C:, D:) e entra na pasta | `cd /d D:\Projetos` |
| `dir` | Lista arquivos e pastas | `dir` |
| `dir /a` | Lista também os itens ocultos (como `.git`) | `dir /a` |
| `mkdir pasta` | Cria uma pasta (cria as intermediárias também) | `mkdir C:\Projetos\Hackathon` |
| `type arquivo` | Mostra o conteúdo de um arquivo | `type README.md` |
| `copy origem destino` | Copia um arquivo | `copy a.txt b.txt` |
| `move origem destino` | Move ou renomeia | `move a.txt pasta\` |
| `del arquivo` | Apaga um arquivo | `del teste.txt` |
| `cls` | Limpa a tela | `cls` |
| `start .` | Abre a pasta atual no Explorador | `start .` |
| `code .` | Abre a pasta no VS Code (se instalado) | `code .` |

Duas armadilhas específicas do CMD que confundem muito quem vem do Git Bash:

- **Aspas simples não funcionam.** Use sempre aspas duplas: `git commit -m "feat: nova tela"`. Com aspas simples, o CMD leva o texto errado ao Git.
- **Evite os caracteres `& ^ % | < >` dentro da mensagem de commit**, porque o CMD os interpreta como comandos. Escreva "e" em vez de "&".

Para abrir o CMD: aperte `Win + R`, digite `cmd` e Enter. Uma dica útil é abrir a pasta desejada no Explorador, clicar na barra de endereço, digitar `cmd` e apertar Enter: o CMD abre já dentro daquela pasta.

---

## 3. Preparação única (cada pessoa faz uma vez)

### 3.1 Conferir ou instalar o Git

```cmd
git --version
```

Se aparecer um número de versão, está instalado. Se der "não é reconhecido como um comando", instale pelo próprio CMD (Windows 10/11):

```cmd
winget install --id Git.Git -e --source winget
```

Depois **feche e abra o CMD de novo** para o Windows reconhecer o `git`.

### 3.2 Identificar-se

Use o mesmo e-mail da conta do GitHub:

```cmd
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf true
git config --global core.longpaths true
```

As duas últimas são específicas do Windows: `core.autocrlf true` evita que a diferença de quebra de linha entre Windows e Linux/Mac apareça como se o arquivo inteiro tivesse mudado, e `core.longpaths true` evita erros com caminhos muito compridos (comuns em `node_modules`).

Para conferir o que ficou gravado:

```cmd
git config --list
```

### 3.3 Autenticar no GitHub

O GitHub não aceita mais senha comum no terminal. O Git para Windows já vem com o **Git Credential Manager**: na primeira vez que você clonar ou der push num repositório privado, abre uma janela do navegador para você entrar na conta, e ele guarda o login. Na maioria dos casos, isso basta.

Se preferir um caminho explícito, instale o GitHub CLI e faça o login uma vez:

```cmd
winget install --id GitHub.cli -e
gh auth login
```

Escolha GitHub.com, HTTPS e autenticar pelo navegador. (Feche e reabra o CMD depois de instalar.)

---

## 4. Fluxo profissional, passo a passo

### Passo 1: escolher e criar a pasta onde o projeto vai ficar

Decida um lugar fixo, sem espaços nem acentos no caminho, e evite pastas sincronizadas como OneDrive ou Área de Trabalho (elas causam conflitos com o Git). Uma boa escolha é `C:\Projetos`:

```cmd
mkdir C:\Projetos\Hackathon
cd /d C:\Projetos\Hackathon
```

Confira onde você está:

```cmd
cd
```

(Sozinho, `cd` mostra a pasta atual.)

### Passo 2: clonar o repositório

Copie a URL na página do repositório no GitHub (botão verde **Code**) e rode:

```cmd
git clone https://github.com/USUARIO/REPOSITORIO.git
```

Isso cria a pasta `REPOSITORIO` dentro de `C:\Projetos\Hackathon`, com todo o código e todo o histórico. Se quiser que a pasta tenha outro nome:

```cmd
git clone https://github.com/USUARIO/REPOSITORIO.git nome-da-pasta
```

Se quiser clonar **dentro da própria pasta atual**, que precisa estar vazia, use o ponto no final:

```cmd
git clone https://github.com/USUARIO/REPOSITORIO.git .
```

### Passo 3: entrar no projeto e conferir que está tudo certo

```cmd
cd REPOSITORIO
git status
git remote -v
git log --oneline -10
git branch -a
```

O que você deve ver: `git status` dizendo "On branch main" e "up to date with 'origin/main'"; `git remote -v` mostrando a URL do GitHub como `origin`; e `git log` listando os commits que já existiam. Se os commits do GitHub aparecem aqui, o clone funcionou e nada foi perdido.

### Passo 4: se você já tem arquivos prontos em outra pasta

Muita gente começa o código antes de clonar. Nesse caso **não** rode `git init` na pasta antiga. Clone primeiro (passos 1 a 3) e depois copie seus arquivos para dentro da pasta clonada, **sem tocar na pasta oculta `.git`**. O `robocopy` faz isso com segurança:

```cmd
robocopy "C:\MeuProjetoAntigo" "C:\Projetos\Hackathon\REPOSITORIO" /E /XD .git node_modules
```

O `/E` copia as subpastas, e o `/XD .git node_modules` exclui essas pastas da cópia (a `.git` nunca deve ser sobrescrita). Depois veja o que mudou e siga o fluxo normal:

```cmd
git status
```

### Passo 5: criar um branch para a sua tarefa

Nunca trabalhe direto na `main`. Antes de qualquer tarefa, atualize e crie um branch:

```cmd
git checkout main
git pull origin main
git checkout -b feature/nome-da-tarefa
```

### Passo 6: trabalhar e registrar o progresso

Edite os arquivos no seu editor (`code .` abre o VS Code). Faça commits pequenos e frequentes:

```cmd
git status
git add .
git commit -m "feat: descricao curta do que foi feito"
```

Para adicionar só um arquivo específico, use `git add caminho\arquivo.js`. Para ver o que vai entrar no commit antes de confirmar, rode `git diff --staged`.

### Passo 7: enviar para o GitHub sem apagar nada

Antes do push, traga as novidades dos colegas:

```cmd
git pull origin main
git push -u origin feature/nome-da-tarefa
```

O `-u` só é necessário na primeira vez de cada branch; depois basta `git push`. Como você está enviando um **branch novo** e o histórico é o mesmo do GitHub, o envio apenas acrescenta commits, e nada é sobrescrito.

### Passo 8: abrir o Pull Request e integrar

No GitHub aparece o botão **Compare & pull request**. Descreva a mudança, peça a revisão de um colega e faça o merge pelo botão do site. Pelo CMD, com o GitHub CLI:

```cmd
gh pr create --base main --title "feat: nome da tarefa" --body "Descricao do que foi feito"
```

### Passo 9: voltar para a main e limpar

```cmd
git checkout main
git pull origin main
git branch -d feature/nome-da-tarefa
```

Repita a partir do Passo 5 para a próxima tarefa.

---

## 5. Criando o .gitignore pelo CMD

Crie o `.gitignore` **antes do primeiro commit** para não versionar arquivos pesados ou secretos. O jeito mais seguro no CMD é abrir o Bloco de Notas:

```cmd
notepad .gitignore
```

Cole o conteúdo abaixo (ajuste à sua linguagem), salve e feche:

```gitignore
node_modules/
venv/
__pycache__/
.gradle/
build/
.env
*.key
local.properties
.idea/
.vscode/
Thumbs.db
```

Se o Bloco de Notas perguntar se deve criar o arquivo, clique em Sim. Ao salvar, confira que o nome ficou `.gitignore` e não `.gitignore.txt` (rode `dir /a` para ver).

Nunca faça commit de senhas, tokens ou arquivos `.env`. Se isso acontecer, considere a chave comprometida e gere outra.

---

## 6. Como ver o que existe no GitHub antes de mexer (segurança extra)

Estes comandos **não alteram** nada nos seus arquivos e servem para conferir a situação:

```cmd
git fetch origin
git log origin/main --oneline -10
git diff main origin/main --stat
git log --oneline --graph --all
```

O `git fetch` baixa as informações novas do GitHub sem misturar com o seu trabalho; os outros comandos mostram o que os colegas enviaram. Vale como hábito antes de um merge importante.

---

## 7. Resolvendo conflitos

Se o `git pull` ou `git merge` avisar de conflito, o Git não perdeu nada: ele só está pedindo que você decida. Rode `git status` para ver quais arquivos estão em conflito, abra cada um e procure as marcações:

```
<<<<<<< HEAD
seu código
=======
código dos colegas
>>>>>>> origin/main
```

Deixe a versão final correta, apague as três linhas de marcação, e então:

```cmd
git add arquivo-resolvido.js
git commit -m "merge: resolve conflito com a main"
git push
```

Para desistir do merge e voltar ao estado anterior: `git merge --abort`. O VS Code destaca conflitos com botões "Accept Current", "Accept Incoming" e "Accept Both", o que ajuda bastante.

---

## 8. Se algo der errado: desfazer sem perder o histórico

| Situação | Comando |
|---|---|
| Descartar edição de um arquivo ainda não adicionado | `git restore arquivo` |
| Tirar um arquivo do `git add` (mantendo a edição) | `git restore --staged arquivo` |
| Desfazer o último commit local, mantendo as edições | `git reset --soft HEAD~1` |
| Desfazer um commit **já enviado**, de forma segura | `git revert HASH` |
| Guardar trabalho pela metade para trocar de branch | `git stash` e depois `git stash pop` |
| Ver tudo o que você fez, inclusive o que "sumiu" | `git reflog` |

O `git revert` é o jeito certo de desfazer algo que já está no GitHub, porque cria um novo commit que anula o anterior, em vez de reescrever a história. Já `git reset --hard` apaga suas alterações locais e **não deve ser usado** se você não tem certeza do que está descartando. Se você achar que perdeu algo, rode `git reflog` antes de qualquer coisa: quase sempre dá para recuperar o commit pelo hash que ele mostra.

---

## 9. Protegendo o GitHub contra apagamentos (o dono do repositório faz)

Mesmo com todos os cuidados, vale travar a `main` no próprio GitHub. Vá em **Settings → Branches → Add branch protection rule**, digite `main` como padrão e ative:

- **Require a pull request before merging** (ninguém envia direto para a `main`).
- **Do not allow force pushes**, que já vem ativo quando a proteção existe e impede que alguém sobrescreva a história.
- **Do not allow deletions**, para ninguém apagar a `main`.

Assim, até um `git push --force` acidental de um colega é bloqueado pelo GitHub.

---

## 10. Problemas comuns no CMD

| Problema | Causa provável | Solução |
|---|---|---|
| `'git' não é reconhecido como um comando` | Git não instalado ou CMD aberto antes da instalação | Instale (seção 3.1) e reabra o CMD |
| `fatal: not a git repository` | Você está fora da pasta do projeto | Use `cd` até a pasta clonada |
| `fatal: destination path already exists` | A pasta do clone já existe e não está vazia | Escolha outra pasta ou outro nome no `git clone` |
| `Authentication failed` | Login não feito ou expirado | `gh auth login` ou refaça o login pelo navegador |
| `rejected ... non-fast-forward` | O GitHub tem commits que você não tem | `git pull origin main`, resolva conflitos e `git push`. **Não use --force** |
| `Please commit your changes or stash them` | Há edições não salvas ao trocar de branch | Faça commit ou `git stash` |
| Mensagem de commit sai cortada ou dá erro | Aspas simples ou caracteres como `&` | Use aspas duplas e evite `& ^ % | < >` |
| `Filename too long` | Caminho excede o limite do Windows | `git config --global core.longpaths true` |
| `dubious ownership` | Pasta pertence a outro usuário do Windows | Rode o comando que o próprio Git sugere (`git config --global --add safe.directory ...`) |
| Arquivos aparecem todos como modificados | Diferença de quebra de linha | `git config --global core.autocrlf true` |

---

## 11. Cola rápida (CMD, do zero ao push)

```cmd
:: --- uma vez por pessoa ---
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"
git config --global core.autocrlf true
gh auth login

:: --- uma vez por projeto: pasta primeiro, clone depois ---
mkdir C:\Projetos\Hackathon
cd /d C:\Projetos\Hackathon
git clone https://github.com/USUARIO/REPOSITORIO.git
cd REPOSITORIO
git log --oneline -10

:: --- a cada tarefa ---
git checkout main
git pull origin main
git checkout -b feature/minha-tarefa
:: ...edite os arquivos...
git add .
git commit -m "feat: o que eu fiz"
git pull origin main
git push -u origin feature/minha-tarefa
gh pr create --base main --title "feat: minha tarefa" --body "Descricao"

:: --- depois do merge ---
git checkout main
git pull origin main
git branch -d feature/minha-tarefa
```

Seguindo esta ordem (pasta, clone, branch, commit, pull, push, Pull Request) e a regra de nunca usar `--force`, o histórico do GitHub fica preservado durante todo o hackathon.

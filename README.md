# BrilliantPDF

**BrilliantPDF** é um projeto base que integra [Tauri](https://tauri.app/), [React](https://reactjs.org/) e [Rust](https://www.rust-lang.org/) para construir aplicações desktop modernas, rápidas e multiplataforma.

---

## 📁 Estrutura do Projeto

```
BrilliantPDF-RustAndJs/
├── .idea/                   # Configurações do ambiente de desenvolvimento (IDE)
├── src-tauri/               # Backend Tauri com código em Rust
├── src/                     # Código-fonte do frontend em React
├── index.html               # Entrada HTML principal
├── output.css               # Arquivo CSS final gerado
├── package.json             # Dependências e scripts do projeto
├── package-lock.json        # Lockfile do npm
├── postcss.config.js        # Configuração do PostCSS
├── tailwind.config.js       # Configuração do Tailwind CSS
├── vite.config.js           # Configuração do Vite
├── splashscreen.html        # Tela de carregamento inicial
└── README.md                # Documentação do projeto
```

---

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** – Biblioteca para criação de interfaces de usuário
- **TypeScript** – Tipagem estática para JavaScript
- **Vite** – Empacotador moderno e rápido
- **Tailwind CSS** – Framework CSS utilitário
- **React Router** – Navegação entre páginas
- **i18n** – Suporte a múltiplos idiomas (PT, EN, ES)
- **Sonner** – Notificações toast
- **Lucide Icons** – Ícones SVG

### Backend & Desktop
- **Tauri 2** – Framework desktop seguro e leve
- **Rust** – Backend seguro e performático
- **SQLite** – Banco de dados local
- **Prisma** – ORM para Node.js/Rust

### API (Opcional - para deploy)
- **Express.js** – Framework web Node.js
- **Prisma** – ORM para banco de dados
- **PostgreSQL** – Banco de dados produção
- **JWT** – Autenticação por token
- **Swagger** – Documentação API

---

## 🛠️ Requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/)

---

## ⚙️ Como Rodar o Projeto

### Iniciantes (Rápido)

```bash
# 1. Clone o repositório
git clone https://github.com/JockaMt/brilliantsoftwarepdf.git
cd brilliantsoftwarepdf

# 2. Instale dependências
npm install

# 3. Inicie em modo desenvolvimento
npm run tauri dev
```

### Detalhado (Passo a Passo)

Veja a seção **Guia Passo a Passo para Começar** abaixo para um guia completo.

---

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](./LICENSE).

---

## 🔒 Update

Como atualizar o programa:

#### Passo 1:

Gerar uma assinatura, para isso usa-se esse comando:

```.powershell
tauri signer sign -f "$env:USERPROFILE\.tauri\brilliantpdf.key" "<caminho_do_instalador>.msi"
```
#### Passo 2:

Inserir a `senha_de_assinatura`, e isso irá gerar um .sig assinado, dentro dele está a chave para colocar no arquivo json que o atualizador busca, com o instalador.

✅ Pronto, após isso, o aplicativo já vai baixar a nova atualização.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Siga este guia passo a passo para começar a contribuir.

### 📋 Pré-requisitos para Contribuir

Antes de começar, certifique-se de ter instalado:

- **[Git](https://git-scm.com/)** – Controle de versão
- **[Node.js v18+](https://nodejs.org/)** – Runtime JavaScript
- **[Rust 1.70+](https://www.rust-lang.org/tools/install)** – Compilador Rust
- **[Visual Studio Code](https://code.visualstudio.com/)** – Editor recomendado
- **[Git Bash](https://gitforwindows.org/)** ou Terminal PowerShell (Windows)

### 🚀 Guia Passo a Passo para Começar

#### Passo 1: Fork e Clone o Repositório

```bash
# 1.1 - Faça um fork no GitHub
# Acesse https://github.com/JockaMt/brilliantsoftwarepdf
# Clique em "Fork" no canto superior direito

# 1.2 - Clone seu fork
git clone https://github.com/SEU-USUARIO/brilliantsoftwarepdf.git
cd brilliantsoftwarepdf

# 1.3 - Adicione o repositório original como upstream
git remote add upstream https://github.com/JockaMt/brilliantsoftwarepdf.git

# 1.4 - Verifique os remotes
git remote -v
# Deve mostrar:
# origin    https://github.com/SEU-USUARIO/brilliantsoftwarepdf.git
# upstream  https://github.com/JockaMt/brilliantsoftwarepdf.git
```

#### Passo 2: Instale as Dependências

```bash
# 2.1 - Instale dependências do frontend
npm install

# 2.2 - Verifique as dependências instaladas
npm list
```

#### Passo 3: Configure o Ambiente

```bash
# 3.1 - Crie o arquivo .env na raiz do projeto
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env

# 3.2 - Configure a variável de ambiente (se necessário)
# Edite o arquivo .env e adicione:
VITE_API_URL=http://localhost:3030/api
```

#### Passo 4: Execute o Projeto em Desenvolvimento

```bash
# 4.1 - Inicie o Tauri em modo desenvolvimento
npm run tauri dev

# Isso abrirá:
# - Uma janela da aplicação desktop
# - Servidor Vite em http://localhost:1420
# - DevTools do Tauri para debugging
```

#### Passo 5: Faça Suas Mudanças

```bash
# 5.1 - Crie uma branch para sua feature
git checkout -b feature/nome-da-funcionalidade
# Exemplo: git checkout -b feature/add-dark-mode

# 5.2 - Faça suas mudanças no código
# - Frontend: edite em src/
# - Backend Rust: edite em src-tauri/src/

# 5.3 - Teste suas mudanças
npm run tauri dev

# 5.4 - Verifique o build
npm run build
```

#### Passo 6: Commit e Push

```bash
# 6.1 - Verifique as mudanças
git status
git diff

# 6.2 - Adicione seus arquivos
git add .

# 6.3 - Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade"
# Exemplos de tipos:
# feat:    Nova funcionalidade
# fix:     Correção de bug
# docs:    Mudanças na documentação
# style:   Formatação, sem mudanças lógicas
# refactor: Refatoração de código
# perf:    Melhoria de performance
# test:    Adição de testes

# 6.4 - Push para seu fork
git push origin feature/nome-da-funcionalidade
```

#### Passo 7: Abra um Pull Request

```bash
# 7.1 - Acesse https://github.com/SEU-USUARIO/brilliantsoftwarepdf
# 7.2 - Clique em "Compare & pull request"
# 7.3 - Preencha o formulário:
#   - Título: Descrição clara da mudança
#   - Descrição: Contexto, por que fez, como testa
#   - Linked issues: Se relacionado a uma issue
# 7.4 - Clique em "Create pull request"
```

#### Passo 8: Responda aos Feedbacks

```bash
# 8.1 - Se houver comentários, faça as alterações
# 8.2 - Commit e push novamente
git add .
git commit -m "fix: ajusta conforme feedback"
git push origin feature/nome-da-funcionalidade

# 8.3 - O PR será atualizado automaticamente
```

### 📁 Estrutura para Contribuidores

**Se trabalha no Frontend (React/TypeScript):**
```
src/
├── components/        # Componentes React reutilizáveis
├── hooks/            # Custom hooks
├── routes/           # Páginas/rotas
├── i18n/             # Traduções (pt, en, es)
├── lib/              # Utilidades
├── utils/            # Funções auxiliares
└── styles.css        # Variáveis CSS (Tailwind)
```

**Se trabalha no Backend (Rust):**
```
src-tauri/src/
├── commands.rs       # Comandos Tauri (IPC)
├── db/              # Lógica de banco de dados
├── models/          # Estruturas de dados
├── settings/        # Configurações do app
└── updater/         # Sistema de atualização
```

### 🔧 Comandos Úteis para Desenvolvimento

```bash
# Modo desenvolvimento
npm run tauri dev

# Build para produção
npm run build

# Apenas compilar TypeScript
npm run tsc

# Compilar Rust (debug)
npm run tauri build --debug

# Verificar tipos TypeScript
npx tsc --noEmit

# Formatar código
npm run format  # se disponível
```

### 🎨 Boas Práticas

1. **Escreva código limpo:**
   - Use nomes descritivos
   - Evite função com >20 linhas
   - Comente código complexo

2. **Siga o padrão do projeto:**
   - TypeScript com tipos explícitos
   - Componentes funcionais com hooks
   - Tailwind para estilização

3. **Teste suas mudanças:**
   - Execute o app em dev
   - Teste em diferentes idiomas (pt, en, es)
   - Teste no responsive (mobile/tablet/desktop)

4. **Mantenha o histórico limpo:**
   - Commits pequenos e focados
   - Mensagens claras em inglês

5. **Sincronize com o upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/master
   git push origin feature/minha-feature --force
   ```

### 🐛 Reportar Bugs

1. Verifique se o bug já não foi reportado
2. Inclua:
   - Descrição clara
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots/logs se aplicável
   - Sistema operacional e versões

### ✨ Sugerir Novas Funcionalidades

1. Descreva o use case
2. Explique como isso ajuda usuários
3. Forneça exemplos ou mockups
4. Discuta abordagens possíveis

### 👨‍💻 Contribuintes

- [Caio Teixeira](https://github.com/CaioXTSY)
- [JockaMt](https://github.com/JockaMt)

---

## 🔗 Links Úteis

- [Tauri Docs](https://tauri.app/)
- [React Docs](https://react.dev/)
- [Rust Lang](https://www.rust-lang.org/)

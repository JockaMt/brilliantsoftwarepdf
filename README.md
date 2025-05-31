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

- **Tauri** – Framework desktop seguro e leve usando web + Rust
- **React** – Biblioteca para criação de interfaces de usuário
- **Vite** – Empacotador de módulos moderno e rápido
- **Tailwind CSS** – Framework CSS utilitário para estilização ágil
- **Rust** – Backend seguro e performático

---

## 🛠️ Requisitos

Certifique-se de ter instalado:

- [Node.js](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites/)

---

## ⚙️ Como Rodar o Projeto

```bash
# Clone o repositório
git clone https://github.com/JockaMt/BrilliantPDF-RustAndJs.git
cd BrilliantPDF-RustAndJs

# Instale as dependências do frontend
npm install

# Execute o app em modo desenvolvimento
npm run tauri dev
```

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

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request com melhorias, correções ou novas ideias.

### 👨‍💻 Contribuintes

- [Caio Teixeira](https://github.com/CaioXTSY)

---

## 🔗 Links Úteis

- [Tauri Docs](https://tauri.app/)
- [React Docs](https://react.dev/)
- [Rust Lang](https://www.rust-lang.org/)

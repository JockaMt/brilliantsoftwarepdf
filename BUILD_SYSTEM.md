# 🔨 Build System - Brilliant PDF

Este documento explica o sistema de build automático que compila scripts Python durante o processo de build do Tauri.

## 📋 Visão Geral

O sistema implementa compilação automática dos scripts Python usando PyInstaller, criando executáveis independentes que não requerem Python instalado no sistema do usuário.

### 🔄 Fluxo de Build

```
1. Build do Tauri inicia
   ↓
2. build.rs executa build_scripts.py
   ↓
3. Python instala PyInstaller (se necessário)
   ↓
4. PyInstaller compila pdf_generator.py → pdf_generator.exe
   ↓
5. Tauri inclui executável no bundle
   ↓
6. App usa executável compilado em runtime
```

## 📁 Estrutura de Arquivos

```
src-tauri/
├── build.rs                 # Script de build Rust
├── build_scripts.py         # Compilador Python
├── scripts/
│   ├── pdf_generator.py     # Script fonte
│   ├── pdf_generator.exe    # Executável compilado (gerado)
│   └── requirements.txt     # Dependências Python
└── target/release/
    └── scripts/
        └── pdf_generator.exe # Copiado para release
```

## 🚀 Como Usar

### Build Automático (Recomendado)
```bash
# Build normal - compila Python automaticamente
npm run tauri build

# Build de desenvolvimento
npm run tauri dev
```

### Build Manual com Script PowerShell
```powershell
# Build completo
.\build.ps1 -Release

# Apenas compilar Python
.\build.ps1 -CompileOnly

# Build sem compilar Python
.\build.ps1 -SkipPython

# Build de desenvolvimento
.\build.ps1
```

### Compilação Manual Python
```bash
cd src-tauri
python build_scripts.py
```

## ⚙️ Configuração

### build.rs
- Detecta mudanças em `scripts/pdf_generator.py`
- Executa `build_scripts.py` automaticamente
- Mostra logs coloridos durante build
- Não falha o build se Python não estiver disponível

### build_scripts.py
- Instala PyInstaller automaticamente
- Verifica dependências (reportlab, Pillow)
- Compila para executável único
- Remove arquivos temporários
- Suporte multiplataforma (Windows/Linux/macOS)

### Comando Rust Inteligente
```rust
// Prioridade de execução:
1. pdf_generator.exe (se existe) - SEM dependência Python
2. pdf_generator.py + python     - COM dependência Python
3. Erro se nenhum encontrado
```

## 🎯 Vantagens do Sistema

### ✅ Para Usuários
- **Sem Python Required**: Executável independente
- **Install Simples**: Apenas um installer
- **Performance**: Startup mais rápido
- **Compatibilidade**: Funciona em qualquer Windows

### ✅ Para Desenvolvedores
- **Build Automático**: Zero configuração manual
- **Fallback Inteligente**: Usa .py se .exe não existir
- **Debug Friendly**: Logs detalhados
- **Cross-Platform**: Windows, Linux, macOS

## 🔧 Troubleshooting

### Python não encontrado
```
cargo:warning=❌ Erro ao executar Python: program not found
```
**Solução**: Instalar Python e adicionar ao PATH

### PyInstaller falha
```
❌ Erro no PyInstaller: ...
```
**Soluções**:
- Verificar dependências: `pip install reportlab Pillow`
- Executar manual: `python build_scripts.py`
- Verificar antivírus (pode bloquear PyInstaller)

### Executável não criado
```
❌ Executável não encontrado: scripts/pdf_generator.exe
```
**Soluções**:
- Compilar manual: `cd src-tauri && python build_scripts.py`
- Verificar permissões de escrita
- Verificar espaço em disco

## 📊 Build Output

### Sucesso
```
🚀 Iniciando compilação do gerador PDF...
🐍 Python: 3.11.0
✅ Todas as dependências estão instaladas
✅ PyInstaller já está instalado
🔨 Compilando gerador PDF...
✅ Executável criado: scripts/pdf_generator.exe
📏 Tamanho: 45.2 MB
🧹 Arquivos temporários removidos
🎉 Compilação concluída com sucesso!
```

### Warning (não crítico)
```
cargo:warning=❌ Erro ao executar Python: program not found
cargo:warning=💡 Certifique-se de que Python está instalado e no PATH
cargo:warning=⚠️ Build continuará sem scripts compilados
```

## 🎛️ Configurações Avançadas

### PyInstaller Options
No `build_scripts.py`:
```python
cmd = [
    "pyinstaller",
    "--onefile",                    # Arquivo único
    "--noconsole",                 # Sem janela console
    "--optimize", "2",             # Otimização máxima
    "--strip",                     # Remove símbolos debug
    str(pdf_script)
]
```

### Build Condicional
No `build.rs`:
```rust
// Recompilar apenas se scripts mudaram
println!("cargo:rerun-if-changed=scripts/pdf_generator.py");
println!("cargo:rerun-if-changed=build_scripts.py");
```

## 📈 Performance

### Comparação de Tamanhos
- **pdf_generator.py**: ~20 KB
- **pdf_generator.exe**: ~45 MB
- **Python + deps**: ~200 MB

### Startup Time
- **Executável**: ~100ms
- **Python script**: ~500ms

## 🔄 Atualizações

Para atualizar o sistema:

1. **Modificar Python**: Edite `scripts/pdf_generator.py`
2. **Build automático**: `npm run tauri build`
3. **O novo .exe** será criado automaticamente

## 📝 Logs de Build

Os logs são exibidos com prefixo `cargo:warning=` durante o build:
```
cargo:warning=🚀 Compilando scripts Python...
cargo:warning=✅ Scripts Python compilados com sucesso
```

---

**Nota**: Este sistema garante que o PDF generator funcione mesmo sem Python instalado no sistema do usuário final, proporcionando uma experiência de instalação mais simples e confiável.

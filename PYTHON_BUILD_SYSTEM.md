# 🔄 Sistema de Recompilação Automática Python

Este sistema garante que o script Python seja **sempre recompilado** automaticamente durante qualquer build ou atualização da aplicação.

## 🎯 Funcionamento

### 1. **Build Automático (`build.rs`)**
- Executa **toda vez** que a aplicação é compilada (dev ou release)
- Monitora mudanças nos arquivos Python
- Força recompilação mesmo se executável já existir

### 2. **Script de Compilação (`build_scripts.py`)**
- Remove executável anterior (força rebuild)
- Instala dependências automaticamente
- Compila com PyInstaller usando flags otimizadas
- Limpa arquivos temporários

### 3. **Configuração Tauri (`tauri.conf.json`)**
- Inclui tanto `.exe` quanto `.py` nos recursos
- Garante compatibilidade com sistemas sem Python

## 🚀 Benefícios

### ✅ **Sempre Atualizado**
- Script Python recompilado a cada build
- Mudanças no código refletidas imediatamente
- Sem necessidade de intervenção manual

### ✅ **Dependências Automáticas**
- Instala reportlab, Pillow automaticamente
- Verifica e instala PyInstaller se necessário
- Build confiável em qualquer máquina

### ✅ **Otimização**
- Executável único (--onefile)
- Sem janela de console (--noconsole) 
- Cache limpo a cada build (--clean)
- Arquivos temporários removidos

### ✅ **Compatibilidade**
- Funciona no Windows e Linux
- Fallback para Python se exe não existir
- Logs detalhados durante compilação

## 🔧 Comandos Úteis

### Build Completo
```bash
npm run tauri build
```

### Build Development
```bash
npm run tauri dev
```

### Teste Isolado da Compilação
```bash
cd src-tauri
python test_build.py
```

## 📊 Métricas

- **Tamanho do Executável**: ~18MB
- **Tempo de Compilação**: ~30-60 segundos
- **Dependências Incluídas**: reportlab, Pillow, todas as libs Python

## 🔍 Logs

Durante o build, você verá:
```
🔄 Recompilando scripts Python...
🐍 Executando compilação Python...
✅ Scripts Python compilados com sucesso
Executável criado: scripts/pdf_generator.exe
Tamanho: 18.2 MB
```

## 🛠️ Resolução de Problemas

### Python não encontrado
- Instale Python 3.7+ 
- Adicione ao PATH do sistema

### PyInstaller falha
- Execute: `pip install --upgrade pyinstaller`
- Verifique antivírus (pode bloquear execução)

### Dependências missing
- Script instala automaticamente
- Se falhar, execute: `pip install reportlab Pillow`

## 📝 Arquivos Envolvidos

- `src-tauri/build.rs` - Trigger de compilação automática
- `src-tauri/build_scripts.py` - Script de compilação Python  
- `src-tauri/test_build.py` - Teste isolado da compilação
- `src-tauri/scripts/pdf_generator.py` - Script fonte
- `src-tauri/scripts/pdf_generator.exe` - Executável gerado
- `src-tauri/tauri.conf.json` - Configuração de recursos

---

**Resultado**: Sistema completamente automatizado que **sempre** gera executáveis Python atualizados, sem intervenção manual! 🎉

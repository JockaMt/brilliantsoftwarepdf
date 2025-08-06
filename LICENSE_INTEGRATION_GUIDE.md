# Sistema de Licenciamento Integrado - Brilliant PDF

## Visão Geral

Este sistema integra validação de licença no aplicativo Tauri, garantindo que o produto só possa ser usado com uma licença válida. O sistema funciona tanto online quanto offline, com verificações periódicas.

## Arquitetura

### Backend (Rust/Tauri)

1. **Módulo `license`**:
   - `validator.rs`: Lógica principal de validação
   - `storage.rs`: Gerenciamento de dados locais
   - `types.rs`: Definições de tipos
   - `commands.rs`: Comandos Tauri expostos ao frontend
   - `guard.rs`: Middleware de proteção

2. **Funcionalidades**:
   - Ativação inicial com chave de licença
   - Validação online/offline
   - Renovação de licenças
   - Período de graça offline (30 dias por padrão)
   - Verificação periódica em background

### Frontend (React/TypeScript)

1. **Componentes**:
   - `LicenseActivation`: Interface de ativação
   - `LicenseGuard`: Componente de proteção do app
   - `useLicense`: Hook para gerenciar estado da licença

2. **Fluxo de Proteção**:
   - App inicia → Verifica licença → Mostra ativação ou permite uso
   - Verificações periódicas em background
   - Avisos de expiração próxima

### API (Node.js/Express)

1. **Endpoints**:
   - `POST /api/activate`: Ativa produto
   - `POST /api/validate`: Valida licença
   - `PUT /api/renew-brilliant-pdf`: Renova licença
   - `GET /api/licenses`: Lista licenças (admin)

## Como Usar

### 1. Gerar uma Licença na API

```bash
curl -X POST http://localhost:3000/api/license \\
  -H "Content-Type: application/json" \\
  -d '{"productId": "PROD001"}'
```

### 2. Ativar o Produto

1. Execute o aplicativo Tauri
2. O sistema mostrará a tela de ativação
3. Insira a chave de licença fornecida
4. Clique em "Ativar Produto"
5. O código da máquina é obtido automaticamente pelo sistema

### 3. Uso Normal

- O app verificará a licença automaticamente
- Funcionará offline por até 30 dias
- Mostrará avisos quando próximo da expiração
- Permitirá renovação online

## Configuração

### Variáveis Importantes

**Rust (`validator.rs`)**:
```rust
// URL da API de validação
api_base_url: "https://brilliantsoftwareapi.onrender.com"

// Intervalo de verificação (3600s = 1 hora)
interval(Duration::from_secs(3600))
```

**Frontend (`useLicense.ts`)**:
```typescript
// Verificação a cada 30 minutos
const interval = setInterval(() => {
  // ...
}, 30 * 60 * 1000);
```

### Produto ID

O sistema usa `PROD001` como ID do produto padrão. Para adicionar novos produtos:

1. Atualize o enum no `schema.prisma`:
```prisma
enum Product {
  PROD001
  PROD002  // Novo produto
}
```

2. Execute as migrações:
```bash
prisma migrate dev --name add_new_product
```

## Comandos Tauri Disponíveis

### Verificação de Status
- `is_license_activated()`: Verifica se está ativado
- `validate_current_license()`: Valida licença atual
- `get_license_info()`: Obtém informações detalhadas

### Gerenciamento
- `activate_license(key)`: Ativa com chave (código da máquina obtido automaticamente)
- `renew_license()`: Renova licença online
- `deactivate_license()`: Remove ativação
- `get_machine_code()`: Obtém código da máquina (uso interno)

## Funcionalidades Protegidas

### Exemplo de Proteção de Comando

```rust
#[tauri::command]
pub fn generate_pdf(db: State<DbConn>) -> Result<String, String> {
    // Verificar licença antes de executar
    check_license_middleware()?;
    
    // Resto da lógica...
}
```

### Proteção no Frontend

```tsx
function App() {
  return (
    <LicenseGuard>
      {/* Componentes protegidos */}
      <MainApp />
    </LicenseGuard>
  );
}
```

## Comportamento Offline

1. **Primeira Ativação**: Requer internet
2. **Uso Offline**: Permitido por até 30 dias
3. **Reativação**: Necessária após período offline
4. **Cache Local**: Informações armazenadas em `%APPDATA%/BrilliantPDF/license/`

## Segurança

### Medidas Implementadas

1. **Código da Máquina**: Hash único baseado no hardware
2. **Validação Dupla**: Online + cache local
3. **Período de Graça**: Evita bloqueios por problemas de rede
4. **Verificação Periódica**: Detecta alterações de licença

### Dados Armazenados Localmente

```json
{
  "key": "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
  "machine_code": "MC-1234567890ABCDEF",
  "expires": "2025-12-31T23:59:59Z",
  "product_id": "PROD001",
  "premium": false,
  "max_offline_days": 30,
  "last_activation": "2025-01-15T10:30:00Z",
  "cached_at": "2025-01-15T10:30:00Z"
}
```

## Experiência do Usuário

### Processo Simplificado de Ativação

O usuário final precisa apenas:

1. **Obter a chave de licença** (fornecida após compra)
2. **Executar o aplicativo** pela primeira vez
3. **Inserir a chave** na tela de ativação
4. **Clicar em "Ativar"**

**Não é necessário**:
- Copiar ou fornecer código da máquina
- Configurar nada manualmente
- Entender aspectos técnicos

O sistema obtém automaticamente todas as informações necessárias do hardware.

## Troubleshooting

### Problemas Comuns

1. **"Produto não ativado"**:
   - Verificar conexão com internet
   - Confirmar que a chave de licença é válida
   - Verificar se a licença não está já vinculada a outra máquina
   - Tentar novamente após alguns minutos

2. **"Período offline expirado"**:
   - Conectar à internet
   - Executar validação manual
   - A licença será reativada automaticamente

3. **Erro de rede**:
   - Verificar URL da API
   - Confirmar que API está rodando
   - Testar endpoints manualmente

### Logs de Debug

Para debug, habilite logs no console:

```rust
// Em validator.rs
eprintln!("Debug: Validando licença para chave: {}", license.key);
```

## Deploy e Distribuição

### Compilação Final

```bash
# Frontend
npm run build

# Backend Tauri
cargo build --release

# Gerar instalador
npm run tauri build
```

### Configuração de Produção

1. **Atualizar URL da API** em `validator.rs`
2. **Configurar HTTPS** para endpoints sensíveis  
3. **Definir certificados** para atualizações automáticas
4. **Testar fluxo completo** em ambiente limpo

## Melhorias Futuras

1. **Licenças Temporárias**: Trial de 30 dias
2. **Múltiplos Produtos**: Sistema multi-produto
3. **Dashboard Admin**: Interface web para gerenciar licenças
4. **Telemetria**: Coleta de dados de uso (opcional)
5. **Licenças Corporativas**: Sistema para empresas

## Manutenção

### Monitoramento

- Verificar logs da API regularmente
- Monitorar tentativas de ativação
- Acompanhar renovações e expirações

### Atualizações

- Sistema suporta atualizações automáticas via Tauri
- Licenças são preservadas durante atualizações
- Migração automática de dados se necessário

---

**Nota**: Este sistema fornece proteção básica contra uso não autorizado. Para ambientes corporativos ou produtos de alto valor, considere implementar medidas adicionais de segurança.

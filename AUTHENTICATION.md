# Autenticação no PeladApp

Este documento descreve como a autenticação foi implementada no aplicativo.

## Visão Geral

O aplicativo suporta três métodos de autenticação:

1. **Login com Email e Código** - O usuário insere seu email, recebe um código de 6 dígitos e faz login
2. **Login com Google** - OAuth 2.0 via Google
3. **Login com CPF e Senha** (método legado)

## Estrutura de Arquivos

```
├── api/
│   ├── auth.ts              # Funções de API para autenticação
│   └── index.ts             # Barrel export
├── contexts/
│   ├── auth-context.tsx     # Context provider de autenticação
│   └── index.ts             # Barrel export
├── lib/
│   ├── api-client.ts        # Cliente HTTP (ky) com interceptors
│   └── storage.ts           # Serviço de armazenamento seguro
├── app/
│   ├── (auth)/              # Grupo de rotas de autenticação
│   │   ├── login.tsx        # Tela inicial de login
│   │   ├── email.tsx        # Tela de entrada de email
│   │   ├── verify.tsx       # Tela de verificação de código
│   │   └── _layout.tsx      # Layout do grupo auth
│   └── _layout.tsx          # Layout raiz com proteção de rotas
├── types/
│   └── auth.ts              # TypeScript types para autenticação
└── config/
    ├── api.ts               # Configuração de endpoints
    └── env.ts               # Variáveis de ambiente
```

## Endpoints da API

A API backend está configurada para rodar em `http://localhost:3004` (ou `http://10.0.2.2:3004` no Android emulator).

### Autenticação por Email

#### 1. Enviar Código
```bash
POST /auth/send-code
Content-Type: application/json

{
  "email": "usuario@email.com"
}

# Resposta
{
  "message": "Código de verificação enviado para o email."
}
```

#### 2. Verificar Código
```bash
POST /auth/verify-code
Content-Type: application/json

{
  "email": "usuario@email.com",
  "code": "123456"
}

# Resposta
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "usuario@email.com",
    "name": "Nome do Usuário"
  }
}
```

### Autenticação com Google

```bash
GET /auth/google/login

# Redireciona para a página de login do Google
# Retorna para o app com o token na URL
```

## Uso no Código

### Usando o Hook useAuth

```tsx
import { useAuth } from '@/hooks';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    isLoading,
    signInWithEmail,
    verifyEmailCode,
    signInWithGoogle,
    signOut
  } = useAuth();

  // Enviar código para email
  const handleSendCode = async () => {
    try {
      await signInWithEmail('usuario@email.com');
      // Redirecionar para tela de verificação
    } catch (error) {
      console.error(error);
    }
  };

  // Verificar código
  const handleVerifyCode = async () => {
    try {
      await verifyEmailCode('usuario@email.com', '123456');
      // Usuário será autenticado e redirecionado automaticamente
    } catch (error) {
      console.error(error);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <View>
      {isAuthenticated ? (
        <Text>Bem-vindo, {user?.name}!</Text>
      ) : (
        <Text>Faça login</Text>
      )}
    </View>
  );
}
```

### Proteção de Rotas

As rotas são automaticamente protegidas pelo `RootLayout` em `app/_layout.tsx`:

- Se o usuário **não está autenticado** e tenta acessar rotas protegidas → redirecionado para `/(auth)/login`
- Se o usuário **está autenticado** e tenta acessar rotas de auth → redirecionado para `/(tabs)`

### Armazenamento Seguro

Os tokens e dados do usuário são armazenados de forma segura usando:
- **Expo SecureStore** no iOS e Android (keychain/keystore)
- **localStorage** na web (fallback)

```typescript
import { storage } from '@/lib/storage';

// Salvar
await storage.save(storage.keys.AUTH_TOKEN, token);
await storage.save(storage.keys.USER_DATA, JSON.stringify(user));

// Recuperar
const token = await storage.get(storage.keys.AUTH_TOKEN);
const userData = await storage.get(storage.keys.USER_DATA);

// Remover
await storage.remove(storage.keys.AUTH_TOKEN);

// Limpar tudo
await storage.clear();
```

## Fluxo de Autenticação

### 1. Login com Email e Código

```
Usuário
  ↓
[Tela de Login] → Clica em "Entrar com código por email"
  ↓
[Tela de Email] → Digita email → Clica em "Enviar código"
  ↓
API POST /auth/send-code
  ↓
[Tela de Verificação] → Digita código de 6 dígitos
  ↓
API POST /auth/verify-code → Recebe token
  ↓
Salva token no SecureStore
  ↓
Redireciona para (tabs)
```

### 2. Login com Google

```
Usuário
  ↓
[Tela de Login] → Clica em "Continuar com Google"
  ↓
Abre browser com URL do Google OAuth
  ↓
Usuário faz login no Google
  ↓
Google redireciona de volta com token
  ↓
Salva token no SecureStore
  ↓
Redireciona para (tabs)
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `app.json` ou `.env` com:

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_URL": "http://localhost:3004",
      "EXPO_PUBLIC_API_TIMEOUT": 10000
    }
  }
}
```

### Esquema de URL para Google OAuth

Atualize o esquema de URL no `app.json`:

```json
{
  "expo": {
    "scheme": "peladapp",
    "web": {
      "bundler": "metro"
    }
  }
}
```

E atualize o redirect URI no código (`contexts/auth-context.tsx`):

```typescript
const result = await WebBrowser.openAuthSessionAsync(
  authUrl,
  'peladapp://' // Seu esquema personalizado
);
```

## Testes

Para testar a autenticação:

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

2. Inicie o backend da API na porta 3004:
   ```bash
   # No diretório do backend
   npm run dev
   ```

3. Teste os fluxos:
   - Acesse a tela de login
   - Tente fazer login com email
   - Verifique se recebeu o código (verifique logs do backend)
   - Digite o código
   - Verifique se foi redirecionado para as tabs

## Solução de Problemas

### Erro: "Cannot connect to API"

- Verifique se o backend está rodando na porta 3004
- No Android emulator, a API deve estar em `http://10.0.2.2:3004`
- No iOS simulator, use `http://localhost:3004`

### Erro: "Token inválido"

- Limpe o storage do app e tente novamente
- Verifique se o token não expirou
- Verifique os logs do backend

### Google OAuth não funciona

- Verifique se configurou o esquema de URL corretamente
- Verifique se o redirect URI no Google Cloud Console está correto
- No desenvolvimento, pode ser necessário usar um túnel como ngrok

## Segurança

- ✅ Tokens são armazenados no SecureStore (keychain/keystore)
- ✅ Tokens são enviados via header Authorization
- ✅ HTTPS deve ser usado em produção
- ✅ Tokens expiram e precisam ser renovados
- ⚠️  Implemente refresh tokens em produção
- ⚠️  Adicione rate limiting no backend
- ⚠️  Valide todos os inputs no backend

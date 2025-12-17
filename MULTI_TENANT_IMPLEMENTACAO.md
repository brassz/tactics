# 🏢 Sistema Multi-Tenant - Implementação Completa

## 🎯 Objetivo

Implementar sistema com 3 empresas separadas, cada uma com seu próprio banco de dados Supabase:
- **FRANCA CRED**
- **MOGIANA CRED**
- **LITORAL CRED**

---

## ✅ Arquivos Criados

### 1. `mobile/config/companies.js`
- ✅ Configuração das 3 empresas
- ✅ URLs e chaves do Supabase
- ✅ Funções auxiliares

### 2. `mobile/lib/supabaseMulti.js`
- ✅ Gerenciamento de múltiplas instâncias Supabase
- ✅ Função para trocar entre empresas
- ✅ Storage da empresa selecionada

### 3. `mobile/screens/CompanySelectScreen.js`
- ✅ Tela de seleção de empresa para admin
- ✅ Lista visual das 3 empresas
- ✅ Navegação após seleção

---

## 📝 Mudanças Necessárias (A FAZER)

### 1. **RegisterScreen.js** ✅ PARCIAL
**Estado:**
- ✅ Campo `cidade` adicionado no state

**Pendente:**
- [ ] Adicionar campo `cidade` no formulário HTML
- [ ] Adicionar `cidade` na validação
- [ ] Incluir `cidade` no INSERT do banco

**Código a adicionar no formulário (após o campo Email):**
```jsx
<View style={styles.inputContainer}>
  <Text style={styles.label}>Cidade *</Text>
  <TextInput
    style={styles.input}
    placeholder="Sua cidade"
    value={cidade}
    onChangeText={setCidade}
    autoCapitalize="words"
  />
</View>
```

**Código a adicionar na validação (linha ~32):**
```javascript
if (!cpf || !nome || !celular || !email || !cidade) {
  Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
  return;
}
```

**Código a adicionar no INSERT (linha ~68):**
```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    {
      cpf,
      nome,
      telefone: celular,
      email,
      cidade,  // ← ADICIONAR ESTA LINHA
      rg: rg || null,
      data_nascimento: dataNascimentoSQL,
      contato_emergencia: contatoEmergencia || null,
      status: 'pendente',
    },
  ])
```

---

### 2. **LoginScreen.js**
**Pendente:**
- [ ] Verificar se CPF é de admin
- [ ] Se admin, redirecionar para CompanySelectScreen
- [ ] Se não admin, fazer login normal

**Código a adicionar (substituir função handleLogin):**
```javascript
const handleLogin = async () => {
  if (!cpf) {
    Alert.alert('Erro', 'Por favor, insira seu CPF');
    return;
  }

  if (cpf.length !== 11) {
    Alert.alert('Erro', 'CPF deve conter 11 dígitos');
    return;
  }

  setLoading(true);

  try {
    // Verificar se é admin (buscar em todos os bancos)
    const { getAllSupabaseInstances } = require('../lib/supabaseMulti');
    const instances = getAllSupabaseInstances();
    
    let isAdmin = false;
    let adminCompany = null;

    for (const [companyId, supabaseInstance] of Object.entries(instances)) {
      const { data: adminData } = await supabaseInstance
        .from('admins')
        .select('*')
        .eq('cpf', cpf)
        .single();

      if (adminData) {
        isAdmin = true;
        adminCompany = companyId;
        break;
      }
    }

    if (isAdmin) {
      // Redirecionar para seleção de empresa
      navigation.navigate('CompanySelect', { cpf });
      setLoading(false);
      return;
    }

    // Se não é admin, fazer login normal de usuário
    const { supabase } = require('../lib/supabaseMulti');
    const { data: userData } = await supabaseInstance
      .from('users')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (!userData) {
      Alert.alert('Erro', 'CPF não encontrado');
      setLoading(false);
      return;
    }

    if (userData.status !== 'aprovado') {
      Alert.alert(
        'Aguarde aprovação',
        'Seu cadastro está em análise. Aguarde a aprovação do administrador.'
      );
      setLoading(false);
      return;
    }

    await AsyncStorage.setItem('user', JSON.stringify(userData));
    // A navegação será automática via App.js
  } catch (error) {
    console.error('Error logging in:', error);
    Alert.alert('Erro', 'Erro ao fazer login. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

---

### 3. **App.js**
**Pendente:**
- [ ] Adicionar rota CompanySelectScreen
- [ ] Inicializar supabaseMulti no boot

**Código a adicionar nas importações:**
```javascript
import CompanySelectScreen from './screens/CompanySelectScreen';
import { initializeSupabase } from './lib/supabaseMulti';
```

**Código a adicionar no useEffect:**
```javascript
useEffect(() => {
  initializeSupabase(); // Inicializar empresa atual
  checkUser();
  
  const interval = setInterval(checkUser, 1000);
  return () => clearInterval(interval);
}, []);
```

**Código a adicionar nas rotas (após Register):**
```jsx
<Stack.Screen name="CompanySelect" component={CompanySelectScreen} />
```

---

### 4. **Todos os arquivos que usam Supabase**
**Pendente:**
- [ ] Substituir `import { supabase } from '../lib/supabase'`
- [ ] Por: `import { getSupabase } from '../lib/supabaseMulti'`
- [ ] E usar: `const supabase = getSupabase()`

**Arquivos a atualizar:**
- RegisterScreen.js
- LoginScreen.js
- HomeScreen.js
- DocumentUploadScreen.js
- AdminDashboardScreen.js
- AdminDocumentsScreen.js
- AdminUsersScreen.js
- AdminRequestsScreen.js
- AdminPaymentsScreen.js
- RequestScreen.js
- PaymentsScreen.js
- ChatScreen.js

---

## 🗄️ Migrações SQL

### Executar em CADA banco de dados (3x):

**1. FRANCA CRED:**
```sql
-- Conectar em: https://mhtxyxizfnxupwmilith.supabase.co

ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
```

**2. MOGIANA CRED:**
```sql
-- Conectar em: https://eemfnpefgojllvzzaimu.supabase.co

ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
```

**3. LITORAL CRED:**
```sql
-- Conectar em: https://dtifsfzmnjnllzzlndxv.supabase.co

ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
```

---

## 🔄 Fluxo Completo

### Fluxo de Cadastro de Cliente:
```
1. Cliente abre app
2. Clica em "Criar Conta"
3. Preenche dados (incluindo cidade)
4. Sistema salva no banco da EMPRESA ATUAL
5. Redireciona para upload de documentos
```

### Fluxo de Login Admin:
```
1. Admin abre app
2. Clica em "Já tenho conta"
3. Insere CPF de admin
4. Sistema detecta que é admin
5. Redireciona para SELEÇÃO DE EMPRESA
6. Admin escolhe: FRANCA / MOGIANA / LITORAL
7. Sistema conecta no banco escolhido
8. Admin acessa painel dessa empresa
```

### Fluxo de Login Cliente:
```
1. Cliente abre app
2. Clica em "Já tenho conta"
3. Insere CPF
4. Sistema busca no banco atual
5. Se aprovado, faz login
6. Se pendente, mostra mensagem
```

---

## 📋 Checklist de Implementação

### Arquivos Criados ✅
- [x] `mobile/config/companies.js`
- [x] `mobile/lib/supabaseMulti.js`
- [x] `mobile/screens/CompanySelectScreen.js`

### Migrações SQL ⏳
- [ ] Executar SQL em FRANCA CRED
- [ ] Executar SQL em MOGIANA CRED
- [ ] Executar SQL em LITORAL CRED

### RegisterScreen.js ⏳
- [x] Adicionar state `cidade`
- [ ] Adicionar campo no formulário
- [ ] Adicionar validação
- [ ] Incluir no INSERT

### LoginScreen.js ⏳
- [ ] Detectar admin
- [ ] Redirecionar para CompanySelect
- [ ] Manter login normal para cliente

### App.js ⏳
- [ ] Adicionar rota CompanySelect
- [ ] Inicializar supabaseMulti

### Outros Screens ⏳
- [ ] Atualizar imports do Supabase
- [ ] Usar getSupabase() dinâmico

---

## 🚀 Como Completar

### Passo 1: Executar SQLs
Executar a migração em cada banco de dados

### Passo 2: Completar RegisterScreen
Adicionar campo cidade visualmente

### Passo 3: Atualizar LoginScreen
Implementar detecção de admin

### Passo 4: Atualizar App.js
Adicionar rota e inicialização

### Passo 5: Atualizar imports
Trocar imports do Supabase em todos os arquivos

---

## ⚠️ IMPORTANTE

**Cada empresa terá:**
- ✅ Seu próprio banco de dados
- ✅ Seus próprios clientes
- ✅ Seus próprios documentos
- ✅ Seus próprios admins

**Admin pode:**
- ✅ Escolher qual empresa acessar
- ✅ Ver apenas dados dessa empresa
- ✅ Gerenciar apenas clientes dessa empresa

---

**Status:** 🟡 EM IMPLEMENTAÇÃO

Próximos passos listados acima.

# ⚡ Próximos Passos - Sistema Multi-Tenant

## ✅ JÁ IMPLEMENTADO

1. ✅ **Configuração das 3 empresas** (`mobile/config/companies.js`)
2. ✅ **Sistema multi-Supabase** (`mobile/lib/supabaseMulti.js`)
3. ✅ **Tela de seleção de empresa** (`mobile/screens/CompanySelectScreen.js`)
4. ✅ **Campo cidade no state** (RegisterScreen.js)
5. ✅ **Migração SQL atualizada** (com campo cidade)

---

## 🔴 PENDENTE - AÇÕES NECESSÁRIAS

### 1️⃣ URGENTE: Executar SQL em CADA banco

Você precisa executar este SQL em **3 bancos diferentes**:

**FRANCA CRED:**
```
https://mhtxyxizfnxupwmilith.supabase.co
SQL Editor → Cole o SQL abaixo → Run
```

**MOGIANA CRED:**
```
https://eemfnpefgojllvzzaimu.supabase.co
SQL Editor → Cole o SQL abaixo → Run
```

**LITORAL CRED:**
```
https://dtifsfzmnjnllzzlndxv.supabase.co
SQL Editor → Cole o SQL abaixo → Run
```

**SQL a executar:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
```

---

### 2️⃣ Completar implementação do código

Preciso completar as seguintes mudanças no código:

**RegisterScreen.js:**
- Adicionar campo cidade visualmente
- Adicionar cidade na validação
- Incluir cidade no INSERT

**LoginScreen.js:**
- Detectar se CPF é admin
- Redirecionar para seleção de empresa

**App.js:**
- Adicionar rota CompanySelect
- Inicializar supabaseMulti

**Todos os screens:**
- Atualizar imports do Supabase

---

## 📄 Documentação

**Guia completo:** `MULTI_TENANT_IMPLEMENTACAO.md`

Este documento contém:
- ✅ Todos os códigos necessários
- ✅ Explicações detalhadas
- ✅ Checklist completo
- ✅ Fluxos do sistema

---

## 🤔 Devo Continuar?

Você quer que eu continue implementando automaticamente, ou prefere revisar primeiro?

**Opção 1:** Continue implementando tudo
**Opção 2:** Vou revisar e te aviso quando executar os SQLs

---

**Aguardando sua confirmação para continuar! 🚀**

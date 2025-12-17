# ⚡ Quick Start - Sistema Multi-Tenant

## 🚀 Início Rápido

### ✅ O que foi feito:
1. ✅ Sistema com 3 empresas (FRANCA, MOGIANA, LITORAL)
2. ✅ Campo "cidade" no cadastro
3. ✅ Admin pode escolher qual empresa acessar
4. ✅ Dados isolados por empresa

---

## 🔴 AÇÃO NECESSÁRIA AGORA:

### **Executar SQL em 3 bancos:**

**1. FRANCA CRED:**
https://mhtxyxizfnxupwmilith.supabase.co

**2. MOGIANA CRED:**
https://eemfnpefgojllvzzaimu.supabase.co

**3. LITORAL CRED:**
https://dtifsfzmnjnllzzlndxv.supabase.co

**SQL (copiar e executar em cada banco):**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON users(cidade);
```

---

## 🧪 Testar:

```bash
cd mobile
npm start
```

### **Teste Login Admin:**
1. Inserir CPF de admin
2. ✅ Deve mostrar tela de seleção de empresa
3. Escolher empresa (FRANCA/MOGIANA/LITORAL)
4. ✅ Login automático

### **Teste Cadastro:**
1. Criar nova conta
2. ✅ Campo "Cidade" deve aparecer (obrigatório)
3. Preencher tudo
4. ✅ Salva no banco da empresa atual

---

## 📄 Documentação Completa:

`SISTEMA_MULTI_TENANT_COMPLETO.md`

---

**Tudo pronto! Só falta executar os SQLs! 🎉**

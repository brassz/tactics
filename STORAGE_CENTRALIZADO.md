# 📦 Storage Centralizado - Configuração

## 🎯 Arquitetura

### **Bancos de Dados** (Separados)
- **FRANCA CRED:** https://mhtxyxizfnxupwmilith.supabase.co
- **MOGIANA CRED:** https://eemfnpefgojllvzzaimu.supabase.co
- **LITORAL CRED:** https://dtifsfzmnjnllzzlndxv.supabase.co

### **Storage** (Centralizado)
- **URL:** https://zwazrwqrbghdicywipaq.supabase.co
- **Usado por:** TODAS as 3 empresas
- **Bucket:** `user-documents`

---

## ✅ O Que Foi Feito

### **1. Configuração do Storage** ✅
- Arquivo: `mobile/config/companies.js`
- Adicionado: `STORAGE_CONFIG` com URL e KEY do storage centralizado

### **2. Instância Separada** ✅
- Arquivo: `mobile/lib/supabaseMulti.js`
- Criado: `supabaseStorage` para uploads
- Exportado para uso nos screens

### **3. DocumentUploadScreen** ✅
- Arquivo: `mobile/screens/DocumentUploadScreen.js`
- Atualizado para usar `supabaseStorage` em vez de `supabase`
- Uploads agora vão para o storage centralizado

---

## 🗄️ SQL Necessário

Execute no **Storage Supabase** (zwazrwqrbghdicywipaq):

```sql
-- Já deve existir, mas confirme:

-- RLS no bucket user-documents
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'user-documents');

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-documents');
```

---

## 🎯 Fluxo de Upload

```
┌─────────────────────────────────┐
│  Cliente preenche cadastro      │
│  Empresa: FRANCA CRED          │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│  Dados salvos em:              │
│  FRANCA DB                     │
│  (mhtxyxizfnxupwmilith)        │
└──────────┬──────────────────────┘
           │
           ↓
┌─────────────────────────────────┐
│  Upload de documentos para:    │
│  STORAGE CENTRALIZADO          │
│  (zwazrwqrbghdicywipaq)        │
│  Bucket: user-documents        │
└─────────────────────────────────┘
```

---

## ✅ Benefícios

### **Storage Centralizado:**
- ✅ Todos os documentos em um só lugar
- ✅ Mais fácil de gerenciar
- ✅ Backup único
- ✅ Menos custos

### **Dados Separados:**
- ✅ Cada empresa tem seus dados
- ✅ Isolamento de clientes
- ✅ Conformidade LGPD

---

## 🔧 Arquivos Modificados

1. ✅ `mobile/config/companies.js`
   - Adicionado `STORAGE_CONFIG`

2. ✅ `mobile/lib/supabaseMulti.js`
   - Criado `supabaseStorage`
   - Exportado para uso

3. ✅ `mobile/screens/DocumentUploadScreen.js`
   - Usa `supabaseStorage` para uploads
   - Mantém `getSupabase()` para dados

---

## 🧪 Testar

1. Recarregar app (R)
2. Fazer cadastro
3. Upload de documentos
4. ✅ Deve funcionar agora!

---

## 📊 Estrutura Final

```
FRANCA CRED DB ─┐
MOGIANA CRED DB ├──→ STORAGE CENTRALIZADO
LITORAL CRED DB ─┘    (user-documents)

- Clientes: Separados por empresa
- Documentos: Centralizados no storage
- Admin: Vê apenas sua empresa
- Storage: Compartilhado (organizado por user.id)
```

---

**Tudo configurado! Recarregue e teste! 🚀**

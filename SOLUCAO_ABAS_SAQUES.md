# 🔧 Solução: Aba "Saques" não aparece no Painel Admin

## ✅ Verificação

O código está **correto**:
- ✅ Menu item configurado em `admin-panel/app/dashboard/layout.tsx` (linha 46)
- ✅ Página criada em `admin-panel/app/dashboard/withdrawals/page.tsx`
- ✅ Ícone `Wallet` importado corretamente

## 🔄 Soluções

### **1. Reiniciar o Servidor Next.js**

Se o servidor estiver rodando, pare e reinicie:

```bash
# Parar o servidor (Ctrl + C)
# Depois executar:
cd admin-panel
npm run dev
```

### **2. Limpar Cache do Navegador**

1. **Chrome/Edge:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Imagens e arquivos em cache"
   - Clique em "Limpar dados"

2. **Firefox:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Cache"
   - Clique em "Limpar agora"

3. **Ou use modo anônimo:**
   - `Ctrl + Shift + N` (Chrome)
   - `Ctrl + Shift + P` (Firefox)

### **3. Hard Refresh**

Pressione `Ctrl + Shift + R` ou `Ctrl + F5` para forçar o recarregamento da página.

### **4. Verificar se a Rota Está Funcionando**

Acesse diretamente: `http://localhost:3000/dashboard/withdrawals`

Se aparecer erro 404, o servidor precisa ser reiniciado.

### **5. Verificar Console do Navegador**

1. Abra o DevTools (`F12`)
2. Vá na aba "Console"
3. Verifique se há erros JavaScript

### **6. Verificar Estrutura de Pastas**

Certifique-se de que a estrutura está assim:

```
admin-panel/
  app/
    dashboard/
      layout.tsx          ✅
      withdrawals/
        page.tsx          ✅
```

## 📋 Checklist

- [ ] Servidor Next.js está rodando?
- [ ] Cache do navegador foi limpo?
- [ ] Hard refresh foi feito?
- [ ] A rota `/dashboard/withdrawals` funciona diretamente?
- [ ] Não há erros no console do navegador?

## 🎯 Menu Esperado

O menu lateral deve mostrar:

1. Cadastros
2. Documentos
3. Solicitações
4. **Saques** ← Deve aparecer aqui
5. Pagamentos
6. Cobranças
7. Chat

## 💡 Se Ainda Não Aparecer

1. Verifique se o arquivo `admin-panel/app/dashboard/layout.tsx` tem a linha 46:
   ```typescript
   { href: '/dashboard/withdrawals', icon: Wallet, label: 'Saques' },
   ```

2. Verifique se o ícone `Wallet` está importado na linha 15:
   ```typescript
   import { Wallet } from 'lucide-react';
   ```

3. Verifique se não há erros de sintaxe no arquivo.

---

**Após seguir estes passos, a aba "Saques" deve aparecer no menu! ✅**


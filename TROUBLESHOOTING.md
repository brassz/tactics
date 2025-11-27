# 🔧 Guia de Solução de Problemas

## 📱 Mobile App

### Erro: "Unable to resolve module @supabase/supabase-js"

**Solução:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Expo Go couldn't connect to server"

**Solução:**
1. Certifique-se de que seu computador e celular estão na mesma rede WiFi
2. Desative VPNs temporariamente
3. Tente usar o modo túnel: `expo start --tunnel`

### Erro ao tirar foto: "Camera permission denied"

**Solução:**
1. No dispositivo físico, vá em Configurações > Apps > Expo Go > Permissões
2. Ative a permissão de câmera
3. Reinicie o Expo Go

### Upload de documentos não funciona

**Solução:**
1. Verifique se os buckets foram criados no Supabase
2. Confirme que os buckets estão marcados como "públicos"
3. Execute o SQL de políticas: `supabase/storage-policies.sql`
4. Verifique a URL do Supabase no arquivo `.env`

### Chat não atualiza em tempo real

**Solução:**
1. Verifique se o Supabase Realtime está habilitado no projeto
2. Confirme que a tabela `chat` tem replicação habilitada
3. Reinicie o app completamente

## 🖥️ Admin Panel

### Erro: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solução:**
```bash
cd admin-panel
# Certifique-se de que o arquivo .env.local existe
cat .env.local
# Se não existir, copie do exemplo
cp .env.example .env.local
# Edite com suas credenciais
```

### Página em branco após login

**Solução:**
1. Abra o Console do navegador (F12)
2. Verifique erros de JavaScript
3. Limpe o localStorage:
```javascript
localStorage.clear()
```
4. Recarregue a página

### Imagens de documentos não carregam

**Solução:**
1. Verifique o arquivo `next.config.js`
2. Confirme que o domínio do Supabase está na lista de domains permitidos
3. Reinicie o servidor: `npm run dev`

### Erro 401 ao acessar dados

**Solução:**
1. Verifique se as políticas RLS estão corretas no Supabase
2. Execute novamente o `schema.sql` completo
3. Confirme que a chave ANON está correta

## 🗄️ Supabase

### Erro: "relation 'users' does not exist"

**Solução:**
1. Vá no SQL Editor do Supabase
2. Execute o arquivo `supabase/schema.sql` completo
3. Aguarde alguns segundos
4. Verifique na seção "Tables" se as tabelas foram criadas

### Erro ao fazer upload: "storage object not found"

**Solução:**
1. Vá em Storage no Supabase
2. Crie os buckets manualmente:
   - `user-documents` (público)
   - `chat-files` (público)
3. Execute o SQL de políticas: `supabase/storage-policies.sql`

### RLS bloqueando acessos

**Solução:**
Se as políticas estiverem muito restritivas:
```sql
-- Temporariamente desabilitar RLS para debug
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
-- etc...

-- Após debug, reabilitar
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## 🔍 Debug Geral

### Como ver logs do Mobile App

**Expo:**
```bash
cd mobile
npx expo start
# Pressione 'j' para abrir debugger
```

**React Native Debugger:**
- Pressione `Cmd+D` (iOS) ou `Cmd+M` (Android)
- Selecione "Debug"

### Como ver logs do Admin Panel

**Next.js:**
- Logs do servidor aparecem no terminal
- Logs do cliente aparecem no Console do navegador (F12)

### Verificar conexão com Supabase

**Teste rápido:**
```javascript
// No console do navegador
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('sua-url', 'sua-chave');
supabase.from('users').select('*').then(console.log);
```

## 📊 Performance

### App mobile está lento

**Soluções:**
1. Use dispositivo físico em vez de emulador
2. Reduza o tamanho das imagens antes do upload
3. Ative mode de produção do Expo

### Admin panel está lento

**Soluções:**
1. Faça build de produção: `npm run build && npm start`
2. Otimize imagens
3. Adicione paginação nas tabelas grandes

## 🔄 Reset Completo

Se tudo mais falhar:

### Mobile
```bash
cd mobile
rm -rf node_modules .expo package-lock.json
npm install
expo start -c
```

### Admin
```bash
cd admin-panel
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

### Supabase
1. Vá em SQL Editor
2. Execute:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
3. Execute o `schema.sql` novamente
4. Recrie os buckets de storage

## 📞 Ainda com Problemas?

### Checklist Final
- [ ] Node.js versão 18+ instalado
- [ ] Expo CLI instalado globalmente
- [ ] Supabase schema executado completamente
- [ ] Buckets de storage criados
- [ ] Políticas de storage aplicadas
- [ ] Arquivos .env configurados corretamente
- [ ] WiFi estável (para mobile)
- [ ] Cache limpo
- [ ] Todos os node_modules instalados

### Logs Úteis

Sempre inclua estes logs ao reportar problemas:

**Mobile:**
```bash
expo diagnostics
```

**Admin:**
```bash
npm run build 2>&1 | tee build.log
```

**Supabase:**
- Screenshot do SQL Editor com erro
- Screenshot das tabelas criadas
- Screenshot dos buckets de storage

## 💡 Dicas de Prevenção

1. **Sempre use a mesma versão do Node.js** em desenvolvimento e produção
2. **Faça backup do schema SQL** antes de fazer alterações
3. **Use variáveis de ambiente** corretamente
4. **Teste em dispositivo físico** para recursos como câmera
5. **Monitore os limites** gratuitos do Supabase

## 🎯 Comandos Rápidos

```bash
# Verificar versões
node --version
npm --version
expo --version

# Limpar cache global npm
npm cache clean --force

# Reinstalar Expo CLI
npm uninstall -g expo-cli
npm install -g expo-cli

# Verificar portas em uso
lsof -i :3000  # Admin
lsof -i :19000 # Expo
```

---

**Lembre-se:** A maioria dos problemas é resolvida com:
1. Reinstalar dependências
2. Limpar cache
3. Verificar variáveis de ambiente
4. Confirmar que o schema foi executado corretamente

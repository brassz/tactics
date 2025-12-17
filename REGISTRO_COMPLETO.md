# Registro Completo com Documentos

## ✅ Implementação Completa

Foram realizadas as seguintes mudanças no sistema de registro:

### 1. Novos Campos no Formulário de Registro

O formulário de criação de conta agora possui os seguintes campos:

#### Campos Obrigatórios (*)
- **CPF** - 11 dígitos
- **Nome Completo**
- **Celular** - DDD + 9 dígitos (ex: 11999999999)
- **Email** - Formato válido

#### Campos Opcionais
- **RG** - Até 12 dígitos
- **Data de Nascimento** - Formato DD/MM/AAAA
- **Contato de Emergência** - DDD + 9 dígitos

### 2. Fluxo de Cadastro

Após clicar em "Cadastrar", o usuário é automaticamente redirecionado para a tela de **Envio de Documentos**, onde deve enviar:

1. **Selfie** (foto tirada com a câmera)
2. **CNH** (foto ou documento)
3. **Carteira de Trabalho Digital** (PDF ou imagem)
4. **Comprovante de Endereço** (PDF ou imagem)

### 3. Alterações no Banco de Dados

Foi criada uma migração SQL para adicionar os novos campos à tabela `users`:
- `rg` - VARCHAR(20)
- `data_nascimento` - DATE
- `contato_emergencia` - VARCHAR(20)

## 📋 Como Aplicar as Mudanças

### Passo 1: Executar Migração SQL

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Abra o arquivo `supabase/migration-update-user-fields.sql`
4. Execute o SQL:

```sql
-- Adicionar novos campos à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS rg VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_nascimento DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(20);

-- Criar índice para RG
CREATE INDEX IF NOT EXISTS idx_users_rg ON users(rg);
```

### Passo 2: Verificar Aplicativo Mobile

Os arquivos já foram atualizados:
- ✅ `mobile/screens/RegisterScreen.js` - Formulário completo
- ✅ `mobile/screens/DocumentUploadScreen.js` - Documentos ajustados
- ✅ `mobile/App.js` - Rotas configuradas

### Passo 3: Testar o Fluxo

1. Abra o aplicativo mobile
2. Clique em "Criar Conta"
3. Preencha todos os campos obrigatórios (marcados com *)
4. Clique em "Cadastrar"
5. Será redirecionado para envio de documentos
6. Envie todos os 4 documentos solicitados
7. Clique em "Enviar Documentos"

## 🔍 Validações Implementadas

### No Formulário de Registro:
- CPF deve ter 11 dígitos
- Celular deve ter 11 dígitos (DDD + número)
- Email deve ser válido
- Data de nascimento deve estar no formato DD/MM/AAAA (se preenchida)
- Campos obrigatórios são validados

### No Envio de Documentos:
- Todos os 4 documentos são obrigatórios
- Selfie deve ser tirada com a câmera
- CNH aceita foto ou imagem da galeria
- Carteira de Trabalho e Comprovante de Endereço aceitam PDF ou imagem

## 📱 Interface do Usuário

### Tela de Registro
- Formulário com scroll para acomodar todos os campos
- Indicação visual de campos obrigatórios (*)
- Formatação automática de CPF, celular e data
- Hints informativos nos campos

### Tela de Documentos
- Visual limpo e organizado
- Botões específicos para cada tipo de documento
- Feedback visual quando documento é enviado (✓)
- Preview da selfie após tirar a foto

## 🎨 Melhorias de UX

1. **Scroll View** - Formulário rolável para facilitar preenchimento
2. **Formatação Automática** - CPF, celular e data formatados enquanto digita
3. **Validação em Tempo Real** - Erros mostrados antes de enviar
4. **Feedback Visual** - Indicadores de campos obrigatórios e documentos enviados
5. **Fluxo Contínuo** - Redirecionamento automático após cadastro

## 📝 Observações Importantes

1. O usuário **não pode** pular o envio de documentos - todos são obrigatórios
2. Após enviar os documentos, o status fica como "em_analise"
3. O admin deve aprovar tanto o cadastro quanto os documentos
4. **Comprovante de Renda foi removido** - não é mais solicitado

## 🔧 Arquivos Modificados

```
supabase/
  └── migration-update-user-fields.sql  [NOVO]

mobile/
  └── screens/
      ├── RegisterScreen.js             [MODIFICADO]
      └── DocumentUploadScreen.js       [MODIFICADO]
```

## ✨ Status

✅ Migração SQL criada  
✅ RegisterScreen atualizado com todos os campos  
✅ Validações implementadas  
✅ Fluxo de redirecionamento configurado  
✅ DocumentUploadScreen ajustado  
✅ Interface responsiva com scroll  
✅ Formatação automática de campos  

**Tudo pronto para uso!** 🚀

Execute apenas a migração SQL no Supabase e o sistema estará completo.

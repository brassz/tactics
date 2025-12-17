# 🔍 Verificar Estrutura do Banco

## ❌ Erro Atual

```
Could not find the 'address' column of 'users' in the schema cache
```

---

## 🔎 Possíveis Campos na Tabela Users

O campo pode ter um nome diferente. Possibilidades:

1. **`address`** ❌ (não existe)
2. **`endereco`** (?)
3. **`end`** (?)
4. Outro nome (?)

---

## ✅ Campos que Sabemos que Existem

Baseado no exemplo que você mostrou:
- `id`
- `cpf`
- `nome` ou `name`
- `telefone` ou `phone`
- `email`
- `rg`
- `birth_date` ou `data_nascimento`

---

## 🔧 Como Descobrir

Execute este SQL no banco **FRANCA CRED**:

```sql
-- Ver estrutura da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

---

## 🎯 Ou Me Diga

**Qual é o nome correto do campo de endereço na tabela `users`?**

Opções:
1. `endereco`
2. `address` (precisa criar)
3. Outro nome: ________

---

**Assim que souber, atualizo o código!**

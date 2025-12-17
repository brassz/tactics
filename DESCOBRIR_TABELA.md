# 🔍 Descobrir Nome da Tabela

## ❌ Erro

```
relation "clients" does not exist
```

---

## 🔎 Qual é o nome correto da tabela?

Execute este SQL no banco **zwazrwqrbghdicywipaq**:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 🎯 Ou Me Diga

**Qual é o nome da tabela de clientes?**

Opções comuns:
1. `clients` ❌ (não existe)
2. `users`
3. `clientes`
4. `customers`
5. Outro: ________

---

**Cole aqui o resultado do SQL ou me diga o nome! 🚀**

# 🔧 Troubleshooting - Erro de Compilação Kotlin

## Erro
```
Execution failed for task ':app:compileReleaseKotlin'
Compilation error
```

## ✅ Correções Aplicadas

### 1. Removido prebuildCommand
- O EAS Build já faz o prebuild automaticamente
- O comando manual estava causando conflitos

### 2. Arquivo .easignore configurado
- Garante que pastas `android/` e `ios/` locais sejam ignoradas
- O EAS Build criará essas pastas limpas na nuvem

### 3. Permissões duplicadas removidas
- Removidas permissões duplicadas no `app.json`

## 🚀 Próximos Passos

### Opção 1: Build Limpo (Recomendado)

Certifique-se de que não há pasta `android/` local:

```bash
cd mobile
# Se existir, remova a pasta android local
# O EAS Build criará uma nova na nuvem
```

Depois execute:

```bash
eas build --platform android --profile production --clear-cache
```

### Opção 2: Verificar Logs Detalhados

Se o erro persistir, veja os logs completos:

```bash
eas build --platform android --profile production --non-interactive
```

Ou acesse o dashboard do Expo para ver os logs detalhados do build.

### Opção 3: Build Local de Teste

Para testar localmente antes do build na nuvem:

```bash
cd mobile
npx expo prebuild --clean --platform android
cd android
./gradlew assembleRelease
```

Se funcionar localmente, o problema pode ser específico do ambiente do EAS Build.

## 🔍 Possíveis Causas

1. **Assets faltando**: Certifique-se de que `assets/images/logo.png` existe
2. **Namespace incorreto**: Verifique se o package no `app.json` corresponde ao namespace no Gradle
3. **Cache corrompido**: Use `--clear-cache` no build
4. **Versão do Expo SDK**: Certifique-se de que todas as dependências estão atualizadas

## 📝 Checklist Antes do Build

- [ ] Não há pasta `android/` local (ou está no `.easignore`)
- [ ] Todos os assets existem (`assets/images/logo.png`)
- [ ] Package name está correto: `com.sistemafinanceiro`
- [ ] Todas as dependências estão atualizadas: `npx expo install --fix`
- [ ] Você está logado: `eas login`

## 💡 Dica

Se o erro persistir, tente fazer um build de preview primeiro (mais rápido):

```bash
eas build --platform android --profile preview
```

Se o preview funcionar, o problema pode ser específico da configuração de produção.


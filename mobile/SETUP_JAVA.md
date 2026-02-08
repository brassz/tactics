# ☕ Configurar Java para Build Android

## Erro
```
ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.
```

## ✅ Solução

### Opção 1: Instalar Java JDK (Recomendado)

1. **Baixar Java JDK 17** (recomendado para Android):
   - Acesse: https://adoptium.net/
   - Baixe "Temurin 17 (LTS)" para Windows x64
   - Instale o arquivo `.msi`

2. **Configurar JAVA_HOME no Windows**:
   
   **Via Interface Gráfica:**
   - Pressione `Win + R`
   - Digite `sysdm.cpl` e pressione Enter
   - Vá na aba "Avançado"
   - Clique em "Variáveis de Ambiente"
   - Em "Variáveis do sistema", clique em "Novo"
   - Nome: `JAVA_HOME`
   - Valor: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` (ou onde você instalou)
   - Clique em "OK"
   - Edite a variável `Path` e adicione: `%JAVA_HOME%\bin`
   - Clique em "OK" em todas as janelas

   **Via PowerShell (como Administrador):**
   ```powershell
   # Substitua o caminho pelo local onde o Java foi instalado
   [System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.12-hotspot', 'Machine')
   
   # Adicionar ao PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
   [System.Environment]::SetEnvironmentVariable('Path', "$currentPath;%JAVA_HOME%\bin", 'Machine')
   ```

3. **Reiniciar o Terminal**:
   - Feche e abra novamente o PowerShell/CMD
   - Verifique com: `java -version`

### Opção 2: Usar EAS Build (Mais Fácil)

Se você não quiser instalar Java localmente, use o EAS Build na nuvem:

```bash
cd mobile
eas build --platform android --profile production
```

O EAS Build já tem Java configurado e não precisa de instalação local.

## 🔍 Verificar Instalação

Após configurar, verifique:

```powershell
java -version
echo $env:JAVA_HOME
```

Deve mostrar:
- Versão do Java
- Caminho do JAVA_HOME

## 📝 Nota

Para builds locais do Android, você precisa:
- ✅ Java JDK 17 (ou superior)
- ✅ Android Studio (para SDK)
- ✅ Variáveis de ambiente configuradas

**Recomendação**: Use o EAS Build na nuvem, que já tem tudo configurado!


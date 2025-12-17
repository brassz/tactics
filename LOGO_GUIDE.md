# Guia de Logo da Empresa

Este guia explica onde colocar e como usar a logo da empresa no projeto Tactics-10.

## 📁 Caminhos para as Logos

### Painel Administrativo (Web)
```
admin-panel/public/images/
```
- Coloque a logo nesta pasta
- Formatos: `.jpg`, `.jpeg`, `.png`, `.svg`
- A pasta `public` é acessível diretamente via URL

### Aplicativo Mobile
```
mobile/assets/images/
```
- Coloque a logo nesta pasta
- Formatos: `.jpg`, `.jpeg` (você está usando) ou `.png`
- Use alta resolução (@2x ou @3x)

---

## 🎨 Especificações Recomendadas

### Para o Painel Admin (Web)

**Logo Principal:**
- Formato: JPEG/JPG (você está usando)
- Tamanho sugerido: 200x60px (ou proporção similar)
- Nome do arquivo: `logo.jpg` ou `logo.jpeg`

**Variações (opcional):**
- `logo-dark.jpg` - Para tema escuro
- `logo-light.jpg` - Para tema claro
- `logo.png` - Versão com transparência (se necessário)
- `favicon.ico` - Ícone do navegador (32x32px)

### Para o App Mobile

**Logo Principal:**
- Formato: JPEG/JPG (você está usando)
- Tamanho sugerido: 450x150px (@3x) ou maior
- Nome do arquivo: `logo.jpg` ou `logo.jpeg`

**Ícone do App:**
- Formato: PNG
- Tamanho: 1024x1024px
- Nome do arquivo: `app-icon.png`
- Atualizar em `mobile/app.json`

---

## 💻 Como Usar no Código

### No Painel Admin (Next.js)

```tsx
import Image from 'next/image';

// Usando Image otimizado do Next.js
<Image 
  src="/images/logo.jpg" 
  alt="Tactics-10 Logo" 
  width={200} 
  height={60}
  priority
/>

// Ou usando tag img normal
<img src="/images/logo.jpg" alt="Tactics-10 Logo" className="h-12" />
```

### No App Mobile (React Native)

```javascript
import { Image } from 'react-native';

// Importando a logo
<Image 
  source={require('./assets/images/logo.jpg')} 
  style={{ width: 150, height: 50 }}
  resizeMode="contain"
/>
```

---

## 📝 Checklist de Implementação

- [ ] Adicionar `logo.jpg` em `admin-panel/public/images/`
- [ ] Adicionar `logo.jpg` em `mobile/assets/images/`
- [ ] (Opcional) Adicionar `favicon.ico` em `admin-panel/public/`
- [ ] (Opcional) Adicionar `app-icon.png` (1024x1024) em `mobile/assets/images/`
- [ ] (Opcional) Atualizar `mobile/app.json` com o caminho do ícone
- [ ] Testar a logo no painel admin
- [ ] Testar a logo no app mobile

---

## 🔗 Arquivos Criados

1. **`admin-panel/public/images/`** - Pasta para imagens do painel web
2. **`mobile/assets/images/`** - Pasta para imagens do app mobile
3. **README em cada pasta** - Instruções detalhadas de uso

---

## 💡 Dicas

1. **JPEG é ótimo** para logos com fundo sólido (menor tamanho de arquivo)
2. **Use PNG** apenas se precisar de transparência (fundo transparente)
3. **Alta resolução** para mobile (mínimo @2x, recomendado @3x)
4. **Otimize as imagens** antes de adicionar - para JPEG use qualidade 80-90%
5. **Mantenha consistência** entre as versões web e mobile
6. **Qualidade JPEG:** Recomendado 85% para um bom equilíbrio entre qualidade e tamanho

---

## 📞 Próximos Passos

1. Coloque sua logo nas pastas indicadas
2. Siga os exemplos de código acima para integrar nos componentes
3. Consulte os READMEs em cada pasta para mais detalhes

**Locais comuns para adicionar a logo:**
- Header/Navbar do painel admin
- Tela de login
- Tela de boas-vindas do app mobile
- Splash screen do app mobile


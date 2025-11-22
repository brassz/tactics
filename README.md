# CS2 Tactics Manager

Gerenciador de táticas e estratégias para Counter-Strike 2.

## 🎮 Sobre o Projeto

O CS2 Tactics Manager é uma aplicação web para organizar e gerenciar táticas de equipe, estratégias por mapa, informações de rounds e dados do time para Counter-Strike 2.

## ✨ Funcionalidades

- 📝 Adicionar e gerenciar táticas por mapa
- 🗺️ Suporte para todos os mapas competitivos (Mirage, Inferno, Dust2, Nuke, Overpass, Vertigo, Ancient)
- 👥 Gerenciamento de membros do time e suas funções
- 🎯 Classificação por tipo de round (Eco, Forçado, Full Buy, Pistol, Anti-Eco)
- 🔍 Filtro de táticas por mapa
- 💾 Armazenamento local no navegador
- 🎨 Interface moderna e responsiva

## 🚀 Deploy no Vercel

### Opção 1: Deploy via CLI

1. Instale a CLI do Vercel:
```bash
npm i -g vercel
```

2. Faça login no Vercel:
```bash
vercel login
```

3. Deploy o projeto:
```bash
vercel
```

### Opção 2: Deploy via GitHub

1. Faça push deste repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Add New Project"
4. Importe seu repositório do GitHub
5. O Vercel detectará automaticamente as configurações
6. Clique em "Deploy"

### Opção 3: Deploy via Vercel Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Faça upload dos arquivos do projeto
3. Configure o projeto (geralmente não é necessário)
4. Clique em "Deploy"

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (Tailwind CSS via CDN)
- JavaScript (Vanilla)
- LocalStorage para persistência de dados

## 📦 Estrutura do Projeto

```
.
├── index.html       # Arquivo principal da aplicação
├── vercel.json      # Configurações do Vercel
├── package.json     # Metadados do projeto
└── README.md        # Este arquivo
```

## 💡 Como Usar

1. **Adicionar Tática**: Clique no botão "Nova Tática" e preencha os campos
2. **Filtrar por Mapa**: Clique em um dos mapas para filtrar as táticas
3. **Gerenciar Time**: Adicione membros do time e suas funções
4. **Adversário**: Registre informações sobre o time adversário
5. **Excluir Tática**: Clique no ícone de lixeira em qualquer tática

## 📱 Responsivo

A aplicação é totalmente responsiva e funciona em:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🔒 Privacidade

Todos os dados são armazenados localmente no seu navegador. Nenhuma informação é enviada para servidores externos.

## 📄 Licença

MIT License - sinta-se livre para usar este projeto.

# 🚀 Guia de Deployment - Nexus PIX

Este guia mostra como fazer o deploy do sistema Nexus PIX em diferentes plataformas.

---

## 📦 Opções de Deploy

### 1. 🌐 Vercel (Recomendado)

O Vercel é ideal para este projeto pois suporta Node.js e oferece deploy gratuito e automático.

#### Deploy via CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login no Vercel
vercel login

# 3. Deploy do projeto
cd /workspace
vercel

# 4. Seguir as instruções
# - Setup and deploy: Yes
# - Which scope: Sua conta
# - Link to existing project: No
# - Project name: nexus-pix
# - Directory: ./
# - Override settings: No
```

#### Deploy via Dashboard

1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Importe o projeto
4. Configure:
   - **Build Command**: Deixe vazio
   - **Output Directory**: `./`
   - **Install Command**: `npm install`
5. Clique em "Deploy"

---

### 2. 🎈 Heroku

O Heroku é uma plataforma PaaS que facilita o deploy de aplicações Node.js.

#### Pré-requisitos
```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

#### Deploy

```bash
# 1. Criar aplicação
heroku create nexus-pix-api

# 2. Adicionar Procfile
echo "web: node server.js" > Procfile

# 3. Commit mudanças
git add .
git commit -m "Add Heroku config"

# 4. Deploy
git push heroku main

# 5. Abrir aplicação
heroku open
```

#### Configurar Variáveis de Ambiente (Opcional)
```bash
heroku config:set PORT=3000
```

---

### 3. 🐳 Docker

Containerize a aplicação para deploy em qualquer plataforma.

#### Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Comando de início
CMD ["node", "server.js"]
```

#### Criar .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
*.md
.env
```

#### Build e Run

```bash
# Build
docker build -t nexus-pix .

# Run
docker run -p 3000:3000 nexus-pix

# Acessar
# http://localhost:3000
```

#### Deploy no Docker Hub

```bash
# Tag
docker tag nexus-pix seu-usuario/nexus-pix:latest

# Push
docker push seu-usuario/nexus-pix:latest
```

---

### 4. ☁️ AWS (EC2)

Deploy em uma instância EC2 da Amazon.

#### Passos

1. **Criar instância EC2**
   - AMI: Ubuntu 22.04
   - Tipo: t2.micro (free tier)
   - Configurar Security Group: Abrir porta 3000

2. **Conectar via SSH**
   ```bash
   ssh -i sua-chave.pem ubuntu@ip-da-instancia
   ```

3. **Instalar Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clonar e configurar projeto**
   ```bash
   git clone seu-repositorio
   cd nexus-pix
   npm install
   ```

5. **Usar PM2 para gerenciar**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name nexus-pix
   pm2 startup
   pm2 save
   ```

6. **Configurar Nginx (Opcional)**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/nexus-pix
   ```

   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

### 5. 🌊 DigitalOcean

Similar ao AWS, mas mais simples.

#### Via App Platform

1. Acesse [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Clique em "Create App"
3. Conecte seu repositório GitHub
4. Configure:
   - **Run Command**: `node server.js`
   - **Port**: 3000
5. Deploy!

#### Via Droplet

1. Criar Droplet Ubuntu
2. Seguir mesmos passos do AWS EC2
3. Configurar firewall para porta 3000

---

### 6. 🔷 Azure

Deploy no Azure App Service.

#### Via Azure CLI

```bash
# Login
az login

# Criar resource group
az group create --name nexus-pix-rg --location eastus

# Criar App Service plan
az appservice plan create --name nexus-pix-plan --resource-group nexus-pix-rg --sku B1 --is-linux

# Criar Web App
az webapp create --resource-group nexus-pix-rg --plan nexus-pix-plan --name nexus-pix --runtime "NODE|18-lts"

# Deploy
az webapp deployment source config-local-git --name nexus-pix --resource-group nexus-pix-rg

# Push code
git remote add azure <url-do-git>
git push azure main
```

---

### 7. 📱 Render

Plataforma moderna e gratuita.

#### Deploy

1. Acesse [render.com](https://render.com)
2. Conecte GitHub
3. Novo Web Service
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Deploy!

---

### 8. 🚢 Railway

Outra opção moderna e fácil.

#### Deploy

1. Acesse [railway.app](https://railway.app)
2. "New Project"
3. "Deploy from GitHub repo"
4. Selecione o repositório
5. Deploy automático!

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente

Crie um arquivo `.env` (não commitar!):

```env
PORT=3000
NODE_ENV=production
```

### package.json Scripts

Adicione scripts úteis:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js",
    "test": "echo \"No tests yet\"",
    "lint": "eslint ."
  }
}
```

### Porta Dinâmica

O servidor já está configurado para usar `process.env.PORT`:

```javascript
const PORT = process.env.PORT || 3000;
```

---

## 🔒 Segurança em Produção

### Headers de Segurança

Instale e configure helmet:

```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de requisições
});

app.use('/api/', limiter);
```

### HTTPS

Use sempre HTTPS em produção. A maioria das plataformas oferece SSL gratuito.

---

## 📊 Monitoramento

### Logs

```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs nexus-pix

# Docker
docker logs -f container-id
```

### Uptime Monitoring

Configure em:
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

---

## 🎯 Checklist de Deploy

- [ ] Código commitado no Git
- [ ] Dependencies atualizadas
- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Porta dinâmica configurada
- [ ] CORS configurado
- [ ] Headers de segurança
- [ ] SSL/HTTPS habilitado
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Domínio customizado (opcional)

---

## 🌍 DNS e Domínio

### Configurar Domínio Customizado

#### Vercel
1. Settings → Domains
2. Add domain
3. Configurar DNS records

#### Heroku
1. `heroku domains:add www.seu-dominio.com`
2. Configurar CNAME no seu provedor DNS

#### Cloudflare (Recomendado)
- CDN gratuito
- SSL automático
- DDoS protection
- Cache inteligente

---

## 📈 Performance

### Otimizações

1. **Compression**
   ```bash
   npm install compression
   ```
   
   ```javascript
   import compression from 'compression';
   app.use(compression());
   ```

2. **Cache Headers**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d'
   }));
   ```

3. **Database** (se migrar do in-memory)
   - MongoDB Atlas
   - PostgreSQL (Heroku Postgres)
   - Redis (cache)

---

## 🆘 Troubleshooting

### Erro: Port Already in Use
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Permission Denied
```bash
sudo chown -R $USER:$USER .
```

---

## 🎉 Deploy Completo!

Após o deploy, teste:

1. ✅ Página principal carrega
2. ✅ API endpoints respondem
3. ✅ Criar conta funciona
4. ✅ Transações PIX funcionam
5. ✅ QR Codes são gerados
6. ✅ Interface responsiva

---

**🚀 Sistema Nexus PIX - Pronto para Produção!**

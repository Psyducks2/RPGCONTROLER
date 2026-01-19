# 🚀 Deploy no Vercel - RPG Ordem Paranormal

## 📋 Passos para Deploy

### 1. Preparação
```bash
# Instalar dependências
npm run install-all
```

### 2. Deploy no Vercel

#### Opção A: Via CLI (Recomendado)
```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Fazer login no Vercel
vercel login

# Deploy
vercel
```

#### Opção B: Via Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em "New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

### 3. Configurações Importantes

O projeto já está configurado com:
- ✅ `vercel.json` - Configuração de rotas e builds
- ✅ `/api/index.js` - Backend como Serverless Function
- ✅ Scripts de build otimizados

### 4. Variáveis de Ambiente (Opcional)

Se quiser adicionar variáveis de ambiente:
1. No Dashboard do Vercel, vá em Settings → Environment Variables
2. Adicione as variáveis necessárias

### 5. Domínio Personalizado (Opcional)

No Dashboard do Vercel:
1. Vá em Settings → Domains
2. Adicione seu domínio personalizado

## 🔧 Estrutura para Vercel

```
RPGCONTROLER/
├── api/
│   └── index.js          # Backend Serverless
├── client/
│   ├── dist/             # Build do frontend (gerado)
│   ├── src/              # Código React
│   └── package.json
├── server/
│   └── data/             # Dados JSON (usados pelo /api)
├── vercel.json           # Configuração Vercel
└── package.json
```

## ⚠️ Importante sobre Dados JSON

**ATENÇÃO**: No Vercel, as Serverless Functions são stateless (sem estado). Isso significa que:

- ❌ Mudanças nos arquivos JSON **NÃO persistem** entre requisições
- ❌ Adicionar/editar/deletar dados será **temporário**

### Solução: Usar Banco de Dados

Para produção, recomendo migrar para um banco de dados real:

#### Opções Gratuitas:
1. **Vercel Postgres** (Recomendado)
2. **MongoDB Atlas**
3. **Supabase**
4. **PlanetScale**

## 📝 Notas

- O desenvolvimento local continua funcionando com `npm run dev`
- No Vercel, o backend roda como serverless em `/api/*`
- O frontend é servido estaticamente de `/client/dist`
- Todas as rotas `/api/*` são redirecionadas para a função serverless

## 🆘 Troubleshooting

### Build Failing?
```bash
# Limpar cache e reconstruir
cd client
rm -rf node_modules dist
npm install
npm run build
```

### API não funciona?
- Verifique se as rotas começam com `/api/`
- Confira os logs no Dashboard do Vercel

### Dados não persistem?
- **Esperado no Vercel com JSON**
- Migre para um banco de dados real

## 🎉 Pronto!

Seu site estará disponível em: `https://seu-projeto.vercel.app`

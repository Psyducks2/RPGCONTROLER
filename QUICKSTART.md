# ⚡ Guia Rápido - RPG Ordem Paranormal com Supabase

## 🚀 Setup em 5 Minutos

### 1️⃣ Criar Projeto no Supabase
```bash
# Acesse: https://supabase.com
# Crie conta e um novo projeto
# Região: South America (São Paulo)
```

### 2️⃣ Executar Schema SQL
```sql
# No Supabase Dashboard:
# 1. Vá em SQL Editor
# 2. Cole o conteúdo de supabase-schema.sql
# 3. Clique em RUN
```

### 3️⃣ Configurar .env
```bash
# Crie o arquivo .env na raiz do projeto:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

### 4️⃣ Instalar e Migrar
```bash
# Instalar dependências
npm install

# Migrar dados JSON para Supabase
npm run migrate
```

### 5️⃣ Rodar o Projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📦 Deploy no Vercel

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Adicionar variáveis de ambiente no Dashboard:
# SUPABASE_URL
# SUPABASE_ANON_KEY
```

## ✅ Pronto!

Agora você tem:
- ✅ Banco de dados real (Supabase)
- ✅ Dados persistentes
- ✅ Deploy fácil no Vercel
- ✅ Backup automático
- ✅ Escalável

## 🆘 Problemas?

Veja o guia completo em `SUPABASE_SETUP.md`

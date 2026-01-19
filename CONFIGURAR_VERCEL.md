# 🔐 Configurar Variáveis de Ambiente no Vercel

## 📋 Passo a Passo Visual

### 1️⃣ Acesse o Vercel Dashboard

1. Vá em [vercel.com](https://vercel.com)
2. Faça login
3. Clique no seu projeto

### 2️⃣ Navegue até Environment Variables

```
Dashboard → Seu Projeto → Settings → Environment Variables
```

Ou diretamente:
- Clique em **"Settings"** (no topo)
- No menu lateral esquerdo, clique em **"Environment Variables"**

### 3️⃣ Adicionar Primeira Variável: SUPABASE_URL

1. Clique no botão **"Add New"** (ou **"Add"**)
2. No campo **"Key"**, digite exatamente:
   ```
   SUPABASE_URL
   ```
3. No campo **"Value"**, cole:
   ```
   https://sefkogdrqcbrshdzocxf.supabase.co
   ```
4. Marque os ambientes:
   - ✅ **Production**
   - ✅ **Preview** 
   - ✅ **Development**
5. Clique em **"Save"**

### 4️⃣ Adicionar Segunda Variável: SUPABASE_ANON_KEY

1. Clique em **"Add New"** novamente
2. No campo **"Key"**, digite:
   ```
   SUPABASE_ANON_KEY
   ```
3. No campo **"Value"**, cole:
   ```
   sb_publishable_sNotVWjsXln78EhzvZIoeg_pkV_kmbE
   ```
4. Marque os ambientes:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Clique em **"Save"**

### 5️⃣ Verificar

Você deve ver uma tabela assim:

| Key | Value | Environments |
|-----|-------|--------------|
| SUPABASE_URL | https://sefkogdrqcbrshdzocxf.supabase.co | Production, Preview, Development |
| SUPABASE_ANON_KEY | sb_publishable_sNotVWjsXln78EhzvZIoeg_pkV_kmbE | Production, Preview, Development |

### 6️⃣ Fazer Redeploy (OBRIGATÓRIO!)

⚠️ **IMPORTANTE**: Após adicionar variáveis, você DEVE fazer redeploy!

#### Opção A: Via Dashboard (Mais Fácil)
1. Vá em **"Deployments"** (no menu superior)
2. Encontre o último deploy
3. Clique nos **3 pontinhos** (⋯) ao lado
4. Clique em **"Redeploy"**
5. Confirme

#### Opção B: Via CLI
```bash
vercel --prod
```

#### Opção C: Push no Git (se conectado)
```bash
git commit --allow-empty -m "Redeploy com variáveis"
git push
```

## ✅ Testar

Após o redeploy:

1. Acesse seu site: `https://seu-projeto.vercel.app`
2. Tente criar um personagem
3. Se funcionar = ✅ Sucesso!

## 🆘 Problemas?

### ❌ "Invalid API key"
- Verifique se copiou a chave completa
- Confirme que fez redeploy após adicionar
- Verifique se selecionou Production

### ❌ Variáveis não funcionam
- Certifique-se de clicar em "Save"
- Verifique se está no projeto correto
- Faça redeploy novamente

### ❌ Funciona local mas não no Vercel
- As variáveis são por ambiente
- Adicione para Production também
- Faça redeploy

## 📝 Resumo Rápido

```
1. Vercel Dashboard → Settings → Environment Variables
2. Add: SUPABASE_URL = https://sefkogdrqcbrshdzocxf.supabase.co
3. Add: SUPABASE_ANON_KEY = sb_publishable_sNotVWjsXln78EhzvZIoeg_pkV_kmbE
4. Marcar: Production ✅ Preview ✅ Development ✅
5. Save
6. Redeploy (obrigatório!)
```

## 🎉 Pronto!

Agora seu projeto está configurado para usar Supabase no Vercel! 🚀

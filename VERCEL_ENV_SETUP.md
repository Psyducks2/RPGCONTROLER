# 🔐 Como Configurar Variáveis de Ambiente no Vercel

## 📋 Passo a Passo Detalhado

### 1️⃣ Acessar o Dashboard do Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Se ainda não fez deploy, faça o primeiro deploy primeiro

### 2️⃣ Navegar até as Variáveis de Ambiente

1. No dashboard, clique no seu projeto **"RPGCONTROLER"** (ou o nome que você deu)
2. No menu superior, clique em **"Settings"**
3. No menu lateral esquerdo, clique em **"Environment Variables"**

### 3️⃣ Adicionar as Variáveis

Você precisa adicionar **2 variáveis**:

#### Variável 1: SUPABASE_URL
1. No campo **"Key"**, digite: `SUPABASE_URL`
2. No campo **"Value"**, cole: `https://sefkogdrqcbrshdzocxf.supabase.co`
3. Selecione os ambientes onde será usada:
   - ✅ **Production** (obrigatório)
   - ✅ **Preview** (recomendado)
   - ✅ **Development** (opcional)
4. Clique em **"Save"**

#### Variável 2: SUPABASE_ANON_KEY
1. Clique em **"Add New"** novamente
2. No campo **"Key"**, digite: `SUPABASE_ANON_KEY`
3. No campo **"Value"**, cole: `sb_publishable_sNotVWjsXln78EhzvZIoeg_pkV_kmbE`
4. Selecione os ambientes:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
5. Clique em **"Save"**

### 4️⃣ Verificar se Está Correto

Você deve ver algo assim:

```
┌─────────────────────┬─────────────────────────────────────────────┐
│ Key                 │ Value                                       │
├─────────────────────┼─────────────────────────────────────────────┤
│ SUPABASE_URL        │ https://sefkogdrqcbrshdzocxf.supabase.co    │
│ SUPABASE_ANON_KEY   │ sb_publishable_sNotVWjsXln78EhzvZIoeg_pkV...│
└─────────────────────┴─────────────────────────────────────────────┘
```

### 5️⃣ Fazer Redeploy (Importante!)

⚠️ **ATENÇÃO**: Após adicionar as variáveis, você precisa fazer um novo deploy!

**Opção A: Via Dashboard**
1. Vá em **"Deployments"**
2. Clique nos **3 pontinhos** (⋯) do último deploy
3. Clique em **"Redeploy"**
4. Confirme o redeploy

**Opção B: Via CLI**
```bash
vercel --prod
```

**Opção C: Push no Git**
Se você tem integração com GitHub:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

## ✅ Verificar se Funcionou

Após o redeploy:

1. Acesse seu site no Vercel
2. Tente criar um personagem
3. Se funcionar, as variáveis estão corretas! ✅

## 🖼️ Imagens de Referência

### Onde encontrar no Vercel:
```
Dashboard → Seu Projeto → Settings → Environment Variables
```

### Como deve ficar:
- **Key**: `SUPABASE_URL`
- **Value**: `https://sefkogdrqcbrshdzocxf.supabase.co`
- **Environments**: Production ✅ Preview ✅ Development ✅

## 🆘 Problemas Comuns

### ❌ "Invalid API key" após deploy
- Verifique se copiou a chave completa
- Confirme que fez redeploy após adicionar as variáveis
- Verifique se selecionou os ambientes corretos

### ❌ Variáveis não aparecem
- Certifique-se de clicar em "Save" após adicionar
- Verifique se está no projeto correto

### ❌ Funciona local mas não no Vercel
- As variáveis de ambiente são diferentes por ambiente
- Certifique-se de adicionar para Production também

## 📝 Nota Importante

As variáveis de ambiente no Vercel são **diferentes** do `.env` local:
- `.env` = apenas desenvolvimento local
- Vercel Environment Variables = produção no Vercel

Você precisa configurar **ambos**!

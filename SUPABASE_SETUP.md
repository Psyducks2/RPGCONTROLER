# 🗄️ Configuração do Supabase - RPG Ordem Paranormal

## 📋 Passo a Passo

### 1. Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub (recomendado)

### 2. Criar Novo Projeto

1. Clique em "New Project"
2. Preencha:
   - **Name**: RPG Ordem Paranormal
   - **Database Password**: (anote essa senha!)
   - **Region**: South America (São Paulo) - para melhor latência
   - **Pricing Plan**: Free (suficiente para o projeto)
3. Clique em "Create new project"
4. Aguarde ~2 minutos para o projeto ser criado

### 3. Executar o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de </> no menu lateral)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Aguarde a mensagem de sucesso ✅

### 4. Obter as Credenciais

1. No dashboard, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xxx.supabase.co`)
   - **anon/public** key (a chave pública, não a service_role!)

### 5. Configurar Variáveis de Ambiente

#### Desenvolvimento Local:

1. Crie um arquivo `.env` na raiz do projeto:

```bash
SUPABASE_URL=sua_url_aqui
SUPABASE_ANON_KEY=sua_chave_aqui
```

2. Substitua pelos valores copiados no passo 4

#### Vercel (Produção):

1. No dashboard do Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - `SUPABASE_URL` = sua URL
   - `SUPABASE_ANON_KEY` = sua chave
3. Aplique para todos os ambientes (Production, Preview, Development)

### 6. Instalar Dependências

```bash
npm install
```

### 7. Migrar Dados dos JSONs para o Supabase

```bash
npm run migrate
```

Este comando irá:
- Ler todos os arquivos JSON em `server/data/`
- Inserir os dados no Supabase
- Mostrar progresso no console

## ✅ Verificação

Para verificar se tudo está funcionando:

1. No Supabase, vá em **Table Editor**
2. Verifique se as tabelas foram criadas:
   - ✅ characters
   - ✅ origens
   - ✅ pericias
   - ✅ armas
   - ✅ municoes
   - ✅ protecoes
   - ✅ equipamentos
   - ✅ rituais
   - ✅ habilidades
   - ✅ insanidade
   - ✅ dificuldades
   - ✅ admin

3. Clique em cada tabela e verifique se os dados foram inseridos

## 🚀 Testar Localmente

```bash
npm run dev
```

Abra `http://localhost:5173` e teste:
- Criar personagem
- Visualizar banco de dados
- Login do mestre
- Editar itens

## 🔒 Segurança

### Row Level Security (RLS)

O schema já inclui políticas RLS básicas:
- ✅ Qualquer um pode LER characters
- ✅ Apenas autenticados podem CRIAR/EDITAR/DELETAR

Para segurança adicional, você pode:
1. Ir em **Authentication** → **Policies**
2. Ajustar as políticas conforme necessário

### Backup Automático

O Supabase faz backup automático diário. Para fazer backup manual:
1. Vá em **Database** → **Backups**
2. Clique em "Create backup"

## 📊 Vantagens do Supabase

- ✅ **Persistência real** (não mais problemas com serverless!)
- ✅ **Escalável** (suporta milhares de requisições)
- ✅ **Backup automático**
- ✅ **Real-time** (websockets nativos)
- ✅ **Auth integrada** (se quiser adicionar login de jogadores)
- ✅ **Storage** (para upload de imagens de personagens)
- ✅ **Grátis** até 500MB + 2GB bandwidth/mês

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave `anon/public` e não a `service_role`
- Confirme que as variáveis de ambiente estão corretas

### Erro: "relation does not exist"
- Execute o schema SQL novamente
- Verifique se todas as tabelas foram criadas

### Erro na migração
- Certifique-se de que o `.env` está configurado
- Verifique se os arquivos JSON existem em `server/data/`

### Dados não aparecem
- Verifique as políticas RLS
- Confira se a migração foi executada com sucesso

## 📚 Próximos Passos (Opcional)

1. **Adicionar Storage**: Para imagens de personagens
2. **Real-time**: Atualização automática de fichas
3. **Auth Jogadores**: Login individual para cada jogador
4. **Funções SQL**: Cálculos automáticos no banco
5. **Edge Functions**: Lógica de negócio no backend

## 🎉 Pronto!

Agora seu RPG está usando um banco de dados de verdade! 🚀

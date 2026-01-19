# 🎲 Sistema de Controle de RPG - Ordem Paranormal

<div align="center">

![Status](https://img.shields.io/badge/Status-Completo-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node](https://img.shields.io/badge/Node.js-Express-green)

**Sistema completo para gerenciar fichas de personagens do RPG Ordem Paranormal**

[Instalação](#-instalação) • [Funcionalidades](#-funcionalidades) • [Como Usar](#-como-usar) • [Documentação](#-documentação)

</div>

---

## 📋 Sobre o Projeto

Sistema web desenvolvido em **React + Node.js** para facilitar o gerenciamento de fichas de personagens, rolagem de dados e consulta de informações do RPG Ordem Paranormal.

### ✨ Principais Características

- 🎭 **Criação de Personagens** - Sistema completo com 26 origens disponíveis
- 📊 **Fichas Interativas** - Controle de PV, SAN, PE em tempo real
- 🎲 **Rolagem de Dados** - Sistema integrado com histórico
- 📚 **Database Completa** - Armas, rituais, equipamentos e mais
- 🔮 **Sistema de Rituais** - 4 círculos e 4 elementos
- 💾 **Salvamento Automático** - Persistência em JSON
- 🎨 **Interface Moderna** - Dark theme responsivo

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 16+ instalado
- npm (vem com Node.js)

### Início Rápido

```powershell
# Clone ou baixe o projeto

# Execute o script de inicialização (Windows)
.\start.ps1

# OU instale manualmente
npm install
cd client
npm install
cd ..

# Inicie o sistema
npm run dev
```

### Acesso

- **Interface**: http://localhost:5173
- **API**: http://localhost:3000

---

## 🎯 Funcionalidades

### 🎭 Área do Mestre (NOVO!)

✅ **Sistema de login e autenticação**
✅ **Gerenciamento total de fichas dos jogadores**
✅ **CRUD completo de armas, rituais e equipamentos**
✅ **Criação de itens personalizados**
✅ **Edição livre de todas as informações**
✅ **Dashboard administrativo intuitivo**

**Acesso:** Usuário: `mestre` | Senha: `ordem2024`
**Documentação:** Veja [AREA_DO_MESTRE.md](AREA_DO_MESTRE.md)

### Sistema de Personagens (FICHA COMPLETA!)

✅ **Informações pessoais** completas (idade, aniversário, local, peso/altura)
✅ **Criação com 26 origens** diferentes
✅ **Distribuição de 20 pontos** de atributos (FOR, AGI, INT, PRE, VIG)
✅ **Trilha** (Ocultista/Especialista) e Classe
✅ **Sistema de Patentes** (Recruta, Operador, Agente de Elite, Especial)
✅ **Status completos**: PV, SAN, PE com cálculos automáticos
✅ **Defesa e Deslocamento** calculados automaticamente
✅ **28 Perícias** oficiais vinculadas a atributos
✅ **Poderes de Origem** implementados
✅ **Habilidades de Classe** gerenciáveis
✅ **Rituais Conhecidos** com círculos e elementos
✅ **Inventário completo** com sistema de espaço por patente
✅ **Descrição, História e Anotações** detalhadas
✅ **Prestígio e NEX** para progressão

**Veja:** [FICHA_COMPLETA.md](FICHA_COMPLETA.md) para todos os detalhes

### Sistema de Dados

✅ Rolagem personalizada (XdY+Z)
✅ Botões rápidos (d4 a d100)
✅ Histórico de rolagens
✅ Detecção de críticos e falhas
✅ Testes de atributo e perícia

### Database

✅ **Armas** - 12 armas catalogadas
✅ **Munições** - 5 tipos
✅ **Proteções** - Leve e Pesada
✅ **Equipamentos** - 7 itens
✅ **Rituais** - 23 rituais em 4 círculos
✅ **Origens** - 26 origens com poderes
✅ **Perícias** - 28 perícias descritas

### Interface

✅ Design dark theme
✅ Totalmente responsivo
✅ Animações suaves
✅ Feedback visual
✅ Navegação intuitiva

---

## 📖 Como Usar

### 1. Criar Personagem

1. Clique em **"+ Novo Personagem"**
2. Preencha nome e escolha origem
3. Selecione trilha (Ocultista/Especialista)
4. Distribua 20 pontos nos atributos
5. Adicione descrição e história
6. Clique em **"Criar Personagem"**

### 2. Usar a Ficha

- **Ajustar Status**: Use os botões +/- nas barras
- **Fazer Testes**: Clique nos atributos ou perícias
- **Ver Resultados**: Última rolagem aparece no topo

### 3. Rolar Dados

- **Personalizado**: Configure quantidade, lados e modificador
- **Rápido**: Use os botões d4, d6, d8, etc.
- **Histórico**: Veja todas as rolagens anteriores

### 4. Consultar Database

- Navegue pelas abas: Armas, Rituais, etc.
- Use a busca para filtrar
- Veja detalhes completos de cada item

---

## 📚 Documentação

### Arquivos de Documentação

- **[INSTALACAO.md](INSTALACAO.md)** - Guia completo de instalação
- **[COMO_USAR.md](COMO_USAR.md)** - Manual do usuário detalhado
- **[FUNCIONALIDADES.md](FUNCIONALIDADES.md)** - Lista completa de recursos
- **[PROJETO_COMPLETO.md](PROJETO_COMPLETO.md)** - Visão técnica completa

---

## 🗂️ Estrutura do Projeto

```
RPGCONTROLER/
├── server/              # Backend Node.js + Express
│   ├── index.js         # API REST
│   └── data/            # Database JSON
│       ├── characters.json
│       ├── origens.json
│       ├── pericias.json
│       ├── armas.json
│       ├── rituais.json
│       └── ...
│
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── utils/       # Funções auxiliares
│   │   └── App.jsx
│   └── package.json
│
├── package.json
├── start.ps1            # Script de inicialização
└── README.md
```

---

## 💻 Tecnologias

### Backend
- Node.js
- Express
- CORS
- Body-Parser

### Frontend
- React 18
- React Router DOM
- Vite
- Axios
- CSS3

---

## 📊 Dados Implementados

Todos os dados foram extraídos das imagens fornecidas:

✅ 26 Origens completas
✅ 28 Perícias com atributos
✅ 12 Armas com stats
✅ 5 Tipos de munição
✅ 2 Proteções
✅ 7 Equipamentos
✅ 23 Rituais em 4 círculos
✅ 20 Efeitos de insanidade
✅ Tabelas de dificuldade

---

## 🎮 Comandos Disponíveis

```powershell
# Instalar tudo
npm run install-all

# Iniciar sistema completo
npm run dev

# Apenas backend
npm run server

# Apenas frontend (na pasta client)
cd client
npm run dev

# Build para produção
cd client
npm run build
```

---

## 🔧 Configuração

### Portas Padrão

- Backend: `3000`
- Frontend: `5173`

Para alterar:
- Backend: Edite `PORT` em `server/index.js`
- Frontend: Edite `server.port` em `client/vite.config.js`

---

## 📝 Licença

Este projeto foi desenvolvido para uso com o sistema de RPG Ordem Paranormal.

---

## 🤝 Contribuindo

Este é um projeto educacional. Sinta-se livre para:

- Adicionar novas funcionalidades
- Melhorar o design
- Corrigir bugs
- Adicionar mais dados ao database

---

## 📞 Suporte

Para problemas técnicos:

1. Verifique a documentação em `INSTALACAO.md`
2. Consulte o guia em `COMO_USAR.md`
3. Revise os logs no terminal

---

## 🎯 Roadmap Futuro (Opcional)

Possíveis expansões:

- [ ] Sistema de inventário visual
- [ ] Gerenciamento de campanhas
- [ ] Fichas de NPCs
- [ ] Sistema de combate detalhado
- [ ] Notas de sessão
- [ ] Exportação/importação de fichas
- [ ] Modo multiplayer
- [ ] Integração com Discord

---

<div align="center">

**Desenvolvido para a comunidade de Ordem Paranormal RPG**

🎲 Boa sorte nas investigações! 🔍

[⬆️ Voltar ao topo](#-sistema-de-controle-de-rpg---ordem-paranormal)

</div>

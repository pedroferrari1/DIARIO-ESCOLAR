[![Netlify Status](https://api.netlify.com/api/v1/badges/e934de63-7ef5-453c-81ca-7758dcc14646/deploy-status)](https://app.netlify.com/sites/diarioescolar/deploys)

# Diário Escolar Digital

Sistema de gerenciamento escolar desenvolvido com React, TypeScript e Supabase.

## 🚀 Tecnologias

- React
- TypeScript
- Tailwind CSS
- Supabase
- Vite
- Vitest
- React Router DOM
- Zustand
- React Hook Form
- Zod

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/diario-escolar-digital.git
cd diario-escolar-digital
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase.

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## ⚙️ Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run preview`: Visualiza a build localmente
- `npm run test`: Executa os testes
- `npm run test:coverage`: Executa os testes com cobertura
- `npm run test:ui`: Executa os testes com interface visual

## 🗄️ Estrutura do Projeto

```
src/
  ├── components/     # Componentes React reutilizáveis
  ├── hooks/         # Custom hooks
  ├── lib/           # Configurações de bibliotecas
  ├── pages/         # Páginas da aplicação
  ├── services/      # Serviços e APIs
  ├── store/         # Gerenciamento de estado global
  ├── test/          # Configurações e utilitários de teste
  └── types/         # Definições de tipos TypeScript
```

## 🚀 Deploy

O projeto está configurado para deploy automático no Netlify:

1. Commits na branch `main` são automaticamente deployados em produção
2. Pull requests geram deploys de preview
3. Branches de feature podem ser deployadas para ambientes de teste

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

# Diário Escolar Digital

Sistema de gerenciamento escolar desenvolvido com React, TypeScript e Supabase.

## 🚀 Tecnologias

- React
- TypeScript
- Tailwind CSS
- Supabase
- Vite
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

## 🔒 Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá para Project Settings > API
4. Copie a URL do projeto e a anon key
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🚀 Deploy no Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente no Netlify:
   - Vá para Site Settings > Environment Variables
   - Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
3. Configure as políticas de segurança no Supabase:
   - Habilite Row Level Security (RLS)
   - Configure as políticas de acesso apropriadas
   - Verifique as configurações de CORS

### Configurações de Segurança Importantes

1. **Row Level Security (RLS)**
   - Todas as tabelas devem ter RLS habilitado
   - Configure políticas específicas para cada tabela
   - Teste as políticas em ambiente de desenvolvimento

2. **CORS Settings no Supabase**
   - Adicione o domínio do Netlify aos allowed origins
   - Use `*` apenas em desenvolvimento
   - Em produção, especifique os domínios exatos

3. **Variáveis de Ambiente**
   - Nunca comite o arquivo `.env`
   - Use diferentes variáveis para desenvolvimento e produção
   - Mantenha as chaves de API seguras

4. **Headers de Segurança**
   - Configurados no `netlify.toml`
   - Incluem proteções contra XSS, clickjacking, etc.
   - Content Security Policy (CSP) configurada

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
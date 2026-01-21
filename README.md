# XMoney - Gestão Financeira Pessoal

XMoney é um aplicativo web moderno, responsivo e mobile-first para gestão financeira pessoal, construído com Next.js, Tailwind CSS, Prisma e SQLite.

## Funcionalidades

- 💰 **Resumo Financeiro**: Dashboard com total de entradas, saídas e saldo atual.
- 📊 **Filtro Mensal**: Visualize suas transações por mês.
- 📝 **Gestão de Transações**: Cadastro completo de entradas e saídas.
- 📱 **PWA Ready**: Instale em seu dispositivo móvel como um aplicativo nativo.
- ⚡ **Mobile-First**: Interface otimizada para todas as telas.

## Tecnologias

- **Framework**: Next.js (App Router)
- **Estilização**: Tailwind CSS 4
- **Banco de Dados**: SQLite
- **ORM**: Prisma
- **Ícones**: Lucide React
- **Datas**: date-fns

## Como Rodar Localmente

1. **Clone o repositório**:
   ```bash
   git clone <URL_DO_REPOSITÓRIO>
   cd x-money-app
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o banco de dados**:
   ```bash
   npx prisma db push
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

## Deploy no Vercel

Este projeto está pronto para ser enviado ao Vercel.

1. Conecte seu repositório ao Vercel.
2. Certifique-se de que o comando de build é `npm run build`.
3. Adicione a variável de ambiente `DATABASE_URL` se for usar um banco de dados externo (Postgres), ou mantenha o SQLite para testes simples (note que o SQLite no Vercel é efêmero).

> [!IMPORTANT]
> Para persistência real em produção, recomenda-se conectar a um banco de dados PostgreSQL (como o Vercel Postgres). Basta alterar o provider no `schema.prisma` para `postgresql`.

---
Desenvolvido com ❤️ para uma gestão financeira mais inteligente.

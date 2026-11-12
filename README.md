# Jujuba Festeira

Aplicação de catálogo e encomendas via WhatsApp, com painel administrativo protegido.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL e Storage
- Encomendas finalizadas manualmente pelo WhatsApp

## Estado
Este repositório estava vazio. A implementação será feita por etapas, preservando a base de dados existente no Supabase.

## Configuração local
1. Instalar Node.js LTS.
2. Executar `npm install`.
3. Copiar `.env.example` para `.env.local` e preencher as credenciais do Supabase.
4. Executar `npm run dev`.

Variáveis necessárias:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Nunca colocar a chave `service_role` em variáveis `NEXT_PUBLIC_*` nem no código do browser.

## Administração
O acesso administrativo deve ser autorizado por uma linha activa em `public.admin_users`, além da sessão Supabase Auth. Não existe registo público de administradores.

## Dados
O projecto Supabase existente já contém categorias, produtos, variantes, imagens, opções e campos de personalização. Não recriar nem apagar essas tabelas.

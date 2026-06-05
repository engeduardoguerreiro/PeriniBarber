# Perini Barber

SaaS multiempresa para barbearias com landing page, autenticação Supabase, dashboard, agenda, clientes, barbeiros, serviços, comandas, financeiro, comissões, estoque, marketing e link público de agendamento.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL com RLS
- React Hook Form
- Zod
- Sonner
- Lucide React

## Como rodar localmente

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local` com base em `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

3. Rode o projeto:

```bash
npm run dev
```

## Supabase

A migration inicial está em:

```text
supabase/migrations/20260604170000_initial_perini_barber.sql
```

Ela cria:

- `profiles`
- `barbershops`
- `barbershop_users`
- `barbers`
- `services`
- `service_barbers`
- `customers`
- `appointments`
- `appointment_blocks`
- `commands`
- `command_items`
- `payments`
- `commissions`
- `products`
- `stock_movements`
- `marketing_templates`
- `settings`

Também inclui índices por `barbershop_id`, `barber_id`, `customer_id`, `appointment_date` e `status`, RLS para isolamento multiempresa e uma constraint de exclusão para impedir conflito de horário ativo para o mesmo barbeiro.

Para aplicar em um projeto Supabase, use o SQL Editor ou o fluxo de migrations do Supabase CLI do seu ambiente.

## Módulos implementados

- `/` landing page comercial com benefícios, funcionalidades, planos, depoimento fictício, FAQ e CTA.
- `/login` login com Supabase Auth.
- `/cadastro` cadastro com dados iniciais de usuário e barbearia em metadata.
- `/agendar/[slug]` fluxo público de agendamento preparado para ler barbearia, barbeiros e serviços do Supabase.
- `/dashboard` visão inicial com indicadores e áreas de próximos horários e serviços mais vendidos.
- Rotas privadas: `/agenda`, `/clientes`, `/barbeiros`, `/servicos`, `/comandas`, `/financeiro`, `/comissoes`, `/estoque`, `/marketing`, `/configuracoes`.

## Estado de produção

Esta primeira entrega cria a base funcional e segura do SaaS. Os módulos privados já têm layout, navegação, tabelas e estrutura para conectar operações Supabase por `barbershop_id`, mas CRUDs completos, server actions de escrita e relatórios agregados ainda devem ser implementados módulo por módulo.

Pendências recomendadas:

- Criar trigger ou server action pós-cadastro para gerar `profiles`, `barbershops`, `barbershop_users` e `settings`.
- Trocar o envio demonstrativo do agendamento público por uma action que cria cliente e agendamento em transação.
- Implementar formulários completos de CRUD por módulo.
- Criar relatórios reais para dashboard, financeiro e comissões.
- Configurar Supabase Storage para logos e fotos.
- Adicionar testes de regras de RLS e validações críticas.

## Validação

Comandos usados para validar:

```bash
npm run lint
npm run build
```

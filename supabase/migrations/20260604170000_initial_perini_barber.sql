create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create schema if not exists private;

create type public.user_role as enum ('owner', 'admin', 'barber', 'receptionist');
create type public.appointment_status as enum ('agendado', 'confirmado', 'em_atendimento', 'finalizado', 'cancelado', 'nao_compareceu');
create type public.appointment_origin as enum ('interno', 'publico', 'whatsapp');
create type public.command_status as enum ('aberta', 'paga', 'cancelada', 'pendente');
create type public.payment_method as enum ('dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'cortesia', 'pendente');
create type public.stock_movement_type as enum ('entrada', 'saida', 'ajuste');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.barbershops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  opening_hours jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.barbershop_users (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'barber',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (barbershop_id, user_id)
);

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  photo_url text,
  whatsapp text,
  email text,
  specialty text,
  bio text,
  active boolean not null default true,
  work_days text[] not null default array['monday','tuesday','wednesday','thursday','friday','saturday'],
  work_start time not null default '09:00',
  work_end time not null default '19:00',
  lunch_start time,
  lunch_end time,
  default_commission_percent numeric(5,2) not null default 40 check (default_commission_percent between 0 and 100),
  allow_online_booking boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  default_commission_percent numeric(5,2) check (default_commission_percent between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_barbers (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (service_id, barber_id)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  whatsapp text not null,
  email text,
  birth_date date,
  notes text,
  preferred_barber_id uuid references public.barbers(id) on delete set null,
  last_appointment_at timestamptz,
  average_ticket numeric(12,2) not null default 0,
  total_spent numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  barber_id uuid not null references public.barbers(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  appointment_date date not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'agendado',
  notes text,
  origin public.appointment_origin not null default 'interno',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('agendado', 'confirmado', 'em_atendimento'))
);

create table public.appointment_blocks (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.commands (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  barber_id uuid references public.barbers(id) on delete set null,
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  payment_method public.payment_method not null default 'pendente',
  status public.command_status not null default 'aberta',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.command_items (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  command_id uuid not null references public.commands(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  product_id uuid,
  description text not null,
  quantity numeric(12,2) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  command_id uuid not null references public.commands(id) on delete cascade,
  method public.payment_method not null,
  amount numeric(12,2) not null check (amount >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  command_id uuid references public.commands(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  gross_amount numeric(12,2) not null default 0,
  commission_percent numeric(5,2) not null check (commission_percent between 0 and 100),
  commission_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  category text,
  current_quantity numeric(12,2) not null default 0,
  minimum_quantity numeric(12,2) not null default 0,
  cost numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.command_items
  add constraint command_items_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  movement_type public.stock_movement_type not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_cost numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketing_templates (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade unique,
  payment_methods text[] not null default array['dinheiro','pix','cartao_debito','cartao_credito'],
  theme jsonb not null default '{}'::jsonb,
  public_booking_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.current_barbershop_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select barbershop_id
  from public.barbershop_users
  where user_id = auth.uid()
    and active = true;
$$;

create or replace function private.has_barbershop_role(target_barbershop_id uuid, allowed_roles public.user_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.barbershop_users
    where user_id = auth.uid()
      and barbershop_id = target_barbershop_id
      and role = any(allowed_roles)
      and active = true
  );
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','barbershops','barbershop_users','barbers','services','service_barbers',
    'customers','appointments','appointment_blocks','commands','payments','commissions',
    'products','stock_movements','marketing_templates','settings'
  ]
  loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
end $$;

create index on public.barbershop_users (barbershop_id);
create index on public.barbershop_users (user_id);
create index on public.barbers (barbershop_id);
create index on public.services (barbershop_id);
create index on public.customers (barbershop_id);
create index on public.customers (whatsapp);
create index on public.appointments (barbershop_id);
create index on public.appointments (barber_id);
create index on public.appointments (customer_id);
create index on public.appointments (appointment_date);
create index on public.appointments (status);
create index on public.commands (barbershop_id);
create index on public.commands (status);
create index on public.command_items (barbershop_id);
create index on public.payments (barbershop_id);
create index on public.commissions (barbershop_id);
create index on public.commissions (barber_id);
create index on public.products (barbershop_id);
create index on public.stock_movements (barbershop_id);

alter table public.profiles enable row level security;
alter table public.barbershops enable row level security;
alter table public.barbershop_users enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.service_barbers enable row level security;
alter table public.customers enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_blocks enable row level security;
alter table public.commands enable row level security;
alter table public.command_items enable row level security;
alter table public.payments enable row level security;
alter table public.commissions enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.marketing_templates enable row level security;
alter table public.settings enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.barbershops, public.barbers, public.services to anon;
grant insert on public.customers, public.appointments to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy "profiles own row" on public.profiles
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "members read barbershop" on public.barbershops
  for select to authenticated using (id in (select private.current_barbershop_ids()));
create policy "owners admins update barbershop" on public.barbershops
  for update to authenticated using (private.has_barbershop_role(id, array['owner','admin']::public.user_role[]));
create policy "public active barbershop by slug" on public.barbershops
  for select to anon using (active = true);

create policy "members read memberships" on public.barbershop_users
  for select to authenticated using (barbershop_id in (select private.current_barbershop_ids()));
create policy "owners manage memberships" on public.barbershop_users
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner']::public.user_role[]));

create policy "members manage operational tables" on public.barbers
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage services" on public.services
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage service barbers" on public.service_barbers
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage customers" on public.customers
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage appointments" on public.appointments
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage blocks" on public.appointment_blocks
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage products" on public.products
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage stock" on public.stock_movements
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members manage marketing" on public.marketing_templates
  for all to authenticated using (barbershop_id in (select private.current_barbershop_ids())) with check (barbershop_id in (select private.current_barbershop_ids()));
create policy "members read settings" on public.settings
  for select to authenticated using (barbershop_id in (select private.current_barbershop_ids()));
create policy "owners admins update settings" on public.settings
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));

create policy "public reads active barbers" on public.barbers
  for select to anon using (active = true and allow_online_booking = true);
create policy "public reads active services" on public.services
  for select to anon using (active = true);
create policy "public creates customers" on public.customers
  for insert to anon with check (exists (select 1 from public.barbershops b where b.id = barbershop_id and b.active = true));
create policy "public creates appointments" on public.appointments
  for insert to anon with check (
    origin = 'publico'
    and status = 'agendado'
    and starts_at > now()
    and exists (select 1 from public.barbershops b where b.id = barbershop_id and b.active = true)
  );

create policy "financial owner admin receptionist commands" on public.commands
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]));
create policy "financial owner admin receptionist command items" on public.command_items
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin','receptionist']::public.user_role[]));
create policy "financial owner admin payments" on public.payments
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));
create policy "financial owner admin commissions" on public.commissions
  for all to authenticated
  using (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]))
  with check (private.has_barbershop_role(barbershop_id, array['owner','admin']::public.user_role[]));

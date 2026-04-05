create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'sales', 'viewer');
create type public.document_kind as enum ('quote', 'invoice', 'credit_note');
create type public.document_status as enum ('draft', 'sent', 'accepted', 'paid', 'cancelled', 'overdue');
create type public.appointment_sync_state as enum ('synced', 'pending_push', 'sync_error', 'disconnected');
create type public.deal_stage as enum ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'de-DE',
  timezone text not null default 'Europe/Berlin',
  is_active boolean not null default true,
  mfa_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role public.app_role not null default 'viewer'
);

create table public.role_permissions (
  role public.app_role not null,
  permission text not null,
  primary key (role, permission)
);

create table public.company_profile (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  vat_id text not null,
  tax_number text not null,
  iban text not null,
  bic text not null,
  invoice_email text not null,
  invoice_footer text not null,
  billing_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('company', 'person')),
  company_name text not null,
  vat_id text,
  email text,
  phone text,
  billing_address jsonb not null default '{}'::jsonb,
  shipping_address jsonb,
  industry text not null default 'Allgemein',
  health_score integer not null default 70 check (health_score between 0 and 100),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  owner_user_id uuid references public.profiles(id),
  title text not null,
  stage public.deal_stage not null default 'lead',
  value_cents bigint not null default 0,
  probability integer not null default 0,
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references public.profiles(id),
  customer_id uuid references public.customers(id),
  title text not null,
  google_event_id text unique,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  notes text,
  sync_state public.appointment_sync_state not null default 'pending_push',
  external_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.number_sequences (
  kind public.document_kind not null,
  fiscal_year integer not null,
  current_value bigint not null default 0,
  primary key (kind, fiscal_year)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  kind public.document_kind not null,
  status public.document_status not null default 'draft',
  customer_id uuid not null references public.customers(id),
  sequence_no bigint,
  document_no text unique,
  issue_date date not null default current_date,
  service_date date,
  due_date date,
  currency text not null default 'EUR',
  tax_mode text not null default 'standard',
  subtotal_net_cents bigint not null default 0,
  tax_total_cents bigint not null default 0,
  total_gross_cents bigint not null default 0,
  payment_terms text not null default '14 Tage netto',
  legal_footer text not null default '',
  einvoice_profile text,
  einvoice_payload jsonb not null default '{}'::jsonb,
  pdf_path text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  sort_order integer not null default 0,
  sku text,
  description text not null,
  qty numeric(12,2) not null default 1,
  unit_net_cents bigint not null default 0,
  tax_rate numeric(5,2) not null default 19,
  line_net_cents bigint not null default 0,
  line_tax_cents bigint not null default 0,
  line_gross_cents bigint not null default 0
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null,
  sha256 text not null,
  generated_by uuid references public.profiles(id),
  generated_at timestamptz not null default now()
);

create table public.calendar_connections (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  google_email text,
  access_scope text,
  encrypted_refresh_token text not null,
  sync_token text,
  token_expires_at timestamptz,
  status text not null default 'pending',
  last_synced_at timestamptz
);

create table public.calendar_watch_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  google_resource_id text,
  google_channel_id text unique,
  expires_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  diff jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.bump_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.bump_updated_at();
create trigger set_company_profile_updated_at before update on public.company_profile for each row execute procedure public.bump_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute procedure public.bump_updated_at();
create trigger set_contacts_updated_at before update on public.contacts for each row execute procedure public.bump_updated_at();
create trigger set_deals_updated_at before update on public.deals for each row execute procedure public.bump_updated_at();
create trigger set_appointments_updated_at before update on public.appointments for each row execute procedure public.bump_updated_at();
create trigger set_documents_updated_at before update on public.documents for each row execute procedure public.bump_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'viewer')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'app_role')::public.app_role, 'viewer'::public.app_role);
$$;

create or replace function public.has_permission(required_permission text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.role_permissions
    where role = public.current_app_role()
      and permission = required_permission
  );
$$;

create or replace function public.next_document_number(request_kind public.document_kind, requested_issue_date date default current_date)
returns table(sequence_no bigint, document_no text)
language plpgsql
security definer
set search_path = public
as $$
declare
  fiscal_year integer := extract(year from requested_issue_date);
  next_value bigint;
  prefix text;
begin
  insert into public.number_sequences (kind, fiscal_year, current_value)
  values (request_kind, fiscal_year, 1)
  on conflict (kind, fiscal_year)
  do update set current_value = public.number_sequences.current_value + 1
  returning current_value into next_value;

  prefix := case request_kind
    when 'quote' then 'AN'
    when 'invoice' then 'RE'
    else 'GS'
  end;

  return query
  select
    next_value,
    format('%s-%s-%s', prefix, fiscal_year, lpad(next_value::text, 4, '0'));
end;
$$;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  user_role public.app_role;
begin
  select role into user_role
  from public.user_roles
  where user_id = (event ->> 'user_id')::uuid;

  if user_role is null then
    user_role := 'viewer';
  end if;

  event := jsonb_set(event, '{claims,app_role}', to_jsonb(user_role::text), true);
  return event;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant usage on type public.app_role to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.company_profile enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.appointments enable row level security;
alter table public.number_sequences enable row level security;
alter table public.documents enable row level security;
alter table public.document_items enable row level security;
alter table public.document_versions enable row level security;
alter table public.calendar_connections enable row level security;
alter table public.calendar_watch_channels enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated
using (auth.uid() = id or public.has_permission('users.manage'));

create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated
using (auth.uid() = id or public.has_permission('users.manage'))
with check (auth.uid() = id or public.has_permission('users.manage'));

create policy "user_roles_select_own_or_admin" on public.user_roles
for select to authenticated
using (auth.uid() = user_id or public.has_permission('users.manage'));

create policy "user_roles_manage_admin" on public.user_roles
for all to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

create policy "role_permissions_read_authenticated" on public.role_permissions
for select to authenticated
using (true);

create policy "company_profile_read_authenticated" on public.company_profile
for select to authenticated
using (true);

create policy "company_profile_manage" on public.company_profile
for all to authenticated
using (public.has_permission('company.manage'))
with check (public.has_permission('company.manage'));

create policy "customers_read" on public.customers
for select to authenticated
using (public.has_permission('crm.view'));

create policy "customers_manage" on public.customers
for all to authenticated
using (public.has_permission('crm.manage'))
with check (public.has_permission('crm.manage'));

create policy "contacts_read" on public.contacts
for select to authenticated
using (public.has_permission('crm.view'));

create policy "contacts_manage" on public.contacts
for all to authenticated
using (public.has_permission('crm.manage'))
with check (public.has_permission('crm.manage'));

create policy "deals_read" on public.deals
for select to authenticated
using (public.has_permission('crm.view'));

create policy "deals_manage" on public.deals
for all to authenticated
using (public.has_permission('crm.manage'))
with check (public.has_permission('crm.manage'));

create policy "appointments_read" on public.appointments
for select to authenticated
using (public.has_permission('calendar.view'));

create policy "appointments_manage" on public.appointments
for all to authenticated
using (public.has_permission('calendar.manage'))
with check (public.has_permission('calendar.manage'));

create policy "number_sequences_manage" on public.number_sequences
for all to authenticated
using (public.has_permission('documents.manage'))
with check (public.has_permission('documents.manage'));

create policy "documents_read" on public.documents
for select to authenticated
using (public.has_permission('documents.view'));

create policy "documents_manage" on public.documents
for all to authenticated
using (public.has_permission('documents.manage'))
with check (public.has_permission('documents.manage'));

create policy "document_items_read" on public.document_items
for select to authenticated
using (public.has_permission('documents.view'));

create policy "document_items_manage" on public.document_items
for all to authenticated
using (public.has_permission('documents.manage'))
with check (public.has_permission('documents.manage'));

create policy "document_versions_read" on public.document_versions
for select to authenticated
using (public.has_permission('documents.view'));

create policy "document_versions_manage" on public.document_versions
for all to authenticated
using (public.has_permission('documents.manage'))
with check (public.has_permission('documents.manage'));

create policy "calendar_connections_read_own" on public.calendar_connections
for select to authenticated
using (auth.uid() = user_id or public.has_permission('users.manage'));

create policy "calendar_connections_manage_own" on public.calendar_connections
for all to authenticated
using (auth.uid() = user_id or public.has_permission('users.manage'))
with check (auth.uid() = user_id or public.has_permission('users.manage'));

create policy "calendar_watch_read_own" on public.calendar_watch_channels
for select to authenticated
using (auth.uid() = user_id or public.has_permission('users.manage'));

create policy "calendar_watch_manage_admin" on public.calendar_watch_channels
for all to authenticated
using (public.has_permission('users.manage'))
with check (public.has_permission('users.manage'));

create policy "audit_logs_read" on public.audit_logs
for select to authenticated
using (public.has_permission('audit.view'));

create policy "audit_logs_write_admin" on public.audit_logs
for insert to authenticated
with check (public.has_permission('audit.view'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "documents_bucket_read" on storage.objects
for select to authenticated
using (bucket_id = 'documents' and public.has_permission('documents.view'));

create policy "documents_bucket_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'documents' and public.has_permission('documents.manage'));

create policy "documents_bucket_update" on storage.objects
for update to authenticated
using (bucket_id = 'documents' and public.has_permission('documents.manage'))
with check (bucket_id = 'documents' and public.has_permission('documents.manage'));

create policy "documents_bucket_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'documents' and public.has_permission('documents.manage'));

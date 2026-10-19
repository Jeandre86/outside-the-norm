-- Preserve the existing content documents and revision-based write protection.
-- Server routes must authenticate the owner before using the service-role client.
begin;
create table public.studio_content (
  id text primary key,
  data jsonb not null,
  revision integer not null check (revision > 0),
  updated_at timestamptz not null default now()
);
create table public.studio_enquiries (
  id uuid primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null
);
alter table public.studio_content enable row level security;
alter table public.studio_enquiries enable row level security;
revoke all on public.studio_content, public.studio_enquiries from anon, authenticated;
grant select, insert, update, delete on public.studio_content, public.studio_enquiries to service_role;

-- A stale editor must never overwrite newer invoice numbers or payments.
create function public.save_studio_content(record_id text, record_data jsonb, expected_revision integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare saved_revision integer;
begin
  if expected_revision < 0 then
    raise exception 'Invalid revision';
  end if;
  if expected_revision = 0 then
    insert into public.studio_content(id, data, revision)
    values (record_id, record_data, 1)
    on conflict (id) do nothing
    returning revision into saved_revision;
  else
    update public.studio_content
    set data = record_data, revision = revision + 1, updated_at = now()
    where id = record_id and revision = expected_revision
    returning revision into saved_revision;
  end if;
  if saved_revision is null then
    raise exception 'Records changed. Reload before saving.' using errcode = '40001';
  end if;
  return saved_revision;
end;
$$;
revoke all on function public.save_studio_content(text,jsonb,integer) from public, anon, authenticated;
grant execute on function public.save_studio_content(text,jsonb,integer) to service_role;
commit;

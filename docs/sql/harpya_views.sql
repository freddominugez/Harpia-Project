-- Contador isolado. A chave é configurada separadamente, nunca neste arquivo.
create schema harpya_stats;
revoke all on schema harpya_stats from public;
grant usage on schema harpya_stats to anon, authenticated;
create table harpya_stats.counter (
  singleton boolean primary key default true check (singleton),
  views bigint not null default 0 check (views >= 0),
  started_on date not null default (now() at time zone 'America/Fortaleza')::date,
  secret_hash bytea
);
insert into harpya_stats.counter (singleton) values (true);
create table harpya_stats.events (
  event_id uuid primary key,
  rate_key text not null,
  created_at timestamptz not null default now()
);
create index events_created_at_idx on harpya_stats.events (created_at);
create index events_rate_key_created_at_idx on harpya_stats.events (rate_key, created_at desc);
alter table harpya_stats.counter enable row level security;
alter table harpya_stats.events enable row level security;
revoke all on all tables in schema harpya_stats from public, anon, authenticated;

create function harpya_stats.read_views() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('views', views, 'started_on', started_on)
  from harpya_stats.counter where singleton;
$$;
create function harpya_stats.record_view(p_secret text, p_event_id uuid, p_rate_key text) returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if p_secret is null or not exists (
    select 1 from harpya_stats.counter where singleton and secret_hash = sha256(convert_to(p_secret, 'UTF8'))
  ) then raise insufficient_privilege using message = 'Unauthorized counter request'; end if;
  if p_event_id is null or p_rate_key is null or length(p_rate_key) <> 64 then
    raise invalid_parameter_value using message = 'Invalid counter event';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_rate_key, 0));
  if (select count(*) from harpya_stats.events where rate_key = p_rate_key and created_at > now() - interval '1 minute') >= 30 then
    return harpya_stats.read_views();
  end if;
  insert into harpya_stats.events(event_id, rate_key) values (p_event_id, p_rate_key) on conflict do nothing;
  if found then update harpya_stats.counter set views = views + 1 where singleton; end if;
  delete from harpya_stats.events where created_at < now() - interval '7 days';
  return harpya_stats.read_views();
end;
$$;
create function public.harpya_views_read() returns jsonb
language sql stable security invoker set search_path = '' as $$ select harpya_stats.read_views(); $$;
create function public.harpya_views_record(p_secret text, p_event_id uuid, p_rate_key text) returns jsonb
language sql security invoker set search_path = '' as $$ select harpya_stats.record_view(p_secret, p_event_id, p_rate_key); $$;
revoke all on function harpya_stats.read_views(), harpya_stats.record_view(text, uuid, text), public.harpya_views_read(), public.harpya_views_record(text, uuid, text) from public;
grant execute on function harpya_stats.read_views(), harpya_stats.record_view(text, uuid, text), public.harpya_views_read(), public.harpya_views_record(text, uuid, text) to anon, authenticated;
notify pgrst, 'reload schema';

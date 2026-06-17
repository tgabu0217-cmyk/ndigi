-- NPCデータ保存用テーブル
create table if not exists public.npcs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '名称未設定',
  job text default '',
  edition smallint not null default 6 check (edition in (6, 7)),
  data jsonb not null, -- { npc, overrides, statOrderKey, cmd, secretMode }
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 一覧取得を高速化するためのインデックス
create index if not exists npcs_user_id_updated_at_idx
  on public.npcs (user_id, updated_at desc);

-- updated_at 自動更新トリガー
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists npcs_set_updated_at on public.npcs;
create trigger npcs_set_updated_at
  before update on public.npcs
  for each row
  execute function public.set_updated_at();

-- Row Level Security: 本人のデータのみ操作可能
alter table public.npcs enable row level security;

drop policy if exists "npcs_select_own" on public.npcs;
create policy "npcs_select_own"
  on public.npcs for select
  using (auth.uid() = user_id);

drop policy if exists "npcs_insert_own" on public.npcs;
create policy "npcs_insert_own"
  on public.npcs for insert
  with check (auth.uid() = user_id);

drop policy if exists "npcs_update_own" on public.npcs;
create policy "npcs_update_own"
  on public.npcs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "npcs_delete_own" on public.npcs;
create policy "npcs_delete_own"
  on public.npcs for delete
  using (auth.uid() = user_id);

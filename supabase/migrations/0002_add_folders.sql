-- フォルダ機能（シナリオごとにNPCを仕分けるための階層フォルダ）

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '無題のフォルダ',
  parent_id uuid references public.folders(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists folders_user_id_parent_id_idx
  on public.folders (user_id, parent_id);

drop trigger if exists folders_set_updated_at on public.folders;
create trigger folders_set_updated_at
  before update on public.folders
  for each row
  execute function public.set_updated_at();

alter table public.folders enable row level security;

drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own"
  on public.folders for select
  using (auth.uid() = user_id);

drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own"
  on public.folders for insert
  with check (auth.uid() = user_id);

drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own"
  on public.folders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own"
  on public.folders for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.folders to authenticated;

-- npcs テーブルに folder_id を追加（null = 未分類フォルダ扱い）
alter table public.npcs
  add column if not exists folder_id uuid references public.folders(id) on delete set null;

create index if not exists npcs_user_id_folder_id_idx
  on public.npcs (user_id, folder_id);

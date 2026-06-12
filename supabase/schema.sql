-- 寵物樂園 Supabase 資料表
-- 在 Supabase Dashboard → SQL Editor 貼上執行即可

create table if not exists public.kidspet_families (
  code text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 啟用 Row Level Security
alter table public.kidspet_families enable row level security;

-- 注意:此 App 採「家庭代碼即金鑰」的簡化模式,
-- 知道代碼的人即可讀寫該家庭的資料(代碼為隨機產生,如 PET-X7K2M9)。
-- 適合家庭自用;若要更高安全性,可改接 Supabase Auth。
create policy "anon can read families"
  on public.kidspet_families for select
  to anon using (true);

create policy "anon can insert families"
  on public.kidspet_families for insert
  to anon with check (true);

create policy "anon can update families"
  on public.kidspet_families for update
  to anon using (true);

-- 啟用 Realtime(讓多裝置即時同步)
alter publication supabase_realtime add table public.kidspet_families;

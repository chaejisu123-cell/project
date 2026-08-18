-- ============================================================================
-- 오퍼하우스 현장관리 - 1단계: 기반 스키마
-- 현장(projects)을 기준으로 사진/공정표/공지사항/예산/지출이 묶이는 구조
-- ============================================================================

-- pgcrypto: gen_random_uuid() 사용을 위해 필요 (Supabase 프로젝트는 기본 활성화되어 있음)
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- projects (현장)
-- ----------------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  customer_name text,
  site_token text not null unique,
  budget_total numeric(14, 0) not null default 0,
  status text not null default '진행중'
    check (status in ('진행중', '완료', '보류')),
  created_at timestamptz not null default now()
);

comment on table projects is '현장(프로젝트). 고객용 페이지는 site_token으로만 접근한다.';
comment on column projects.site_token is '추측 불가능한 랜덤 토큰. /site/[token] 링크에 사용.';

-- ----------------------------------------------------------------------------
-- photos (현장 사진)
-- ----------------------------------------------------------------------------
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  image_url text not null,
  taken_at date,
  process_tag text,
  created_at timestamptz not null default now()
);

create index if not exists photos_project_id_idx on photos (project_id);

-- ----------------------------------------------------------------------------
-- schedule_items (공정표)
-- ----------------------------------------------------------------------------
create table if not exists schedule_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  process_name text not null,
  start_date date,
  end_date date,
  status text not null default '예정'
    check (status in ('예정', '진행중', '완료')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists schedule_items_project_id_idx on schedule_items (project_id);

-- ----------------------------------------------------------------------------
-- notices (공지사항)
-- ----------------------------------------------------------------------------
create table if not exists notices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  title text not null,
  content text,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notices_project_id_idx on notices (project_id);

-- ----------------------------------------------------------------------------
-- budget_items (예산 항목)
-- ----------------------------------------------------------------------------
create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  category text,
  item_name text not null,
  planned_amount numeric(14, 0) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists budget_items_project_id_idx on budget_items (project_id);

-- ----------------------------------------------------------------------------
-- expense_items (실집행 지출)
-- ----------------------------------------------------------------------------
create table if not exists expense_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  budget_item_id uuid references budget_items (id) on delete set null,
  vendor_name text,
  amount numeric(14, 0) not null default 0,
  expense_date date,
  receipt_image_url text,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists expense_items_project_id_idx on expense_items (project_id);
create index if not exists expense_items_budget_item_id_idx on expense_items (budget_item_id);

-- ============================================================================
-- Row Level Security
--
-- 1단계 방침: 로그인한 관리자만 모든 테이블에 접근 가능하도록 설정한다.
-- 고객 페이지(/site/[token])의 공개 읽기는 2단계에서 서버 전용 서비스 롤 키로
-- 토큰을 검증한 뒤 조회하는 방식으로 추가한다(RLS를 anon에 열어두면 토큰 없이도
-- REST API로 전체 현장 데이터가 노출될 수 있기 때문).
-- ============================================================================

alter table projects enable row level security;
alter table photos enable row level security;
alter table schedule_items enable row level security;
alter table notices enable row level security;
alter table budget_items enable row level security;
alter table expense_items enable row level security;

create policy "authenticated_all_projects" on projects
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_photos" on photos
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_schedule_items" on schedule_items
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_notices" on notices
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_budget_items" on budget_items
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_expense_items" on expense_items
  for all to authenticated using (true) with check (true);

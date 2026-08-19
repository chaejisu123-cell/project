-- ============================================================================
-- 오퍼하우스 현장관리 - 4단계: 실행정산 (공수관리 / 자재관리)
-- 0001~0003 실행 후 이 파일도 SQL Editor에서 실행해야 공수관리·자재관리 화면이 동작한다.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- labor_records (일일 노무 투입 기록 — 날짜 x 공정 셀 하나당 한 행)
-- ----------------------------------------------------------------------------
create table if not exists labor_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  work_date date not null,
  process_name text not null,
  worker_count numeric(6, 1) not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, work_date, process_name)
);

comment on table labor_records is '공수관리: 날짜별·공정별 투입 인원수(품수). 공정 목록은 별도 테이블 없이 이 테이블에 실제 입력된 process_name에서 유도한다.';
comment on column labor_records.worker_count is '0.5인 단위(반나절 품)까지 입력 가능. 0 이하로 저장하려는 시도는 서버 액션에서 행 삭제로 처리한다.';

create index if not exists labor_records_project_id_idx on labor_records (project_id);

-- ----------------------------------------------------------------------------
-- material_records (자재 사용/발주 기록)
-- ----------------------------------------------------------------------------
create table if not exists material_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  material_name text not null,
  unit text,
  record_date date not null,
  quantity numeric(12, 2) not null default 0,
  type text not null check (type in ('사용', '발주')),
  memo text,
  created_at timestamptz not null default now()
);

comment on table material_records is '자재관리: 자재별 사용/발주 기록. 자재 목록도 labor_records의 공정과 동일하게 별도 테이블 없이 material_name에서 유도한다.';

create index if not exists material_records_project_id_idx on material_records (project_id);
create index if not exists material_records_project_material_idx
  on material_records (project_id, material_name);

-- ============================================================================
-- Row Level Security — 두 테이블 모두 관리자 전용(고객 페이지에는 노출하지 않음).
-- ============================================================================

alter table labor_records enable row level security;
alter table material_records enable row level security;

create policy "authenticated_all_labor_records" on labor_records
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_material_records" on material_records
  for all to authenticated using (true) with check (true);

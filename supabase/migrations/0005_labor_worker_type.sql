-- ============================================================================
-- 오퍼하우스 현장관리 - 공수관리 기공/조공 구분 추가
-- 0001~0004 실행 후 이 파일도 SQL Editor에서 실행해야 공수관리 화면이 다시 동작한다.
-- labor_records에 worker_type(기공/조공)을 추가하고, 셀의 유일성 기준에 포함시킨다.
-- ============================================================================

alter table labor_records
  add column if not exists worker_type text not null default '기공';

alter table labor_records
  add constraint labor_records_worker_type_check check (worker_type in ('기공', '조공'));

comment on column labor_records.worker_type is '기공(기능공) / 조공(보조인력) 구분. 날짜·공정별로 각각 따로 집계한다.';

-- 기존 unique(project_id, work_date, process_name)를 worker_type까지 포함하도록 교체
-- (0001~0004 시점에 만들어진 기본 이름이라 다를 수 있어 if exists로 안전하게 제거)
alter table labor_records
  drop constraint if exists labor_records_project_id_work_date_process_name_key;

alter table labor_records
  add constraint labor_records_project_date_process_type_key
  unique (project_id, work_date, process_name, worker_type);

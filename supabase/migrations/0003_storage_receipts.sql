-- ============================================================================
-- 오퍼하우스 현장관리 - 영수증 이미지 저장용 Storage 버킷 (4단계: 실행정산)
-- 0001_init.sql, 0002_storage.sql 실행 후 이 파일도 SQL Editor에서 실행해야
-- 지출 등록 시 영수증 이미지 첨부가 동작한다.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('receipt-images', 'receipt-images', true)
on conflict (id) do nothing;

-- 로그인한 관리자만 업로드/수정/삭제 가능
create policy "authenticated_upload_receipt_images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipt-images');

create policy "authenticated_update_receipt_images" on storage.objects
  for update to authenticated
  using (bucket_id = 'receipt-images')
  with check (bucket_id = 'receipt-images');

create policy "authenticated_delete_receipt_images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipt-images');

-- 정산 화면 자체는 관리자 전용이라 영수증도 고객에게 노출되지 않지만, 이미지
-- 로딩 방식은 site-photos와 동일하게 맞춘다: 버킷을 public으로 두고 경로에
-- project id(추측 불가능한 UUID)를 포함시켜 URL을 아는 사람만 열람 가능한
-- 수준으로 관리한다. SDK로 목록 조회(list)도 가능하도록 읽기 정책을 명시한다.
create policy "public_read_receipt_images" on storage.objects
  for select to public
  using (bucket_id = 'receipt-images');

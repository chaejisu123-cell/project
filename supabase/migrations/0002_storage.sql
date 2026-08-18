-- ============================================================================
-- 오퍼하우스 현장관리 - 사진 저장용 Storage 버킷
-- 0001_init.sql 실행 후 이 파일도 SQL Editor에서 실행해야 사진 업로드가 동작한다.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', true)
on conflict (id) do nothing;

-- 로그인한 관리자만 업로드/수정/삭제 가능
create policy "authenticated_upload_site_photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-photos');

create policy "authenticated_update_site_photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-photos')
  with check (bucket_id = 'site-photos');

create policy "authenticated_delete_site_photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-photos');

-- 버킷이 public이라 이미지 자체(/object/public/...)는 정책과 무관하게 누구나 볼 수 있다.
-- SDK로 목록 조회(list)도 가능하도록 읽기 정책을 명시적으로 열어둔다.
-- (경로가 project id 기준으로 나뉘어 있고 project id 자체가 128비트 무작위값이라
-- site_token과 동일한 수준으로 추측이 불가능하므로 다른 현장 사진을 열람할 위험은 없다.)
create policy "public_read_site_photos" on storage.objects
  for select to public
  using (bucket_id = 'site-photos');

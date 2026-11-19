-- Jalankan SEKALI di Supabase → SQL Editor
-- Bucket PRIVAT: foto hanya bisa dibuka lewat link sementara yang dibuat akun pemiliknya.
insert into storage.buckets (id, name, public)
values ('moment-photos', 'moment-photos', false)
on conflict (id) do update set public = false;   -- kalau sudah terlanjur dibuat publik, dijadikan privat

drop policy if exists "moment-photos: upload folder sendiri" on storage.objects;
drop policy if exists "moment-photos: lihat folder sendiri"  on storage.objects;
drop policy if exists "moment-photos: hapus folder sendiri"  on storage.objects;

create policy "moment-photos: upload folder sendiri" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'moment-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "moment-photos: lihat folder sendiri" on storage.objects
  for select to authenticated
  using (bucket_id = 'moment-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "moment-photos: hapus folder sendiri" on storage.objects
  for delete to authenticated
  using (bucket_id = 'moment-photos' and (storage.foldername(name))[1] = auth.uid()::text);

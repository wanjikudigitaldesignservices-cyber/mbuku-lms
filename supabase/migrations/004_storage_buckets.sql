-- Create course_thumbnails storage bucket
insert into storage.buckets (id, name, public)
values ('course_thumbnails', 'course_thumbnails', false)
on conflict (id) do nothing;

-- RLS for course_thumbnails
create policy "Course thumbnails are viewable by everyone."
  on storage.objects for select
  using ( bucket_id = 'course_thumbnails' );

create policy "Instructors and Admins can upload thumbnails."
  on storage.objects for insert
  with check (
    bucket_id = 'course_thumbnails' and
    (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

create policy "Instructors and Admins can update thumbnails."
  on storage.objects for update
  using (
    bucket_id = 'course_thumbnails' and
    (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

create policy "Instructors and Admins can delete thumbnails."
  on storage.objects for delete
  using (
    bucket_id = 'course_thumbnails' and
    (select role from profiles where id = auth.uid()) in ('admin', 'instructor')
  );

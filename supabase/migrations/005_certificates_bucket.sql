-- Create certificates storage bucket
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- RLS for certificates
create policy "Certificates are viewable by everyone."
  on storage.objects for select
  using ( bucket_id = 'certificates' );

create policy "Service role can upload certificates."
  on storage.objects for insert
  with check (
    bucket_id = 'certificates' and
    (select role from profiles where id = auth.uid()) in ('admin') -- Or just allow service role via edge function which bypasses RLS
  );

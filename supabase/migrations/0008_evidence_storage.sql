-- Evidence photos (spec S1b). Private bucket; objects live under
-- <owner uid>/<event id>/<epoch ms>.jpg. The owner uploads into their own
-- folder; the owner and their active circle can read. Nobody else, including
-- other signed-in users, can list or fetch them.
--
-- The storage schema exists on Supabase, not in the test database, so this is
-- skipped where storage.buckets is missing.

do $$
begin
  if to_regclass('storage.buckets') is null then
    return;
  end if;

  insert into storage.buckets (id, name, public)
  values ('evidence', 'evidence', false)
  on conflict (id) do nothing;

  execute $p$
    create policy evidence_upload_own on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'evidence'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
  $p$;

  execute $p$
    create policy evidence_read_owner_or_circle on storage.objects
      for select to authenticated
      using (
        bucket_id = 'evidence'
        and (
          (storage.foldername(name))[1] = auth.uid()::text
          or public.is_connected_to(((storage.foldername(name))[1])::uuid)
        )
      )
  $p$;
end;
$$;

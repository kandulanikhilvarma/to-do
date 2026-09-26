-- Supabase grants EXECUTE on every new public function to anon and
-- authenticated, which exposes each one at /rest/v1/rpc/<name>. The security
-- definer functions below already refuse or return nothing without a signed-in
-- caller; this stops anyone who is not signed in from reaching them at all.
--
-- is_connected_to() keeps its grant: RLS policies call it for every role, and
-- without auth.uid() it answers false.

-- Trigger functions are not an API.
revoke execute on function claim_pending_invites() from public, anon, authenticated;
revoke execute on function enforce_connection_consent() from public, anon, authenticated;
revoke execute on function request_fanout() from public, anon, authenticated;

-- Signed-in only.
revoke execute on function invite_contact(text, text) from public, anon;
revoke execute on function revoke_contact(text) from public, anon;
revoke execute on function my_circle() from public, anon;
revoke execute on function my_invites() from public, anon;
revoke execute on function responding_for() from public, anon;
revoke execute on function issue_relay_secret() from public, anon;
revoke execute on function event_responders(uuid) from public, anon;
revoke execute on function fire_missed_check_ins() from public, anon;

grant execute on function
  invite_contact(text, text),
  revoke_contact(text),
  my_circle(),
  my_invites(),
  responding_for(),
  issue_relay_secret(),
  event_responders(uuid),
  fire_missed_check_ins()
to authenticated;

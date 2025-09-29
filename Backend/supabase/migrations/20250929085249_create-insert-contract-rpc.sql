create or replace function insert_contract(payload jsonb)
returns void
language plpgsql
as $$
declare
  v_matter_id uuid;
begin
  -- Start transaction implicitly (functions are atomic by default)

  -- Insert into matters
  insert into matters (contract_id, title, description, status, requester_id, assignee_id)
  values (
    payload->'contract'->>'id',
    payload->'contract'->>'title',
    payload->'contract'->>'description',
    payload->'contract'->>'status',
    payload->'contract'->>'requesterId',
    payload->'contract'->>'assigneeId'
  )
  returning id into v_matter_id;

  -- Insert into history
  -- Correct table name (existing DDL: matter_status_history)
  insert into matter_status_history (matter_id, status)
  values (v_matter_id, payload->>'status');

  -- Insert comments
  insert into matter_comments (matter_id, author_id, message, created_at)
  select
    v_matter_id,
    c->>'authorId',
    c->>'message',
    (c->>'createdAt')::timestamp
  from jsonb_array_elements(payload->'contract'->'comments') as c;

  -- Insert documents
  insert into matter_documents (matter_id, document_id, name, url)
  select
    v_matter_id,
    d->>'id',
    d->>'name',
    d->>'url'
  from jsonb_array_elements(payload->'contract'->'documents') as d;

  -- Insert webhook event
  insert into webhook_events (event_id, event_type, payload)
  values (payload->>'eventId', payload->>'event', payload)
    on conflict (event_id) do nothing;

end;
$$;
-- migration: 20240409130800_initial_schema.sql
-- description: creates the initial database schema for the flashcard application
-- includes users table reference, flashcards, sessions, generations, and error logs

-- enable uuid extension if not already enabled
create extension if not exists "uuid-ossp";

-- create tables in proper dependency order
create table if not exists generations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  model varchar not null,
  generated_count integer not null,
  accepted_unedited_count integer,
  accepted_edited_count integer,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  generation_duration integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists generation_error_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  error_message text not null,
  error_details text,
  model varchar,
  source_text_hash varchar not null,
  source_text_length integer not null check (source_text_length between 1000 and 10000),
  created_at timestamptz not null default now()
);

create table if not exists flashcards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front varchar(200) not null,
  back varchar(500) not null,
  source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
  is_deleted boolean not null default false,
  generation_id bigint references generations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- create indexes
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_source on flashcards(source);
create index idx_sessions_user_id on sessions(user_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generations_model on generations(model);
create index idx_generations_source_text_hash on generations(source_text_hash);
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);
create index idx_generation_error_logs_model on generation_error_logs(model);
create index idx_generation_error_logs_source_text_hash on generation_error_logs(source_text_hash);

-- create trigger functions for automatic updated_at updates
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create triggers
create trigger set_updated_at
before update on flashcards
for each row
execute function update_updated_at();

create trigger set_updated_at
before update on sessions
for each row
execute function update_updated_at();

create trigger set_updated_at
before update on generations
for each row
execute function update_updated_at();

-- enable row level security
alter table flashcards enable row level security;
alter table sessions enable row level security;
alter table generations enable row level security;
alter table generation_error_logs enable row level security;

-- create rls policies for flashcards
-- policy for anonymous users - no access
create policy "No access for anon users on flashcards"
  on flashcards
  for all
  to anon
  using (false);

-- policies for authenticated users
create policy "Users can view their own flashcards"
  on flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own flashcards"
  on flashcards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own flashcards"
  on flashcards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own flashcards"
  on flashcards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- create rls policies for sessions
-- policy for anonymous users - no access
create policy "No access for anon users on sessions"
  on sessions
  for all
  to anon
  using (false);

-- policies for authenticated users
create policy "Users can view their own sessions"
  on sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own sessions"
  on sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own sessions"
  on sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- create rls policies for generations
-- policy for anonymous users - no access
create policy "No access for anon users on generations"
  on generations
  for all
  to anon
  using (false);

-- policies for authenticated users
create policy "Users can view their own generations"
  on generations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own generations"
  on generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own generations"
  on generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- no delete policy for generations as these are non-deletable logs

-- create rls policies for generation_error_logs
-- policy for anonymous users - no access
create policy "No access for anon users on generation_error_logs"
  on generation_error_logs
  for all
  to anon
  using (false);

-- policies for authenticated users
create policy "Users can view their own generation_error_logs"
  on generation_error_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own generation_error_logs"
  on generation_error_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- no update or delete policies for generation_error_logs as these are non-deletable/modifiable logs 
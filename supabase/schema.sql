create table profiles (
  id uuid references auth.users primary key,
  objetivo text,
  nivel text default 'intermedio',
  restricciones text,
  updated_at timestamptz default now()
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  mes integer not null,
  anio integer not null,
  dias jsonb not null,
  es_manual boolean default false,
  created_at timestamptz default now()
);

create table diets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_id uuid references plans not null,
  contenido jsonb not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table plans enable row level security;
alter table diets enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own plans" on plans for all using (auth.uid() = user_id);
create policy "own diets" on diets for all using (auth.uid() = user_id);

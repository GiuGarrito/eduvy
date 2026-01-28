-- Tabela de Disponibilidade Semanal
create table availability_weekly (
  id uuid default gen_random_uuid() primary key,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0=Domingo, 1=Segunda, etc.
  start_time time not null,
  end_time time not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Datas Bloqueadas (para exceções)
create table blocked_dates (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(date)
);

-- Habilitar RLS (Row Level Security)
alter table availability_weekly enable row level security;
alter table blocked_dates enable row level security;

-- Políticas para Disponibilidade
create policy "Admins podem gerenciar disponibilidade"
  on availability_weekly
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Todos podem ver disponibilidade"
  on availability_weekly
  for select
  using (true);

-- Políticas para Datas Bloqueadas
create policy "Admins podem gerenciar datas bloqueadas"
  on blocked_dates
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Todos podem ver datas bloqueadas"
  on blocked_dates
  for select
  using (true);

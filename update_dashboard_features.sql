-- Create Reminders Table
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  is_done boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;

create policy "Admins can manage reminders"
  on public.reminders
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin' -- Assuming admin role for teacher
    )
  );

-- Create Doubts Table
create table if not exists public.doubts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  question text not null,
  answer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  answered_at timestamp with time zone
);

alter table public.doubts enable row level security;

-- Policy: Admin can do everything
create policy "Admins can manage doubts"
  on public.doubts
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Policy: Students can insert their own doubts
create policy "Students can insert own doubts"
  on public.doubts
  for insert
  with check (student_id = auth.uid());

-- Policy: Students can view their own doubts
create policy "Students can view own doubts"
  on public.doubts
  for select
  using (student_id = auth.uid());

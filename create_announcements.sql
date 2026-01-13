-- Create Announcements Table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.announcements enable row level security;

-- Policy: Everyone can read
create policy "Everyone can read announcements"
  on public.announcements for select
  using (true);

-- Policy: Only admins (teachers) can insert/update/delete
-- Assuming 'teacher' role or checking specific user metadata/email.
-- For now, relying on the service role or authenticated users if we want to restrict to just teachers.
-- Ideally we check profiles.role = 'teacher' via a join or claim.
-- Simplification: If the user has 'teacher' role in profiles metadata or table.
-- Let's use a subquery to check profile role if possible, or just allow authenticated for now and frontend controls it?
-- Better: Check against profiles table.

create policy "Teachers can manage announcements"
  on public.announcements for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

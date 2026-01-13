
-- Create lessons table
create table lessons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date text not null, -- Storing as YYYY-MM-DD text for simplicity with HTML date input
  time text not null, -- Storing as HH:MM
  student_id uuid references profiles(id) on delete cascade not null,
  notes text,
  status text default 'scheduled', -- scheduled, completed, cancelled
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table lessons enable row level security;

-- Policies

-- Admin can do everything
create policy "Admins can do everything on lessons"
  on lessons
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Students can view their own lessons
create policy "Students can view their own lessons"
  on lessons
  for select
  using (
    student_id = auth.uid()
  );

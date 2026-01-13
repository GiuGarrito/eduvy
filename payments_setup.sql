
-- Create payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  amount numeric not null,
  due_date date not null,
  paid_at timestamp with time zone,
  description text,
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table payments enable row level security;

-- Policies

-- Admin can do everything
create policy "Admins can do everything on payments"
  on payments
  for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Students can view their own payments
create policy "Students can view their own payments"
  on payments
  for select
  using (
    student_id = auth.uid()
  );

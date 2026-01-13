
-- Add financial columns to profiles
alter table profiles 
add column if not exists monthly_fee numeric,
add column if not exists due_day integer;

-- Update the handle_new_user function to include these fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, monthly_fee, due_day)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    (new.raw_user_meta_data->>'monthly_fee')::numeric,
    (new.raw_user_meta_data->>'due_day')::integer
  );
  return new;
end;
$$ language plpgsql security definer;

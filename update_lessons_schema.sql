
-- Add columns for Classroom Experience
alter table lessons 
add column if not exists meet_link text,
add column if not exists videos jsonb default '[]'::jsonb;

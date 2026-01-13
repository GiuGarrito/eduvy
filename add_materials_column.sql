-- Add materials/links column to lessons table
alter table lessons 
add column if not exists materials jsonb default '[]'::jsonb;

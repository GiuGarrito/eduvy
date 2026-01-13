
-- Add content column to lessons table for storing rich text (HTML)
alter table lessons 
add column if not exists content text;

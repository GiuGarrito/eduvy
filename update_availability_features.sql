-- Add start_time and end_time to blocked_dates for partial blocking
ALTER TABLE blocked_dates 
ADD COLUMN IF NOT EXISTS start_time time,
ADD COLUMN IF NOT EXISTS end_time time;

-- If start_time and end_time are NULL, it means the WHOLE day is blocked.
-- If they are set, only that interval is blocked.

COMMENT ON COLUMN blocked_dates.start_time IS 'Start time of the block. If null, whole day is blocked.';
COMMENT ON COLUMN blocked_dates.end_time IS 'End time of the block. If null, whole day is blocked.';

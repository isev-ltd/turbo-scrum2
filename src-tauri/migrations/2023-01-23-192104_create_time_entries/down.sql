-- This file should undo anything in `up.sql`
DROP TABLE time_entries;
ALTER TABLE sprints DROP COLUMN active_time_entry_id;

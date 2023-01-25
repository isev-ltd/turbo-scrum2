-- This file should undo anything in `up.sql`
DROP TABLE time_entries;
-- ALTER TABLE sprints DROP COLUMN active_time_entry_id;
ALTER TABLE sprints DROP COLUMN active_task_id;
ALTER TABLE sprints DROP COLUMN active_task_started_at;
ALTER TABLE sprints DROP COLUMN active_task_note;

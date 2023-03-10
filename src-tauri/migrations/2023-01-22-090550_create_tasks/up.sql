-- Your SQL goes here

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  sprint_id INTEGER NOT NULL,

  text text NOT NULL,
  `order` INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_in_minutes INTEGER NOT NULL DEFAULT 0,
  time_estimate_in_minutes INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (sprint_id)
  REFERENCES sprints (id)
     ON UPDATE CASCADE
     ON DELETE CASCADE
)

-- Your SQL goes here

CREATE TABLE sprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
)

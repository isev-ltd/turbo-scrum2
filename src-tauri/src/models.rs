// use self::schema::{sprints, tasks};
use serde::{Deserialize, Serialize};
use diesel::prelude::*;
use crate::schema::tasks;
use crate::schema::sprints;
use crate::schema::time_entries;


#[derive(Debug, Clone, Queryable, Serialize, Deserialize, AsChangeset)]
pub struct Sprint {
  pub id: i32,
  pub is_current: bool,
  pub active_task_id: Option<i32>,
  pub active_task_started_at: Option<String>,
  pub active_task_note: Option<String>,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(AsChangeset)]
#[diesel(table_name = sprints)]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateActiveTaskSprint {
  pub active_task_id: Option<i32>,
  pub active_task_started_at: Option<String>,
  pub active_task_note: Option<String>,
}


#[derive(Debug, Clone, Queryable, Serialize, Deserialize)]
pub struct Task {
  pub id: i32,
  pub sprint_id: i32,
  pub text: String,
  pub order: i32,
  pub is_completed: bool,
  pub is_blocked: bool,
  pub time_spent_in_minutes: i32,
  pub time_estimate_in_minutes: i32,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = tasks)]
pub struct NewTask<'a> {
  pub sprint_id: i32,
  pub text: &'a str,
  pub order: i32,
  pub is_completed: bool,
  pub is_blocked: bool,
  pub time_spent_in_minutes: i32,
  pub time_estimate_in_minutes: i32,
}

#[derive(Debug, Clone, Queryable, Serialize, Deserialize)]
pub struct TimeEntry {
  pub id: i32,
  pub task_id: i32,
  pub note: Option<String>,
  pub created_at: String,
  pub ended_at: String,
  pub updated_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = time_entries)]
pub struct NewTimeEntry {
  pub task_id: i32,
  pub note: Option<String>,
  pub created_at: String,
}

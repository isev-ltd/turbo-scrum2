// use self::schema::{sprints, tasks};
use serde::{Deserialize, Serialize};
use diesel::prelude::*;
use crate::schema::tasks;


#[derive(Debug, Clone, Queryable, Serialize)]
pub struct Sprint {
  pub id: i32,
  pub is_current: bool,
  pub active_time_entry_id: Option<i32>,
  pub created_at: String,
  pub updated_at: String,
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

#[derive(Debug, Clone, Queryable, Serialize)]
pub struct TimeEntry {
  pub id: i32,
  pub taskt_id: i32,
  pub note: String,
  pub created_at: String,
  pub ended_at: Option<String>,
  pub updated_at: String,
}

// impl Sprint {
//   fn is_current(name: &str, conn: &mut SqliteConnection) -> QueryResult<Self> {
//     Self::all()
//         .filter(is_current(true))
//         .first(conn)
//   }
// }

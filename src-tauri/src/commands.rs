use diesel::associations::HasTable;
use diesel::RunQueryDsl;
use crate::{establish_connection, get_time_entries_for_sprint};
use crate::models::{Sprint, Task, TimeEntry};
use diesel::prelude::*;
use dotenvy::dotenv;
use crate::schema::sprints::dsl::sprints;
use crate::schema::tasks::dsl::tasks;

#[tauri::command]
pub fn delete_time_entry(time_entry_id: i32) {
    use crate::schema::time_entries::dsl::time_entries as te;
    use crate::schema::time_entries::id;
    let connection = &mut establish_connection();
    println!("deleting time entry {}", time_entry_id);
    diesel::delete(te.filter(id.eq(&time_entry_id)))
        .execute(connection).expect("Could not delete entry");
}

#[tauri::command]
pub fn update_time_entry(time_entry: TimeEntry) {
    use crate::schema::time_entries::{id, created_at, ended_at};
    use crate::schema::time_entries::dsl::time_entries as te;
    println!("Updating task {}", time_entry.id);
    let connection = &mut establish_connection();
    diesel::update(te.filter(id.eq(&time_entry.id)))
        .set((
            created_at.eq(&time_entry.created_at),
            ended_at.eq(&time_entry.ended_at),
        ))
        .execute(connection).expect("Could not update entry");
}

#[tauri::command]
pub fn get_report(sprint_id: i32, started_at: String, ended_at: String) -> (Vec<TimeEntry>, Vec<Task>) {
    use crate::schema::tasks::{id as task_id};
    // use crate::schema::time_entries::{id, created_at, ended_at as ended_at_column};
    // use crate::schema::time_entries::dsl::time_entries as te;
    // use crate::schema::tasks::dsl::tasks;

    let connection = &mut establish_connection();

    let time_entries = get_time_entries_for_sprint(sprint_id);
    let task_ids: Vec<i32> = time_entries.iter().map(|t| t.task_id).collect();
    let task_entries = tasks.filter(task_id.eq_any(task_ids))
        .load(connection)
        .expect("Get time entries for sprint");
    //
    (time_entries, task_entries)
}

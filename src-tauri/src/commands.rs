use diesel::RunQueryDsl;
use crate::establish_connection;
use crate::models::TimeEntry;
use diesel::prelude::*;
use dotenvy::dotenv;

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

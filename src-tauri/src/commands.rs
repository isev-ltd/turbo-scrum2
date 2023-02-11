#[tauri::command]
pub fn delete_time_entry(time_entry_id: i32) {
    println!("deleting time entry {}", time_entry_id)
}

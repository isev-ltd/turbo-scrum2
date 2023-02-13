#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use std::path;
use std::path::is_separator;
use std::time::SystemTime;
use crate::schema::sprints::dsl::sprints;
use chrono::{NaiveDate, NaiveDateTime, Utc};
use diesel::dsl::{now, Update};
use tauri::utils::config::WindowConfig;
use tauri::{AboutMetadata, AppHandle, CustomMenuItem, Manager, Menu, MenuItem, Submenu};

pub mod models;
pub mod schema;
pub mod commands;

use self::models::*;


#[derive(Clone, serde::Serialize)]
struct Payload {
    url: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn js_get_latest_sprint() -> Sprint {
    let connection = &mut establish_connection();
    get_latest_sprint(connection)
}

#[tauri::command]
fn get_sprint(sprint_id: i32) -> Sprint {
    use self::schema::sprints::dsl::*;
    let connection = &mut establish_connection();
    sprints.filter(id.eq(sprint_id))
        .order(id.desc())
        .first(connection)
        .expect("Error loading sprint")
}

#[tauri::command]
fn get_task(task_id: i32) -> Task {
    use self::schema::tasks::dsl::*;
    let connection = &mut establish_connection();
    tasks.filter(id.eq(task_id))
        .order(id.desc())
        .first(connection)
        .expect("Error loading sprint")
}

#[tauri::command]
fn js_get_tasks(sprint_id: i32) -> Vec<Task> {
    let connection = &mut establish_connection();
    println!("Getting tasks for sprint id {}", sprint_id);
    get_sprint_tasks(connection, sprint_id)
}

#[tauri::command]
fn js_update_task(task: Task) {
    println!("Updating task {} - {}", task.id, task.is_completed);
    let connection = &mut establish_connection();
    update_task(connection, &task)
}

#[tauri::command]
fn js_update_sprint(sprint: Sprint) {
    println!("Updating sprint - {}", sprint.id);
    let connection = &mut establish_connection();
    update_sprint(connection, &sprint)
}

#[tauri::command]
fn js_delete_task(task: Task) {
    println!("Updating task {} - {}", task.id, task.is_completed);
    let connection = &mut establish_connection();
    delete_task(connection, &task)
}

#[tauri::command]
fn js_toggle_active_task(task: Option<Task>, sprint: Sprint) -> (models::Sprint, Option<models::TimeEntry>) {
    use self::schema::sprints::dsl::*;
    let connection = &mut establish_connection();
    println!("Hello sprint! {} {:?} {:?}", sprint.id, sprint.active_task_id, task);
    match task {
        Some(task) => {
            println!("Updating sprint!");
            diesel::update(sprints.filter(id.eq(&sprint.id)))
                .set((
                    active_task_id.eq(&task.id),
                    // active_task_started_at.eq(time),
                    active_task_started_at.eq(now),
                ))
                .execute(connection);
            (get_latest_sprint(connection), None)
        }
        None => {
            println!("Clearing sprint!");
            match (sprint.active_task_id, sprint.active_task_started_at) {
                (Some(t_id), Some(t_started_at)) => {
                    let t = create_time_entry(t_id, sprint.active_task_note, t_started_at);
                    diesel::update(sprints.filter(id.eq(&sprint.id)))
                        .set(UpdateActiveTaskSprint {
                            active_task_id: None,
                            active_task_started_at: None,
                            active_task_note: None,
                        })
                        .execute(connection);
                    let s = get_latest_sprint(connection);
                    (s, Some(t))
                }
                _ => {
                    (get_latest_sprint(connection), None)
                }
            }
        }
    }
}

#[tauri::command]
fn create_time_entry(active_task_id: i32, active_task_note: Option<String>, active_task_started_at: String) -> models::TimeEntry {
    use crate::schema::time_entries;
    use crate::schema::time_entries::dsl::time_entries as te;
    use crate::schema::time_entries::id;
    use crate::schema::time_entries::task_id;

    let connection = &mut establish_connection();
    let new_time_entry = NewTimeEntry {
        task_id: active_task_id,
        note: active_task_note,
        created_at: active_task_started_at,
    };
    diesel::insert_into(time_entries::table)
        .values(&new_time_entry)
        .execute(connection)
        .expect("Error saving new task");
    // let connection = &mut establish_connection();
    te.filter(task_id.eq(active_task_id))
        .order(id.desc())
        .first(connection)
        .expect("Could not find time entry")
}

#[tauri::command]
fn js_create_task(selected_sprint_id: i32) -> models::Task {
    use crate::schema::tasks;
    use self::schema::tasks::dsl::*;
    let connection = &mut establish_connection();
    let latest_task: Result<models::Task, diesel::result::Error> = tasks.filter(sprint_id.eq(selected_sprint_id))
        .order(order.desc())
        .first(connection);
    let order_value = match latest_task {
        Ok(task) => task.order + 1,
        _ => 0,
    };
//     let connection = &mut establish_connection();
    let new_task = NewTask { sprint_id: selected_sprint_id, text: "New Index", order: order_value, is_completed: false, is_blocked: false, time_spent_in_minutes: 0, time_estimate_in_minutes: 0 };
    diesel::insert_into(tasks::table)
        .values(&new_task)
        .execute(connection)
        .expect("Error saving new task");
//
    tasks.filter(sprint_id.eq(selected_sprint_id))
        .order(id.desc())
        .first(connection)
        .expect("Error loading sprint")
}

#[tauri::command]
fn get_time_entries_for_task(selected_task_id: i32) -> Vec<models::TimeEntry> {
    use crate::schema::time_entries;
    use crate::schema::time_entries::dsl::time_entries as te;
    use crate::schema::time_entries::id;
    use crate::schema::time_entries::task_id;

    let connection = &mut establish_connection();

    te.filter(task_id.eq(selected_task_id))
        .load(connection)
        .expect("Get time entries for sprint")
}

#[tauri::command]
fn get_time_entries_for_sprint(selected_sprint_id: i32) -> Vec<models::TimeEntry> {
    use crate::schema::time_entries;
    use crate::schema::time_entries::dsl::time_entries as te;
    use crate::schema::time_entries::id;
    use crate::schema::time_entries::task_id;

    let connection = &mut establish_connection();
    let tasks = get_sprint_tasks(connection, selected_sprint_id);

    let task_ids: Vec<i32> = tasks.iter().map(|t| t.id).collect();
    te.filter(task_id.eq_any(task_ids))
        .load(connection)
        .expect("Get time entries for sprint")
}

fn main() {
    let connection = &mut establish_connection();
    let sprint = get_latest_sprint(connection);
    let tasks = get_sprint_tasks(connection, sprint.id);
    println!("{}", sprint.created_at);
    for task in tasks {
        println!("{}", task.text)
    }
    let default_menu = Submenu::new(
        "Self",
        Menu::new()
            .add_native_item(MenuItem::About("Turbo Scrum".to_string(), Default::default())
            ),
    );
    let file_menu = Submenu::new("File", Menu::new()
        .add_native_item(MenuItem::Hide)
        .add_native_item(MenuItem::HideOthers)
        .add_native_item(MenuItem::CloseWindow)
        .add_native_item(MenuItem::Separator)
        .add_native_item(MenuItem::Quit),
    );
    let edit_menu = Submenu::new("Edit", Menu::new()
        .add_native_item(MenuItem::Copy)
        .add_native_item(MenuItem::Paste),
    );
    let view_menu = Submenu::new("View", Menu::new()
        .add_item(CustomMenuItem::new("GenerateReport", "Generate Report")),
    );

    let menu = Menu::new()
        .add_submenu(default_menu)
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu);
    tauri::Builder::default()
        .menu(menu)
        .invoke_handler(tauri::generate_handler![
            js_get_latest_sprint,
            js_get_tasks,
            js_update_task,
            js_create_task,
            js_delete_task,
            js_toggle_active_task,
            get_time_entries_for_sprint,
            get_time_entries_for_task,
            create_new_sprint,
            get_sprints,
            get_sprint,
            js_update_sprint,
            open_window,
            get_task,
            commands::delete_time_entry,
            commands::update_time_entry,
            commands::get_report,
        ])
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "GenerateReport" => {
                    event
                        .window()
                        .emit("window:open", Payload { url: "/report".into() })
                        .unwrap();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

pub fn get_latest_sprint(connection: &mut SqliteConnection) -> models::Sprint {
    use self::schema::sprints::dsl::*;
    sprints.filter(is_current.eq(true))
        .order(id.desc())
        .first(connection)
        .expect("Error loading sprint")
}

#[tauri::command]
fn get_sprints() -> Vec<models::Sprint> {
    use self::schema::sprints::dsl::*;
    let connection = &mut establish_connection();
    sprints
        .order(id.desc())
        .load(connection)
        .expect("Error loading sprint")
}

#[tauri::command]
fn create_new_sprint() -> models::Sprint {
    use self::schema::sprints::dsl::*;
    use crate::schema::sprints;
    let connection = &mut establish_connection();
    diesel::update(sprints)
        .set(UpdateCurrentSprint {
            is_current: false,
        })
        .execute(connection);

    let new_sprint = UpdateCurrentSprint { is_current: true };
    diesel::insert_into(sprints::table)
        .values(&new_sprint)
        .execute(connection)
        .expect("Error saving new task");

    get_latest_sprint(connection)
}

#[tauri::command]
async fn open_window(handle: tauri::AppHandle, url: String) {
    println!("Open window!");
    let docs_window = tauri::WindowBuilder::new(
        &handle,
        url.clone(), /* the unique window label */
        tauri::WindowUrl::App(url.into()),
    )
        .title("Turbo Scrum")
        .resizable(true)
        .focused(true)
        .center()
        // .position(20.0, 20.0)
        .inner_size(450.0, 600.0)
        .build().unwrap();
}

pub fn get_sprint_tasks(connection: &mut SqliteConnection, task_sprint_id: i32) -> Vec<models::Task> {
    use self::schema::tasks::dsl::*;
    tasks.filter(sprint_id.eq(task_sprint_id)).load(connection).expect("Rawr")
}

pub fn update_task(connection: &mut SqliteConnection, task: &Task) {
    use self::schema::tasks::dsl::*;
    diesel::update(tasks.filter(id.eq(&task.id)))
        .set((
            text.eq(&task.text),
            is_completed.eq(&task.is_completed),
            is_blocked.eq(&task.is_blocked),
            time_estimate_in_minutes.eq(&task.time_estimate_in_minutes),
        ))
        .execute(connection);
}

pub fn update_sprint(connection: &mut SqliteConnection, sprint: &Sprint) {
    use self::schema::sprints::dsl::*;
    use crate::schema::sprints::*;
    diesel::update(sprints.filter(id.eq(&sprint.id)))
        .set((
            active_task_note.eq(&sprint.active_task_note),
            active_task_started_at.eq(&sprint.active_task_started_at),
        ))
        .execute(connection);
}

pub fn delete_task(connection: &mut SqliteConnection, task: &Task) {
    use self::schema::tasks::dsl::*;
    diesel::delete(tasks.filter(id.eq(&task.id)))
        .execute(connection);
}

pub fn establish_connection() -> SqliteConnection {
    dotenv().ok();
    let _env = env::var("DATABASE_URL");

    match _env {
        Ok(_env) => {
            let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
            SqliteConnection::establish(&database_url)
                .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
        }
        Err(_) => {
            println!("no DATABASE_URL");

            let database_url = path::Path::new(&tauri::api::path::home_dir().unwrap())
                .join(".turboscrum")
                .join("data.db");

            let database_url = database_url.to_str().clone().unwrap();

            SqliteConnection::establish(&database_url)
                .unwrap_or_else(|_| panic!("Error connecting to {}", &database_url))
        }
    }
}

// #[derive(AsChangeset)]
// #[table_name = sprints]
// #[changeset_options(treat_none_as_null = "true")]
// struct UpdateSprint {
//     pub active_task_id: Option<i32>,
//     pub active_task_note: Option<String>,
//     pub active_task_started_at: Option<String>,
// }

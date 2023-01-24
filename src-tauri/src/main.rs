#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use std::path;

pub mod models;
pub mod schema;

use self::models::*;

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
fn js_get_tasks(sprint_id: i32) -> Vec<Task> {
    let connection = &mut establish_connection();
    get_sprint_tasks(connection, sprint_id)
}

#[tauri::command]
fn js_update_task(task: Task) {
    let connection = &mut establish_connection();
    update_task(connection, &task)
}

#[tauri::command]
fn js_create_task(selected_sprint_id: i32) -> models::Task {
    use crate::schema::tasks;
    use self::schema::tasks::dsl::*;
    let connection = &mut establish_connection();
//     let connection = &mut establish_connection();
    let new_task = NewTask { sprint_id: selected_sprint_id, text: "New Task", order: 0, is_completed: false, is_blocked: false, time_spent_in_minutes: 0, time_estimate_in_minutes: 0 };
    diesel::insert_into(tasks::table)
        .values(&new_task)
        .execute(connection)
        .expect("Error saving new task");
//
    tasks.filter(sprint_id.eq(selected_sprint_id))
        .order(sprint_id.desc())
        .first(connection)
        .expect("Error loading sprint")
}

fn main() {
    let connection = &mut establish_connection();
    let sprint = get_latest_sprint(connection);
    let tasks = get_sprint_tasks(connection, sprint.id);
    println!("{}", sprint.created_at);
    for task in tasks {
        println!("{}", task.text)
    }
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, js_get_latest_sprint, js_get_tasks, js_update_task, js_create_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}

pub fn get_latest_sprint(connection: &mut SqliteConnection) -> models::Sprint {
    use self::schema::sprints::dsl::*;
    sprints.filter(is_current.eq(true))
        .first(connection)
        .expect("Error loading sprint")
}

pub fn get_sprint_tasks(connection: &mut SqliteConnection, sprint_id: i32) -> Vec<models::Task>  {
    use self::schema::tasks::dsl::*;
    tasks.filter(sprint_id.eq(sprint_id)).load(connection).expect("Rawr")
}

pub fn update_task(connection: &mut SqliteConnection, task: &Task) {
    use self::schema::tasks::dsl::*;
    diesel::update(tasks.filter(id.eq(&task.id)))
        .set(text.eq(&task.text))
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

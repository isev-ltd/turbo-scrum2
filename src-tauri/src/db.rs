//
// use diesel::prelude::*;
//
// use dotenvy::dotenv;
// use std::env;
// use std::path;
//
// pub mod models;
// pub mod schema;
//
//
// use self::models::*;
//
// pub fn get_latest_sprint() {
//     use self::schema::sprints::dsl::*;
//     let connection = &mut establish_connection();
//     sprints.limit(5)
//         .load::<Sprint>(connection)
//         .expect("Error loading sprints")
// }
//
// pub fn establish_connection() -> SqliteConnection {
//     dotenv().ok();
//     let _env = env::var("DATABASE_URL");
//
//     match _env {
//         Ok(_env) => {
//             let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
//             SqliteConnection::establish(&database_url)
//                 .unwrap_or_else(|_| panic!("Error connecting to {}", database_url))
//         }
//         Err(_) => {
//             println!("no DATABASE_URL");
//
//             let database_url = path::Path::new(&tauri::api::path::home_dir().unwrap())
//                 .join(".turboscrum")
//                 .join("data.db");
//
//             let database_url = database_url.to_str().clone().unwrap();
//
//             SqliteConnection::establish(&database_url)
//                 .unwrap_or_else(|_| panic!("Error connecting to {}", &database_url))
//         }
//     }
// }

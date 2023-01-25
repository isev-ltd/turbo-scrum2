// @generated automatically by Diesel CLI.

diesel::table! {
    sprints (id) {
        id -> Integer,
        is_current -> Bool,
        active_task_id -> Nullable<Integer>,
        active_task_started_at -> Nullable<Timestamp>,
        active_task_note -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    tasks (id) {
        id -> Integer,
        sprint_id -> Integer,
        text -> Text,
        order -> Integer,
        is_completed -> Bool,
        is_blocked -> Bool,
        time_spent_in_minutes -> Integer,
        time_estimate_in_minutes -> Integer,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    time_entries (id) {
        id -> Integer,
        task_id -> Integer,
        note -> Nullable<Text>,
        created_at -> Timestamp,
        ended_at -> Nullable<Timestamp>,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(time_entries -> tasks (task_id));

diesel::allow_tables_to_appear_in_same_query!(
    sprints,
    tasks,
    time_entries,
);

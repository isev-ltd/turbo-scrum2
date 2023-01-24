export type Task = {
    id: number,
    sprint_id: number,
    text: string,
    order: number,
    is_completed: boolean,
    is_blocked: boolean,
    time_estimate_in_minutes: number,
    time_spent_in_minutes: number,
    created_at: string,
    updated_at: string
}

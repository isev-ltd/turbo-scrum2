import {invoke} from "@tauri-apps/api/tauri";
import {Sprint, Task, TimeEntry} from "../types";

export default function loadSprint(sprintId: number | null, {
    setSprint, setSprints, setTasks, setTimeEntries
}) {
    invoke("get_sprints")
        .then((sprints: Sprint[]) => {
            setSprints(sprints);
        });
    let promise = (sprintId) ? invoke("get_sprint", {sprintId: sprintId}) : invoke("js_get_latest_sprint");
    promise
        .then((s: Sprint) => {
            setSprint(s)
            console.log('fetched sprint', s)
            return s
        })
        .then((s: Sprint) => {
            return invoke("js_get_tasks", {sprintId: s.id}).then((tasks) => {
                return {s: s, tasks: tasks}
            })
        })
        .then(({s, tasks}: { s: Sprint, tasks: Task[] }) => {
            setTasks(tasks)
            return invoke("get_time_entries_for_sprint", {selectedSprintId: s.id})
                .then((timeEntries: TimeEntry[]) => {
                    console.log('time entries', timeEntries)
                    setTimeEntries(timeEntries)
                })
        })
}

import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import Image from "next/image";
import reactLogo from "../assets/react.svg";
import tauriLogo from "../assets/tauri.svg";
import nextLogo from "../assets/next.svg";
import Header from "../components/Header";
import TaskRow from "../components/TaskRow";
import {Sprint, Task, TimeEntry} from "../types";
import ActiveTask from "../components/ActiveTask";
import {useStore} from "../store";
import loadSprint from "../lib/loadSprint";
import {Transition} from "@headlessui/react";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    // const [sprint, setSprint] = useState({id: 0, is_current: true, created_at: "", updated_at: ""});
    // const [tasks, setTasks] = useState([]);
    // const [editingTaskId, setEditingTaskId] = useState(0);
    // const [activeTask, setActiveTask] = useState(null);

    const [setSprint, setTasks, tasks, setTimeEntries, searchQuery, setSprints] = useStore((state) => [state.setSprint, state.setTasks, state.tasks, state.setTimeEntries, state.searchQuery, state.setSprints])

    useEffect(() => {
        loadSprint(null, {
            setSprints,
            setSprint,
            setTasks,
            setTimeEntries
        })
        // invoke("get_sprints")
        //     .then((sprints: Sprint[]) => {
        //         setSprints(sprints);
        //     });
        // invoke("js_get_latest_sprint")
        //     .then((s: Sprint) => {
        //         setSprint(s)
        //         console.log('fetched sprint', s)
        //         return s
        //     })
        //     .then((s: Sprint) => {
        //         return invoke("js_get_tasks", {sprintId: s.id}).then((tasks) => {
        //             return {s: s, tasks: tasks}
        //         })
        //     })
        //     .then(({s, tasks}: { s: Sprint, tasks: Task[] }) => {
        //         setTasks(tasks)
        //         return invoke("get_time_entries_for_sprint", {selectedSprintId: s.id})
        //             .then((timeEntries: TimeEntry[]) => {
        //                 console.log('time entries', timeEntries)
        //                 setTimeEntries(timeEntries)
        //             })
        //     })
    }, [])

    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //     setGreetMsg(await invoke("greet", {name}));
    // }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header /*addNewTask={() => addNewTask(sprint, setTasks, tasks, setEditingTaskId)}*//>
            <div className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto">
                <Transition
                    appear={true}
                    show={true}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-y-95 rounded overflow-hidden scale-y-0"
                    enterTo="transform opacity-100 scale-y-100 "
                    leave="transition ease-in "
                    leaveFrom="transform opacity-100 scale-y-100 duration-0 "
                    leaveTo="transform opacity-0 scale-y-0 rounded overflow-hidden duration-0 "
                >
                    {tasks.filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map((task: Task, index: number) => {
                        return (

                            <TaskRow key={task.id}
                                     task={task}
                                     index={index}
                            />
                        )
                    })}
                </Transition>
            </div>
            <ActiveTask
                // sprint={sprint}
                // setSprint={setSprint}
                // task={activeTask}
                // toggleActiveTask={toggleActiveTask(sprint, activeTask, activeTask, setActiveTask, setSprint)}
            />
        </div>

    )
}

// function toggleActiveTask(sprint, task, activeTask, setActiveTask, setSprint) {
//     return () => {
//         if(task.id == activeTask?.id) {
//             console.log('clicking active task')
//             setActiveTask(null)
//         } else {
//             console.log('clicking unactive task')
//             setActiveTask(task)
//         }
//         invoke("js_toggle_active_task", {task: (task.id == activeTask?.id ? null : task), sprint}).then((sprint : Sprint) => {
//             console.log({sprint})
//             setSprint(sprint)
//         })
//     }
// }
// async function updateTaskText(text, task, setTasks, tasks) {
//     await updateTask(task, 'text', text, setTasks, tasks)
// }

// async function updateTask(task, key, value, setTasks, tasks) {
//     setTasks(tasks.map((t) => {
//         if (t.id == task.id) {
//             t[key] = value
//             return t
//         } else {
//             return t
//         }
//     }));
//     console.log('updating', task, key, value)
//     await invoke("js_update_task", {task})
//
// }

// function deleteTask(task, setTasks, tasks) {
//     setTasks(tasks.filter((t) => {
//         return t.id != task.id
//     }));
//     invoke("js_delete_task", {task}).then(() => {
//         // TODO: notify deleted
//     }).catch((e) => {
//         // TODO: Could not be deleted, re-add and notify
//     })
// }

// function addNewTask(sprint, setTasks, tasks, setEditingTaskId) {
//     invoke("js_create_task", {selectedSprintId: sprint.id}).then((task: Task) => {
//         setTasks([...tasks, task])
//         setEditingTaskId(task.id)
//     })
// }

export default App;

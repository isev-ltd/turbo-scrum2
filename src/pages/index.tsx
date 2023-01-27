import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import Image from "next/image";
import reactLogo from "../assets/react.svg";
import tauriLogo from "../assets/tauri.svg";
import nextLogo from "../assets/next.svg";
import Header from "../components/Header";
import TaskRow from "../components/TaskRow";
import {Task} from "../types";
import ActiveTask from "../components/ActiveTask";

type Sprint = {
    id: number,
    is_current: boolean,
    created_at: string,
    updated_at: string
}

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    const [sprint, setSprint] = useState({id: 0, is_current: true, created_at: "", updated_at: ""});
    const [tasks, setTasks] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(0);

    useEffect(() => {
        invoke("js_get_latest_sprint")
            .then((s: Sprint) => {
                setSprint(s)
                return s
            })
            .then((s: Sprint) => {
                return invoke("js_get_tasks", {sprintId: s.id})

            }).then((tasks: Task[]) => {
            setTasks(tasks)
        })
        console.log('sprint', sprint)
    }, [])

    async function greet() {
        // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
        setGreetMsg(await invoke("greet", {name}));
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header addNewTask={() => addNewTask(sprint, setTasks, tasks, setEditingTaskId)}/>
            <div className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto">
                {tasks.map((task: Task, index: number) => {
                    return (<TaskRow key={task.id} task={task}
                                     editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId}
                                     updateTaskName={(text) => updateTaskText(text, task, setTasks, tasks)}
                                     updateTask={(key, value) => updateTask(task, key, value, setTasks, tasks)}
                                     deleteTask={(task) => deleteTask(task, setTasks, tasks)}

                    />)
                })}
            </div>
            <ActiveTask sprint={sprint} task={tasks[0]} />
        </div>

    )
}

async function updateTaskText(text, task, setTasks, tasks) {
    await updateTask(task, 'text', text, setTasks, tasks)
}

async function updateTask(task, key, value, setTasks, tasks) {
    setTasks(tasks.map((t) => {
        if (t.id == task.id) {
            t[key] = value
            return t
        } else {
            return t
        }
    }));
    console.log('updating', task, key, value)
    await invoke("js_update_task", {task})

}

function deleteTask(task, setTasks, tasks) {
    setTasks(tasks.filter((t) => {
        return t.id != task.id
    }));
    invoke("js_delete_task", {task}).then(() => {
        // TODO: notify deleted
    }).catch((e) => {
        // TODO: Could not be deleted, re-add and notify
    })
}

function addNewTask(sprint, setTasks, tasks, setEditingTaskId) {
    invoke("js_create_task", {selectedSprintId: sprint.id}).then((task: Task) => {
        setTasks([...tasks, task])
        setEditingTaskId(task.id)
    })
}

export default App;

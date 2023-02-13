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
import {listen} from "@tauri-apps/api/event";
import {WebviewWindow} from "@tauri-apps/api/window";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    // const [sprint, setSprint] = useState({id: 0, is_current: true, created_at: "", updated_at: ""});
    // const [tasks, setTasks] = useState([]);
    // const [editingTaskId, setEditingTaskId] = useState(0);
    // const [activeTask, setActiveTask] = useState(null);

    const [setSprint, setTasks, tasks, setTimeEntries, searchQuery, setSprints, setActiveTask, timeEntries] = useStore((state) => [state.setSprint, state.setTasks, state.tasks, state.setTimeEntries, state.searchQuery, state.setSprints, state.setActiveTask, state.timeEntries])

    useEffect(() => {
        loadSprint(null, {
            setSprints,
            setSprint,
            setTasks,
            setTimeEntries,
            setActiveTask
        })
        const unlistenTimeEntriesDelete = listen('time-entries:remove', (event) => {
            // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
            // event.payload is the payload object
            console.log('event', event.event, event.payload)
            setTimeEntries(timeEntries.filter((te) => te.id != event.payload))
        })
        const unlistenTimeEntriesUpdate = listen('time-entries:update', (event: {payload: TimeEntry}) => {
            // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
            // event.payload is the payload object
            setTimeEntries(timeEntries.map((te) => {
                if (te.id == event.payload.id) {
                    return event.payload
                } else {
                    return te
                }
            }))
        })

        const unlistenWindow = listen('window:open', (event) => {
            // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
            // event.payload is the payload object
            console.log('open window!')
            invoke("open_window", {url: `/report`}).then(() => {})
        });
    }, [])

    // async function greet() {
    //     // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    //     setGreetMsg(await invoke("greet", {name}));
    // }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header /*addNewTask={() => addNewTask(sprint, setTasks, tasks, setEditingTaskId)}*//>
            <div className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto">
                {tasks.filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map((task: Task, index: number) => {
                    return (

                        <TaskRow key={task.id}
                                 task={task}
                                 index={index}
                        />
                    )
                })}
            </div>
            <ActiveTask/>
        </div>

    )
}

export default App;

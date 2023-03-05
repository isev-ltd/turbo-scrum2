import {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import Image from "next/image";
import reactLogo from "../assets/react.svg";
import tauriLogo from "../assets/tauri.svg";
import nextLogo from "../assets/next.svg";
import Header from "../components/Header";
import {Sprint, Task, TimeEntry} from "../types";
import ActiveTask from "../components/ActiveTask";
import {useStore} from "../store";
import loadSprint from "../lib/loadSprint";
import {Transition} from "@headlessui/react";
import {listen} from "@tauri-apps/api/event";
import {WebviewWindow} from "@tauri-apps/api/window";
import dynamic from "next/dynamic";
import {Simulate} from "react-dom/test-utils";
import dragOver = Simulate.dragOver;

const TaskRow = dynamic(() => import("../components/TaskRow"), {ssr: false});
// function onDrag(obj) {
//     console.log('on drag', obj)
// }

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");
    // const [sprint, setSprint] = useState({id: 0, is_current: true, created_at: "", updated_at: ""});
    // const [tasks, setTasks] = useState([]);
    // const [editingTaskId, setEditingTaskId] = useState(0);
    // const [activeTask, setActiveTask] = useState(null);

    const [setSprint, setTasks, tasks, setTimeEntries, searchQuery, setSprints, setActiveTask, timeEntries, sprint] = useStore((state) => [state.setSprint, state.setTasks, state.tasks, state.setTimeEntries, state.searchQuery, state.setSprints, state.setActiveTask, state.timeEntries, state.sprint])
    const dragItem = useRef();
    const dragOverItem = useRef();
    const listRef = useRef(null);

    const dragStart = (e, position) => {
        dragItem.current = position;
        console.log('drag start', e.target.innerHTML, position);
        e.target.classList.add('task-dragging')
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
        console.log('drag enter', e.target.innerHTML, position);
        e.target.classList.add('task-drag-over')
        // e.target.style = "border: solid 1px red;"
    };
    const dragLeave = (e, position) => {
        e.target.classList.remove('task-drag-over')
    }
    const drop = (e) => {
        console.log('todo')
        let copyTasks: Task[] = [...tasks];
        // @ts-ignore
        let draggedTask = copyTasks[dragItem.current];
        copyTasks.splice(dragItem.current, 1);
        copyTasks.splice(dragOverItem.current, 0, draggedTask);
        copyTasks = copyTasks.map((task: Task, i) => { return {...task, order: i}})
        console.log('tasks', copyTasks.map((t) => t.order))
        dragItem.current = null;
        console.log('drag over item', dragOverItem.current, dragOverItem)
        // dragOverItem.current
        //     .el.classList.remove('task-drag-over')
        dragOverItem.current = null;
        setTasks(copyTasks);
        e.target.classList.remove('task-dragging')
        e.target.classList.remove('task-drag-over')
        console.log('list ref', listRef.current.children)
        for(const child of listRef.current.children) {
            child.classList.remove('task-drag-over')
        }
        // console.log('list ref', listRef.current.children.forEach((c) => c.removeClass('task-drag-over')));
        copyTasks.forEach((task) => {
            invoke('js_update_task', {task})
        })
    };

    useEffect(() => {
        loadSprint(null, {
            setSprints,
            setSprint,
            setTasks,
            setTimeEntries,
            setActiveTask
        })
        // let [draggingIndex, setDraggingIndex] = useState(null);
        const unlistenTimeEntriesDelete = listen('time-entries:remove', (event) => {
            // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
            // event.payload is the payload object
            console.log('event', event.event, event.payload)
            setTimeEntries(timeEntries.filter((te) => te.id != event.payload))
        })
        const unlistenTimeEntriesUpdate = listen('time-entries:update', (event: { payload: TimeEntry }) => {
            invoke("get_time_entries_for_sprint", {selectedSprintId: sprint.id})
                .then((timeEntries: TimeEntry[]) => {
                    console.log('time entries', timeEntries)
                    setTimeEntries(timeEntries)
                })
            // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
            // event.payload is the payload object
            // console.log('time entry count', timeEntries.length)
            // setTimeEntries(timeEntries.map((te) => {
            //     console.log('time-entries:update')
            //     console.log('time entries', timeEntries)
            //     console.log('te', te)
            //     console.log('payload', event.payload)
            //     if (te.id == event.payload.id) {
            //         return event.payload
            //     } else {
            //         return te
            //     }
            // }))
        })
    }, [])



    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header /*addNewTask={() => addNewTask(sprint, setTasks, tasks, setEditingTaskId)}*//>
            <div ref={listRef} className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto pb-20" >
                {tasks.sort((a: Task, b: Task) => a.order < b.order ? -1 : 1).filter((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase())).map((task: Task, index: number) => {
                    return (

                        <TaskRow key={task.id}
                                 task={task}
                                 index={index}
                                 dragStart={dragStart}
                                 dragEnter={dragEnter}
                                 dragLeave={dragLeave}
                                 drop={drop}
                                 // items={tasks}
                                 // draggingIndex={0}
                                 // sortId={task.id}
                                 // outline="list"
                        />
                    )
                })}
            </div>
            <ActiveTask/>
        </div>

    )
}

export default App;

import {Task, TimeEntry} from "../types";
import {CheckIcon, EllipsisVerticalIcon, LockClosedIcon} from "@heroicons/react/20/solid";
import {useState} from "react";
import DropdownMenu from "./DropdownMenu";
import {Menu} from '@headlessui/react'
import PlayPauseButton from "./PlayPauseButton";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {intervalToDuration, parseISO} from "date-fns";

import {Transition} from "@headlessui/react";
import {WebviewWindow} from "@tauri-apps/api/window";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function TaskRow({task, index, dragStart, dragEnter, drop, dragLeave}) {
    // const [editMode, setEditMode] = useState(false);
    const [
        editingTask,
        setEditingTask,
        clearEditingTask,
        updateTask,
        toggleActiveTask,
        activeTask,
        deleteTask
    ]
        = useStore((state) => [
        state.editingTask,
        state.setEditingTask,
        state.clearEditingTask,
        state.updateTask,
        state.toggleActiveTask,
        state.activeTask,
        state.deleteTask
    ])
    const [text, setText] = useState(task.text);

    return (
        <div data-id={task.id}
             className="relative rounded bg-slate-100 shadow p-4 text-slate-800 flex gap-2 items-center"
             draggable
             onDragStart={(e) => dragStart(e, index)}
             onDragEnter={(e) => dragEnter(e, index)}
             onDragEnd={drop}
             onDragLeave={(e) => dragLeave(e, index)}
        >
            {blockedOrCompleted(task)}
            {editingTask?.id == task.id && editingTask?.key == "text" ? <div
                className="flex-grow flex rounded-md overflow-hidden shadow-sm border-slate-300 ">
                <TaskNameInput task={task}
                               text={text}
                               setText={setText}
                               cancelUpdateTaskName={() => {
                                   setText(task.text);
                                   // setEditingTaskId(0)
                                   clearEditingTask()
                               }}
                               updateTask={updateTask}/>
                <button onClick={() => {
                    // updateTask()
                    // updateTaskName(text);
                    // setEditingTaskId(0)
                    clearEditingTask()
                }} type="button"
                        className="z-10 bg-indigo-600 text-indigo-100 hover:text-indigo-50 hover:bg-indigo-500 transition ease-in-out duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="w-5 h-5 m-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </button>
            </div> : <button type="button" className="flex-grow text-left truncate"
                             onClick={() => setEditingTask(task.id, "text")}>{task.text}</button>}
            <Time task={task} updateTask={updateTask}/>
            <PlayPauseButton task={task}/>
            <DropdownMenu renderButton={null} direction={index >= 4 ? "up" : "down"}>
                <Menu.Item>
                    {({active}) => (
                        <button
                            onClick={() => {
                                updateTask({...task, is_completed: !task.is_completed})
                                invoke("js_update_task", {
                                    task: {
                                        ...task,
                                        is_completed: !task.is_completed
                                    }
                                }).then(() => {
                                })
                            }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm w-full text-left'
                            )}
                        >
                            {task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({active}) => (
                        <button
                            onClick={() => {
                                updateTask({...task, is_blocked: !task.is_blocked})
                                invoke("js_update_task", {task: {...task, is_blocked: !task.is_blocked}})
                                    .then(() => {
                                    })
                            }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm w-full text-left'
                            )}
                        >
                            {task.is_blocked ? 'Mark as unblocked' : 'Mark as blocked'}
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({active}) => (
                        <button
                            onClick={() => {
                                deleteTask(task)
                                invoke("js_delete_task", {task}).then(() => {
                                    // TODO: notify deleted
                                }).catch((e) => {
                                    // TODO: Could not be deleted, re-add and notify
                                })
                            }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm w-full text-left'
                            )}
                        >
                            Delete task
                        </button>
                    )}
                </Menu.Item>
                <Menu.Item>
                    {({active}) => (
                        <button
                            onClick={() => {
                                    const webview = new WebviewWindow(`Task${task.id}`, {
                                        url: `/task?id=${task.id}`,
                                        center: true,
                                        height: 600,
                                        width: 450,
                                    });
                                // invoke("open_window", {url: `/tasks/${task.id}`}).then(() => {})
                                // try {
                                //     const webview = new WebviewWindow(`Task${task.id}`, {
                                //         url: `/tasks/${task.id}`,
                                //         center: true,
                                //         height: 600,
                                //         width: 450,
                                //     });
                                //
                                // } catch {
                                //     console.log("Couldnt use window API")
                                // }
                            }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm w-full text-left'
                            )}
                        >
                            Time entries
                        </button>
                    )}
                </Menu.Item>
            </DropdownMenu>
        </div>
    );
}


function blockedOrCompleted(task) {
    return (<  >
            <Transition
                appear={true}
                show={task.is_completed}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95 rounded overflow-hidden scale-0"
                enterTo="transform opacity-100 scale-100 "
                leave="transition ease-in "
                leaveFrom="transform opacity-100 scale-100 duration-0 "
                leaveTo="transform opacity-0 scale-0 rounded overflow-hidden duration-0 "
            >
                <CheckIcon className="w-6 bg-emerald-600 rounded-full fill-white p-1"/>
            </Transition>
            <Transition
                appear={true}
                show={!task.is_completed && task.is_blocked}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95 rounded overflow-hidden scale-0"
                enterTo="transform opacity-100 scale-100 "
                leave="transition ease-in "
                leaveFrom="transform opacity-100 scale-100 duration-0 "
                leaveTo="transform opacity-0 scale-0 rounded overflow-hidden duration-0 "
            >
                <LockClosedIcon className="w-6 bg-rose-600  rounded-full fill-white p-1"/>
            </Transition>
        </>
    )
}

function totalTimeForEntries(entries: TimeEntry[]) {
    let times = entries.map((e) => {
        let t = intervalToDuration({
            start: parseISO(e.created_at),
            end: parseISO(e.ended_at)
        })
        return t.minutes + (t.hours * 60) + (t.days * 24 * 60)
    })
    console.log({times})
    if (times.length === 0) {
        return 0;
    }

    let currentValue = 0
    return times.reduce((x, currentValue) => x + currentValue)
}

function Time({task, updateTask}) {
    const editingTask = useStore((state) => state.editingTask)
    const setEditingTask = useStore((state) => state.setEditingTask)
    const clearEditingTask = useStore((state) => state.clearEditingTask)
    const getTimeEntriesForTaskId = useStore((state) => state.getTimeEntriesForTaskId)
    const [estimatedTime, setEstimatedTime] = useState(task.time_estimate_in_minutes)
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            let t = Math.ceil(parseFloat(event.target.value) * 60)
            updateTask({...task, time_estimate_in_minutes: t})
            invoke("js_update_task", {task: {...task, time_estimate_in_minutes: t}}).then(() => {
            })
            // setEditingTaskId(0)
            clearEditingTask()
        } else {
            console.log(event)
        }
    }
    const handleFocus = (event) => event.target.select();

    if (task.id == editingTask?.id && editingTask?.key == "time") {
        return (<div className="bg-slate-200 rounded px-2 py-1 text-sm border border-slate-200 shadow-sm">
            <input type="number" min="0" step="0.5"
                   autoFocus onFocus={handleFocus}
                   className="flex rounded-md overflow-hidden shadow-sm border-slate-300 w-16 " value={estimatedTime}
                   onKeyDown={handleKeyDown} onChange={(e) => {
                setEstimatedTime(e.target.value)
            }}/>
        </div>);
    } else {
        let timeInMinutes = totalTimeForEntries(getTimeEntriesForTaskId(task.id));
        let timeInHours = ((Math.round(((timeInMinutes) / 60) * 100)) / 100).toFixed(2)
        return (<button onClick={() => setEditingTask(task.id, "time")}
                        className="bg-slate-200 rounded px-2 py-1 text-sm border border-slate-200 shadow-sm"
                        title={`${timeInMinutes} minutes`}>
            {timeInHours.replace('.00', '')}/{parseFloat(task.time_estimate_in_minutes) / 60.0}
            <strong
                className="ml-2">{task.time_estimate_in_minutes > 0 ? Math.ceil((timeInMinutes / task.time_estimate_in_minutes) * 100) : 0}%</strong>
        </button>);

    }

}

function TaskNameInput({task, text, setText, cancelUpdateTaskName, updateTask}) {
    const editingTask = useStore((state) => state.editingTask)
    const setEditingTask = useStore((state) => state.setEditingTask)
    const clearEditingTask = useStore((state) => state.clearEditingTask)
    const handleFocus = (event) => event.target.select();

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            updateTask({...task, text: event.target.value});
            invoke("js_update_task", {task: {...task, text: event.target.value}}).then(() => {
            })
            // setEditingTaskId(0)
            clearEditingTask()
        } else {
            console.log(event)
        }
    }
    return (
        <div className="relative flex-grow">
            <input autoFocus onFocus={handleFocus} onKeyDown={handleKeyDown} type="text" name="account-number"
                   id={`task-name-edit-${task.id}`}
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   className="z-0 block w-full pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1 px-2"
                   placeholder="000-00-0000"/>
            <button type="button" onClick={cancelUpdateTaskName}
                    className="z-10 absolute inset-y-0 right-0 flex items-center pr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     className="h-5 w-5 text-slate-300"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
        </div>
    );
}


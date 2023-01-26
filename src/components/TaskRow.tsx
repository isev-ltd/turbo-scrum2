import {Task} from "../types";
import {CheckIcon, EllipsisVerticalIcon, LockClosedIcon} from "@heroicons/react/20/solid";
import {useState} from "react";
import DropdownMenu from "./DropdownMenu";
import {Menu} from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function TaskRow({task, updateTaskName, editingTaskId, setEditingTaskId, updateTask, deleteTask}) {
    // const [editMode, setEditMode] = useState(false);
    const [text, setText] = useState(task.text);
    console.log('editing task id', editingTaskId)
    return (<div data-id={task.id}
                 className="relative rounded bg-slate-100 shadow p-4 text-slate-800 flex gap-2 items-center">
        {blockedOrCompleted(task)}
        {editingTaskId == task.id ? <div
            className="flex-grow flex rounded-md overflow-hidden shadow-sm border-slate-300 ">{taskNameInput(task, text, setText, () => {
            setText(task.text);
            setEditingTaskId(0)
        }, updateTask, setEditingTaskId)}
            <button onClick={() => {
                updateTaskName(text);
                setEditingTaskId(0)
            }} type="button"
                    className="z-10 bg-indigo-600 text-indigo-100 hover:text-indigo-50 hover:bg-indigo-500 transition ease-in-out duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-5 h-5 m-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
        </div> : <button type="button" className="flex-grow text-left"
                         onClick={() => setEditingTaskId(task.id)}>{task.text}</button>}
        {time(task, editingTaskId, updateTask, setEditingTaskId)}
        <DropdownMenu>
            <Menu.Item>
                {({active}) => (
                    <button
                        onClick={() => {
                            updateTask('is_completed', !task.is_completed)
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
                            updateTask('is_blocked', !task.is_blocked)
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
        </DropdownMenu>
    </div>);
}

function blockedOrCompleted(task) {
    if (task.is_completed) {
        return <CheckIcon className="w-6 bg-emerald-600 rounded-full fill-white p-1"/>
    }
    if (task.is_blocked) {
        return <LockClosedIcon className="w-6 bg-rose-600  rounded-full fill-white p-1"/>
    }
    return <></>;
}

function time(task, editingTaskId, updateTask, setEditingTaskId) {
    const [estimatedTime, setEstimatedTime] = useState(task.time_estimate_in_minutes)
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            updateTask("time_estimate_in_minutes", Math.ceil(parseFloat(event.target.value) * 60));
            setEditingTaskId(0)
        } else {
            console.log(event)
        }
    }
    if (task.id == editingTaskId) {
        return (<div className="bg-slate-200 rounded px-2 py-1 text-sm border border-slate-200 shadow-sm">
            <input type="number" min="0" step="0.5" className="flex rounded-md overflow-hidden shadow-sm border-slate-300 w-16 " value={estimatedTime} onKeyDown={handleKeyDown} onChange={(e) => {
                setEstimatedTime(e.target.value)
            }}/>
        </div>);
    } else {
        return (<div onClick={() => setEditingTaskId(task.id)} className="bg-slate-200 rounded px-2 py-1 text-sm border border-slate-200 shadow-sm">
            {parseFloat(task.time_spent_in_minutes) / 60.0}/{parseFloat(task.time_estimate_in_minutes) / 60.0}
            <strong
                className="ml-2">{task.time_estimate_in_minutes > 0 ? Math.ceil((task.time_spent_in_minutes / task.time_estimate_in_minutes) * 100) : 0}%</strong>
        </div>);

    }

}

function taskNameInput(task, text, setText, cancelUpdateTaskName, updateTask, setEditingTaskId) {
    const handleFocus = (event) => event.target.select();

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            updateTask("text", event.target.value);
            setEditingTaskId(0)
        } else {
            console.log(event)
        }
    }
    return (
        <div className="relative flex-grow">
            <input autoFocus onFocus={handleFocus} onKeyDown={handleKeyDown} type="text" name="account-number" id={`task-name-edit-${task.id}`}
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

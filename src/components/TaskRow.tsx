import {Task} from "../types";
import {CheckIcon, EllipsisVerticalIcon, LockClosedIcon} from "@heroicons/react/20/solid";
import {useState} from "react";

export default function TaskRow({task, updateTaskName}) {
    const [editMode, setEditMode] = useState(false);
    const [text, setText] = useState(task.text);
    return (<div className="relative rounded bg-slate-100 shadow p-4 text-slate-800 flex gap-2 items-center">
        {blockedOrCompleted(task)}
        {editMode ? <div className="flex-grow flex rounded-md overflow-hidden shadow-sm border-slate-300 ">{taskNameInput(task, text, setText, () => { setText(task.text); setEditMode(false)})}
            <button onClick={() => { updateTaskName(text); setEditMode(false) }} type="button" className="z-10 bg-indigo-600 text-indigo-100 hover:text-indigo-50 hover:bg-indigo-500 transition ease-in-out duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-5 h-5 m-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
        </div> : <button type="button" className="flex-grow text-left" onClick={() => setEditMode(true)}>{task.text}</button>}
        {time(task)}
        <button type="button"><EllipsisVerticalIcon className="w-5"/></button>
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

function time(task) {
    return (<div className="bg-slate-200 rounded px-2 py-1 text-sm border border-slate-200 shadow-sm">
        {parseFloat(task.time_spent_in_minutes) / 60.0}/{parseFloat(task.time_estimate_in_minutes) / 60.0}
        <strong
            className="ml-2">{task.time_estimate_in_minutes > 0 ? Math.ceil((task.time_spent_in_minutes / task.time_estimate_in_minutes) * 100) : 0}%</strong>
    </div>);

}

function taskNameInput(task, text, setText, cancelUpdateTaskName) {
    return (
        <div className="relative flex-grow">
            <input type="text" name="account-number" id={`task-name-edit-${task.id}`}
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                   className="z-0 block w-full pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-1 px-2"
                   placeholder="000-00-0000"/>
            <button type="button" onClick={cancelUpdateTaskName} className="z-10 absolute inset-y-0 right-0 flex items-center pr-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     className="h-5 w-5 text-slate-300"
                     stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
        </div>
    );
}

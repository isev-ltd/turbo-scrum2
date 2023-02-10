import {Menu, Transition} from "@headlessui/react";
import {PauseCircleIcon, XMarkIcon} from "@heroicons/react/20/solid";
import DropdownMenu from "./DropdownMenu";
import {formatDistance, parseISO} from "date-fns";
import {Fragment, useEffect, useState} from "react";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Sprint, TimeEntry} from "../types";

export default function ActiveTask() {
    const [sprint,
        activeTask,
        setSprint,
        toggleActiveTask,
        addTimeEntry
    ]
        = useStore((state) => [
        state.sprint,
        state.activeTask,
        state.setSprint,
        state.toggleActiveTask,
        state.addTimeEntry
    ])
    const [now, setNow] = useState(Date.now())
    const [i, setI] = useState(null);
    const [editingNote, setEditingNote] = useState(false);
    const [note, setNote] = useState('');
    useEffect(() => {
        setInterval(() => {
            setNow(Date.now())
        }, 1000);
    }, [])
    return (
        <Transition
            show={activeTask !== null}
            as={Fragment}
            enter="transition ease-out duration-100 "
            enterFrom="transform opacity-0 scale-95 rounded overflow-hidden scale-0"
            enterTo="transform opacity-100 scale-100 "
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-0 rounded overflow-hidden"
        >
            <div className="absolute bottom-0 left-0 right-0 flex text-slate-900">
                <div className="flex-grow flex items-center shadow-2xl bg-white p-4  gap-2">
                    <div className="text-white">

                        <button onClick={() => {
                            console.log('sprint id', sprint?.id)
                            if (sprint?.id !== undefined) {
                                toggleActiveTask(activeTask)
                                invoke("js_toggle_active_task", {task: null, sprint: sprint}).then((args) => {
                                    let sprint: Sprint = args[0];
                                    let timeEntry: TimeEntry = args[1];
                                    setSprint(sprint)
                                    setNote('')
                                    if (timeEntry) {
                                        addTimeEntry(timeEntry)
                                    }
                                })
                            } else {
                                console.error("No sprint")
                            }

                        }} className="  hover:scale-105 transition-transform easy-in-out delay-100 bg-gradient-to-r
from-blue-400
to-orange-500
via-purple-500
animate-gradient-x w-12 rounded-full shadow-lg">
                            <PauseCircleIcon
                                className="fill-transparent stroke-white animate-pulse hover:animate-ping "/>
                        </button>
                    </div>
                    <div className="flex flex-col flex-grow tracking-tighter">
                        <div className="text-sm font-semibold ">{activeTask?.text ?? ""}</div>
                        <div
                            className="text-sm text-slate-700">{noteArea(sprint, setSprint, editingNote, setEditingNote, note, setNote)}</div>
                    </div>
                    <div className="text-2xl font-extrabold">
                        {sprint?.active_task_started_at ? formatDistance(parseISO(sprint.active_task_started_at), now)
                                .replace("less than a minute", "<0m")
                                .replace(' minutes', 'm')
                                .replace(" minute", "m")
                            : ''}
                    </div>
                    <DropdownMenu direction="up">
                        <Menu.Item>
                            {({active}) => (
                                <button
                                    onClick={() => {
                                    }}
                                    className={'text-gray-700 block px-4 py-2 text-sm w-full text-left'}>
                                    Add 5 minutes
                                </button>
                            )}
                        </Menu.Item>
                    </DropdownMenu>
                </div>
            </div>
        </Transition>
    )
}

function noteArea(sprint, setSprint, editingNote, setEditingNote, note, setNote) {
    const handleFocus = (event) => event.target.select();

    const handleSettingNote = (value) => {
        // setEditingNote(false)
        setNote(value)

    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            setSprint({
                ...sprint,
                active_task_note: event.target.value
            })
            invoke("js_update_sprint", {
                sprint: {
                    ...sprint,
                    active_task_note: event.target.value
                }
            }).then(() => {
                setEditingNote(false)
                // setNote('')
            })
        } else {
            console.log(event)
        }
    }
    if (sprint == null) {
        return <>ERROR: NO SPRINT SET</>
    }
    if (editingNote) {
        return (
            <div className="flex">
                <div className="relative w-full">
                    <div className="absolute right-0 top-0 bottom-0 mt-0.5 mr-2 text-xs opacity-50">⮐</div>
                    <input type="text"
                           autoFocus onFocus={handleFocus}
                           className="bg-slate-100 text-xs py-0.5 flex rounded-md overflow-hidden shadow-sm border-slate-300 px-2 w-full focus:ring-indigo-600 ring-indigo-600 focus:border-indigo-600"
                           placeholder="Note..."
                           value={note}
                           onKeyDown={handleKeyDown}
                           onChange={(e) => handleSettingNote(e.target.value)}/>
                </div>
                <button title="Cancel edit" type="button" onClick={() => {
                    setEditingNote(false)
                    setNote(sprint.active_task_note)
                }}
                        className="bg-slate-100 rounded shadow-sm px-1 ml-2">
                    <XMarkIcon className=" w-4"/>
                </button>
            </div>
        )
    }
    return (<div>
        <button type="button" onClick={() => setEditingNote(true)} className="text-xs italic">
            {sprint.active_task_note ? sprint.active_task_note : 'Set a note...'}
        </button>
    </div>)

}

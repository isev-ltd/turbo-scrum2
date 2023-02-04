import {Menu, Transition} from "@headlessui/react";
import {PauseCircleIcon} from "@heroicons/react/20/solid";
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
        toggleActiveTask
    ]
        = useStore((state) => [
        state.sprint,
        state.activeTask,
        state.setSprint,
        state.toggleActiveTask
    ])
    const [now, setNow] = useState(Date.now())
    const [i, setI] = useState(null);
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
                        if(sprint?.id !== undefined) {
                            toggleActiveTask(activeTask)
                            invoke("js_toggle_active_task", {task: null, sprint: sprint}).then((args)  => {
                                let sprint: Sprint = args[0];
                                let timeEntry: TimeEntry = args[1];
                                setSprint(sprint)
                            })
                        } else {
                            console.error("No sprint")
                        }

                    }} className="  hover:scale-105 transition-transform easy-in-out delay-100 bg-gradient-to-r
from-blue-400
to-orange-500
via-purple-500
animate-gradient-x w-12 rounded-full shadow-lg">
                        <PauseCircleIcon className="fill-transparent stroke-white  "/>
                    </button>
                </div>
                <div className="flex flex-col flex-grow tracking-tighter">
                    <div className="text-sm font-semibold ">{activeTask?.text ?? ""}</div>
                    <div className="text-sm text-slate-700">{noteArea(sprint)}</div>
                </div>
                <div className="text-2xl font-extrabold">
                    {sprint?.active_task_started_at ? formatDistance(parseISO(sprint.active_task_started_at), now)
                        .replace("less than a minute", "<0m")
                        .replace(" minute", "m") : ''}
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

function noteArea(sprint) {
    if (sprint?.active_note_text) {
        return <button className="text-xs italic">{sprint.active_note_text}</button>
    } else {
        return <button className="text-xs italic">Set a note for this time entry...</button>

    }

}

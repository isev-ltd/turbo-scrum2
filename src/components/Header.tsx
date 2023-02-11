import {PlusIcon, MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Sprint, Task} from "../types";
import DropdownMenu from "./DropdownMenu";
import {Menu} from '@headlessui/react'
import {confirm} from '@tauri-apps/api/dialog';
import {Fragment, useState} from "react";
import {XMarkIcon} from "@heroicons/react/20/solid";
import {Transition} from "@headlessui/react";
import {format, parseISO} from "date-fns";
import loadSprint from "../lib/loadSprint";
import Link from "next/link";

enum States {
    default = 'Default',
    search = 'Search',
}

export default function Header({}) {

    const [
        sprint,
        addNewTask,
        setSprint,
        setTasks,
        setActiveTask,
        setTimeEntries,
        searchQuery,
        setSearchQuery,
        sprints,
        setSprints
    ] = useStore((state) => [
        state.sprint,
        state.addNewTask,
        state.setSprint,
        state.setTasks,
        state.setActiveTask,
        state.setTimeEntries,
        state.searchQuery,
        state.setSearchQuery,
        state.sprints,
        state.setSprints
    ])
    const [state, setState] = useState(States.default);

    function add() {
        invoke("js_create_task", {selectedSprintId: sprint.id})
            .then((task: Task) => {
                addNewTask(task)
            })
    }

    function handleChange(e) {
        console.log('handling change', e)

        loadSprint(parseInt(e.target.value), {
            setSprints,
            setSprint,
            setTasks,
            setTimeEntries,
            setActiveTask
        })
    }

    const handleFocus = (event) => event.target.select();

    return (
        <div data-tauri-drag-region className="flex justify-end gap-2 p-2 bg-slate-200">
            <Transition
                show={state == States.search}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-x-95 rounded overflow-hidden scale-x-0"
                enterTo="transform opacity-100 scale-x-100 "
                leave="transition ease-in "
                leaveFrom="transform opacity-100 scale-x-100 duration-0 "
                leaveTo="transform opacity-0 scale-x-0 rounded overflow-hidden duration-0 "
            >

                <div className="flex-grow text-center align-center flex gap-2 w-full justify-center">
                    <input type="search"
                           autoFocus onFocus={handleFocus}
                           className="flex rounded-md overflow-hidden shadow-sm border-slate-300 px-2 w-full ml-16 focus:ring-indigo-600 ring-indigo-600 focus:border-indigo-600"
                           placeholder="Search..."
                           value={searchQuery}
                           onKeyDown={() => {
                           }} onChange={(e) => {
                        setSearchQuery(e.target.value)
                    }}/>

                    <button onClick={() => setState(States.default)} className="p-2 rounded-lg shadow bg-white">
                        <XMarkIcon className="w-6"/>
                    </button>
                </div>
            </Transition>

            <Transition
                show={state == States.default}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-x-95 rounded overflow-hidden scale-x-0"
                enterTo="transform opacity-100 scale-x-100 "
                leave="transition ease-in "
                leaveFrom="transform opacity-100 scale-x-100 duration-0 "
                leaveTo="transform opacity-0 scale-x-0 rounded overflow-hidden duration-0 "
            >
                <div className={` flex-grow flex gap-2 items-center`}>
                    <div className="flex-grow text-center align-center flex gap-2 w-full justify-center">
                        <select value={sprint?.id ?? 0} onChange={handleChange}
                                className="ml-16 h-10 bg-white block w-full border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm rounded-lg shadow">
                            {sprints.map((s: Sprint) => {
                                return <option value={s.id}>{format(parseISO(s.created_at), "PPPp")}</option>
                            })}
                        </select>
                    </div>
                    <button onClick={() => setState(States.search)} className="p-2 rounded-lg shadow bg-white">
                        <MagnifyingGlassIcon
                            className="w-6"/></button>

                    <DropdownMenu renderButton={button}>
                        <Menu.Item>
                            <button onClick={add} type="button"
                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                task
                            </button>
                        </Menu.Item>
                        <Menu.Item>
                            <button onClick={() => createNewSprint(setSprint, setTasks, setActiveTask, setTimeEntries)}
                                    type="button"
                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                sprint
                            </button>
                        </Menu.Item>
                    </DropdownMenu>
                </div>
            </Transition>
        </div>
    )
}

function button() {
    return (<Menu.Button
        className="p-2 rounded-lg shadow bg-white">
        <PlusIcon className="w-6"/>
    </Menu.Button>)
}


async function createNewSprint(setSprint, setTasks, setActiveTask, setTimeEntries) {
    const confirmed = await confirm('Are you sure you wish to create and change to a new sprint?', 'Turbo Scrum');
    if (confirmed) {
        invoke("create_new_sprint").then((newSprint) => {
            if (newSprint) {
                console.log('received new sprint', newSprint)
                setSprint(newSprint)
                setTasks([])
                setActiveTask(null)
                setTimeEntries([])
            }
        })
    }

}

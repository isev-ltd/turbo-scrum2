import {PlusIcon, MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Task} from "../types";
import DropdownMenu from "./DropdownMenu";
import {Menu} from '@headlessui/react'
import {confirm} from '@tauri-apps/api/dialog';

export default function Header({}) {

    const [sprint, addNewTask, setSprint, setTasks, setActiveTask, setTimeEntries] = useStore((state) => [state.sprint, state.addNewTask, state.setSprint, state.setTasks, state.setActiveTask, state.setTimeEntries])

    function add() {
        invoke("js_create_task", {selectedSprintId: sprint.id})
            .then((task: Task) => {
                addNewTask(task)
            })
    }

    return (<div data-tauri-drag-region className="flex justify-end gap-2 p-2 bg-slate-200">
        <div className="flex-grow text-center align-center">{sprint?.created_at}</div>
        <button className="p-2 rounded shadow"><MagnifyingGlassIcon className="w-6"/></button>

        <DropdownMenu renderButton={button}>
            <Menu.Item>
                <button onClick={add} type="button"
                        className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New task
                </button>
            </Menu.Item>
            <Menu.Item>
                <button onClick={() => createNewSprint(setSprint, setTasks, setActiveTask, setTimeEntries)}
                        type="button"
                        className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New sprint
                </button>
            </Menu.Item>
        </DropdownMenu>
    </div>)
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

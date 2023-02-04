import {PlusIcon, MagnifyingGlassIcon} from "@heroicons/react/24/solid";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Task} from "../types";

export default function Header({}) {

    const [sprint, addNewTask] = useStore((state) => [state.sprint, state.addNewTask])

    function add() {
        invoke("js_create_task", {selectedSprintId: sprint.id})
            .then((task: Task) => {
                addNewTask(task)
            })
    }

    return (<div data-tauri-drag-region className="flex justify-end gap-2 p-1 bg-slate-200">
        <div className="flex-grow text-center align-center">{sprint?.created_at}</div>
        <button onClick={add} type="button" className="p-2 rounded shadow"><PlusIcon className="w-6"/></button>
        <button className="p-2 rounded shadow"><MagnifyingGlassIcon className="w-6"/></button>
    </div>)
}


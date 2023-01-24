import {PlusIcon, MagnifyingGlassIcon} from "@heroicons/react/24/solid";

export default function Header({addNewTask}) {
    return (<div data-tauri-drag-region  className="flex justify-end gap-2 p-1 bg-slate-200">
        <button onClick={addNewTask} type="button" className="p-2 rounded shadow"><PlusIcon className="w-6"/></button>
        <button className="p-2 rounded shadow"><MagnifyingGlassIcon className="w-6"/></button>
    </div>)
}

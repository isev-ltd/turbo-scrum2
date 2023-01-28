import {Menu} from "@headlessui/react";
import {PauseCircleIcon} from "@heroicons/react/20/solid";
import DropdownMenu from "./DropdownMenu";

export default function ActiveTask({sprint, task, setSprint}) {
    if(!task) {
        return <></>;
    }
    return (
        <div className="absolute bottom-0 left-0 right-0 flex text-slate-900">
            <div className="flex-grow flex items-center shadow-2xl bg-white p-4  gap-2">
                <div className="text-white">
                    <button className="  hover:scale-105 transition-transform easy-in-out delay-100 bg-gradient-to-r
from-blue-400
to-orange-500
via-purple-500
animate-gradient-x w-12 rounded-full shadow-lg">
                        <PauseCircleIcon className="fill-transparent stroke-white  "/>
                    </button>
                </div>
                <div className="flex flex-col flex-grow tracking-tighter">
                    <div className="text-sm font-semibold ">{task?.text ?? ""}</div>
                    <div className="text-sm text-slate-700">{noteArea(sprint)}</div>
                </div>
                <div className="text-2xl font-extrabold">5m 2s</div>
                <DropdownMenu direction="up">
                    <Menu.Item>
                        {({active}) => (
                            <button
                                onClick={() => {
                                }}
                                className={'text-gray-700', 'block px-4 py-2 text-sm w-full text-left'}>
                                Add 5 minutes
                            </button>
                        )}
                    </Menu.Item>
                </DropdownMenu>
            </div>
        </div>
    )
}

function noteArea(sprint) {
    if (sprint.active_note_text) {
        return <button className="text-xs italic">{sprint.active_note_text}</button>
    } else {
        return <button className="text-xs italic">Set a note for this time entry...</button>

    }

}

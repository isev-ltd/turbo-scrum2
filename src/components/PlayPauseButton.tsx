import {PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/20/solid";

export default function PlayPauseButton({onClick, activeTask, task}) {
    return (
        <div className="flex items-center">
            <button className="">
                {(activeTask?.id == task.id ? (
                    <PauseCircleIcon onClick={onClick}
                                     className={`w-5 ${activeTask?.id == task.id ? 'fill-indigo-500' : 'fill-slate-500'} hover:fill-indigo-500 transition transform easy-in-out delay-100 hover:scale-110 shadow-sm`}/>
                ) : (
                    <PlayCircleIcon onClick={onClick}
                                    className={`w-5 ${activeTask?.id == task.id ? 'fill-indigo-500' : 'fill-slate-500'} hover:fill-indigo-500 transition transform easy-in-out delay-100 hover:scale-110 shadow-sm`}/>
                ))}
            </button>
        </div>
    )
}

import {PauseCircleIcon, PlayCircleIcon} from "@heroicons/react/20/solid";
import {useStore} from "../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Sprint, TimeEntry} from "../types";

export default function PlayPauseButton({task}) {
    const [
        toggleActiveTask,
        setActiveTask,
        activeTask,
        sprint,
        setSprint,
        addTimeEntry
    ]
        = useStore((state) => [
        state.toggleActiveTask,
        state.setActiveTask,
        state.activeTask,
        state.sprint,
        state.setSprint,
        state.addTimeEntry
    ])

    function onClick() {
        let oldTask = task;
        if(task.id == activeTask?.id) {
            console.log('clicking active task')
            setActiveTask(null)
        } else {
            console.log('clicking unactive task')
            setActiveTask(task)
        }
        console.log({sprint})
        invoke("js_toggle_active_task", {task: (oldTask.id == activeTask?.id ? null : oldTask), sprint: sprint}).then((args) => {
            let sprint: Sprint = args[0];
            let timeEntry: TimeEntry = args[1];
            setSprint(sprint)
            if(timeEntry) {
                addTimeEntry(timeEntry)
            }
        })
    }
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

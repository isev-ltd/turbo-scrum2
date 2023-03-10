import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {addMinutes, formatDistance, formatDistanceStrict, formatISO, parseISO} from "date-fns";
import {Sprint} from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Report() {
    let [tasks, setTasks] = useState([])
    const [startedAt, setStartedAt] = useState(addMinutes(new Date(), -1440));
    const [endedAt, setEndedAt] = useState(new Date());
    const [sprint, setSprint] = useState(null);
    useEffect(() => {
        invoke("js_get_latest_sprint")
            .then((sprint: Sprint) => {
                setSprint(sprint)
                return invoke("get_report", {sprintId: sprint.id, startedAt, endedAt})
            })
            .then((args) => {
                console.log(args)
                let timeEntries = args[0];
                setTasks(args[1].map(task => {
                    return {
                        ...task,
                        timeEntries: args[0].filter((e) => e.task_id == task.id)
                    }
                }));
            })
    }, [])
    function updateReport(attr, setter, val) {
        console.log('args', attr, val, formatISO(val))
        setter(val)
        let args = {
            sprintId: sprint.id,
            startedAt: formatISO(startedAt).replace('T', ' ').replace('Z', ''),
            endedAt: formatISO(endedAt).replace('T', ' ').replace('Z', ''),
            [attr]: formatISO(val).replace('T', ' ').replace('Z', '')
        }
        invoke("get_report", args)
            .then((args) => {
                console.log(args)
                let timeEntries = args[0];
                setTasks(args[1].map(task => {
                    return {
                        ...task,
                        timeEntries: args[0].filter((e) => e.task_id == task.id)
                    }
                }));
            })

    }
    return (<div className="flex flex-col h-screen overflow-hidden">
        <div data-tauri-drag-region className="flex justify-center gap-2 p-2 bg-slate-200">
            Report
        </div>
        <div className="flex flex-row">
            <DatePicker
                selected={startedAt}
                showTimeSelect
                dateFormat="PPPp"
                // onSelect={(val) => {updateReport('startedAt', setStartedAt, val)}}
                onChange={(e) => {
                    updateReport('startedAt', setStartedAt, e)
                }}
            />
            <DatePicker
                selected={endedAt}
                // onChange={(date) => setEndedAt(date)}
                showTimeSelect
                dateFormat="PPPp"
                // onSelect={(val) => {updateReport('endedAt', setEndedAt, val)}}
                onChange={(e) => {
                    updateReport('endedAt', setEndedAt, e)
                }}
            />
        </div>
        <div className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto">
            {tasks.map((task) => {
                return <ul key={task.id}>
                    <li className="w-full relative rounded bg-slate-100 shadow p-4 text-slate-800 flex flex-col items-start text-left">
                        <div className="font-semibold">{task.text}</div>
                        <ul className="list list-disc w-full">{task?.timeEntries?.map((entry) => {
                            return (<li key={entry.id} className="ml-4 ">
                                <div className="flex flex-row w-full justify-between">
                                    <div
                                        className="italic text-xs text-slate-500">{entry.created_at} - {entry.ended_at}</div>
                                    <div
                                        className="font-semibold text-slate-900">{formatDistanceStrict(parseISO(entry.created_at), parseISO(entry.ended_at),
                                        {unit: 'minute'}
                                    )
                                    }</div>
                                </div>
                                {(entry.note) ? (<div className="text-xs italic rounded bg-slate-200 p-2 relative">
                                    <div className="text-[0.2rem] absolute top-0 right-0 mr-1 text-slate-400">Note</div>
                                    {entry.note}</div>) : <></>}
                            </li>)
                        })}</ul>
                    </li>
                </ul>
            })}</div>
    </div>)
}

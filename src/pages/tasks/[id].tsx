import {useRouter} from 'next/router'
import {useEffect, useState} from "react";
import {useStore} from "../../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Task, TimeEntry} from "../../types";
import {format, parseISO} from "date-fns";
import DropdownMenu from "../../components/DropdownMenu";
import {Menu} from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function TaskShow() {
    const router = useRouter()
    const {id} = router.query
    const [sprint, setSprint] = useState(null)
    const [task, setTask] = useState(null)
    const [timeEntries, setTimeEntries] = useState([])

    const taskId = typeof id === 'string' ? parseInt(id) : id
    useEffect(() => {
        console.log('taskId', taskId)
        if (taskId !== undefined) {
            invoke("get_task", {taskId: taskId})
                .then((task: Task) => {
                    setTask(task)
                    return task
                }).then((task) => {
                return invoke("get_time_entries_for_task", {selectedTaskId: taskId})
            }).then((timeEntries: TimeEntry[]) => {
                setTimeEntries(timeEntries)
            })
        }

    }, [taskId])
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div data-tauri-drag-region className="flex justify-center gap-2 p-2 bg-slate-200">
                {task?.text}
            </div>
            <div className="flex flex-col gap-2 px-2 py-2 flex-grow overflow-auto">
                {timeEntries.map((timeEntry, index) => {
                    return (
                        <div key={timeEntry.id}
                             className="relative items-center rounded bg-slate-100 shadow p-4 text-slate-800 flex   items-start text-left">
                            <div className="flex flex-col flex-grow">
                                <div className="text-xs italic text-slate-600 flex gap-x-1">
                                    {format(parseISO(timeEntry.created_at), "PP")}
                                    <div
                                        className="bg-slate-300 rounded px-0.5 text-slate-600">{format(parseISO(timeEntry.created_at), "p")}</div>
                                    -
                                    <div
                                        className="bg-slate-300 rounded px-0.5 text-slate-600">{format(parseISO(timeEntry.ended_at), "p")}</div>
                                </div>
                                <div className="text-base">
                                    {timeEntry.note}
                                </div>
                            </div>

                            <DropdownMenu direction={index >= 4 ? "up" : "down"}>
                                <Menu.Item>
                                    {({active}) => (
                                        <button
                                            onClick={() => {
                                                setTimeEntries(timeEntries.filter((te) => {
                                                    return te.id != timeEntry.id
                                                }))
                                                invoke("delete_time_entry", {timeEntryId: timeEntry.id}).then(() => {})
                                            }}
                                            className={classNames(
                                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                'block px-4 py-2 text-sm w-full text-left'
                                            )}
                                        >
                                            Delete entry
                                        </button>
                                    )}
                                </Menu.Item>
                            </DropdownMenu>
                        </div>
                    )
                })}

            </div>
        </div>
    )
}

export default TaskShow

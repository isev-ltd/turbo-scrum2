import {useRouter} from 'next/router'
import {useEffect, useState} from "react";
import {useStore} from "../../store";
import {invoke} from "@tauri-apps/api/tauri";
import {Task, TimeEntry} from "../../types";
import {addMinutes, format, formatDistance, formatISO, parseISO} from "date-fns";
import DropdownMenu from "../../components/DropdownMenu";
import {Menu} from '@headlessui/react'
import {emit, listen} from '@tauri-apps/api/event'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function button(time) {
    return (<></>)
}


function TaskShow() {
    const router = useRouter()
    const {id} = router.query
    const [sprint, setSprint] = useState(null)
    const [task, setTask] = useState(null)
    const [timeEntries, setTimeEntries] = useState([])

    const taskId = typeof id === 'string' ? parseInt(id) : id

    function addTime(timeEntry, attr, minutes) {
        setTimeEntries(timeEntries.map((te) => {
            if (te.id == timeEntry.id && typeof te[attr] == 'string') {
                console.log(te[attr], attr, parseISO(te[attr]), addMinutes(parseISO(te[attr]), minutes))
                return {
                    ...te,
                    [attr]: formatISO(addMinutes(parseISO(te[attr]), minutes))
                }
            } else {
                return te
            }
        }))
        const te = {
            ...timeEntry,
            [attr]:
                formatISO(addMinutes(parseISO(timeEntry[attr]), minutes))
        }
        invoke("update_time_entry", {
                timeEntry: te
            }
        ).then(() => {
            emit('time-entries:update', te)
        })

    }

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
                                    <DropdownMenu renderButton={() => {
                                        return <Menu.Button>{format(parseISO(timeEntry.created_at), "p")}</Menu.Button>
                                    }}>
                                        <Menu.Item>
                                            <button onClick={() => {
                                                addTime(timeEntry, 'created_at', -5)
                                            }} type="button"
                                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                                Add 5 minutes
                                            </button>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <button onClick={() => {
                                                addTime(timeEntry, 'created_at', 5)
                                            }} type="button"
                                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                                Remove 5 minutes
                                            </button>
                                        </Menu.Item>
                                    </DropdownMenu>
                                    -
                                    <DropdownMenu renderButton={() => {
                                        return <Menu.Button>{format(parseISO(timeEntry.ended_at), "p")}</Menu.Button>
                                    }}>
                                        <Menu.Item>
                                            <button onClick={() => {
                                                addTime(timeEntry, 'ended_at', 5)
                                            }} type="button"
                                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                                Add 5 minutes
                                            </button>
                                        </Menu.Item>
                                        <Menu.Item>
                                            <button onClick={() => {
                                                addTime(timeEntry, 'ended_at', -5)
                                            }} type="button"
                                                    className="block px-4 py-2 text-sm w-full text-left text-gray-700 hover:bg-slate-100">New
                                                Remove 5 minutes
                                            </button>
                                        </Menu.Item>
                                    </DropdownMenu>
                                </div>
                                <div className="text-base">

                                    <strong
                                        className="mr-2">{formatDistance(parseISO(timeEntry.created_at), parseISO(timeEntry.ended_at))
                                        .replace("less than a minute", "<0m")
                                        .replace(' minutes', 'm')
                                        .replace(" minute", "m")
                                    }</strong>
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
                                                invoke("delete_time_entry", {timeEntryId: timeEntry.id}).then(() => {
                                                    emit('time-entries:remove', timeEntry.id)
                                                })
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

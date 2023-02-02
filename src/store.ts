import {create} from "zustand";
import {Sprint, Task} from "./types";

interface EditingTask {
    id: number | null
    key: string | null
}

interface TurboScrumState {
    sprint: Sprint | null
    activeTask: Task | null
    tasks: Task[]
    editingTask: EditingTask | null
    setTasks: (tasks: Task[]) => void
    updateTask: (task: Task) => void
    setSprint: (tasks: Sprint | null) => void
    setActiveTask: (task: Task | null) => void
    setEditingTask: (id: number, key: string) => void
    clearEditingTask: () => void
    addNewTask: (task: Task) => void
    toggleActiveTask: (task: Task | null) => void
    deleteTask: (task: Task) => void
}

export const useStore = create<TurboScrumState>()((set) => ({
    sprint: null,
    tasks: [],
    activeTask: null,
    editingTask: null,
    setTasks: (tasks) => set((state) => ({tasks: tasks})),
    setActiveTask: (task) => set((state) => ({activeTask: task})),
    updateTask: (task) => set((state) => ({
        tasks: state.tasks.map((t) => {
            if (t.id == task.id) {
                return task
            } else {
                return t
            }
        })
    })),
    setSprint: (sprint) => set((state) => ({sprint: sprint})),
    setEditingTask: (id: number, key: string) => set((state) => ({editingTask: {id, key}})),
    clearEditingTask: () => set((state) => ({editingTask: null})),
    addNewTask: (task) => set((state) => {
        return ({
            tasks: [...state.tasks, task],
            editingTask: {id: task.id, key: "text"}
        })
    }),
    toggleActiveTask: (task) => set((state) => {
        if (task.id == state.activeTask?.id) {
            // console.log('clicking active task')
            return ({
                activeTask: null
            })
        } else {
            // console.log('clicking unactive task')
            // setActiveTask(task)
            return ({
                activeTask: task
            })
        }
        // invoke("js_toggle_active_task", {task: (task.id == activeTask?.id ? null : task), sprint}).then((sprint : Sprint) => {
        //     console.log({sprint})
        //     setSprint(sprint)
        // })
        return ({});
    }),
    deleteTask: (task) => set((state) => {
        return ({
            tasks: state.tasks.filter((t) => t.id != task.id)
        })
    })
}))

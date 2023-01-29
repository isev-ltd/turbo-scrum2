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
    setSprint: (tasks: Sprint | null) => void
    setActiveTask: (task: Task | null) => void
    setEditingTask: (id: number, key: string) => void
    clearEditingTask: () => void
}

export const useStore = create<TurboScrumState>()((set) => ({
    sprint: null,
    tasks: [],
    activeTask: null,
    editingTask: null,
    setTasks: (tasks) => set((state) => ({tasks: tasks})),
    setActiveTask: (task) => set((state) => ({activeTask: task})),
    setSprint: (sprint) => set((state) => ({sprint: sprint})),
    setEditingTask: (id: number, key: string) => set((state) => ({editingTask: {id, key}})),
    clearEditingTask: () => set((state) => ({editingTask: null}))
}))


import { useRouter } from 'next/router'
function TaskShow() {
    const router = useRouter()
    const { id } = router.query
    return <div>Hello {id}</div>
}

export default TaskShow

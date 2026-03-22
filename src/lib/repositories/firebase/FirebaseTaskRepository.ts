import { ref, get, set, update, push, onValue, off } from 'firebase/database'
import { rtdb } from '@/lib/firebase/client'
import { ITaskRepository } from '../interfaces/ITaskRepository'
import { RealtimeTask, TaskStatus } from '@/types'

export class FirebaseTaskRepository implements ITaskRepository {
  private basePath = 'tasks'

  async getAllTasks(): Promise<Record<string, RealtimeTask>> {
    const snapshot = await get(ref(rtdb, this.basePath))
    return snapshot.exists() ? snapshot.val() : {}
  }

  async getTask(id: string): Promise<RealtimeTask | null> {
    const snapshot = await get(ref(rtdb, `${this.basePath}/${id}`))
    return snapshot.exists() ? snapshot.val() : null
  }

  async createTask(task: Omit<RealtimeTask, 'id' | 'createdAt'>): Promise<string> {
    const newRef = push(ref(rtdb, this.basePath))
    const id = newRef.key!
    await set(newRef, { ...task, id, createdAt: Date.now() })
    return id
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${id}`), { status })
  }

  async assignTask(taskId: string, vehicleId: string, assignedTo: string): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${taskId}`), {
      vehicleId,
      assignedTo,
      status: 'IN_PROGRESS',
    })
  }

  subscribeToTasks(callback: (tasks: Record<string, RealtimeTask>) => void): () => void {
    const tasksRef = ref(rtdb, this.basePath)
    const handler = onValue(tasksRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : {})
    })
    return () => off(tasksRef, 'value', handler)
  }
}

export const taskRepository: ITaskRepository = new FirebaseTaskRepository()

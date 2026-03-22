import { RealtimeTask, TaskStatus, Priority } from '@/types'

export interface ITaskRepository {
  getAllTasks(): Promise<Record<string, RealtimeTask>>
  getTask(id: string): Promise<RealtimeTask | null>
  createTask(task: Omit<RealtimeTask, 'id' | 'createdAt'>): Promise<string>
  updateTaskStatus(id: string, status: TaskStatus): Promise<void>
  assignTask(taskId: string, vehicleId: string, assignedTo: string): Promise<void>
  subscribeToTasks(callback: (tasks: Record<string, RealtimeTask>) => void): () => void
}

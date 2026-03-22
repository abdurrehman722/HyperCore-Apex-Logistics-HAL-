'use client'

import { useState, useEffect } from 'react'
import { taskRepository } from '@/lib/repositories/firebase/FirebaseTaskRepository'
import { RealtimeTask } from '@/types'

export function useTasks() {
  const [tasks, setTasks] = useState<Record<string, RealtimeTask>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = taskRepository.subscribeToTasks((data) => {
      setTasks(data)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const taskList = Object.values(tasks)
  const pendingTasks = taskList.filter(t => t.status === 'PENDING')
  const activeTasks = taskList.filter(t => t.status === 'IN_PROGRESS')
  const criticalTasks = taskList.filter(t => t.priority === 'CRITICAL')

  return { tasks, taskList, isLoading, pendingTasks, activeTasks, criticalTasks }
}

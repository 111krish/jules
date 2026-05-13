'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser || !['CEO', 'COO', 'CTO', 'PROJECT_HEAD'].includes(currentUser.role)) {
    throw new Error("Not authorized to create projects")
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  await prisma.project.create({
    data: { name, description }
  })

  revalidatePath('/projects')
}

export async function createTask(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const projectId = formData.get('projectId') as string
  const assigneeId = formData.get('assigneeId') as string

  await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assigneeId
    }
  })

  revalidatePath('/projects')
}

export async function updateTaskStatus(taskId: string, status: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error("Task not found")

  const canUpdate = task.assigneeId === currentUser.id || ['CEO', 'COO', 'CTO', 'HEAD_OF_RESEARCH', 'PROJECT_HEAD'].includes(currentUser.role)
  if (!canUpdate) throw new Error("Not authorized to update this task")

  await prisma.task.update({
    where: { id: taskId },
    data: { status }
  })

  revalidatePath('/projects')
}

'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitTimesheet(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const date = new Date(formData.get('date') as string)
  const hours = parseFloat(formData.get('hours') as string)
  const notes = formData.get('notes') as string
  const projectId = formData.get('projectId') as string

  await prisma.timesheet.create({
    data: {
      date,
      hours,
      notes,
      projectId,
      userId: currentUser.id
    }
  })

  revalidatePath('/timesheets')
}

export async function approveTimesheet(timesheetId: string) {
  await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status: 'APPROVED' }
  })

  revalidatePath('/timesheets')
}

export async function rejectTimesheet(timesheetId: string) {
  await prisma.timesheet.update({
    where: { id: timesheetId },
    data: { status: 'REJECTED' }
  })

  revalidatePath('/timesheets')
}

'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitReport(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const title = formData.get('title') as string
  const type = formData.get('type') as string
  const content = formData.get('content') as string

  await prisma.report.create({
    data: {
      title,
      type,
      content,
      userId: currentUser.id
    }
  })

  revalidatePath('/reports')
}

export async function markReportReviewed(reportId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser || !['CTO', 'CEO', 'COO'].includes(currentUser.role)) {
    throw new Error("Not authorized to review reports")
  }

  await prisma.report.update({
    where: { id: reportId },
    data: { status: 'REVIEWED' }
  })

  revalidatePath('/reports')
}

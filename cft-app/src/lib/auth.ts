import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/app/actions/auth'

export async function getCurrentUser() {
  const userId = await getCurrentUserId()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { id: userId },
  })
}

'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function submitExpense(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string

  await prisma.expense.create({
    data: {
      amount,
      description,
      userId: currentUser.id
    }
  })

  revalidatePath('/expenses')
}

export async function approveExpense(expenseId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) throw new Error("Not logged in")

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } })
  if (!expense) throw new Error("Expense not found")

  // Logic based on docs:
  // <= ₹5,000 via Revathy (PROJECT_HEAD) / CTO
  // <= ₹25,000 via COO
  // > ₹25,000 requires CEO

  let canApprove = false

  if (expense.amount <= 5000) {
    if (['PROJECT_HEAD', 'CTO', 'COO', 'CEO'].includes(currentUser.role)) canApprove = true
  } else if (expense.amount <= 25000) {
    if (['COO', 'CEO'].includes(currentUser.role)) canApprove = true
  } else {
    if (['CEO'].includes(currentUser.role)) canApprove = true
  }

  if (!canApprove) {
    throw new Error("You do not have the required approval authority for this amount.")
  }

  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: 'APPROVED' }
  })

  revalidatePath('/expenses')
}

export async function rejectExpense(expenseId: string) {
  // Simplification for MVP: anyone who can approve can reject (or just standard managers)
  await prisma.expense.update({
    where: { id: expenseId },
    data: { status: 'REJECTED' }
  })

  revalidatePath('/expenses')
}

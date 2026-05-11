import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { submitExpense, approveExpense, rejectExpense } from '@/app/actions/expenses/actions'

export default async function ExpensesPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return <div className="p-8">Please select a user to login.</div>

  const myExpenses = await prisma.expense.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: 'desc' }
  })

  // Show all pending expenses to managers
  const pendingExpenses = ['PROJECT_HEAD', 'CTO', 'COO', 'CEO'].includes(currentUser.role)
    ? await prisma.expense.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      })
    : []

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-bold mb-4">Submit New Expense</h2>
          <form action={submitExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₹)</label>
              <input type="number" name="amount" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Submit Request</button>
          </form>
        </div>

        <div>
          {pendingExpenses.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border mb-8">
              <h2 className="text-xl font-bold mb-4 text-red-600">Pending Approvals</h2>
              <ul className="space-y-4">
                {pendingExpenses.map(expense => (
                  <li key={expense.id} className="border p-3 rounded bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{expense.user.name} - ₹{expense.amount}</div>
                        <div className="text-sm text-gray-600">{expense.description}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(() => {
                        let canApprove = false;
                        if (expense.amount <= 5000) {
                          if (['PROJECT_HEAD', 'CTO', 'COO', 'CEO'].includes(currentUser.role)) canApprove = true
                        } else if (expense.amount <= 25000) {
                          if (['COO', 'CEO'].includes(currentUser.role)) canApprove = true
                        } else {
                          if (['CEO'].includes(currentUser.role)) canApprove = true
                        }

                        if (canApprove) {
                          return (
                            <form action={approveExpense.bind(null, expense.id)}>
                              <button className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Approve</button>
                            </form>
                          )
                        }
                        return null;
                      })()}
                      <form action={rejectExpense.bind(null, expense.id)}>
                        <button className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold mb-4">My Expenses</h2>
            {myExpenses.length === 0 ? (
              <p className="text-gray-500 text-sm">No expenses submitted.</p>
            ) : (
              <ul className="space-y-3">
                {myExpenses.map(expense => (
                  <li key={expense.id} className="border p-3 rounded flex justify-between items-center">
                    <div>
                      <div className="font-semibold">₹{expense.amount}</div>
                      <div className="text-sm text-gray-600">{expense.description}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded font-bold ${
                      expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {expense.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

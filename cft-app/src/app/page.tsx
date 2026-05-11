import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { UserSwitcher } from '@/components/UserSwitcher'
import Link from 'next/link'

export default async function Home() {
  const users = await prisma.user.findMany()
  const currentUser = await getCurrentUser()

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">CarbonFuelTech Dashboard</h1>

      <UserSwitcher users={users} currentUser={currentUser} />

      {currentUser ? (
        <div className="grid grid-cols-2 gap-4">
          <Link href="/projects" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Projects & Tasks</h5>
            <p className="font-normal text-gray-700">Manage ongoing work and assignments.</p>
          </Link>

          <Link href="/expenses" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Expenses</h5>
            <p className="font-normal text-gray-700">Submit and approve expense requests.</p>
          </Link>

          <Link href="/reports" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Reports</h5>
            <p className="font-normal text-gray-700">Weekly/Monthly plans and work done.</p>
          </Link>

          {['INTERN', 'PROJECT_HEAD', 'CTO'].includes(currentUser.role) && (
            <Link href="/timesheets" className="block p-6 bg-white border rounded-lg shadow hover:bg-gray-50">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Timesheets</h5>
              <p className="font-normal text-gray-700">Log and review intern hours.</p>
            </Link>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Please select a user above to simulate logging in.</p>
      )}
    </main>
  )
}

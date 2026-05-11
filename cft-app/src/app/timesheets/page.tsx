import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { submitTimesheet, approveTimesheet, rejectTimesheet } from '@/app/actions/timesheets/actions'

export default async function TimesheetsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return <div className="p-8">Please select a user to login.</div>

  const projects = await prisma.project.findMany()

  const myTimesheets = await prisma.timesheet.findMany({
    where: { userId: currentUser.id },
    include: { project: true },
    orderBy: { date: 'desc' }
  })

  // Managers (Revathy, Rahul) can see interns timesheets
  const pendingTimesheets = ['PROJECT_HEAD', 'CTO'].includes(currentUser.role)
    ? await prisma.timesheet.findMany({
        where: { status: 'PENDING' },
        include: { user: true, project: true },
        orderBy: { date: 'desc' }
      })
    : []

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {currentUser.role === 'INTERN' && (
          <div className="bg-white p-6 rounded-lg shadow border h-fit">
            <h2 className="text-xl font-bold mb-4">Log Hours</h2>
            <form action={submitTimesheet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="date" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hours</label>
                <input type="number" step="0.5" name="hours" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project</label>
                <select name="projectId" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes / Work Done</label>
                <textarea name="notes" required rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Submit Timesheet</button>
            </form>
          </div>
        )}

        <div className="space-y-8">
          {pendingTimesheets.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4 text-red-600">Pending Approvals</h2>
              <ul className="space-y-4">
                {pendingTimesheets.map(timesheet => (
                  <li key={timesheet.id} className="border p-4 rounded bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{timesheet.user.name} - {timesheet.hours} hrs</div>
                        <div className="text-sm text-gray-600">{new Date(timesheet.date).toLocaleDateString()} | {timesheet.project.name}</div>
                        <div className="text-sm text-gray-700 mt-1">{timesheet.notes}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <form action={approveTimesheet.bind(null, timesheet.id)}>
                        <button className="text-xs bg-green-500 text-white px-2 py-1 rounded">Approve</button>
                      </form>
                      <form action={rejectTimesheet.bind(null, timesheet.id)}>
                        <button className="text-xs bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentUser.role === 'INTERN' && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4">My Logged Hours</h2>
              {myTimesheets.length === 0 ? (
                <p className="text-gray-500 text-sm">No timesheets logged.</p>
              ) : (
                <ul className="space-y-3">
                  {myTimesheets.map(timesheet => (
                    <li key={timesheet.id} className="border p-3 rounded flex justify-between items-center bg-gray-50">
                      <div>
                        <div className="font-semibold">{timesheet.hours} hrs on {new Date(timesheet.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">{timesheet.project.name}</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded font-bold ${
                        timesheet.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        timesheet.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {timesheet.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

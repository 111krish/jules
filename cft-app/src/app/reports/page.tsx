import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { submitReport, markReportReviewed } from '@/app/actions/reports/actions'

export default async function ReportsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return <div className="p-8">Please select a user to login.</div>

  const myReports = await prisma.report.findMany({
    where: { userId: currentUser.id },
    orderBy: { createdAt: 'desc' }
  })

  // Managers/Executives can see others' reports
  const allReports = ['CTO', 'CEO', 'COO'].includes(currentUser.role)
    ? await prisma.report.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      })
    : []

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow border h-fit">
          <h2 className="text-xl font-bold mb-4">Submit New Report</h2>
          <form action={submitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Title</label>
              <input type="text" name="title" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="WEEKLY_PLAN">Weekly Plan</option>
                <option value="MONTHLY_PLAN">Monthly Plan</option>
                <option value="WORK_DONE">Weekly Work-Done Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea name="content" required rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Submit Report</button>
          </form>
        </div>

        <div className="space-y-8">
          {allReports.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4">All Submitted Reports</h2>
              <ul className="space-y-4">
                {allReports.map(report => (
                  <li key={report.id} className="border p-4 rounded bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold">{report.title} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{report.type}</span></div>
                        <div className="text-sm text-gray-600">By: {report.user.name} | Status: {report.status}</div>
                      </div>
                      {report.status === 'SUBMITTED' && (
                        <form action={markReportReviewed.bind(null, report.id)}>
                          <button className="text-xs bg-green-500 text-white px-2 py-1 rounded">Mark Reviewed</button>
                        </form>
                      )}
                    </div>
                    <div className="text-sm whitespace-pre-wrap mt-2 pt-2 border-t text-gray-700">{report.content}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-xl font-bold mb-4">My Reports</h2>
            {myReports.length === 0 ? (
              <p className="text-gray-500 text-sm">No reports submitted.</p>
            ) : (
              <ul className="space-y-4">
                {myReports.map(report => (
                  <li key={report.id} className="border p-4 rounded bg-gray-50">
                    <div className="font-bold">{report.title} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{report.type}</span></div>
                    <div className="text-sm text-gray-600 mb-2">Status: {report.status}</div>
                    <div className="text-sm whitespace-pre-wrap pt-2 border-t text-gray-700">{report.content}</div>
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

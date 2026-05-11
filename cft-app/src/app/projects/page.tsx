import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { createProject, createTask, updateTaskStatus } from '@/app/actions/projects/actions'

export default async function ProjectsPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return <div className="p-8">Please select a user to login.</div>

  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        include: {
          assignee: true
        }
      }
    }
  })

  const users = await prisma.user.findMany()

  const canCreateProject = ['CEO', 'COO', 'CTO', 'PROJECT_HEAD'].includes(currentUser.role)
  const canCreateTask = ['CEO', 'COO', 'CTO', 'HEAD_OF_RESEARCH', 'PROJECT_HEAD'].includes(currentUser.role)

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects & Tasks</h1>
        <Link href="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {projects.map(project => (
            <div key={project.id} className="border p-6 rounded-lg shadow bg-white">
              <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>

              <h3 className="text-xl font-semibold mb-3">Tasks</h3>
              {project.tasks.length > 0 ? (
                <ul className="space-y-3">
                  {project.tasks.map(task => (
                    <li key={task.id} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">{task.title}</div>
                        <div className="text-sm text-gray-700">{task.description}</div>
                        <div className="text-sm text-gray-500 mt-1">Assigned to: {task.assignee.name}</div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                          task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>

                        {(currentUser.id === task.assigneeId || canCreateTask) && task.status !== 'DONE' && (
                          <form action={updateTaskStatus.bind(null, task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}>
                            <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600">
                              {task.status === 'TODO' ? 'Start Task' : 'Mark Done'}
                            </button>
                          </form>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No tasks assigned yet.</p>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-8">
          {canCreateTask && projects.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4">Assign New Task</h2>
              <form action={createTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <select name="projectId" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Title</label>
                  <input type="text" name="title" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select name="assigneeId" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Create Task</button>
              </form>
            </div>
          )}

          {canCreateProject && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              <form action={createProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Create Project</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

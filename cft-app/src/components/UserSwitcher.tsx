'use client'

import { useRouter } from 'next/navigation'
import { loginAs, logout } from '@/app/actions/auth'

import { User } from '@prisma/client'

export function UserSwitcher({ users, currentUser }: { users: User[], currentUser: User | null }) {
  const router = useRouter()

  const handleSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value
    if (userId) {
      await loginAs(userId)
    } else {
      await logout()
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-md mb-8">
      <span className="font-semibold">Current User:</span>
      <select
        value={currentUser?.id || ''}
        onChange={handleSwitch}
        className="border border-gray-300 rounded p-2"
      >
        <option value="">-- Not Logged In --</option>
        {users.map(u => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
    </div>
  )
}

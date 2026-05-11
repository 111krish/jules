'use server'

import { cookies } from 'next/headers'

export async function loginAs(userId: string) {
  cookies().set('auth_user_id', userId)
}

export async function logout() {
  cookies().delete('auth_user_id')
}

export async function getCurrentUserId() {
  return cookies().get('auth_user_id')?.value
}

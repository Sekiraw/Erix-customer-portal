/**
 * Pure role-checking helpers for use in client components and server actions.
 * These do NOT depend on Payload's request context — pass in `user.role` directly.
 */

import type { UserRole } from '@/access/roles'
import { STAFF_ROLES, MANAGER_ROLES } from '@/access/roles'

export type { UserRole }
export { STAFF_ROLES, MANAGER_ROLES }

export const isStaffRole = (role: UserRole | undefined | null): boolean => {
  if (!role) return false
  return (STAFF_ROLES as readonly string[]).includes(role)
}

export const isManagerRole = (role: UserRole | undefined | null): boolean => {
  if (!role) return false
  return (MANAGER_ROLES as readonly string[]).includes(role)
}

export const isClientRole = (role: UserRole | undefined | null): boolean =>
  role === 'client'

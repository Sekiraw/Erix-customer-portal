import type { Access } from 'payload'
import type { User } from '../payload-types'

export type UserRole = User['role']

/** Roles that can access internal/management features */
export const STAFF_ROLES = ['employee', 'manager', 'it_staff'] as const satisfies UserRole[]

/** Roles with elevated management privileges */
export const MANAGER_ROLES = ['manager', 'it_staff'] as const satisfies UserRole[]

// ---------------------------------------------------------------------------
// Payload Access functions — use these in collection / field `access` objects
// ---------------------------------------------------------------------------

/** Any authenticated user */
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)

/** Only employees, managers, or IT staff */
export const isStaff: Access = ({ req: { user } }) => {
  if (!user) return false
  return (STAFF_ROLES as readonly string[]).includes((user as User).role)
}

/** Only managers or IT staff */
export const isManager: Access = ({ req: { user } }) => {
  if (!user) return false
  return (MANAGER_ROLES as readonly string[]).includes((user as User).role)
}

/** Only clients */
export const isClient: Access = ({ req: { user } }) => {
  if (!user) return false
  return (user as User).role === 'client'
}

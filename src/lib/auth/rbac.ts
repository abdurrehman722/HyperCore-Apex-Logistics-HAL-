import { Role } from '@/types'

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 4,
  FLEET_MANAGER: 3,
  WAREHOUSE_OPS: 2,
  VIEWER: 1,
}

export const PERMISSIONS = {
  // Fleet
  VIEW_FLEET: ['SUPER_ADMIN', 'FLEET_MANAGER', 'VIEWER'],
  MANAGE_FLEET: ['SUPER_ADMIN', 'FLEET_MANAGER'],
  ASSIGN_VEHICLE: ['SUPER_ADMIN', 'FLEET_MANAGER'],

  // Bays
  VIEW_BAYS: ['SUPER_ADMIN', 'FLEET_MANAGER', 'WAREHOUSE_OPS', 'VIEWER'],
  MANAGE_BAYS: ['SUPER_ADMIN', 'FLEET_MANAGER', 'WAREHOUSE_OPS'],

  // Tasks
  VIEW_TASKS: ['SUPER_ADMIN', 'FLEET_MANAGER', 'WAREHOUSE_OPS', 'VIEWER'],
  CREATE_TASK: ['SUPER_ADMIN', 'FLEET_MANAGER', 'WAREHOUSE_OPS'],
  ASSIGN_TASK: ['SUPER_ADMIN', 'FLEET_MANAGER'],

  // Inventory
  VIEW_INVENTORY: ['SUPER_ADMIN', 'WAREHOUSE_OPS', 'VIEWER'],
  MANAGE_INVENTORY: ['SUPER_ADMIN', 'WAREHOUSE_OPS'],

  // Team
  VIEW_TEAM: ['SUPER_ADMIN', 'FLEET_MANAGER'],
  MANAGE_TEAM: ['SUPER_ADMIN'],
  CHANGE_ROLES: ['SUPER_ADMIN'],

  // Schema Forge
  VIEW_SCHEMA_FORGE: ['SUPER_ADMIN'],
  MANAGE_SCHEMA_FORGE: ['SUPER_ADMIN'],

  // Audit
  VIEW_AUDIT: ['SUPER_ADMIN', 'FLEET_MANAGER'],
  VERIFY_AUDIT: ['SUPER_ADMIN'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[]
  return allowedRoles.includes(role)
}

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN': return 'danger'
    case 'FLEET_MANAGER': return 'warning'
    case 'WAREHOUSE_OPS': return 'primary'
    case 'VIEWER': return 'default'
  }
}

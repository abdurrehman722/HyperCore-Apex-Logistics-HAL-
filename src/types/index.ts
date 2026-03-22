// ========================
// CORE DOMAIN TYPES
// ========================

export type Role = 'SUPER_ADMIN' | 'FLEET_MANAGER' | 'WAREHOUSE_OPS' | 'VIEWER'
export type VehicleType = 'TRUCK' | 'VAN' | 'FORKLIFT' | 'CARGO_BIKE'
export type VehicleStatus = 'IDLE' | 'EN_ROUTE' | 'LOADING' | 'MAINTENANCE' | 'OFFLINE'
export type BayStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
export type TaskType = 'DELIVERY' | 'PICKUP' | 'LOADING' | 'UNLOADING' | 'INSPECTION'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// ========================
// USER / AUTH
// ========================

export interface UserProfile {
  id: string
  name: string
  email: string
  role: Role
  department?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

// ========================
// REAL-TIME (Firebase)
// ========================

export interface FleetVehicle {
  id: string
  plateNumber: string
  model: string
  type: VehicleType
  status: VehicleStatus
  driverName: string
  lat: number
  lng: number
  speed: number
  heading: number
  lastUpdate: number
  loadPercent: number
}

export interface RealtimeBay {
  id: string
  bayNumber: number
  zone: string
  status: BayStatus
  occupiedBy: string | null
  maxCapacity: number
  currentLoad: number
  lastUpdate: number
}

export interface RealtimeTask {
  id: string
  title: string
  type: TaskType
  status: TaskStatus
  priority: Priority
  vehicleId: string | null
  assignedTo: string | null
  destination: string
  eta: number | null
  createdAt: number
}

// ========================
// STATIC (PostgreSQL)
// ========================

export interface Vehicle {
  id: string
  plateNumber: string
  model: string
  type: VehicleType
  status: VehicleStatus
  driverName?: string
  driverId?: string
  loadCapacity: number
  currentLoad: number
  assignedBayId?: string
  createdAt: string
  updatedAt: string
}

export interface LoadingBay {
  id: string
  bayNumber: number
  zone: string
  status: BayStatus
  occupiedBy?: string
  maxCapacity: number
  currentLoad: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  description?: string
  category: string
  quantity: number
  unit: string
  warehouseZone: string
  minStock: number
  maxStock: number
  unitWeight: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: Priority
  assignedTo?: string
  vehicleId?: string
  bayId?: string
  scheduledAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// ========================
// AUDIT LEDGER
// ========================

export interface AuditEntry {
  id: string
  sequence: number
  actorId: string
  actorName: string
  actorRole: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  hash: string
  previousHash: string
  timestamp: string
  isVerified?: boolean
}

// ========================
// SCHEMA FORGE (MongoDB)
// ========================

export type FieldType = 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Array'

export interface SchemaField {
  name: string
  type: FieldType
  required: boolean
  unique: boolean
  default?: string
  ref?: string
}

export interface CustomSchema {
  id: string
  name: string
  description?: string
  provider: 'postgresql' | 'mongodb'
  fields: SchemaField[]
  createdBy: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// ========================
// API RESPONSES
// ========================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ========================
// DASHBOARD STATS
// ========================

export interface DashboardStats {
  fleetOnline: number
  fleetTotal: number
  baysOccupied: number
  baysTotal: number
  activeTasks: number
  pendingTasks: number
  inventoryAlerts: number
  teamOnline: number
}

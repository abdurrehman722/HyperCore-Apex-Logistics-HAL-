/**
 * Firebase RTDB Seed Script
 * Run this to populate initial real-time data for fleet, bays, and tasks
 */
import { ref, set } from 'firebase/database'
import { rtdb } from './client'

export async function seedFirebaseData() {
  // Seed fleet positions
  const fleetData = {
    'VH-001': {
      id: 'VH-001',
      plateNumber: 'HAL-001',
      model: 'Volvo FH16',
      type: 'TRUCK',
      status: 'EN_ROUTE',
      driverName: 'Marcus Chen',
      lat: 1.3521,
      lng: 103.8198,
      speed: 65,
      heading: 45,
      lastUpdate: Date.now(),
      loadPercent: 78,
    },
    'VH-002': {
      id: 'VH-002',
      plateNumber: 'HAL-002',
      model: 'Mercedes Actros',
      type: 'TRUCK',
      status: 'IDLE',
      driverName: 'Sarah Okonkwo',
      lat: 1.3644,
      lng: 103.8302,
      speed: 0,
      heading: 180,
      lastUpdate: Date.now(),
      loadPercent: 0,
    },
    'VH-003': {
      id: 'VH-003',
      plateNumber: 'HAL-003',
      model: 'Ford Transit',
      type: 'VAN',
      status: 'LOADING',
      driverName: 'Raj Patel',
      lat: 1.3456,
      lng: 103.8145,
      speed: 0,
      heading: 270,
      lastUpdate: Date.now(),
      loadPercent: 45,
    },
    'VH-004': {
      id: 'VH-004',
      plateNumber: 'HAL-004',
      model: 'Toyota Hilux',
      type: 'VAN',
      status: 'EN_ROUTE',
      driverName: 'Aisha Obi',
      lat: 1.3589,
      lng: 103.8421,
      speed: 52,
      heading: 90,
      lastUpdate: Date.now(),
      loadPercent: 92,
    },
    'VH-005': {
      id: 'VH-005',
      plateNumber: 'HAL-005',
      model: 'Komatsu FG25',
      type: 'FORKLIFT',
      status: 'IDLE',
      driverName: 'Lee Jae-won',
      lat: 1.3510,
      lng: 103.8200,
      speed: 0,
      heading: 0,
      lastUpdate: Date.now(),
      loadPercent: 0,
    },
  }

  // Seed loading bays
  const bayData: Record<string, object> = {}
  const bayStatuses = ['AVAILABLE', 'OCCUPIED', 'OCCUPIED', 'AVAILABLE', 'MAINTENANCE', 'AVAILABLE', 'OCCUPIED', 'AVAILABLE', 'AVAILABLE', 'OCCUPIED', 'AVAILABLE', 'MAINTENANCE']
  const zones = ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C']
  
  for (let i = 1; i <= 12; i++) {
    const status = bayStatuses[i - 1]
    bayData[`BAY-${String(i).padStart(2, '0')}`] = {
      id: `BAY-${String(i).padStart(2, '0')}`,
      bayNumber: i,
      zone: zones[i - 1],
      status,
      occupiedBy: status === 'OCCUPIED' ? `VH-00${Math.ceil(i / 3)}` : null,
      maxCapacity: 30000,
      currentLoad: status === 'OCCUPIED' ? Math.floor(Math.random() * 25000) + 5000 : 0,
      lastUpdate: Date.now(),
    }
  }

  // Seed active tasks
  const taskData = {
    'TASK-001': {
      id: 'TASK-001',
      title: 'Deliver Electronics Batch #4421',
      type: 'DELIVERY',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      vehicleId: 'VH-001',
      assignedTo: 'Marcus Chen',
      destination: 'Changi Industrial Park, Block 7',
      eta: Date.now() + 45 * 60 * 1000,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    'TASK-002': {
      id: 'TASK-002',
      title: 'Pickup: Warehouse B → Distribution Hub',
      type: 'PICKUP',
      status: 'PENDING',
      priority: 'MEDIUM',
      vehicleId: null,
      assignedTo: null,
      destination: 'Distribution Hub Alpha',
      eta: null,
      createdAt: Date.now() - 30 * 60 * 1000,
    },
    'TASK-003': {
      id: 'TASK-003',
      title: 'Unload Container #CT-8821',
      type: 'UNLOADING',
      status: 'IN_PROGRESS',
      priority: 'CRITICAL',
      vehicleId: 'VH-003',
      assignedTo: 'Raj Patel',
      destination: 'Bay 03',
      eta: Date.now() + 20 * 60 * 1000,
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
    },
  }

  try {
    await set(ref(rtdb, 'fleet'), fleetData)
    await set(ref(rtdb, 'bays'), bayData)
    await set(ref(rtdb, 'tasks'), taskData)
    await set(ref(rtdb, 'system/lastSeed'), Date.now())
    console.log('Firebase RTDB seeded successfully')
  } catch (error) {
    console.error('Firebase seed error:', error)
  }
}

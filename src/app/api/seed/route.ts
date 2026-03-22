import { NextRequest, NextResponse } from 'next/server'
import { seedFirebaseData } from '@/lib/firebase/seed'
import { userRepository } from '@/lib/repositories/postgres/PostgresUserRepository'
import { inventoryRepository } from '@/lib/repositories/postgres/PostgresInventoryRepository'
import { logAuditEvent } from '@/lib/audit/ledger'

const sampleInventory = [
  { sku: 'ELEC-001', name: 'Industrial Servo Motor', category: 'Electronics', quantity: 45, unit: 'units', warehouseZone: 'A', minStock: 10, maxStock: 100, unitWeight: 3.2, description: 'High-torque servo for assembly lines' },
  { sku: 'ELEC-002', name: 'Control Panel Board', category: 'Electronics', quantity: 8, unit: 'units', warehouseZone: 'A', minStock: 15, maxStock: 60, unitWeight: 1.5, description: 'PLC control board v2.4' },
  { sku: 'MECH-001', name: 'Heavy Duty Bearing Set', category: 'Mechanical', quantity: 200, unit: 'sets', warehouseZone: 'B', minStock: 50, maxStock: 500, unitWeight: 0.8, description: '62mm bearing assemblies' },
  { sku: 'MECH-002', name: 'Hydraulic Cylinder 200mm', category: 'Mechanical', quantity: 12, unit: 'units', warehouseZone: 'B', minStock: 5, maxStock: 30, unitWeight: 8.5, description: 'Double-acting hydraulic cylinder' },
  { sku: 'CHEM-001', name: 'Industrial Lubricant 5L', category: 'Chemicals', quantity: 85, unit: 'cans', warehouseZone: 'C', minStock: 20, maxStock: 150, unitWeight: 5.2, description: 'Multi-purpose machine lubricant' },
  { sku: 'SAFE-001', name: 'Safety Harness Kit', category: 'Safety', quantity: 6, unit: 'kits', warehouseZone: 'D', minStock: 10, maxStock: 40, unitWeight: 2.1, description: 'EN361 certified harness' },
  { sku: 'PACK-001', name: 'Industrial Strapping Roll', category: 'Packaging', quantity: 150, unit: 'rolls', warehouseZone: 'C', minStock: 30, maxStock: 300, unitWeight: 4.0, description: '19mm polyester strapping' },
  { sku: 'ELEC-003', name: 'Variable Speed Drive 15kW', category: 'Electronics', quantity: 3, unit: 'units', warehouseZone: 'A', minStock: 5, maxStock: 20, unitWeight: 12.0, description: 'ABB ACS550 series VSD' },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = body?.type ?? 'all'

    if (type === 'firebase' || type === 'all') {
      await seedFirebaseData()
    }

    if (type === 'inventory' || type === 'all') {
      const existingItems = await inventoryRepository.getAllItems()
      if (existingItems.length === 0) {
        for (const item of sampleInventory) {
          await inventoryRepository.createItem(item)
        }
      }
    }

    if (type === 'admin' || type === 'all') {
      const existingAdmin = await userRepository.getUserByEmail('admin@hal.corp')
      if (!existingAdmin) {
        const admin = await userRepository.createUser({
          name: 'System Administrator',
          email: 'admin@hal.corp',
          password: 'admin123',
          role: 'SUPER_ADMIN',
          department: 'IT Operations',
          isActive: true,
        })

        await logAuditEvent({
          actorId: admin.id,
          actorName: admin.name,
          actorRole: admin.role,
          action: 'SYSTEM_INIT',
          entityType: 'SYSTEM',
          entityName: 'HAL Platform',
          metadata: { version: '1.0.0', seedType: type },
        })
      }
    }

    return NextResponse.json({ success: true, message: `Seeded: ${type}` })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Seed failed'
    console.error('[Seed]', err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

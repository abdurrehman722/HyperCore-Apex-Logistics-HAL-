import { ref, get, set, update, onValue, off } from 'firebase/database'
import { rtdb } from '@/lib/firebase/client'
import { IFleetRepository } from '../interfaces/IFleetRepository'
import { FleetVehicle, VehicleStatus } from '@/types'

export class FirebaseFleetRepository implements IFleetRepository {
  private basePath = 'fleet'

  async getAllVehicles(): Promise<Record<string, FleetVehicle>> {
    const snapshot = await get(ref(rtdb, this.basePath))
    return snapshot.exists() ? snapshot.val() : {}
  }

  async getVehicle(id: string): Promise<FleetVehicle | null> {
    const snapshot = await get(ref(rtdb, `${this.basePath}/${id}`))
    return snapshot.exists() ? snapshot.val() : null
  }

  async updateVehicleStatus(id: string, status: VehicleStatus): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${id}`), {
      status,
      lastUpdate: Date.now(),
    })
  }

  async updateVehiclePosition(id: string, lat: number, lng: number, speed: number): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${id}`), {
      lat,
      lng,
      speed,
      lastUpdate: Date.now(),
    })
  }

  async assignVehicle(vehicleId: string, taskId: string): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${vehicleId}`), {
      assignedTaskId: taskId,
      status: 'EN_ROUTE',
      lastUpdate: Date.now(),
    })
  }

  async unassignVehicle(vehicleId: string): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${vehicleId}`), {
      assignedTaskId: null,
      status: 'IDLE',
      lastUpdate: Date.now(),
    })
  }

  subscribeToFleet(callback: (vehicles: Record<string, FleetVehicle>) => void): () => void {
    const fleetRef = ref(rtdb, this.basePath)
    const handler = onValue(fleetRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : {})
    })
    return () => off(fleetRef, 'value', handler)
  }
}

// Singleton export
export const fleetRepository: IFleetRepository = new FirebaseFleetRepository()

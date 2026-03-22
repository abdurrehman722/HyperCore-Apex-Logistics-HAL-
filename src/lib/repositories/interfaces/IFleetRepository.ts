import { FleetVehicle, VehicleStatus } from '@/types'

export interface IFleetRepository {
  getAllVehicles(): Promise<Record<string, FleetVehicle>>
  getVehicle(id: string): Promise<FleetVehicle | null>
  updateVehicleStatus(id: string, status: VehicleStatus): Promise<void>
  updateVehiclePosition(id: string, lat: number, lng: number, speed: number): Promise<void>
  assignVehicle(vehicleId: string, taskId: string): Promise<void>
  unassignVehicle(vehicleId: string): Promise<void>
  subscribeToFleet(callback: (vehicles: Record<string, FleetVehicle>) => void): () => void
}

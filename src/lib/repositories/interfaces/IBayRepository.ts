import { RealtimeBay, BayStatus } from '@/types'

export interface IBayRepository {
  getAllBays(): Promise<Record<string, RealtimeBay>>
  getBay(id: string): Promise<RealtimeBay | null>
  updateBayStatus(id: string, status: BayStatus, occupiedBy?: string | null): Promise<void>
  subscribeToBays(callback: (bays: Record<string, RealtimeBay>) => void): () => void
}

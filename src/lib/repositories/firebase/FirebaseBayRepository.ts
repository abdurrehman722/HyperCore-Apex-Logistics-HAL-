import { ref, get, update, onValue, off } from 'firebase/database'
import { rtdb } from '@/lib/firebase/client'
import { IBayRepository } from '../interfaces/IBayRepository'
import { RealtimeBay, BayStatus } from '@/types'

export class FirebaseBayRepository implements IBayRepository {
  private basePath = 'bays'

  async getAllBays(): Promise<Record<string, RealtimeBay>> {
    const snapshot = await get(ref(rtdb, this.basePath))
    return snapshot.exists() ? snapshot.val() : {}
  }

  async getBay(id: string): Promise<RealtimeBay | null> {
    const snapshot = await get(ref(rtdb, `${this.basePath}/${id}`))
    return snapshot.exists() ? snapshot.val() : null
  }

  async updateBayStatus(id: string, status: BayStatus, occupiedBy?: string | null): Promise<void> {
    await update(ref(rtdb, `${this.basePath}/${id}`), {
      status,
      occupiedBy: occupiedBy ?? null,
      currentLoad: status === 'AVAILABLE' ? 0 : undefined,
      lastUpdate: Date.now(),
    })
  }

  subscribeToBays(callback: (bays: Record<string, RealtimeBay>) => void): () => void {
    const baysRef = ref(rtdb, this.basePath)
    const handler = onValue(baysRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.val() : {})
    })
    return () => off(baysRef, 'value', handler)
  }
}

export const bayRepository: IBayRepository = new FirebaseBayRepository()

'use client'

import { useState, useEffect } from 'react'
import { bayRepository } from '@/lib/repositories/firebase/FirebaseBayRepository'
import { RealtimeBay } from '@/types'

export function useBays() {
  const [bays, setBays] = useState<Record<string, RealtimeBay>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = bayRepository.subscribeToBays((data) => {
      setBays(data)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  const bayList = Object.values(bays).sort((a, b) => a.bayNumber - b.bayNumber)
  const availableCount = bayList.filter(b => b.status === 'AVAILABLE').length
  const occupiedCount = bayList.filter(b => b.status === 'OCCUPIED').length
  const maintenanceCount = bayList.filter(b => b.status === 'MAINTENANCE').length

  return { bays, bayList, isLoading, availableCount, occupiedCount, maintenanceCount }
}

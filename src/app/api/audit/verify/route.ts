import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { auditLedger } from '@/lib/audit/ledger'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const result = await auditLedger.verifyChain()
    return NextResponse.json({ success: true, result })
  } catch {
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}

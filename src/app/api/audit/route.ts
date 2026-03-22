import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { auditLedger } from '@/lib/audit/ledger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const [entries, total] = await Promise.all([
      auditLedger.getEntries(100, 0),
      auditLedger.getTotalCount(),
    ])

    return NextResponse.json({ success: true, data: entries, total })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch audit log' }, { status: 500 })
  }
}

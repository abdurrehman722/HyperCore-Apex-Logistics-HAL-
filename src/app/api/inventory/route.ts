import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { inventoryRepository } from '@/lib/repositories/postgres/PostgresInventoryRepository'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const items = await inventoryRepository.getAllItems()
    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const item = await inventoryRepository.createItem(body)
    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

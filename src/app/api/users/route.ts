import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { userRepository } from '@/lib/repositories/postgres/PostgresUserRepository'
import { logAuditEvent } from '@/lib/audit/ledger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const users = await userRepository.getAllUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const actor = session.user as { id: string; name: string; role: string }
    if (actor.role !== 'SUPER_ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { name, email, password, role, department } = body
    if (!name || !email || !password) return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })

    const user = await userRepository.createUser({ name, email, password, role: role ?? 'VIEWER', department, isActive: true })

    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name ?? 'Admin',
      actorRole: actor.role,
      action: 'CREATE_USER',
      entityType: 'USER',
      entityId: user.id,
      entityName: user.email,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { userRepository } from '@/lib/repositories/postgres/PostgresUserRepository'
import { logAuditEvent } from '@/lib/audit/ledger'
import { Role } from '@/types'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const actor = session.user as { id: string; name: string; role: string }
    if (actor.role !== 'SUPER_ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { role } = await req.json()
    await userRepository.updateUserRole(params.id, role as Role)

    const targetUser = await userRepository.getUserById(params.id)

    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name ?? 'Admin',
      actorRole: actor.role,
      action: `ROLE_CHANGE → ${role}`,
      entityType: 'USER',
      entityId: params.id,
      entityName: targetUser?.email,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

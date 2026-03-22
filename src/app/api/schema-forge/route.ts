import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import connectMongoDB from '@/lib/mongodb/client'
import CustomSchemaModel from '@/lib/mongodb/models/CustomSchema'
import { logAuditEvent } from '@/lib/audit/ledger'
import { CustomSchema } from '@/types'

function toCustomSchema(doc: {
  _id: { toString(): string }
  name: string
  description?: string
  provider: 'postgresql' | 'mongodb'
  fields: unknown[]
  createdBy: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): CustomSchema {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    provider: doc.provider,
    fields: doc.fields as CustomSchema['fields'],
    createdBy: doc.createdBy,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    await connectMongoDB()
    const schemas = await CustomSchemaModel.find({}).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: schemas.map(toCustomSchema) })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch schemas' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const actor = session.user as { id: string; name: string; role: string }
    if (actor.role !== 'SUPER_ADMIN') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { name, description, provider, fields } = body

    await connectMongoDB()
    const schema = await CustomSchemaModel.create({
      name, description, provider, fields, createdBy: actor.id,
    })

    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name ?? 'Admin',
      actorRole: actor.role,
      action: 'PROVISION_SCHEMA',
      entityType: 'SCHEMA',
      entityId: schema._id.toString(),
      entityName: name,
      metadata: { provider, fieldCount: fields.length },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json({ success: true, data: toCustomSchema(schema) }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

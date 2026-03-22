'use client'

import { useState, useEffect } from 'react'
import { CustomSchema, SchemaField, FieldType } from '@/types'
import { Button, Input, Select, SelectItem, Switch, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Skeleton } from '@nextui-org/react'
import { Database, Plus, Trash2, Code2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const FIELD_TYPES: FieldType[] = ['String', 'Number', 'Boolean', 'Date', 'ObjectId', 'Array']

const emptyField = (): SchemaField => ({
  name: '',
  type: 'String',
  required: false,
  unique: false,
})

export default function SchemaForgePage() {
  const [schemas, setSchemas] = useState<CustomSchema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [schemaName, setSchemaName] = useState('')
  const [schemaDesc, setSchemaDesc] = useState('')
  const [provider, setProvider] = useState<'postgresql' | 'mongodb'>('mongodb')
  const [fields, setFields] = useState<SchemaField[]>([emptyField()])
  const [isCreating, setIsCreating] = useState(false)
  const [previewSchema, setPreviewSchema] = useState<CustomSchema | null>(null)

  const fetchSchemas = async () => {
    try {
      const res = await fetch('/api/schema-forge')
      const data = await res.json()
      if (data.success) setSchemas(data.data)
    } catch { toast.error('Failed to load schemas') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchSchemas() }, [])

  const addField = () => setFields(prev => [...prev, emptyField()])

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f))
  }

  const removeField = (index: number) => {
    setFields(prev => prev.filter((_, i) => i !== index))
  }

  const generatePreview = () => {
    const validFields = fields.filter(f => f.name.trim())
    if (provider === 'mongodb') {
      const schema: Record<string, unknown> = {}
      validFields.forEach(f => {
        schema[f.name] = {
          type: f.type,
          required: f.required,
          unique: f.unique || undefined,
        }
      })
      return JSON.stringify({ [schemaName]: schema }, null, 2)
    } else {
      const cols = validFields.map(f => {
        const typeMap: Record<FieldType, string> = {
          String: 'TEXT', Number: 'NUMERIC', Boolean: 'BOOLEAN',
          Date: 'TIMESTAMP', ObjectId: 'TEXT', Array: 'JSONB'
        }
        return `  ${f.name.padEnd(20)} ${typeMap[f.type]}${f.required ? ' NOT NULL' : ''}${f.unique ? ' UNIQUE' : ''}`
      })
      return `CREATE TABLE "${schemaName.toLowerCase().replace(/\s+/g, '_')}" (\n  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,\n${cols.join(',\n')},\n  created_at TIMESTAMP DEFAULT NOW()\n);`
    }
  }

  const handleCreate = async () => {
    const validFields = fields.filter(f => f.name.trim())
    if (!schemaName || validFields.length === 0) {
      toast.error('Schema name and at least one field required')
      return
    }
    setIsCreating(true)
    try {
      const res = await fetch('/api/schema-forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: schemaName, description: schemaDesc, provider, fields: validFields }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Schema "${schemaName}" provisioned!`)
        fetchSchemas()
        onClose()
        setSchemaName(''); setSchemaDesc(''); setFields([emptyField()])
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } catch { toast.error('Server error') }
    finally { setIsCreating(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-[#7c3aed]" />
            <h1 className="text-xl font-bold text-white">Schema Forge</h1>
            <Chip size="sm" variant="flat" className="bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 font-mono text-[10px]">
              ADMIN ONLY
            </Chip>
          </div>
          <p className="text-sm text-slate-400">Architect and provision custom database schemas</p>
        </div>
        <Button onPress={onOpen} className="bg-[#7c3aed] text-white font-semibold" startContent={<Plus className="w-4 h-4" />}>
          New Schema
        </Button>
      </div>

      {/* Existing Schemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-[#1e2d4a]" />
          ))
        ) : schemas.length === 0 ? (
          <div className="col-span-3 hal-card p-12 text-center">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-1">No custom schemas provisioned yet</p>
            <p className="text-xs text-slate-600">Design your first schema to extend the data model</p>
          </div>
        ) : (
          schemas.map(schema => (
            <div key={schema.id} className="hal-card p-5 hover:border-[#7c3aed]/30 transition-colors cursor-pointer" onClick={() => setPreviewSchema(schema)}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{schema.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{schema.description}</p>
                </div>
                <Chip size="sm" variant="flat" color={schema.provider === 'mongodb' ? 'success' : 'primary'} className="font-mono text-[9px]">
                  {schema.provider}
                </Chip>
              </div>
              <div className="space-y-1 mb-3">
                {schema.fields.slice(0, 3).map(f => (
                  <div key={f.name} className="flex items-center gap-2 text-xs">
                    <Code2 className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-300 font-mono">{f.name}</span>
                    <span className="text-slate-500">{f.type}</span>
                    {f.required && <Chip size="sm" color="warning" variant="flat" className="text-[8px] h-3 px-1">REQ</Chip>}
                  </div>
                ))}
                {schema.fields.length > 3 && (
                  <p className="text-xs text-slate-600">+{schema.fields.length - 3} more fields</p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#1e2d4a]">
                <CheckCircle className="w-3 h-3 text-[#00ff88]" />
                <span className="text-[10px] text-[#00ff88] font-mono">ACTIVE</span>
                <span className="text-[10px] text-slate-600 ml-auto font-mono">
                  {new Date(schema.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Schema Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="bg-[#0f1629] border border-[#1e2d4a]" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#7c3aed]" />
            Provision New Schema
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Schema Name"
                  placeholder="CustomerOrders"
                  value={schemaName}
                  onChange={e => setSchemaName(e.target.value)}
                  classNames={{ input: 'bg-[#060910] text-white', inputWrapper: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
                />
                <Select
                  label="Database Provider"
                  selectedKeys={[provider]}
                  onSelectionChange={(keys) => setProvider(Array.from(keys)[0] as 'postgresql' | 'mongodb')}
                  classNames={{ trigger: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
                >
                  <SelectItem key="mongodb">MongoDB (Flexible)</SelectItem>
                  <SelectItem key="postgresql">PostgreSQL (Relational)</SelectItem>
                </Select>
              </div>
              <Input
                label="Description"
                placeholder="Schema description..."
                value={schemaDesc}
                onChange={e => setSchemaDesc(e.target.value)}
                classNames={{ input: 'bg-[#060910] text-white', inputWrapper: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-300 font-medium">Fields</p>
                  <Button size="sm" variant="flat" onPress={addField} className="text-[#7c3aed]" startContent={<Plus className="w-3 h-3" />}>
                    Add Field
                  </Button>
                </div>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-[#060910] rounded-lg border border-[#1e2d4a]">
                      <Input
                        size="sm"
                        placeholder="fieldName"
                        value={field.name}
                        onChange={e => updateField(index, { name: e.target.value })}
                        classNames={{ input: 'text-white font-mono text-xs', inputWrapper: 'bg-[#0f1629] border-[#1e2d4a] h-8' }}
                        className="flex-1"
                      />
                      <Select
                        size="sm"
                        aria-label="Field type"
                        selectedKeys={[field.type]}
                        onSelectionChange={(keys) => updateField(index, { type: Array.from(keys)[0] as FieldType })}
                        classNames={{ trigger: 'bg-[#0f1629] border-[#1e2d4a] h-8 min-h-0', mainWrapper: 'w-28' }}
                      >
                        {FIELD_TYPES.map(t => <SelectItem key={t}>{t}</SelectItem>)}
                      </Select>
                      <Switch
                        size="sm"
                        isSelected={field.required}
                        onValueChange={v => updateField(index, { required: v })}
                        classNames={{ label: 'text-xs text-slate-500' }}
                      >
                        Req
                      </Switch>
                      <Switch
                        size="sm"
                        isSelected={field.unique}
                        onValueChange={v => updateField(index, { unique: v })}
                        classNames={{ label: 'text-xs text-slate-500' }}
                      >
                        Uniq
                      </Switch>
                      <button onClick={() => removeField(index)} className="text-slate-500 hover:text-[#ff3366] transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SQL/Schema Preview */}
              {schemaName && fields.some(f => f.name) && (
                <div>
                  <p className="text-xs text-slate-500 mb-2 font-mono">GENERATED {provider === 'mongodb' ? 'SCHEMA' : 'SQL'}</p>
                  <pre className="bg-[#060910] border border-[#1e2d4a] rounded-lg p-4 text-xs font-mono text-[#00d4ff] overflow-auto max-h-40">
                    {generatePreview()}
                  </pre>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} className="text-slate-400">Cancel</Button>
            <Button
              onPress={handleCreate}
              isLoading={isCreating}
              className="bg-[#7c3aed] text-white"
              isDisabled={!schemaName || !fields.some(f => f.name)}
            >
              Provision Schema
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Schema Preview Modal */}
      {previewSchema && (
        <Modal isOpen={!!previewSchema} onClose={() => setPreviewSchema(null)} size="lg" className="bg-[#0f1629] border border-[#1e2d4a]">
          <ModalContent>
            <ModalHeader className="text-white">{previewSchema.name}</ModalHeader>
            <ModalBody>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Chip size="sm" color={previewSchema.provider === 'mongodb' ? 'success' : 'primary'} variant="flat">{previewSchema.provider}</Chip>
                  <Chip size="sm" color="success" variant="flat">Active</Chip>
                </div>
                <p className="text-xs text-slate-400">{previewSchema.description}</p>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500 uppercase">Fields</p>
                  {previewSchema.fields.map(f => (
                    <div key={f.name} className="flex items-center gap-2 p-2 bg-[#060910] rounded border border-[#1e2d4a]">
                      <Code2 className="w-3 h-3 text-[#7c3aed]" />
                      <span className="text-sm font-mono text-white">{f.name}</span>
                      <span className="text-xs text-slate-500 ml-1">{f.type}</span>
                      {f.required && <Chip size="sm" color="warning" variant="flat" className="text-[9px] h-4 ml-auto">REQUIRED</Chip>}
                      {f.unique && <Chip size="sm" color="primary" variant="flat" className="text-[9px] h-4">UNIQUE</Chip>}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600 font-mono">Created: {new Date(previewSchema.createdAt).toLocaleString()}</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setPreviewSchema(null)}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}

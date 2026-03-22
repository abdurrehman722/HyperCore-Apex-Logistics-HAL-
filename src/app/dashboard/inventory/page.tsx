'use client'

import { useState, useEffect } from 'react'
import { InventoryItem } from '@/types'
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, useDisclosure, Skeleton, Progress } from '@nextui-org/react'
import { Package, Plus, AlertTriangle, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [form, setForm] = useState({ sku: '', name: '', category: '', quantity: 0, unit: 'units', warehouseZone: 'A', minStock: 10, maxStock: 100, unitWeight: 1, description: '' })
  const [isCreating, setIsCreating] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory')
      const data = await res.json()
      if (data.success) setItems(data.data)
    } catch { toast.error('Failed to load inventory') }
    finally { setIsLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter(i => i.quantity <= i.minStock)

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Item added to inventory')
        fetchItems()
        onClose()
      } else {
        toast.error(data.error ?? 'Failed')
      }
    } catch { toast.error('Server error') }
    finally { setIsCreating(false) }
  }

  const handleSeedInventory = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'inventory' }) })
      const data = await res.json()
      if (data.success) { toast.success('Sample inventory loaded'); fetchItems() }
      else toast.error(data.error)
    } catch { toast.error('Seed failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#00d4ff]" />
            <h1 className="text-xl font-bold text-white">Warehouse Inventory</h1>
          </div>
          <p className="text-sm text-slate-400">Stock management and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" className="text-slate-400" onPress={handleSeedInventory}>
            Load Sample Data
          </Button>
          <Button onPress={onOpen} className="bg-[#00d4ff] text-black font-semibold" startContent={<Plus className="w-4 h-4" />}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats + alerts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="hal-card p-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Total SKUs</p>
          <p className="text-2xl font-bold font-mono text-white">{items.length}</p>
        </div>
        <div className={`hal-card p-4 ${lowStockItems.length > 0 ? 'border-[#ff3366]/30' : ''}`}>
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Low Stock Alerts</p>
          <p className={`text-2xl font-bold font-mono ${lowStockItems.length > 0 ? 'text-[#ff3366]' : 'text-[#00ff88]'}`}>
            {lowStockItems.length}
          </p>
        </div>
        <div className="hal-card p-4">
          <p className="text-xs text-slate-500 font-mono uppercase mb-1">Total Weight</p>
          <p className="text-2xl font-bold font-mono text-white">
            {(items.reduce((acc, i) => acc + i.quantity * i.unitWeight, 0) / 1000).toFixed(1)}t
          </p>
        </div>
      </div>

      {/* Low stock banner */}
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-[#ff3366]/5 border border-[#ff3366]/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-[#ff3366] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#ff3366]">{lowStockItems.length} items at low stock</p>
            <p className="text-xs text-slate-500">{lowStockItems.map(i => i.name).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Search by name, SKU or category..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        startContent={<Search className="w-4 h-4 text-slate-500" />}
        classNames={{
          input: 'bg-[#060910] text-white',
          inputWrapper: 'bg-[#060910] border-[#1e2d4a]',
        }}
      />

      {/* Table */}
      <div className="hal-card overflow-hidden">
        <Table
          aria-label="Inventory"
          removeWrapper
          classNames={{
            th: 'bg-[#060910] text-slate-400 text-xs font-mono border-b border-[#1e2d4a]',
            td: 'border-b border-[#1e2d4a]/40 py-2.5',
            tr: 'hover:bg-[#060910]/40 transition-colors',
          }}
        >
          <TableHeader>
            <TableColumn>SKU</TableColumn>
            <TableColumn>ITEM</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>ZONE</TableColumn>
            <TableColumn>STOCK</TableColumn>
            <TableColumn>WEIGHT/UNIT</TableColumn>
            <TableColumn>STATUS</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              <div className="py-10 text-slate-500 text-sm">
                {items.length === 0 ? 'No inventory items. Add items or load sample data.' : 'No items match your search.'}
              </div>
            }
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 rounded bg-[#1e2d4a]" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              filtered.map(item => {
                const stockPercent = Math.round((item.quantity / item.maxStock) * 100)
                const isLow = item.quantity <= item.minStock
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="text-xs font-mono text-[#00d4ff]">{item.sku}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-white">{item.name}</p>
                        {item.description && <p className="text-xs text-slate-500 truncate max-w-[180px]">{item.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default" className="text-xs">{item.category}</Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-slate-400">Zone {item.warehouseZone}</span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs font-mono text-white">{item.quantity}</span>
                          <span className="text-[10px] text-slate-500">{item.unit}</span>
                        </div>
                        <Progress
                          size="sm"
                          value={stockPercent}
                          color={isLow ? 'danger' : stockPercent < 50 ? 'warning' : 'success'}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-slate-400">{item.unitWeight}kg</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={isLow ? 'danger' : 'success'} variant="flat" className="text-[9px]">
                        {isLow ? 'LOW STOCK' : 'OK'}
                      </Chip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="bg-[#0f1629] border border-[#1e2d4a]">
        <ModalContent>
          <ModalHeader className="text-white">Add Inventory Item</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'sku', label: 'SKU', placeholder: 'ITEM-001' },
                { key: 'name', label: 'Item Name', placeholder: 'Industrial Widget' },
                { key: 'category', label: 'Category', placeholder: 'Electronics' },
                { key: 'unit', label: 'Unit', placeholder: 'units' },
              ].map(f => (
                <Input
                  key={f.key}
                  label={f.label}
                  placeholder={f.placeholder}
                  value={(form as Record<string, string | number>)[f.key] as string}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  classNames={{ input: 'bg-[#060910] text-white', inputWrapper: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
                />
              ))}
              {[
                { key: 'quantity', label: 'Current Qty', type: 'number' },
                { key: 'minStock', label: 'Min Stock', type: 'number' },
                { key: 'maxStock', label: 'Max Stock', type: 'number' },
                { key: 'unitWeight', label: 'Weight (kg)', type: 'number' },
              ].map(f => (
                <Input
                  key={f.key}
                  type="number"
                  label={f.label}
                  value={String((form as Record<string, string | number>)[f.key])}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  classNames={{ input: 'bg-[#060910] text-white', inputWrapper: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
                />
              ))}
              <Select
                label="Warehouse Zone"
                selectedKeys={[form.warehouseZone]}
                onSelectionChange={(keys) => setForm(prev => ({ ...prev, warehouseZone: Array.from(keys)[0] as string }))}
                classNames={{ trigger: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
              >
                {['A', 'B', 'C', 'D'].map(z => <SelectItem key={z}>Zone {z}</SelectItem>)}
              </Select>
              <Input
                label="Description"
                placeholder="Optional description"
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                classNames={{ input: 'bg-[#060910] text-white', inputWrapper: 'bg-[#060910] border-[#1e2d4a]', label: 'text-slate-400' }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} className="text-slate-400">Cancel</Button>
            <Button onPress={handleCreate} isLoading={isCreating} isDisabled={!form.sku || !form.name} className="bg-[#00d4ff] text-black">
              Add Item
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

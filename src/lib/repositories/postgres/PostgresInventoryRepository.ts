import { prisma } from '@/lib/prisma/client'
import { IInventoryRepository } from '../interfaces/IInventoryRepository'
import { InventoryItem } from '@/types'

function toInventoryItem(item: {
  id: string
  sku: string
  name: string
  description: string | null
  category: string
  quantity: number
  unit: string
  warehouseZone: string
  minStock: number
  maxStock: number
  unitWeight: number
  createdAt: Date
  updatedAt: Date
}): InventoryItem {
  return {
    ...item,
    description: item.description ?? undefined,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}

export class PostgresInventoryRepository implements IInventoryRepository {
  async getAllItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } })
    return items.map(toInventoryItem)
  }

  async getItemById(id: string): Promise<InventoryItem | null> {
    const item = await prisma.inventoryItem.findUnique({ where: { id } })
    return item ? toInventoryItem(item) : null
  }

  async getItemBySku(sku: string): Promise<InventoryItem | null> {
    const item = await prisma.inventoryItem.findUnique({ where: { sku } })
    return item ? toInventoryItem(item) : null
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: { quantity: { lte: prisma.inventoryItem.fields.minStock } },
    })
    return items.map(toInventoryItem)
  }

  async createItem(input: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const item = await prisma.inventoryItem.create({ data: input })
    return toInventoryItem(item)
  }

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = await prisma.inventoryItem.update({ where: { id }, data: updates })
    return toInventoryItem(item)
  }

  async updateQuantity(id: string, delta: number): Promise<void> {
    await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: { increment: delta } },
    })
  }

  async deleteItem(id: string): Promise<void> {
    await prisma.inventoryItem.delete({ where: { id } })
  }
}

export const inventoryRepository: IInventoryRepository = new PostgresInventoryRepository()

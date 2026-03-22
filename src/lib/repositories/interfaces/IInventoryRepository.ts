import { InventoryItem } from '@/types'

export interface IInventoryRepository {
  getAllItems(): Promise<InventoryItem[]>
  getItemById(id: string): Promise<InventoryItem | null>
  getItemBySku(sku: string): Promise<InventoryItem | null>
  getLowStockItems(): Promise<InventoryItem[]>
  createItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem>
  updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>
  updateQuantity(id: string, delta: number): Promise<void>
  deleteItem(id: string): Promise<void>
}

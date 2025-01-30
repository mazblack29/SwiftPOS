export interface Product {
  id: number
  name: string
  price: number
  image: string
  stock?: number
  category?: string
  sku?: string
  cost?: number
}

export interface InventoryItem {
  id: number
  productId: number
  quantity: number
  lastUpdated: string
  minimumStock: number
  location?: string
}

export interface JournalEntry {
  id: number
  date: string
  type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN'
  description: string
  amount: number
  items: JournalItem[]
  reference?: string
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'
}

export interface JournalItem {
  id: number
  productId: number
  quantity: number
  price: number
  subtotal: number
}

export interface SalesReport {
  startDate: string
  endDate: string
  totalSales: number
  totalItems: number
  transactions: JournalEntry[]
}

export interface SaleTransaction {
  id: string
  items: Product[]
  total: number
  timestamp: string
}

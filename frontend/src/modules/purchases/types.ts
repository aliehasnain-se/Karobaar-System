export type PurchaseStatus = 'Paid' | 'Partial' | 'Unpaid' | 'Cancelled'

export type PurchaseRoll = {
  id: number
  rollNumber: string
  barcode: string
}

export type PurchaseItem = {
  id: number
  fabricId: number
  fabric: string
  article: string
  color: string
  thaanQuantity: number
  metersPerThaan: number
  pricePerThaan: number
  totalMeters: number
  totalAmount: number
  rolls: PurchaseRoll[]
}

export type Purchase = {
  id: number
  number: string
  date: string
  supplierId: number
  supplier: string
  supplierPhone: string
  supplierInvoiceNumber: string
  thaans: number
  meters: number
  total: number
  paid: number
  balance: number
  status: PurchaseStatus
  items: PurchaseItem[]
}

export type PurchaseItemInput = {
  fabricId: number
  color: string
  thaanQuantity: number
  metersPerThaan: number
  pricePerThaan: number
}

export type PurchaseInput = {
  supplierId: number
  supplierInvoiceNumber: string
  purchaseDate: string
  paidAmount: number
  items: PurchaseItemInput[]
}

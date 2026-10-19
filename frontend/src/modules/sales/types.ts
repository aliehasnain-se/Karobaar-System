export type SaleStatus = 'Paid' | 'Partial' | 'Unpaid'

export type Sale = {
  id: number
  invoice: string
  date: string
  customer: string
  rolls: number
  meters: number
  total: number
  received: number
  status: SaleStatus
}

export type SaleItem = {
  rollId: number
  rollNumber: string
  barcode: string
  fabric: string
  article: string
  color: string
  meters: number
  saleType?: 'ROLL' | 'METER'
  availableMeters?: number
  soldMeters?: number
  pricePerMeter?: number
  price: number
}

export type SaleDetail = Sale & {
  customerPhone: string
  discount: number
  items: SaleItem[]
}

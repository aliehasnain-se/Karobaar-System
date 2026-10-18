export type PurchaseStatus = 'Paid' | 'Partial' | 'Unpaid'

export type Purchase = {
  id: number
  number: string
  date: string
  supplier: string
  rolls: number
  meters: number
  total: number
  paid: number
  status: PurchaseStatus
}

export type PurchaseItem = {
  id: number
  fabric: string
  color: string
  rollNumber: string
  quantity: number
  unit: 'Meter' | 'Yard'
  rate: number
}


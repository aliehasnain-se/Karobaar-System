export type Customer = {
  id: number
  businessName: string
  contactPerson: string
  phone: string
  city: string
  sales: number
  received: number
  lastSale: string
}

export type CustomerLedgerEntry = {
  id: number
  date: string
  reference: string
  description: string
  sale: number
  received: number
  balance: number
  type: 'Sale' | 'Payment' | 'Return'
}

export type Supplier = {
  id: number
  name: string
  contactPerson: string
  phone: string
  city: string
  purchases: number
  paid: number
  balance: number
  lastPurchase: string
}

export type SupplierInput = {
  name: string
  contactPerson: string
  phone: string
  city: string
}

export type SupplierPaymentInput = {
  amount: number
  paymentDate: string
  note: string
}

export type SupplierLedgerEntry = {
  id: number
  date: string
  reference: string
  description: string
  debit: number
  credit: number
  balance: number
  type: 'Purchase' | 'Payment' | 'Return'
}

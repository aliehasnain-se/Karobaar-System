export type ReturnRecord = {
  id: number
  number: string
  date: string
  invoice: string
  customer: string
  kind: 'Return' | 'Exchange'
  rolls: number
  amount: number
}

export type SoldRoll = {
  id: number
  rollNumber: string
  fabric: string
  color: string
  meters: number
  amount: number
}

export type ReturnableInvoice = {
  invoice: string
  date: string
  customer: string
  total: number
  items: SoldRoll[]
}

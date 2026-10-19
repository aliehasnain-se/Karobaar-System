import { apiFetch } from '../../../shared/api/client'
import type { Supplier, SupplierInput, SupplierLedgerEntry, SupplierPaymentInput } from '../types'

type SupplierApi = {
  id: number
  name: string
  contact_person: string
  phone: string
  city: string
  total_purchases: string
  total_paid: string
  balance: string
  last_purchase_date: string | null
}

type LedgerApi = {
  id: number
  entry_date: string
  reference: string
  note: string
  type_label: SupplierLedgerEntry['type']
  debit: string
  credit: string
  balance_after: string
}

const displayDate = (value: string | null) => value
  ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'No purchases yet'

const mapSupplier = (item: SupplierApi): Supplier => ({
  id: item.id,
  name: item.name,
  contactPerson: item.contact_person,
  phone: item.phone,
  city: item.city,
  purchases: Number(item.total_purchases),
  paid: Number(item.total_paid),
  balance: Number(item.balance),
  lastPurchase: displayDate(item.last_purchase_date),
})

const mapLedger = (item: LedgerApi): SupplierLedgerEntry => ({
  id: item.id,
  date: displayDate(item.entry_date),
  reference: item.reference,
  description: item.note || item.type_label,
  debit: Number(item.debit),
  credit: Number(item.credit),
  balance: Number(item.balance_after),
  type: item.type_label,
})

const supplierPayload = (input: SupplierInput) => ({
  name: input.name,
  contact_person: input.contactPerson,
  phone: input.phone,
  city: input.city,
})

export async function getSuppliers() {
  return (await apiFetch<SupplierApi[]>('/suppliers/')).map(mapSupplier)
}

export async function createSupplier(input: SupplierInput) {
  return mapSupplier(await apiFetch<SupplierApi>('/suppliers/', {
    method: 'POST',
    body: JSON.stringify(supplierPayload(input)),
  }))
}

export async function editSupplier(id: number, input: SupplierInput) {
  return mapSupplier(await apiFetch<SupplierApi>(`/suppliers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(supplierPayload(input)),
  }))
}

export async function getSupplierLedger(id: number) {
  return (await apiFetch<LedgerApi[]>(`/suppliers/${id}/ledger/`)).map(mapLedger)
}

export async function createSupplierPayment(id: number, input: SupplierPaymentInput) {
  return mapLedger(await apiFetch<LedgerApi>(`/suppliers/${id}/payments/`, {
    method: 'POST',
    body: JSON.stringify({ amount: input.amount, payment_date: input.paymentDate, note: input.note }),
  }))
}

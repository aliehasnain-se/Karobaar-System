import { apiFetch } from '../../../shared/api/client'
import type { Purchase, PurchaseInput, PurchaseStatus } from '../types'

type PurchaseApi = {
  id: number
  number: string
  supplier: number
  supplier_name: string
  supplier_phone: string
  supplier_invoice_number: string
  purchase_date: string
  total_thaans: number
  total_meters: string
  total_amount: string
  paid_amount: string
  balance: string
  status: PurchaseStatus
  items: Array<{
    id: number
    fabric_id: number
    fabric: string
    article: string
    color: string
    thaan_quantity: number
    meters_per_thaan: string
    price_per_thaan: string
    total_meters: string
    total_amount: string
    rolls: Array<{ id: number; roll_number: string; barcode: string }>
  }>
}

const displayDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const mapPurchase = (item: PurchaseApi): Purchase => ({
  id: item.id,
  number: item.number,
  date: displayDate(item.purchase_date),
  supplierId: item.supplier,
  supplier: item.supplier_name,
  supplierPhone: item.supplier_phone,
  supplierInvoiceNumber: item.supplier_invoice_number,
  thaans: item.total_thaans,
  meters: Number(item.total_meters),
  total: Number(item.total_amount),
  paid: Number(item.paid_amount),
  balance: Number(item.balance),
  status: item.status,
  items: item.items.map((line) => ({
    id: line.id,
    fabricId: line.fabric_id,
    fabric: line.fabric,
    article: line.article,
    color: line.color,
    thaanQuantity: line.thaan_quantity,
    metersPerThaan: Number(line.meters_per_thaan),
    pricePerThaan: Number(line.price_per_thaan),
    totalMeters: Number(line.total_meters),
    totalAmount: Number(line.total_amount),
    rolls: line.rolls.map((roll) => ({
      id: roll.id,
      rollNumber: roll.roll_number,
      barcode: roll.barcode,
    })),
  })),
})

export async function getPurchases() {
  return (await apiFetch<PurchaseApi[]>('/purchases/')).map(mapPurchase)
}

export async function getPurchase(number: string) {
  return mapPurchase(await apiFetch<PurchaseApi>(`/purchases/${number}/`))
}

export async function createPurchase(input: PurchaseInput) {
  return mapPurchase(
    await apiFetch<PurchaseApi>('/purchases/', {
      method: 'POST',
      body: JSON.stringify({
        supplier: input.supplierId,
        supplier_invoice_number: input.supplierInvoiceNumber,
        purchase_date: input.purchaseDate,
        paid_amount: input.paidAmount,
        items: input.items.map((item) => ({
          fabric_id: item.fabricId,
          color: item.color,
          thaan_quantity: item.thaanQuantity,
          meters_per_thaan: item.metersPerThaan,
          price_per_thaan: item.pricePerThaan,
        })),
      }),
    }),
  )
}

export async function cancelPurchase(number: string) {
  return mapPurchase(await apiFetch<PurchaseApi>(`/purchases/${number}/cancel/`, {
    method: 'POST',
  }))
}

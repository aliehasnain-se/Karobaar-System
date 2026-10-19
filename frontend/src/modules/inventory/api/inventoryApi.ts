import { apiFetch } from '../../../shared/api/client'
import type { Fabric, FabricInput, FabricRoll, OpeningStockInput, SellingPriceInput } from '../types'

type FabricApi = {
  id: number
  name: string
  article: string
  category: string
  brand: string
  colors: number
  rolls: number
  total_meters: string
}

type RollApi = {
  id: number
  barcode: string
  roll_number: string
  fabric_id: number
  fabric: string
  article: string
  brand: string
  color: string
  original_meters: string
  remaining_meters: string
  cost_total: string
  selling_price: string
  status: FabricRoll['statusCode']
  status_label: FabricRoll['status']
  purchase_item_id: number | null
  purchase_number: string | null
  supplier: string | null
  created_at: string
}

const mapFabric = (item: FabricApi): Fabric => ({
  id: item.id,
  name: item.name,
  article: item.article,
  category: item.category,
  brand: item.brand,
  colors: item.colors,
  rolls: item.rolls,
  totalMeters: Number(item.total_meters),
})

const mapRoll = (item: RollApi): FabricRoll => ({
  id: item.id,
  barcode: item.barcode,
  rollNumber: item.roll_number,
  fabricId: item.fabric_id,
  fabric: item.fabric,
  article: item.article,
  brand: item.brand,
  color: item.color,
  originalMeters: Number(item.original_meters),
  remainingMeters: Number(item.remaining_meters),
  costTotal: Number(item.cost_total),
  price: Number(item.selling_price),
  statusCode: item.status,
  status: item.status_label,
  purchaseItemId: item.purchase_item_id,
  purchaseNumber: item.purchase_number || '',
  supplier: item.supplier || '',
  createdAt: item.created_at,
})

export async function getFabrics() {
  return (await apiFetch<FabricApi[]>('/fabrics/')).map(mapFabric)
}

export async function createFabric(input: FabricInput) {
  return mapFabric(
    await apiFetch<FabricApi>('/fabrics/', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function getRolls() {
  return (await apiFetch<RollApi[]>('/rolls/')).map(mapRoll)
}

export async function updateSellingPrice(input: SellingPriceInput) {
  return apiFetch<{ updated_thaans: number; selling_price: string }>('/rolls/selling-price/', {
    method: 'POST',
    body: JSON.stringify({
      purchase_item_id: input.purchaseItemId || undefined,
      roll_id: input.purchaseItemId ? undefined : input.rollId,
      price: input.price,
    }),
  })
}

export async function createOpeningStock(input: OpeningStockInput) {
  const payload = {
    fabric_id: input.fabricId || null,
    fabric_name: input.fabricName || undefined,
    article: input.article || undefined,
    category: input.category || undefined,
    brand: input.brand || undefined,
    color: input.color,
    meters: input.meters,
    purchase_cost: input.purchaseCost,
    price: input.price,
    roll_number: input.rollNumber || undefined,
  }
  return mapRoll(
    await apiFetch<RollApi>('/inventory/opening-stock/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  )
}

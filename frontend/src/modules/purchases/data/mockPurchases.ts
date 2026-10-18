import type { Purchase, PurchaseDetail, PurchaseDetailItem } from '../types'

export const purchases: Purchase[] = [
  { id: 1, number: 'PUR-0108', date: '17 Oct 2026', supplier: 'Noor Fabrics', rolls: 8, meters: 628, total: 376800, paid: 200000, status: 'Partial' },
  { id: 2, number: 'PUR-0107', date: '16 Oct 2026', supplier: 'Classic Textiles', rolls: 5, meters: 392.5, total: 215875, paid: 215875, status: 'Paid' },
  { id: 3, number: 'PUR-0106', date: '15 Oct 2026', supplier: 'Punjab Mills', rolls: 12, meters: 946, total: 520300, paid: 0, status: 'Unpaid' },
  { id: 4, number: 'PUR-0105', date: '13 Oct 2026', supplier: 'Pak Loom', rolls: 6, meters: 471, total: 329700, paid: 329700, status: 'Paid' },
  { id: 5, number: 'PUR-0104', date: '11 Oct 2026', supplier: 'Noor Fabrics', rolls: 9, meters: 705, total: 401850, paid: 150000, status: 'Partial' },
]

const fabrics = [
  { fabric: 'Cotton Soft Finish', article: 'CT-205', color: 'White' },
  { fabric: 'Wash & Wear Premium', article: 'WW-101', color: 'Navy Blue' },
  { fabric: 'Khaddar Winter', article: 'KD-118', color: 'Charcoal' },
  { fabric: 'Linen Plain', article: 'LN-440', color: 'Beige' },
]

const makeItems = (purchase: Purchase): PurchaseDetailItem[] => Array.from({ length: purchase.rolls }, (_, index) => {
  const fabric = fabrics[index % fabrics.length]
  return {
    id: purchase.id * 100 + index,
    rollNumber: `R-${String(140 - purchase.id * 10 - index).padStart(4, '0')}`,
    barcode: `890201${String(purchase.id * 1000 + index).padStart(6, '0')}`,
    ...fabric,
    quantity: purchase.meters / purchase.rolls,
    unit: 'Meter',
    rate: purchase.total / purchase.meters,
  }
})

const supplierInfo: Record<string, { id: number; phone: string }> = {
  'Noor Fabrics': { id: 1, phone: '0300 1234567' },
  'Classic Textiles': { id: 2, phone: '0321 7654321' },
  'Punjab Mills': { id: 3, phone: '0333 4567890' },
  'Pak Loom': { id: 4, phone: '0301 9876543' },
}

export const purchaseDetails: PurchaseDetail[] = purchases.map((purchase) => ({
  ...purchase,
  supplierId: supplierInfo[purchase.supplier].id,
  supplierPhone: supplierInfo[purchase.supplier].phone,
  items: makeItems(purchase),
}))


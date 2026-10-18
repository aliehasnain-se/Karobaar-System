import type { Sale, SaleDetail, SaleItem } from '../types'

export const sales: Sale[] = [
  { id: 1, invoice: 'SAL-0128', date: '17 Oct 2026', customer: 'Madina Fabrics', rolls: 4, meters: 312, total: 187200, received: 120000, status: 'Partial' },
  { id: 2, invoice: 'SAL-0127', date: '17 Oct 2026', customer: 'Al-Rehman Cloth', rolls: 2, meters: 144, total: 82800, received: 82800, status: 'Paid' },
  { id: 3, invoice: 'SAL-0126', date: '16 Oct 2026', customer: 'Usman Traders', rolls: 6, meters: 465, total: 269700, received: 0, status: 'Unpaid' },
  { id: 4, invoice: 'SAL-0125', date: '15 Oct 2026', customer: 'New City Garments', rolls: 1, meters: 78, total: 46800, received: 46800, status: 'Paid' },
  { id: 5, invoice: 'SAL-0124', date: '14 Oct 2026', customer: 'Bismillah Fabrics', rolls: 3, meters: 231, total: 138600, received: 80000, status: 'Partial' },
]

const fabrics = [
  { fabric: 'Wash & Wear Premium', article: 'WW-101', color: 'Navy Blue' },
  { fabric: 'Cotton Soft Finish', article: 'CT-205', color: 'White' },
  { fabric: 'Boski Gold', article: 'BK-310', color: 'Cream' },
  { fabric: 'Linen Plain', article: 'LN-440', color: 'Beige' },
]

const makeItems = (sale: Sale): SaleItem[] => Array.from({ length: sale.rolls }, (_, index) => {
  const fabric = fabrics[index % fabrics.length]
  return {
    rollId: sale.id * 100 + index,
    rollNumber: `R-${String(119 - sale.id * 6 - index).padStart(4, '0')}`,
    barcode: `890101${String(sale.id * 1000 + index).padStart(6, '0')}`,
    ...fabric,
    meters: sale.meters / sale.rolls,
    price: sale.total / sale.rolls,
  }
})

const customerPhones: Record<string, string> = {
  'Madina Fabrics': '0300 4455667',
  'Al-Rehman Cloth': '0321 7788990',
  'Usman Traders': '0333 1122445',
  'New City Garments': '0301 6677889',
  'Bismillah Fabrics': '0345 2233445',
}

export const saleDetails: SaleDetail[] = sales.map((sale) => ({
  ...sale,
  customerPhone: customerPhones[sale.customer],
  discount: 0,
  items: makeItems(sale),
}))


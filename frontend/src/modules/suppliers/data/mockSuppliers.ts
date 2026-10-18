import type { Supplier, SupplierLedgerEntry } from '../types'

export const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Noor Fabrics', contactPerson: 'Muhammad Salman', phone: '0300 1234567', city: 'Faisalabad', purchases: 1285000, paid: 835000, lastPurchase: '17 Oct 2026' },
  { id: 2, name: 'Classic Textiles', contactPerson: 'Abdul Rehman', phone: '0321 7654321', city: 'Lahore', purchases: 960000, paid: 960000, lastPurchase: '16 Oct 2026' },
  { id: 3, name: 'Punjab Mills', contactPerson: 'Hamza Tariq', phone: '0333 4567890', city: 'Faisalabad', purchases: 1120000, paid: 599700, lastPurchase: '15 Oct 2026' },
  { id: 4, name: 'Pak Loom', contactPerson: 'Usman Sheikh', phone: '0301 9876543', city: 'Karachi', purchases: 740000, paid: 630000, lastPurchase: '13 Oct 2026' },
  { id: 5, name: 'Al-Madina Textiles', contactPerson: 'Bilal Ahmed', phone: '0345 1122334', city: 'Multan', purchases: 485000, paid: 385000, lastPurchase: '08 Oct 2026' },
]

export const supplierLedger: SupplierLedgerEntry[] = [
  { id: 1, date: '17 Oct 2026', reference: 'PUR-0108', description: 'Purchase · 8 rolls, 628 meters', debit: 376800, credit: 0, balance: 450000, type: 'Purchase' },
  { id: 2, date: '12 Oct 2026', reference: 'PAY-0042', description: 'Cash payment', debit: 0, credit: 200000, balance: 73200, type: 'Payment' },
  { id: 3, date: '09 Oct 2026', reference: 'PUR-0099', description: 'Purchase · 6 rolls, 472 meters', debit: 283200, credit: 0, balance: 273200, type: 'Purchase' },
  { id: 4, date: '04 Oct 2026', reference: 'RET-0011', description: 'Purchase return · damaged roll', debit: 0, credit: 10000, balance: -10000, type: 'Return' },
]


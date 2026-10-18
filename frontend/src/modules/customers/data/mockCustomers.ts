import type { Customer, CustomerLedgerEntry } from '../types'

export const initialCustomers: Customer[] = [
  { id: 1, businessName: 'Madina Fabrics', contactPerson: 'Ahsan Malik', phone: '0300 4455667', city: 'Lahore', sales: 1280000, received: 910000, lastSale: '17 Oct 2026' },
  { id: 2, businessName: 'Al-Rehman Cloth', contactPerson: 'Fahad Khan', phone: '0321 7788990', city: 'Gujranwala', sales: 875000, received: 875000, lastSale: '17 Oct 2026' },
  { id: 3, businessName: 'Usman Traders', contactPerson: 'Usman Ali', phone: '0333 1122445', city: 'Faisalabad', sales: 1495000, received: 955000, lastSale: '16 Oct 2026' },
  { id: 4, businessName: 'New City Garments', contactPerson: 'Saad Ahmed', phone: '0301 6677889', city: 'Rawalpindi', sales: 640000, received: 530000, lastSale: '15 Oct 2026' },
  { id: 5, businessName: 'Bismillah Fabrics', contactPerson: 'Zain Qureshi', phone: '0345 2233445', city: 'Multan', sales: 720000, received: 500000, lastSale: '12 Oct 2026' },
]

export const customerLedger: CustomerLedgerEntry[] = [
  { id: 1, date: '17 Oct 2026', reference: 'SAL-0128', description: 'Sale · 4 rolls, 312 meters', sale: 187200, received: 0, balance: 370000, type: 'Sale' },
  { id: 2, date: '13 Oct 2026', reference: 'REC-0068', description: 'Cash received', sale: 0, received: 100000, balance: 182800, type: 'Payment' },
  { id: 3, date: '10 Oct 2026', reference: 'SAL-0112', description: 'Sale · 3 rolls, 228 meters', sale: 136800, received: 0, balance: 282800, type: 'Sale' },
  { id: 4, date: '06 Oct 2026', reference: 'SRT-0008', description: 'Sale return adjustment', sale: 0, received: 12000, balance: 146000, type: 'Return' },
]


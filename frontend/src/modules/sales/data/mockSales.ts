import type { Sale } from '../types'

export const sales: Sale[] = [
  { id: 1, invoice: 'SAL-0128', date: '17 Oct 2026', customer: 'Madina Fabrics', rolls: 4, meters: 312, total: 187200, received: 120000, status: 'Partial' },
  { id: 2, invoice: 'SAL-0127', date: '17 Oct 2026', customer: 'Al-Rehman Cloth', rolls: 2, meters: 144, total: 82800, received: 82800, status: 'Paid' },
  { id: 3, invoice: 'SAL-0126', date: '16 Oct 2026', customer: 'Usman Traders', rolls: 6, meters: 465, total: 269700, received: 0, status: 'Unpaid' },
  { id: 4, invoice: 'SAL-0125', date: '15 Oct 2026', customer: 'New City Garments', rolls: 1, meters: 78, total: 46800, received: 46800, status: 'Paid' },
  { id: 5, invoice: 'SAL-0124', date: '14 Oct 2026', customer: 'Bismillah Fabrics', rolls: 3, meters: 231, total: 138600, received: 80000, status: 'Partial' },
]


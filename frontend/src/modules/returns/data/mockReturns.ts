import type { ReturnableInvoice, ReturnRecord } from '../types'

export const returns: ReturnRecord[] = [
  { id: 1, number: 'RET-0014', date: '17 Oct 2026', invoice: 'SAL-0118', customer: 'Madina Fabrics', kind: 'Exchange', rolls: 1, amount: 49200 },
  { id: 2, number: 'RET-0013', date: '14 Oct 2026', invoice: 'SAL-0109', customer: 'New City Garments', kind: 'Return', rolls: 1, amount: 46800 },
  { id: 3, number: 'RET-0012', date: '11 Oct 2026', invoice: 'SAL-0098', customer: 'Usman Traders', kind: 'Return', rolls: 2, amount: 93600 },
  { id: 4, number: 'RET-0011', date: '08 Oct 2026', invoice: 'SAL-0087', customer: 'Al-Rehman Cloth', kind: 'Exchange', rolls: 1, amount: 41400 },
]

export const returnableInvoices: ReturnableInvoice[] = [
  { invoice: 'SAL-0128', date: '17 Oct 2026', customer: 'Madina Fabrics', total: 187200, items: [
    { id: 1, rollNumber: 'R-0119', fabric: 'Wash & Wear Premium', color: 'Navy Blue', meters: 82, amount: 49200 },
    { id: 2, rollNumber: 'R-0118', fabric: 'Cotton Soft Finish', color: 'White', meters: 78, amount: 44850 },
    { id: 3, rollNumber: 'R-0117', fabric: 'Boski Gold', color: 'Cream', meters: 76, amount: 53200 },
  ] },
  { invoice: 'SAL-0127', date: '17 Oct 2026', customer: 'Al-Rehman Cloth', total: 82800, items: [
    { id: 4, rollNumber: 'R-0116', fabric: 'Cotton Soft Finish', color: 'Sky Blue', meters: 72, amount: 41400 },
    { id: 5, rollNumber: 'R-0115', fabric: 'Cotton Soft Finish', color: 'White', meters: 72, amount: 41400 },
  ] },
  { invoice: 'SAL-0126', date: '16 Oct 2026', customer: 'Usman Traders', total: 269700, items: [
    { id: 6, rollNumber: 'R-0114', fabric: 'Khaddar Winter', color: 'Charcoal', meters: 78, amount: 50700 },
    { id: 7, rollNumber: 'R-0113', fabric: 'Linen Plain', color: 'Beige', meters: 75, amount: 46875 },
  ] },
]


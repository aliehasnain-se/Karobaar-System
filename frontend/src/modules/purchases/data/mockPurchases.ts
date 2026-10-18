import type { Purchase } from '../types'

export const purchases: Purchase[] = [
  { id: 1, number: 'PUR-0108', date: '17 Oct 2026', supplier: 'Noor Fabrics', rolls: 8, meters: 628, total: 376800, paid: 200000, status: 'Partial' },
  { id: 2, number: 'PUR-0107', date: '16 Oct 2026', supplier: 'Classic Textiles', rolls: 5, meters: 392.5, total: 215875, paid: 215875, status: 'Paid' },
  { id: 3, number: 'PUR-0106', date: '15 Oct 2026', supplier: 'Punjab Mills', rolls: 12, meters: 946, total: 520300, paid: 0, status: 'Unpaid' },
  { id: 4, number: 'PUR-0105', date: '13 Oct 2026', supplier: 'Pak Loom', rolls: 6, meters: 471, total: 329700, paid: 329700, status: 'Paid' },
  { id: 5, number: 'PUR-0104', date: '11 Oct 2026', supplier: 'Noor Fabrics', rolls: 9, meters: 705, total: 401850, paid: 150000, status: 'Partial' },
]


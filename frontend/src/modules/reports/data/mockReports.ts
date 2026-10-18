import type { ReportDefinition, ReportKey } from '../types'

export const reportSummary = [
  { label: 'Sales', value: 'Rs. 725,100', note: '16–17 Oct 2026' },
  { label: 'Purchases', value: 'Rs. 1,844,525', note: '11–17 Oct 2026' },
  { label: 'Available stock', value: '5,997 m', note: '79 rolls' },
  { label: 'Customer balance', value: 'Rs. 1,240,000', note: '5 customers' },
]

export const reports: Record<ReportKey, ReportDefinition> = {
  sales: {
    title: 'Sales report',
    description: 'Invoice-wise sales and received amount.',
    columns: [
      { key: 'reference', label: 'Invoice' }, { key: 'date', label: 'Date' },
      { key: 'party', label: 'Customer' }, { key: 'quantity', label: 'Quantity' },
      { key: 'total', label: 'Sale', align: 'right' }, { key: 'paid', label: 'Received', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [
      { reference: 'SAL-0128', date: '17 Oct 2026', party: 'Madina Fabrics', quantity: '4 rolls · 312 m', total: 'Rs. 187,200', paid: 'Rs. 120,000', balance: 'Rs. 67,200' },
      { reference: 'SAL-0127', date: '17 Oct 2026', party: 'Al-Rehman Cloth', quantity: '2 rolls · 144 m', total: 'Rs. 82,800', paid: 'Rs. 82,800', balance: 'Rs. 0' },
      { reference: 'SAL-0126', date: '16 Oct 2026', party: 'Usman Traders', quantity: '6 rolls · 465 m', total: 'Rs. 269,700', paid: 'Rs. 0', balance: 'Rs. 269,700' },
      { reference: 'SAL-0125', date: '15 Oct 2026', party: 'New City Garments', quantity: '1 roll · 78 m', total: 'Rs. 46,800', paid: 'Rs. 46,800', balance: 'Rs. 0' },
      { reference: 'SAL-0124', date: '14 Oct 2026', party: 'Bismillah Fabrics', quantity: '3 rolls · 231 m', total: 'Rs. 138,600', paid: 'Rs. 80,000', balance: 'Rs. 58,600' },
    ],
  },
  purchases: {
    title: 'Purchase report',
    description: 'Supplier-wise purchases and remaining payment.',
    columns: [
      { key: 'reference', label: 'Purchase' }, { key: 'date', label: 'Date' },
      { key: 'party', label: 'Supplier' }, { key: 'quantity', label: 'Quantity' },
      { key: 'total', label: 'Purchase', align: 'right' }, { key: 'paid', label: 'Paid', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [
      { reference: 'PUR-0108', date: '17 Oct 2026', party: 'Noor Fabrics', quantity: '8 rolls · 628 m', total: 'Rs. 376,800', paid: 'Rs. 200,000', balance: 'Rs. 176,800' },
      { reference: 'PUR-0107', date: '16 Oct 2026', party: 'Classic Textiles', quantity: '5 rolls · 392.5 m', total: 'Rs. 215,875', paid: 'Rs. 215,875', balance: 'Rs. 0' },
      { reference: 'PUR-0106', date: '15 Oct 2026', party: 'Punjab Mills', quantity: '12 rolls · 946 m', total: 'Rs. 520,300', paid: 'Rs. 0', balance: 'Rs. 520,300' },
      { reference: 'PUR-0105', date: '13 Oct 2026', party: 'Pak Loom', quantity: '6 rolls · 471 m', total: 'Rs. 329,700', paid: 'Rs. 329,700', balance: 'Rs. 0' },
      { reference: 'PUR-0104', date: '11 Oct 2026', party: 'Noor Fabrics', quantity: '9 rolls · 705 m', total: 'Rs. 401,850', paid: 'Rs. 150,000', balance: 'Rs. 251,850' },
    ],
  },
  stock: {
    title: 'Stock report',
    description: 'Current fabric stock in rolls and meters.',
    columns: [
      { key: 'reference', label: 'Article' }, { key: 'party', label: 'Fabric' },
      { key: 'category', label: 'Category' }, { key: 'colors', label: 'Colors', align: 'right' },
      { key: 'rolls', label: 'Rolls', align: 'right' }, { key: 'meters', label: 'Total meters', align: 'right' },
    ],
    rows: [
      { reference: 'WW-101', party: 'Wash & Wear Premium', category: 'Wash & Wear', colors: 4, rolls: 18, meters: '1,384 m' },
      { reference: 'CT-205', party: 'Cotton Soft Finish', category: 'Cotton', colors: 6, rolls: 24, meters: '1,820 m' },
      { reference: 'BK-310', party: 'Boski Gold', category: 'Boski', colors: 3, rolls: 9, meters: '690 m' },
      { reference: 'KD-118', party: 'Khaddar Winter', category: 'Khaddar', colors: 5, rolls: 16, meters: '1,208 m' },
      { reference: 'LN-440', party: 'Linen Plain', category: 'Linen', colors: 4, rolls: 12, meters: '895 m' },
    ],
  },
  balances: {
    title: 'Balance report',
    description: 'Customers se lena aur suppliers ko dena hai.',
    columns: [
      { key: 'type', label: 'Type' }, { key: 'party', label: 'Name' },
      { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' },
      { key: 'total', label: 'Total business', align: 'right' }, { key: 'paid', label: 'Paid / received', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [
      { type: 'Customer', party: 'Usman Traders', phone: '0333 1122445', city: 'Faisalabad', total: 'Rs. 1,495,000', paid: 'Rs. 955,000', balance: 'Rs. 540,000' },
      { type: 'Supplier', party: 'Punjab Mills', phone: '0333 4567890', city: 'Faisalabad', total: 'Rs. 1,120,000', paid: 'Rs. 599,700', balance: 'Rs. 520,300' },
      { type: 'Supplier', party: 'Noor Fabrics', phone: '0300 1234567', city: 'Faisalabad', total: 'Rs. 1,285,000', paid: 'Rs. 835,000', balance: 'Rs. 450,000' },
      { type: 'Customer', party: 'Madina Fabrics', phone: '0300 4455667', city: 'Lahore', total: 'Rs. 1,280,000', paid: 'Rs. 910,000', balance: 'Rs. 370,000' },
      { type: 'Customer', party: 'Bismillah Fabrics', phone: '0345 2233445', city: 'Multan', total: 'Rs. 720,000', paid: 'Rs. 500,000', balance: 'Rs. 220,000' },
    ],
  },
}

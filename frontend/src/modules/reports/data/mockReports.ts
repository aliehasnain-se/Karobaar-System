import type { ReportDefinition, ReportKey } from '../types'

export const reportSummary = [
  { label: 'Sales', value: 'Rs. 0', note: 'No records' },
  { label: 'Purchases', value: 'Rs. 0', note: 'No records' },
  { label: 'Available stock', value: '0 m', note: '0 thaans' },
  { label: 'Customer balance', value: 'Rs. 0', note: '0 customers' },
]

export const reports: Record<ReportKey, ReportDefinition> = {
  sales: {
    title: 'Sales report',
    description: 'Invoice-wise sales and received amount.',
    columns: [
      { key: 'reference', label: 'Invoice' },
      { key: 'date', label: 'Date' },
      { key: 'party', label: 'Customer' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'total', label: 'Sale', align: 'right' },
      { key: 'paid', label: 'Received', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [],
  },
  purchases: {
    title: 'Purchase report',
    description: 'Supplier-wise purchases and remaining payment.',
    columns: [
      { key: 'reference', label: 'Purchase' },
      { key: 'date', label: 'Date' },
      { key: 'party', label: 'Supplier' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'total', label: 'Purchase', align: 'right' },
      { key: 'paid', label: 'Paid', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [],
  },
  stock: {
    title: 'Stock report',
    description: 'Current fabric stock in thaans and meters.',
    columns: [
      { key: 'reference', label: 'Article' },
      { key: 'party', label: 'Fabric' },
      { key: 'category', label: 'Category' },
      { key: 'colors', label: 'Colors', align: 'right' },
      { key: 'rolls', label: 'Thaans', align: 'right' },
      { key: 'meters', label: 'Total meters', align: 'right' },
    ],
    rows: [],
  },
  balances: {
    title: 'Balance report',
    description: 'Customer and supplier remaining amounts.',
    columns: [
      { key: 'type', label: 'Type' },
      { key: 'party', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City' },
      { key: 'total', label: 'Total business', align: 'right' },
      { key: 'paid', label: 'Paid / received', align: 'right' },
      { key: 'balance', label: 'Balance', align: 'right' },
    ],
    rows: [],
  },
}

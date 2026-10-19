import { initialCustomers } from '../../customers/data/mockCustomers'
import { sales } from '../../sales/data/mockSales'

export type GlobalSearchItem = {
  id: string
  category: 'Sale' | 'Purchase' | 'Customer' | 'Supplier' | 'Thaan' | 'Fabric'
  title: string
  subtitle: string
  keywords: string
  to: string
}

export const globalSearchItems: GlobalSearchItem[] = [
  ...sales.map((sale) => ({
    id: `sale-${sale.id}`,
    category: 'Sale' as const,
    title: sale.invoice,
    subtitle: `${sale.customer} · Rs. ${sale.total.toLocaleString()}`,
    keywords: `${sale.invoice} ${sale.customer}`,
    to: `/sales/${sale.invoice}`,
  })),
  ...initialCustomers.map((customer) => ({
    id: `customer-${customer.id}`,
    category: 'Customer' as const,
    title: customer.businessName,
    subtitle: `${customer.phone} · ${customer.city}`,
    keywords: `${customer.businessName} ${customer.contactPerson} ${customer.phone} ${customer.city}`,
    to: `/customers/${customer.id}`,
  })),
]

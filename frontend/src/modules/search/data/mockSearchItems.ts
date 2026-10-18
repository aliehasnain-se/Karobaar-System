import { initialCustomers } from '../../customers/data/mockCustomers'
import { initialFabrics, inventoryRolls } from '../../inventory/data/mockInventory'
import { purchases } from '../../purchases/data/mockPurchases'
import { sales } from '../../sales/data/mockSales'
import { initialSuppliers } from '../../suppliers/data/mockSuppliers'

export type GlobalSearchItem = {
  id: string
  category: 'Sale' | 'Purchase' | 'Customer' | 'Supplier' | 'Roll' | 'Fabric'
  title: string
  subtitle: string
  keywords: string
  to: string
}

export const globalSearchItems: GlobalSearchItem[] = [
  ...sales.map((sale) => ({ id: `sale-${sale.id}`, category: 'Sale' as const, title: sale.invoice, subtitle: `${sale.customer} · Rs. ${sale.total.toLocaleString()}`, keywords: `${sale.invoice} ${sale.customer}`, to: `/sales/${sale.invoice}` })),
  ...purchases.map((purchase) => ({ id: `purchase-${purchase.id}`, category: 'Purchase' as const, title: purchase.number, subtitle: `${purchase.supplier} · Rs. ${purchase.total.toLocaleString()}`, keywords: `${purchase.number} ${purchase.supplier}`, to: `/purchases/${purchase.number}` })),
  ...initialCustomers.map((customer) => ({ id: `customer-${customer.id}`, category: 'Customer' as const, title: customer.businessName, subtitle: `${customer.phone} · ${customer.city}`, keywords: `${customer.businessName} ${customer.contactPerson} ${customer.phone} ${customer.city}`, to: `/customers/${customer.id}` })),
  ...initialSuppliers.map((supplier) => ({ id: `supplier-${supplier.id}`, category: 'Supplier' as const, title: supplier.name, subtitle: `${supplier.phone} · ${supplier.city}`, keywords: `${supplier.name} ${supplier.contactPerson} ${supplier.phone} ${supplier.city}`, to: `/suppliers/${supplier.id}` })),
  ...inventoryRolls.map((roll) => ({ id: `roll-${roll.id}`, category: 'Roll' as const, title: roll.rollNumber, subtitle: `${roll.fabric} · ${roll.color} · ${roll.remainingMeters} m`, keywords: `${roll.rollNumber} ${roll.barcode} ${roll.fabric} ${roll.article} ${roll.color}`, to: `/inventory?tab=rolls&q=${encodeURIComponent(roll.barcode)}` })),
  ...initialFabrics.map((fabric) => ({ id: `fabric-${fabric.id}`, category: 'Fabric' as const, title: fabric.name, subtitle: `${fabric.article} · ${fabric.category}`, keywords: `${fabric.name} ${fabric.article} ${fabric.category} ${fabric.brand}`, to: `/inventory?tab=fabrics&q=${encodeURIComponent(fabric.article)}` })),
]

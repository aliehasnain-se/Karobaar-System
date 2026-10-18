import { ChevronRight, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddSupplierModal } from '../components/AddSupplierModal'
import { useSuppliers } from '../context/useSuppliers'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function SuppliersPage() {
  const { suppliers, addSupplier } = useSuppliers()
  const [search, setSearch] = useState('')
  const [balanceFilter, setBalanceFilter] = useState('All suppliers')
  const [showAddSupplier, setShowAddSupplier] = useState(false)

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return suppliers.filter((supplier) => {
      const balance = supplier.purchases - supplier.paid
      const matchesSearch = !term || [supplier.name, supplier.contactPerson, supplier.phone, supplier.city].some((value) => value.toLowerCase().includes(term))
      const matchesBalance = balanceFilter === 'All suppliers' || (balanceFilter === 'With balance' ? balance > 0 : balance === 0)
      return matchesSearch && matchesBalance
    })
  }, [balanceFilter, search, suppliers])

  const totalPurchases = suppliers.reduce((sum, supplier) => sum + supplier.purchases, 0)
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.paid, 0)

  return (
    <div className="suppliers-page">
      <div className="page-heading">
        <div><h1>Suppliers</h1><p>Supplier accounts, purchases aur outstanding payments.</p></div>
        <button className="button button--primary" onClick={() => setShowAddSupplier(true)}><Plus size={17} /> Add supplier</button>
      </div>

      <section className="inventory-summary" aria-label="Supplier summary">
        <div><span>Total suppliers</span><strong>{suppliers.length}</strong></div>
        <div><span>Total purchases</span><strong>{money(totalPurchases)}</strong></div>
        <div><span>Amount paid</span><strong>{money(totalPaid)}</strong></div>
        <div><span>Total supplier balance</span><strong>{money(totalPurchases - totalPaid)}</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading"><div><h2>Supplier accounts</h2><p>{filteredSuppliers.length} suppliers</p></div></div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone or city..." /></label>
            <select className="plain-select" value={balanceFilter} onChange={(event) => setBalanceFilter(event.target.value)} aria-label="Filter supplier balance"><option>All suppliers</option><option>With balance</option><option>Fully paid</option></select>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Supplier</th><th>Contact</th><th>City</th><th>Total purchases</th><th>Paid</th><th>Balance</th><th>Last purchase</th><th aria-label="Open" /></tr></thead>
            <tbody>
              {filteredSuppliers.map((supplier) => {
                const balance = supplier.purchases - supplier.paid
                return <tr key={supplier.id}>
                  <td><Link className="table-primary-link" to={`/suppliers/${supplier.id}`}>{supplier.name}</Link></td>
                  <td>{supplier.contactPerson}<small className="cell-subtext">{supplier.phone}</small></td><td>{supplier.city}</td>
                  <td>{money(supplier.purchases)}</td><td>{money(supplier.paid)}</td><td><strong className={balance > 0 ? 'amount-due' : ''}>{money(balance)}</strong></td><td>{supplier.lastPurchase}</td>
                  <td><Link className="row-open" to={`/suppliers/${supplier.id}`} aria-label={`Open ${supplier.name}`}><ChevronRight size={17} /></Link></td>
                </tr>
              })}
            </tbody>
          </table>
          {!filteredSuppliers.length && <p className="empty-state">Koi matching supplier nahi mila.</p>}
        </div>
      </section>

      {showAddSupplier && <AddSupplierModal onClose={() => setShowAddSupplier(false)} onAdd={(supplier) => { addSupplier(supplier); setShowAddSupplier(false) }} />}
    </div>
  )
}


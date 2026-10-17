import { Download, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { purchases } from '../data/mockPurchases'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function PurchasesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')

  const filteredPurchases = useMemo(() => {
    const term = search.trim().toLowerCase()
    return purchases.filter((purchase) => {
      const matchesSearch = !term || [purchase.number, purchase.supplier, purchase.branch]
        .some((value) => value.toLowerCase().includes(term))
      return matchesSearch && (status === 'All statuses' || purchase.status === status)
    })
  }, [search, status])

  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const totalPaid = purchases.reduce((sum, purchase) => sum + purchase.paid, 0)

  return (
    <div className="purchases-page">
      <div className="page-heading">
        <div><h1>Purchases</h1><p>Supplier purchases, received rolls aur payment balances.</p></div>
        <div className="heading-actions">
          <button className="button button--secondary"><Download size={17} /> Export</button>
          <Link className="button button--primary" to="/purchases/new"><Plus size={17} /> New purchase</Link>
        </div>
      </div>

      <section className="inventory-summary" aria-label="Purchase summary">
        <div><span>This month</span><strong>{money(totalPurchases)}</strong></div>
        <div><span>Amount paid</span><strong>{money(totalPaid)}</strong></div>
        <div><span>Supplier balance</span><strong>{money(totalPurchases - totalPaid)}</strong></div>
        <div><span>Rolls received</span><strong>{purchases.reduce((sum, purchase) => sum + purchase.rolls, 0)}</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading"><div><h2>Purchase history</h2><p>{filteredPurchases.length} records</p></div></div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Invoice, supplier or branch..." /></label>
            <select className="plain-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status"><option>All statuses</option><option>Paid</option><option>Partial</option><option>Unpaid</option></select>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Purchase</th><th>Supplier</th><th>Branch</th><th>Stock received</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
            <tbody>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td><strong>{purchase.number}</strong><small className="cell-subtext">{purchase.date}</small></td>
                  <td><strong>{purchase.supplier}</strong></td><td>{purchase.branch}</td>
                  <td>{purchase.rolls} rolls<small className="cell-subtext">{purchase.meters} meters</small></td>
                  <td><strong>{money(purchase.total)}</strong></td><td>{money(purchase.paid)}</td><td>{money(purchase.total - purchase.paid)}</td>
                  <td><span className={`status status--${purchase.status.toLowerCase()}`}>{purchase.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredPurchases.length && <p className="empty-state">Koi matching purchase nahi mili.</p>}
        </div>
      </section>
    </div>
  )
}


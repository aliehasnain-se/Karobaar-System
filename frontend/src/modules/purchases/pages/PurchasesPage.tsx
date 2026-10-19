import { Download, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSuppliers } from '../../suppliers/context/useSuppliers'
import { usePurchases } from '../context/usePurchases'

const money = (value: number) => `Rs. ${value.toLocaleString()}`
const csvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`

export function PurchasesPage() {
  const { purchases, loading, error } = usePurchases()
  const { suppliers } = useSuppliers()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')

  const filteredPurchases = useMemo(() => {
    const term = search.trim().toLowerCase()
    return purchases.filter((purchase) => {
      const matchesSearch = !term || [purchase.number, purchase.supplier, purchase.supplierInvoiceNumber]
        .some((value) => value.toLowerCase().includes(term))
      return matchesSearch && (status === 'All statuses' || purchase.status === status)
    })
  }, [purchases, search, status])

  const activePurchases = purchases.filter((purchase) => purchase.status !== 'Cancelled')
  const totalPurchases = activePurchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.paid, 0)
  const totalBalance = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0)

  const exportPurchases = () => {
    const header = ['Purchase', 'Date', 'Supplier', 'Thaans', 'Meters', 'Total', 'Paid at purchase', 'Due at purchase', 'Status']
    const rows = filteredPurchases.map((purchase) => [purchase.number, purchase.date, purchase.supplier, purchase.thaans, purchase.meters, purchase.total, purchase.paid, purchase.status === 'Cancelled' ? '' : purchase.balance, purchase.status])
    const blob = new Blob([[header, ...rows].map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'purchases.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="purchases-page">
      <div className="page-heading">
        <div><h1>Purchases</h1><p>Supplier purchases, received thaans, and remaining payments.</p></div>
        <div className="heading-actions">
          <button className="button button--secondary" onClick={exportPurchases} disabled={!filteredPurchases.length}><Download size={17} /> Export CSV</button>
          <Link className="button button--primary" to="/purchases/new"><Plus size={17} /> New purchase</Link>
        </div>
      </div>

      <section className="inventory-summary" aria-label="Purchase summary">
        <div><span>Total purchases</span><strong>{money(totalPurchases)}</strong></div>
        <div><span>Amount paid</span><strong>{money(totalPaid)}</strong></div>
        <div><span>Supplier balance</span><strong>{money(totalBalance)}</strong></div>
        <div><span>Thaans received</span><strong>{activePurchases.reduce((sum, purchase) => sum + purchase.thaans, 0)}</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading"><div><h2>Purchase history</h2><p>{filteredPurchases.length} records</p></div></div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Purchase no., invoice or supplier..." /></label>
            <select className="plain-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status">
              <option>All statuses</option><option>Paid</option><option>Partial</option><option>Unpaid</option><option>Cancelled</option>
            </select>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Purchase</th><th>Supplier</th><th>Stock received</th><th>Total</th><th>Paid at purchase</th><th>Due at purchase</th><th>Status</th></tr></thead>
            <tbody>{filteredPurchases.map((purchase) => <tr key={purchase.id}>
              <td><Link className="table-primary-link" to={`/purchases/${purchase.number}`}>{purchase.number}</Link><small className="cell-subtext">{purchase.date}</small></td>
              <td><strong>{purchase.supplier}</strong>{purchase.supplierInvoiceNumber && <small className="cell-subtext">Invoice: {purchase.supplierInvoiceNumber}</small>}</td>
              <td>{purchase.thaans} thaans<small className="cell-subtext">{purchase.meters.toLocaleString()} meters</small></td>
              <td><strong>{money(purchase.total)}</strong></td><td>{money(purchase.paid)}</td><td>{purchase.status === 'Cancelled' ? '—' : money(purchase.balance)}</td>
              <td><span className={`status status--${purchase.status.toLowerCase()}`}>{purchase.status}</span></td>
            </tr>)}</tbody>
          </table>
          {loading && <p className="empty-state">Loading purchases...</p>}
          {error && <p className="form-api-error" role="alert">{error}</p>}
          {!loading && !error && !filteredPurchases.length && <p className="empty-state">No matching purchase found.</p>}
        </div>
      </section>
    </div>
  )
}

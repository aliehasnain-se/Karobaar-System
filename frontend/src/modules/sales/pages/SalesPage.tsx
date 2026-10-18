import { Download, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { sales } from '../data/mockSales'

const money = (value: number) => `Rs. ${value.toLocaleString()}`
const csvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`

export function SalesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')

  const filteredSales = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sales.filter((sale) => {
      const matchesSearch = !term || [sale.invoice, sale.customer].some((value) => value.toLowerCase().includes(term))
      return matchesSearch && (status === 'All statuses' || sale.status === status)
    })
  }, [search, status])

  const total = sales.reduce((sum, sale) => sum + sale.total, 0)
  const received = sales.reduce((sum, sale) => sum + sale.received, 0)

  const exportSales = () => {
    const header = ['Invoice', 'Date', 'Customer', 'Rolls', 'Meters', 'Total', 'Received', 'Balance', 'Status']
    const rows = filteredSales.map((sale) => [sale.invoice, sale.date, sale.customer, sale.rolls, sale.meters, sale.total, sale.received, sale.total - sale.received, sale.status])
    const blob = new Blob([[header, ...rows].map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sales.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="sales-page">
      <div className="page-heading">
        <div><h1>Sales</h1><p>Invoices, sold thaans aur customer payments.</p></div>
        <div className="heading-actions"><button className="button button--secondary" onClick={exportSales} disabled={!filteredSales.length}><Download size={17} /> Export CSV</button><Link className="button button--primary" to="/sales/new"><Plus size={17} /> New sale</Link></div>
      </div>
      <section className="inventory-summary" aria-label="Sales summary">
        <div><span>This month</span><strong>{money(total)}</strong></div><div><span>Cash received</span><strong>{money(received)}</strong></div><div><span>Customer balance</span><strong>{money(total - received)}</strong></div><div><span>Thaans sold</span><strong>{sales.reduce((sum, sale) => sum + sale.rolls, 0)}</strong></div>
      </section>
      <section className="panel inventory-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Sales history</h2><p>{filteredSales.length} invoices</p></div></div><div className="inventory-filters"><label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Invoice or customer..." /></label><select className="plain-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter payment status"><option>All statuses</option><option>Paid</option><option>Partial</option><option>Unpaid</option></select></div></div>
        <div className="inventory-table-wrap"><p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p><table><thead><tr><th>Invoice</th><th>Customer</th><th>Stock sold</th><th>Total</th><th>Received</th><th>Balance</th><th>Status</th></tr></thead><tbody>{filteredSales.map((sale) => <tr key={sale.id}><td><Link className="table-primary-link" to={`/sales/${sale.invoice}`}>{sale.invoice}</Link><small className="cell-subtext">{sale.date}</small></td><td><strong>{sale.customer}</strong></td><td>{sale.rolls} thaans<small className="cell-subtext">{sale.meters} meters</small></td><td><strong>{money(sale.total)}</strong></td><td>{money(sale.received)}</td><td>{money(sale.total - sale.received)}</td><td><span className={`status status--${sale.status.toLowerCase()}`}>{sale.status}</span></td></tr>)}</tbody></table>{!filteredSales.length && <p className="empty-state">Koi matching sale nahi mili.</p>}</div>
      </section>
    </div>
  )
}

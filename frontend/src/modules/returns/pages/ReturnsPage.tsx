import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { returns } from '../data/mockReturns'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function ReturnsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return returns.filter((item) => (!term || [item.number, item.invoice, item.customer, item.kind].some((value) => value.toLowerCase().includes(term))) && (status === 'All statuses' || item.status === status))
  }, [search, status])

  return (
    <div className="returns-page">
      <div className="page-heading"><div><h1>Returns & Exchanges</h1><p>Invoice-linked returns aur exchange adjustments.</p></div><Link className="button button--primary" to="/returns/new"><Plus size={17} /> New return</Link></div>
      <section className="inventory-summary" aria-label="Returns summary"><div><span>Total requests</span><strong>{returns.length}</strong></div><div><span>Pending approval</span><strong>{returns.filter((item) => item.status === 'Pending').length}</strong></div><div><span>Completed</span><strong>{returns.filter((item) => item.status === 'Completed').length}</strong></div><div><span>Return value</span><strong>{money(returns.reduce((sum, item) => sum + item.amount, 0))}</strong></div></section>
      <section className="panel inventory-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Return history</h2><p>{filtered.length} records</p></div></div><div className="inventory-filters"><label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Return, invoice or customer..." /></label><select className="plain-select" value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Pending</option><option>Approved</option><option>Completed</option><option>Rejected</option></select></div></div>
        <div className="inventory-table-wrap"><p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p><table><thead><tr><th>Return</th><th>Original invoice</th><th>Customer</th><th>Type</th><th>Rolls</th><th>Amount</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.number}</strong><small className="cell-subtext">{item.date}</small></td><td>{item.invoice}</td><td>{item.customer}</td><td>{item.kind}</td><td>{item.rolls}</td><td><strong>{money(item.amount)}</strong></td><td><span className={`return-status return-status--${item.status.toLowerCase()}`}>{item.status}</span></td></tr>)}</tbody></table>{!filtered.length && <p className="empty-state">Koi matching return nahi mila.</p>}</div>
      </section>
    </div>
  )
}


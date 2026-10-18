import { ArrowLeft, Banknote, Building2, Pencil, Phone, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RecordPaymentModal } from '../components/RecordPaymentModal'
import { EditSupplierModal } from '../components/EditSupplierModal'
import { useSuppliers } from '../context/useSuppliers'
import { supplierLedger } from '../data/mockSuppliers'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function SupplierDetailPage() {
  const { supplierId } = useParams()
  const { suppliers, updateSupplier } = useSuppliers()
  const supplier = suppliers.find((item) => item.id === Number(supplierId))
  const [extraPayment, setExtraPayment] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  if (!supplier) return <Navigate to="/suppliers" replace />

  const balance = Math.max(0, supplier.purchases - supplier.paid - extraPayment)

  return (
    <div className="supplier-detail-page">
      <div className="page-heading">
        <div className="title-with-back"><Link className="back-button" to="/suppliers" aria-label="Back to suppliers"><ArrowLeft size={19} /></Link><div><h1>{supplier.name}</h1><p>Supplier profile aur complete ledger.</p></div></div>
        <div className="heading-actions"><button className="button button--secondary" onClick={() => setShowEdit(true)}><Pencil size={16} /> Edit supplier</button><Link className="button button--secondary" to={`/purchases/new?supplier=${supplier.id}`}><Plus size={17} /> New purchase</Link>{balance > 0 && <button className="button button--primary" onClick={() => setShowPayment(true)}><Banknote size={17} /> Record payment</button>}</div>
      </div>

      <section className="supplier-profile-grid">
        <article className="panel supplier-card">
          <div className="supplier-avatar">{supplier.name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div><h2>{supplier.name}</h2><p>{supplier.contactPerson}</p></div>
          <dl><div><dt><Phone size={15} /> Phone</dt><dd>{supplier.phone}</dd></div><div><dt><Building2 size={15} /> City</dt><dd>{supplier.city || 'Not added'}</dd></div></dl>
        </article>
        <article className="panel supplier-balance-card"><span>Current balance</span><strong>{money(balance)}</strong><small>{extraPayment > 0 ? `${money(extraPayment)} demo payment recorded` : 'Remaining amount to pay'}</small></article>
        <article className="panel supplier-balance-card"><span>Total purchases</span><strong>{money(supplier.purchases)}</strong><small>All recorded purchases</small></article>
        <article className="panel supplier-balance-card"><span>Total paid</span><strong>{money(supplier.paid + extraPayment)}</strong><small>Cash payments recorded</small></article>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Supplier ledger</h2><p>Purchases, payments aur returns</p></div></div></div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Type</th><th>Purchase</th><th>Payment / Return</th><th>Running balance</th></tr></thead>
            <tbody>
              {extraPayment > 0 && <tr><td>17 Oct 2026</td><td><strong>PAY-DEMO</strong></td><td>Cash payment · Demo entry</td><td>Payment</td><td>—</td><td>{money(extraPayment)}</td><td><strong>{money(balance)}</strong></td></tr>}
              {supplierLedger.map((entry) => <tr key={entry.id}><td>{entry.date}</td><td><strong>{entry.reference}</strong></td><td>{entry.description}</td><td>{entry.type}</td><td>{entry.debit ? money(entry.debit) : '—'}</td><td>{entry.credit ? money(entry.credit) : '—'}</td><td><strong>{money(entry.balance)}</strong></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {showPayment && <RecordPaymentModal supplierName={supplier.name} balance={balance} onClose={() => setShowPayment(false)} onSave={(amount) => { setExtraPayment((current) => current + amount); setShowPayment(false) }} />}
      {showEdit && <EditSupplierModal supplier={supplier} onClose={() => setShowEdit(false)} onSave={(updatedSupplier) => { updateSupplier(updatedSupplier); setShowEdit(false) }} />}
    </div>
  )
}


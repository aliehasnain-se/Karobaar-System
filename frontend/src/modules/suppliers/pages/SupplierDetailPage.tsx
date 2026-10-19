import { ArrowLeft, Banknote, Building2, Pencil, Phone, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { EditSupplierModal } from '../components/EditSupplierModal'
import { RecordPaymentModal } from '../components/RecordPaymentModal'
import { useSuppliers } from '../context/useSuppliers'
import type { SupplierLedgerEntry } from '../types'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

const mergePurchasePayments = (entries: SupplierLedgerEntry[]) => {
  const purchasePayments = new Map<string, SupplierLedgerEntry>()
  for (const entry of entries) {
    if (entry.type !== 'Payment') continue
    const reference = entry.description.match(/^Paid with (PUR-\d+)$/)?.[1]
    if (reference) purchasePayments.set(reference, entry)
  }
  return entries
    .filter((entry) => {
      if (entry.type !== 'Payment') return true
      return !entry.description.match(/^Paid with PUR-\d+$/)
    })
    .map((entry) => {
      if (entry.type !== 'Purchase') return entry
      const payment = purchasePayments.get(entry.reference)
      const paidWithPurchase = payment?.credit ?? 0
      return {
        ...entry,
        description: payment ? 'Purchase with payment' : entry.description,
        credit: paidWithPurchase,
        balance: Math.max(0, entry.debit - paidWithPurchase),
      }
    })
}

export function SupplierDetailPage() {
  const { supplierId } = useParams()
  const { suppliers, loading, updateSupplier, getLedger, recordPayment } = useSuppliers()
  const supplier = suppliers.find((item) => item.id === Number(supplierId))
  const [ledger, setLedger] = useState<SupplierLedgerEntry[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(true)
  const [ledgerError, setLedgerError] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const displayedLedger = useMemo(() => mergePurchasePayments(ledger), [ledger])

  useEffect(() => {
    if (!supplier) return
    getLedger(supplier.id)
      .then((entries) => {
        setLedger(entries)
        setLedgerError('')
      })
      .catch((requestError) => setLedgerError(requestError instanceof Error ? requestError.message : 'Could not load supplier account.'))
      .finally(() => setLedgerLoading(false))
  }, [getLedger, supplier])

  if (loading) return <p className="empty-state">Loading supplier...</p>
  if (!supplier) return <Navigate to="/suppliers" replace />

  return (
    <div className="supplier-detail-page">
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/suppliers" aria-label="Back to suppliers"><ArrowLeft size={19} /></Link>
          <div><h1>{supplier.name}</h1><p>Supplier profile and complete account history.</p></div>
        </div>
        <div className="heading-actions">
          <button className="button button--secondary" onClick={() => setShowEdit(true)}><Pencil size={16} /> Edit supplier</button>
          <Link className="button button--secondary" to={`/purchases/new?supplier=${supplier.id}`}><Plus size={17} /> New purchase</Link>
          {supplier.balance > 0 && <button className="button button--primary" onClick={() => setShowPayment(true)}><Banknote size={17} /> Record payment</button>}
        </div>
      </div>

      <section className="supplier-profile-grid">
        <article className="panel supplier-card">
          <div className="supplier-avatar">{supplier.name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div><h2>{supplier.name}</h2><p>{supplier.contactPerson}</p></div>
          <dl>
            <div><dt><Phone size={15} /> Phone</dt><dd>{supplier.phone}</dd></div>
            <div><dt><Building2 size={15} /> City</dt><dd>{supplier.city || 'Not added'}</dd></div>
          </dl>
        </article>
        <article className="panel supplier-balance-card"><span>Current balance</span><strong>{money(supplier.balance)}</strong><small>Remaining amount to pay</small></article>
        <article className="panel supplier-balance-card"><span>Total purchases</span><strong>{money(supplier.purchases)}</strong><small>All recorded purchases</small></article>
        <article className="panel supplier-balance-card"><span>Total paid</span><strong>{money(supplier.paid)}</strong><small>Cash payments recorded</small></article>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Supplier account</h2><p>Purchases, payments, and returns</p></div></div></div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Type</th><th>Purchase</th><th>Payment / Return</th><th>Remaining</th></tr></thead>
            <tbody>{displayedLedger.map((entry) => <tr key={entry.id}><td>{entry.date}</td><td><strong>{entry.reference}</strong></td><td>{entry.description}</td><td>{entry.type}</td><td>{entry.debit ? money(entry.debit) : '—'}</td><td>{entry.credit ? money(entry.credit) : '—'}</td><td><strong>{entry.type === 'Purchase' ? money(entry.balance) : '—'}</strong></td></tr>)}</tbody>
          </table>
          {ledgerLoading && <p className="empty-state">Loading account history...</p>}
          {ledgerError && <p className="form-api-error" role="alert">{ledgerError}</p>}
          {!ledgerLoading && !displayedLedger.length && !ledgerError && <p className="empty-state">No account entries yet.</p>}
        </div>
      </section>

      {showPayment && <RecordPaymentModal supplierName={supplier.name} balance={supplier.balance} onClose={() => setShowPayment(false)} onSave={async (payment) => { await recordPayment(supplier.id, payment); setLedger(await getLedger(supplier.id)); setShowPayment(false) }} />}
      {showEdit && <EditSupplierModal supplier={supplier} onClose={() => setShowEdit(false)} onSave={async (input) => { await updateSupplier(supplier.id, input); setShowEdit(false) }} />}
    </div>
  )
}

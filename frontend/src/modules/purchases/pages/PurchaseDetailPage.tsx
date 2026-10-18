import { ArrowLeft, Building2 } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { purchaseDetails } from '../data/mockPurchases'

const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function PurchaseDetailPage() {
  const { purchaseNumber } = useParams()
  const purchase = purchaseDetails.find((item) => item.number === purchaseNumber)

  if (!purchase) return <Navigate to="/purchases" replace />

  const balance = purchase.total - purchase.paid

  return (
    <div className="purchase-detail-page">
      <div className="page-heading">
        <div className="title-with-back"><Link className="back-button" to="/purchases" aria-label="Back to purchases"><ArrowLeft size={19} /></Link><div><h1>{purchase.number}</h1><p>Complete purchase and received stock record.</p></div></div>
        <Link className="button button--secondary" to={`/suppliers/${purchase.supplierId}`}><Building2 size={16} /> View supplier</Link>
      </div>

      <section className="invoice-meta-grid">
        <article className="panel invoice-meta"><span>Supplier</span><strong>{purchase.supplier}</strong><small>{purchase.supplierPhone}</small></article>
        <article className="panel invoice-meta"><span>Purchase date</span><strong>{purchase.date}</strong><small>{purchase.rolls} rolls · {purchase.meters} meters</small></article>
        <article className="panel invoice-meta"><span>Payment status</span><strong><span className={`status status--${purchase.status.toLowerCase()}`}>{purchase.status}</span></strong><small>{balance ? `${money(balance)} remaining` : 'Fully paid'}</small></article>
      </section>

      <section className="panel inventory-panel invoice-items-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Received rolls</h2><p>Roll-wise stock and cost details</p></div></div></div>
        <div className="inventory-table-wrap"><p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p><table className="invoice-items-table"><thead><tr><th>Roll</th><th>Barcode</th><th>Fabric</th><th>Color</th><th className="text-right">Meters</th><th className="text-right">Cost / meter</th><th className="text-right">Amount</th></tr></thead><tbody>{purchase.items.map((item) => <tr key={item.id}><td><strong>{item.rollNumber}</strong></td><td>{item.barcode}</td><td><strong>{item.fabric}</strong><small className="cell-subtext">{item.article}</small></td><td>{item.color}</td><td className="text-right">{item.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td><td className="text-right">{money(item.rate)}</td><td className="text-right"><strong>{money(item.quantity * item.rate)}</strong></td></tr>)}</tbody></table></div>
      </section>

      <section className="invoice-bottom-grid">
        <article className="panel payment-record"><h2>Payment record</h2><div><span>{purchase.paid ? 'Cash paid with purchase' : 'No payment made'}</span><strong>{money(purchase.paid)}</strong></div><small>Later payments supplier ledger mein show hongi.</small></article>
        <aside className="panel purchase-summary-card"><h2>Purchase summary</h2><dl><div><dt>Total rolls</dt><dd>{purchase.rolls}</dd></div><div><dt>Total meters</dt><dd>{purchase.meters.toLocaleString()} m</dd></div><div><dt>Total amount</dt><dd>{money(purchase.total)}</dd></div><div><dt>Paid</dt><dd>{money(purchase.paid)}</dd></div><div className="summary-balance"><dt>Remaining balance</dt><dd>{money(balance)}</dd></div></dl></aside>
      </section>
    </div>
  )
}

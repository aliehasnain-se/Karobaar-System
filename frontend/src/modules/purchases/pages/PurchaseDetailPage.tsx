import { ArrowLeft, Ban, Building2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useInventory } from '../../inventory/context/useInventory'
import { useSuppliers } from '../../suppliers/context/useSuppliers'
import { usePurchases } from '../context/usePurchases'

const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function PurchaseDetailPage() {
  const { purchaseNumber } = useParams()
  const { purchases, loading, cancelPurchase } = usePurchases()
  const { refresh: refreshInventory } = useInventory()
  const { refresh: refreshSuppliers } = useSuppliers()
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState('')
  const purchase = purchases.find((item) => item.number === purchaseNumber)

  if (loading) return <p className="empty-state">Loading purchase...</p>
  if (!purchase) return <Navigate to="/purchases" replace />

  const handleCancel = async () => {
    const confirmed = window.confirm(
      `Cancel ${purchase.number}? Its unused stock and supplier account entries will be reversed.`,
    )
    if (!confirmed) return
    setCancelling(true)
    setActionError('')
    try {
      await cancelPurchase(purchase.number)
      await Promise.all([refreshInventory(), refreshSuppliers()])
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'Could not cancel the purchase.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="purchase-detail-page">
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/purchases" aria-label="Back to purchases"><ArrowLeft size={19} /></Link>
          <div><h1>{purchase.number}</h1><p>Complete purchase and received stock record.</p></div>
        </div>
        <div className="heading-actions">
          <Link className="button button--secondary" to={`/suppliers/${purchase.supplierId}`}><Building2 size={16} /> View supplier</Link>
          {purchase.status !== 'Cancelled' && <button className="button button--secondary" type="button" onClick={() => void handleCancel()} disabled={cancelling}><Ban size={16} /> {cancelling ? 'Cancelling...' : 'Cancel purchase'}</button>}
        </div>
      </div>

      {purchase.status === 'Cancelled' && <div className="form-notice" role="status"><strong>This purchase is cancelled.</strong> Its stock and supplier account entries are not active.</div>}
      {actionError && <p className="form-api-error" role="alert">{actionError}</p>}

      <section className="invoice-meta-grid">
        <article className="panel invoice-meta"><span>Supplier</span><strong>{purchase.supplier}</strong><small>{purchase.supplierPhone}</small></article>
        <article className="panel invoice-meta"><span>Purchase date</span><strong>{purchase.date}</strong><small>{purchase.thaans} thaans · {purchase.meters.toLocaleString()} meters</small></article>
        <article className="panel invoice-meta"><span>Payment status</span><strong><span className={`status status--${purchase.status.toLowerCase()}`}>{purchase.status}</span></strong><small>{purchase.status === 'Cancelled' ? 'No active supplier balance' : purchase.balance ? `${money(purchase.balance)} due at purchase` : 'Fully paid at purchase'}</small></article>
      </section>

      <section className="panel inventory-panel invoice-items-panel">
        <div className="inventory-toolbar"><div className="panel-heading"><div><h2>Purchased items</h2><p>Quantity, meters and purchase price per thaan</p></div></div></div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table className="invoice-items-table">
            <thead><tr><th>Fabric</th><th>Color</th><th className="text-right">Thaans</th><th className="text-right">Meters per thaan</th><th className="text-right">Price per thaan</th><th className="text-right">Total meters</th><th className="text-right">Total</th></tr></thead>
            <tbody>{purchase.items.map((item) => <tr key={item.id}>
              <td><strong>{item.fabric}</strong><small className="cell-subtext">{item.article}</small></td><td>{item.color}</td><td className="text-right">{item.thaanQuantity}</td><td className="text-right">{item.metersPerThaan.toLocaleString()} m</td><td className="text-right">{money(item.pricePerThaan)}</td><td className="text-right">{item.totalMeters.toLocaleString()} m</td><td className="text-right"><strong>{money(item.totalAmount)}</strong></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="invoice-bottom-grid">
        <article className="panel payment-record"><h2>Payment record</h2><div><span>{purchase.status === 'Cancelled' ? 'Cancelled purchase' : purchase.paid ? 'Cash paid with purchase' : 'No payment made'}</span><strong>{purchase.status === 'Cancelled' ? 'Not active' : money(purchase.paid)}</strong></div><small>{purchase.status === 'Cancelled' ? 'Original record kept for history.' : 'Later payments appear in the supplier account.'}</small></article>
        <aside className="panel purchase-summary-card"><h2>Purchase summary</h2><dl>
          <div><dt>Total thaans</dt><dd>{purchase.thaans}</dd></div><div><dt>Total meters</dt><dd>{purchase.meters.toLocaleString()} m</dd></div><div><dt>Total amount</dt><dd>{money(purchase.total)}</dd></div><div><dt>Paid at purchase</dt><dd>{money(purchase.paid)}</dd></div><div className="summary-balance"><dt>Due at purchase</dt><dd>{purchase.status === 'Cancelled' ? '—' : money(purchase.balance)}</dd></div>
        </dl></aside>
      </section>
    </div>
  )
}

import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { saleDetails } from '../data/mockSales'

const money = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function SaleDetailPage() {
  const { invoiceNumber } = useParams()
  const sale = saleDetails.find((item) => item.invoice === invoiceNumber)

  if (!sale) return <Navigate to="/sales" replace />

  const balance = sale.total - sale.received

  return (
    <div className="sale-detail-page">
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/sales" aria-label="Back to sales">
            <ArrowLeft size={19} />
          </Link>
          <div>
            <h1>{sale.invoice}</h1>
            <p>Complete sale invoice record.</p>
          </div>
        </div>
        <Link
          className="button button--secondary"
          to={`/returns/new?invoice=${sale.invoice}`}
        >
          <RotateCcw size={16} /> Return / exchange
        </Link>
      </div>

      <section className="invoice-meta-grid">
        <article className="panel invoice-meta">
          <span>Customer</span>
          <strong>{sale.customer}</strong>
          <small>{sale.customerPhone}</small>
        </article>
        <article className="panel invoice-meta">
          <span>Invoice date</span>
          <strong>{sale.date}</strong>
          <small>
            {sale.rolls} rolls · {sale.meters} meters
          </small>
        </article>
        <article className="panel invoice-meta">
          <span>Payment status</span>
          <strong>
            <span className={`status status--${sale.status.toLowerCase()}`}>
              {sale.status}
            </span>
          </strong>
          <small>
            {balance ? `${money(balance)} remaining` : 'Fully paid'}
          </small>
        </article>
      </section>

      <section className="panel inventory-panel invoice-items-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading">
            <div>
              <h2>Sold rolls</h2>
              <p>Roll-wise invoice details</p>
            </div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">
            Swipe left to see more columns →
          </p>
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Roll</th>
                <th>Barcode</th>
                <th>Fabric</th>
                <th>Color</th>
                <th className="text-right">Meters</th>
                <th className="text-right">Final roll price</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.rollId}>
                  <td>
                    <strong>{item.rollNumber}</strong>
                  </td>
                  <td>{item.barcode}</td>
                  <td>
                    <strong>{item.fabric}</strong>
                    <small className="cell-subtext">{item.article}</small>
                  </td>
                  <td>{item.color}</td>
                  <td className="text-right">
                    {item.meters.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-right">
                    <strong>{money(item.price)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="invoice-bottom-grid">
        <article className="panel payment-record">
          <h2>Payment record</h2>
          <div>
            <span>
              {sale.received
                ? 'Cash received with sale'
                : 'No payment received'}
            </span>
            <strong>{money(sale.received)}</strong>
          </div>
          <small>Later payments will appear in the customer account.</small>
        </article>
        <aside className="panel purchase-summary-card">
          <h2>Invoice summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(sale.total + sale.discount)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>{money(sale.discount)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{money(sale.total)}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{money(sale.received)}</dd>
            </div>
            <div className="summary-balance">
              <dt>Remaining balance</dt>
              <dd>{money(balance)}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  )
}

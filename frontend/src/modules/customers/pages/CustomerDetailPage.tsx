import {
  ArrowLeft,
  Banknote,
  Building2,
  Pencil,
  Phone,
  Plus,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ReceivePaymentModal } from '../components/ReceivePaymentModal'
import { EditCustomerModal } from '../components/EditCustomerModal'
import { useCustomers } from '../context/useCustomers'
import { customerLedger } from '../data/mockCustomers'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function CustomerDetailPage() {
  const { customerId } = useParams()
  const { customers, updateCustomer } = useCustomers()
  const customer = customers.find((item) => item.id === Number(customerId))
  const [extraReceived, setExtraReceived] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  if (!customer) return <Navigate to="/customers" replace />

  const balance = Math.max(
    0,
    customer.sales - customer.received - extraReceived,
  )

  return (
    <div className="customer-detail-page">
      <div className="page-heading">
        <div className="title-with-back">
          <Link
            className="back-button"
            to="/customers"
            aria-label="Back to customers"
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <h1>{customer.businessName}</h1>
            <p>Customer profile and complete account history.</p>
          </div>
        </div>
        <div className="heading-actions">
          <button
            className="button button--secondary"
            onClick={() => setShowEdit(true)}
          >
            <Pencil size={16} /> Edit customer
          </button>
          <Link
            className="button button--secondary"
            to={`/sales/new?customer=${customer.id}`}
          >
            <Plus size={17} /> New sale
          </Link>
          {balance > 0 && (
            <button
              className="button button--primary"
              onClick={() => setShowPayment(true)}
            >
              <Banknote size={17} /> Receive payment
            </button>
          )}
        </div>
      </div>

      <section className="supplier-profile-grid">
        <article className="panel supplier-card">
          <div className="supplier-avatar">
            {customer.businessName
              .split(' ')
              .map((word) => word[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h2>{customer.businessName}</h2>
            <p>{customer.contactPerson}</p>
          </div>
          <dl>
            <div>
              <dt>
                <Phone size={15} /> Phone
              </dt>
              <dd>{customer.phone}</dd>
            </div>
            <div>
              <dt>
                <Building2 size={15} /> City
              </dt>
              <dd>{customer.city || 'Not added'}</dd>
            </div>
          </dl>
        </article>
        <article className="panel supplier-balance-card">
          <span>Current balance</span>
          <strong>{money(balance)}</strong>
          <small>
            {extraReceived > 0
              ? `${money(extraReceived)} demo payment received`
              : 'Remaining amount to receive'}
          </small>
        </article>
        <article className="panel supplier-balance-card">
          <span>Total sales</span>
          <strong>{money(customer.sales)}</strong>
          <small>All recorded sales</small>
        </article>
        <article className="panel supplier-balance-card">
          <span>Cash received</span>
          <strong>{money(customer.received + extraReceived)}</strong>
          <small>Total customer payments</small>
        </article>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading">
            <div>
              <h2>Customer ledger</h2>
              <p>Sales, received payments, and returns</p>
            </div>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">
            Swipe left to see more columns →
          </p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Type</th>
                <th>Sale</th>
                <th>Received / Return</th>
                <th>Running balance</th>
              </tr>
            </thead>
            <tbody>
              {extraReceived > 0 && (
                <tr>
                  <td>17 Oct 2026</td>
                  <td>
                    <strong>REC-DEMO</strong>
                  </td>
                  <td>Cash received · Demo entry</td>
                  <td>Payment</td>
                  <td>—</td>
                  <td>{money(extraReceived)}</td>
                  <td>
                    <strong>{money(balance)}</strong>
                  </td>
                </tr>
              )}
              {customerLedger.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>
                    <strong>{entry.reference}</strong>
                  </td>
                  <td>{entry.description}</td>
                  <td>{entry.type}</td>
                  <td>{entry.sale ? money(entry.sale) : '—'}</td>
                  <td>{entry.received ? money(entry.received) : '—'}</td>
                  <td>
                    <strong>{money(entry.balance)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showPayment && (
        <ReceivePaymentModal
          customerName={customer.businessName}
          balance={balance}
          onClose={() => setShowPayment(false)}
          onSave={(amount) => {
            setExtraReceived((current) => current + amount)
            setShowPayment(false)
          }}
        />
      )}
      {showEdit && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSave={(updatedCustomer) => {
            updateCustomer(updatedCustomer)
            setShowEdit(false)
          }}
        />
      )}
    </div>
  )
}

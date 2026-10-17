import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { PurchaseItem } from '../types'

const emptyItem = (id: number): PurchaseItem => ({
  id,
  fabric: 'Wash & Wear Premium',
  color: 'Navy Blue',
  rollNumber: '',
  quantity: 0,
  unit: 'Meter',
  rate: 0,
})

const toMeters = (item: PurchaseItem) => item.unit === 'Yard' ? item.quantity * 0.9144 : item.quantity
const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function NewPurchasePage() {
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem(1)])
  const [paymentType, setPaymentType] = useState('Partial')
  const [paidAmount, setPaidAmount] = useState(0)
  const [saved, setSaved] = useState(false)

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.rate, 0), [items])
  const effectivePaid = paymentType === 'Paid' ? subtotal : paymentType === 'Unpaid' ? 0 : Math.min(paidAmount, subtotal)
  const balance = subtotal - effectivePaid
  const totalMeters = items.reduce((sum, item) => sum + toMeters(item), 0)

  const updateItem = <K extends keyof PurchaseItem>(id: number, key: K, value: PurchaseItem[K]) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  const removeItem = (id: number) => {
    setItems((current) => current.length === 1 ? current : current.filter((item) => item.id !== id))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <form className="purchase-form-page" onSubmit={handleSubmit}>
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/purchases" aria-label="Back to purchases"><ArrowLeft size={19} /></Link>
          <div><h1>New purchase</h1><p>Supplier invoice aur received rolls record karein.</p></div>
        </div>
        <div className="heading-actions"><Link className="button button--secondary" to="/purchases">Cancel</Link><button className="button button--primary" type="submit"><Save size={17} /> Save purchase</button></div>
      </div>

      {saved && <div className="form-notice" role="status"><strong>Demo purchase ready.</strong> Backend connect hone ke baad yahan se stock aur supplier ledger update hoga.</div>}

      <section className="panel form-section">
        <div className="section-heading"><h2>Purchase details</h2><p>Invoice kis supplier aur branch ke liye hai.</p></div>
        <div className="purchase-details-grid">
          <label className="form-field">Supplier<select required defaultValue=""><option value="" disabled>Select supplier</option><option>Noor Fabrics</option><option>Classic Textiles</option><option>Punjab Mills</option><option>Pak Loom</option></select></label>
          <label className="form-field">Receiving branch<select defaultValue="Lahore Main"><option>Lahore Main</option><option>Faisalabad</option><option>Rawalpindi</option></select></label>
          <label className="form-field">Supplier invoice no.<input placeholder="e.g. NF-8841" required /></label>
          <label className="form-field">Purchase date<input type="date" defaultValue="2026-10-17" required /></label>
        </div>
      </section>

      <section className="panel form-section">
        <div className="section-heading section-heading--row"><div><h2>Fabric rolls</h2><p>Har thaan ko separate roll number dein.</p></div><button className="button button--secondary" type="button" onClick={() => setItems((current) => [...current, emptyItem(Date.now())])}><Plus size={16} /> Add roll</button></div>
        <div className="purchase-items-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to complete roll details →</p>
          <table className="purchase-items-table">
            <thead><tr><th>Fabric</th><th>Color</th><th>Roll no.</th><th>Quantity</th><th>Unit</th><th>Meters</th><th>Rate / unit</th><th>Total</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><select value={item.fabric} onChange={(event) => updateItem(item.id, 'fabric', event.target.value)}><option>Wash & Wear Premium</option><option>Cotton Soft Finish</option><option>Boski Gold</option><option>Khaddar Winter</option><option>Linen Plain</option></select></td>
                  <td><input value={item.color} onChange={(event) => updateItem(item.id, 'color', event.target.value)} required /></td>
                  <td><input value={item.rollNumber} onChange={(event) => updateItem(item.id, 'rollNumber', event.target.value)} placeholder="R-0129" required /></td>
                  <td><input type="number" min="0.01" step="0.01" value={item.quantity || ''} onChange={(event) => updateItem(item.id, 'quantity', Number(event.target.value))} required /></td>
                  <td><select value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value as PurchaseItem['unit'])}><option>Meter</option><option>Yard</option></select></td>
                  <td className="calculated-cell">{toMeters(item).toFixed(2)} m</td>
                  <td><input type="number" min="0" step="0.01" value={item.rate || ''} onChange={(event) => updateItem(item.id, 'rate', Number(event.target.value))} required /></td>
                  <td className="calculated-cell"><strong>{money(item.quantity * item.rate)}</strong></td>
                  <td><button className="row-action" type="button" aria-label="Remove roll" onClick={() => removeItem(item.id)} disabled={items.length === 1}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="purchase-bottom-grid">
        <div className="panel form-section">
          <div className="section-heading"><h2>Payment</h2><p>Cash paid aur supplier udhaar record karein.</p></div>
          <div className="payment-options">
            {['Paid', 'Partial', 'Unpaid'].map((option) => <label key={option} className={paymentType === option ? 'payment-option active' : 'payment-option'}><input type="radio" name="paymentType" value={option} checked={paymentType === option} onChange={() => setPaymentType(option)} /><span><strong>{option}</strong><small>{option === 'Paid' ? 'Full payment done' : option === 'Partial' ? 'Some amount paid' : 'Complete udhaar'}</small></span></label>)}
          </div>
          {paymentType === 'Partial' && <label className="form-field paid-input">Amount paid<input type="number" min="0" max={subtotal} value={paidAmount || ''} onChange={(event) => setPaidAmount(Number(event.target.value))} placeholder="0" /></label>}
        </div>

        <aside className="panel purchase-summary-card">
          <h2>Purchase summary</h2>
          <dl><div><dt>Total rolls</dt><dd>{items.length}</dd></div><div><dt>Total meters</dt><dd>{totalMeters.toFixed(2)} m</dd></div><div><dt>Purchase total</dt><dd>{money(subtotal)}</dd></div><div><dt>Cash paid</dt><dd>{money(effectivePaid)}</dd></div><div className="summary-balance"><dt>Supplier payable</dt><dd>{money(balance)}</dd></div></dl>
        </aside>
      </section>
    </form>
  )
}


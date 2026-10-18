import { ArrowLeft, Plus, Save, ScanBarcode, Search, Trash2 } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { inventoryRolls } from '../../inventory/data/mockInventory'
import type { SaleItem } from '../types'

const defaultRates: Record<string, number> = { 'WW-101': 600, 'CT-205': 575, 'BK-310': 700, 'KD-118': 650, 'LN-440': 625 }
const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function NewSalePage() {
  const [customer, setCustomer] = useState('')
  const [rollSearch, setRollSearch] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState('Paid')
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [saved, setSaved] = useState(false)

  const availableRolls = useMemo(() => {
    const term = rollSearch.trim().toLowerCase()
    return inventoryRolls.filter((roll) => {
      const isAvailable = roll.status === 'Available' && !items.some((item) => item.rollId === roll.id)
      const matchesSearch = !term || [roll.barcode, roll.rollNumber, roll.fabric, roll.article, roll.color].some((value) => value.toLowerCase().includes(term))
      return isAvailable && matchesSearch
    })
  }, [items, rollSearch])

  const subtotal = items.reduce((sum, item) => sum + item.meters * item.rate, 0)
  const total = Math.max(0, subtotal - discount)
  const effectiveReceived = paymentType === 'Paid' ? total : paymentType === 'Unpaid' ? 0 : Math.min(receivedAmount, total)
  const balance = total - effectiveReceived

  const addRoll = (rollId: number) => {
    const roll = inventoryRolls.find((item) => item.id === rollId)
    if (!roll) return
    setItems((current) => [...current, { rollId: roll.id, rollNumber: roll.rollNumber, barcode: roll.barcode, fabric: roll.fabric, article: roll.article, color: roll.color, meters: roll.remainingMeters, rate: defaultRates[roll.article] ?? 0 }])
    setRollSearch('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!items.length) return
    setSaved(true)
  }

  return (
    <form className="sale-form-page" onSubmit={handleSubmit}>
      <div className="page-heading"><div className="title-with-back"><Link className="back-button" to="/sales" aria-label="Back to sales"><ArrowLeft size={19} /></Link><div><h1>New sale</h1><p>Select customer aur complete rolls to create an invoice.</p></div></div><div className="heading-actions"><Link className="button button--secondary" to="/sales">Cancel</Link><button className="button button--primary" type="submit" disabled={!items.length}><Save size={17} /> Save sale</button></div></div>
      {saved && <div className="form-notice" role="status"><strong>Demo sale ready.</strong> Backend connect hone par invoice, stock aur customer balance ek saath update honge.</div>}

      <section className="panel form-section"><div className="section-heading"><h2>Sale details</h2><p>Customer aur invoice details enter karein.</p></div><div className="purchase-details-grid">
        <label className="form-field">Customer<select required value={customer} onChange={(event) => setCustomer(event.target.value)}><option value="" disabled>Select customer</option><option>Madina Fabrics</option><option>Al-Rehman Cloth</option><option>Usman Traders</option><option>New City Garments</option><option>Bismillah Fabrics</option></select></label>
        <label className="form-field">Invoice date<input type="date" defaultValue="2026-10-17" required /></label><label className="form-field">Reference note <span className="optional-label">Optional</span><input placeholder="Customer order reference" /></label>
      </div></section>

      <section className="panel form-section"><div className="section-heading"><h2>Select rolls</h2><p>Barcode scan karein ya roll, article, fabric aur color search karein.</p></div><label className="roll-search"><ScanBarcode size={19} /><input value={rollSearch} onChange={(event) => setRollSearch(event.target.value)} placeholder="Scan barcode or search available rolls..." autoFocus /><Search size={17} /></label><div className="available-rolls">{availableRolls.map((roll) => <div className="available-roll" key={roll.id}><div><strong>{roll.rollNumber} · {roll.fabric}</strong><small>{roll.article} · {roll.color} · {roll.barcode}</small></div><span>{roll.remainingMeters} m</span><button type="button" className="button button--secondary" onClick={() => addRoll(roll.id)}><Plus size={15} /> Add</button></div>)}{!availableRolls.length && <p className="empty-inline">Koi matching available roll nahi mila.</p>}</div></section>

      <section className="panel form-section"><div className="section-heading"><h2>Selected rolls</h2><p>Complete remaining quantity invoice mein add hogi.</p></div>{items.length ? <div className="purchase-items-wrap"><p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p><table className="sale-items-table"><thead><tr><th>Roll</th><th>Fabric</th><th>Color</th><th>Quantity</th><th>Rate / meter</th><th>Total</th><th aria-label="Actions" /></tr></thead><tbody>{items.map((item) => <tr key={item.rollId}><td><strong>{item.rollNumber}</strong><small className="cell-subtext">{item.barcode}</small></td><td><strong>{item.fabric}</strong><small className="cell-subtext">{item.article}</small></td><td>{item.color}</td><td>{item.meters} m</td><td><input type="number" min="0" step="0.01" value={item.rate || ''} onChange={(event) => setItems((current) => current.map((row) => row.rollId === item.rollId ? { ...row, rate: Number(event.target.value) } : row))} required /></td><td><strong>{money(item.meters * item.rate)}</strong></td><td><button className="row-action" type="button" aria-label="Remove roll" onClick={() => setItems((current) => current.filter((row) => row.rollId !== item.rollId))}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div> : <p className="empty-selection">No rolls selected. Search and add a roll above.</p>}</section>

      <section className="purchase-bottom-grid"><div className="panel form-section"><div className="section-heading"><h2>Payment</h2><p>Cash received aur remaining amount record karein.</p></div><div className="payment-options">{['Paid', 'Partial', 'Unpaid'].map((option) => <label key={option} className={paymentType === option ? 'payment-option active' : 'payment-option'}><input type="radio" name="salePaymentType" value={option} checked={paymentType === option} onChange={() => setPaymentType(option)} /><span><strong>{option}</strong><small>{option === 'Paid' ? 'Full cash received' : option === 'Partial' ? 'Some cash received' : 'No payment received'}</small></span></label>)}</div>{paymentType === 'Partial' && <label className="form-field paid-input">Cash received<input type="number" min="0" max={total} value={receivedAmount || ''} onChange={(event) => setReceivedAmount(Number(event.target.value))} placeholder="0" /></label>}</div>
        <aside className="panel purchase-summary-card"><h2>Invoice summary</h2><dl><div><dt>Total rolls</dt><dd>{items.length}</dd></div><div><dt>Total meters</dt><dd>{items.reduce((sum, item) => sum + item.meters, 0).toFixed(2)} m</dd></div><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div className="summary-discount"><dt>Discount</dt><dd><input type="number" min="0" max={subtotal} value={discount || ''} onChange={(event) => setDiscount(Math.min(Number(event.target.value), subtotal))} placeholder="0" /></dd></div><div><dt>Cash received</dt><dd>{money(effectiveReceived)}</dd></div><div className="summary-balance"><dt>Remaining amount</dt><dd>{money(balance)}</dd></div></dl></aside>
      </section>
    </form>
  )
}


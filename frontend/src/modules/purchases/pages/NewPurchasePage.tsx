import { ArrowLeft, Check, ChevronDown, Plus, Save, Trash2, UserRoundPlus } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AddSupplierModal } from '../../suppliers/components/AddSupplierModal'
import { useSuppliers } from '../../suppliers/context/useSuppliers'
import type { Supplier } from '../../suppliers/types'
import { FabricSelect } from '../components/FabricSelect'
import { purchases } from '../data/mockPurchases'
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
  const { suppliers, addSupplier, updateSupplier } = useSuppliers()
  const [searchParams] = useSearchParams()
  const supplierFromProfile = suppliers.find((supplier) => supplier.id === Number(searchParams.get('supplier')))
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(supplierFromProfile ?? null)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [showQuickSupplier, setShowQuickSupplier] = useState(false)
  const [supplierError, setSupplierError] = useState('')
  const [items, setItems] = useState<PurchaseItem[]>([emptyItem(1)])
  const [paymentType, setPaymentType] = useState('Partial')
  const [paidAmount, setPaidAmount] = useState(0)
  const [saved, setSaved] = useState(false)
  const purchaseNumber = `PUR-${String(Math.max(...purchases.map((purchase) => Number(purchase.number.replace('PUR-', '')))) + 1).padStart(4, '0')}`

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.rate, 0), [items])
  const effectivePaid = paymentType === 'Paid' ? subtotal : paymentType === 'Unpaid' ? 0 : Math.min(paidAmount, subtotal)
  const balance = subtotal - effectivePaid
  const totalMeters = items.reduce((sum, item) => sum + toMeters(item), 0)
  const matchingSuppliers = useMemo(() => {
    const term = supplierSearch.trim().toLowerCase()
    return suppliers.filter((supplier) => !term || [supplier.name, supplier.contactPerson, supplier.phone].some((value) => value.toLowerCase().includes(term)))
  }, [supplierSearch, suppliers])

  const updateItem = <K extends keyof PurchaseItem>(id: number, key: K, value: PurchaseItem[K]) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  const removeItem = (id: number) => {
    setItems((current) => current.length === 1 ? current : current.filter((item) => item.id !== id))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSupplier) {
      setSupplierError('Supplier select ya create karein.')
      setSupplierDropdownOpen(true)
      return
    }
    if (saved) return
    const updatedSupplier = {
      ...selectedSupplier,
      purchases: selectedSupplier.purchases + subtotal,
      paid: selectedSupplier.paid + effectivePaid,
      lastPurchase: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    }
    updateSupplier(updatedSupplier)
    setSelectedSupplier(updatedSupplier)
    setSupplierError('')
    setSaved(true)
  }

  const chooseSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setSupplierSearch('')
    setSupplierDropdownOpen(false)
    setSupplierError('')
  }

  const handleQuickSupplier = (supplier: Supplier) => {
    addSupplier(supplier)
    chooseSupplier(supplier)
    setShowQuickSupplier(false)
  }

  return (
    <form className="purchase-form-page" onSubmit={handleSubmit}>
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/purchases" aria-label="Back to purchases"><ArrowLeft size={19} /></Link>
          <div><h1>New purchase</h1><p>Supplier invoice aur received rolls record karein.</p></div>
        </div>
        <div className="heading-actions"><Link className="button button--secondary" to="/purchases">Cancel</Link><button className="button button--primary" type="submit" disabled={saved}><Save size={17} /> {saved ? 'Purchase saved' : 'Save purchase'}</button></div>
      </div>

      {saved && <div className="form-notice" role="status"><strong>Purchase saved.</strong> Supplier account ke totals demo mein update ho gaye hain.</div>}

      <section className="panel form-section">
        <div className="section-heading"><h2>Purchase details</h2><p>Supplier invoice ki basic details enter karein.</p></div>
        <div className="purchase-details-grid">
          <div className="form-field customer-picker" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSupplierDropdownOpen(false) }}><span>Supplier</span><div className="customer-select-row"><button type="button" className={`customer-select-trigger${supplierError ? ' input-error' : ''}`} onClick={() => setSupplierDropdownOpen((open) => !open)} aria-haspopup="listbox" aria-expanded={supplierDropdownOpen}><span>{selectedSupplier?.name ?? 'Select supplier'}</span><ChevronDown size={16} /></button><button type="button" className="button button--secondary quick-customer-button" onClick={() => { setSupplierDropdownOpen(false); setShowQuickSupplier(true) }}><UserRoundPlus size={16} /> New</button></div>{supplierDropdownOpen && <div className="customer-select-menu"><input className="customer-menu-search" value={supplierSearch} onChange={(event) => setSupplierSearch(event.target.value)} placeholder="Search by name or phone number" aria-label="Search suppliers" autoFocus /><div className="customer-menu-options" role="listbox">{matchingSuppliers.map((supplier) => <button type="button" key={supplier.id} onClick={() => chooseSupplier(supplier)}><span><strong>{supplier.name}</strong><small>{supplier.phone}</small></span>{selectedSupplier?.id === supplier.id && <Check size={15} />}</button>)}{!matchingSuppliers.length && <p>No supplier found.</p>}</div></div>}{supplierError && <small className="field-error">{supplierError}</small>}</div>
          <label className="form-field">Purchase no.<input value={purchaseNumber} readOnly /></label>
          <label className="form-field"><span className="field-label">Supplier invoice no. <small className="optional-label">Optional</small></span><input placeholder="e.g. NF-8841" /></label>
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
                  <td><FabricSelect value={item.fabric} onChange={(fabric) => updateItem(item.id, 'fabric', fabric)} /></td>
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
          <div className="section-heading"><h2>Payment</h2><p>Cash paid aur remaining amount record karein.</p></div>
          <div className="payment-options">
            {['Paid', 'Partial', 'Unpaid'].map((option) => <label key={option} className={paymentType === option ? 'payment-option active' : 'payment-option'}><input type="radio" name="paymentType" value={option} checked={paymentType === option} onChange={() => setPaymentType(option)} /><span><strong>{option}</strong><small>{option === 'Paid' ? 'Full payment done' : option === 'Partial' ? 'Some amount paid' : 'No payment made'}</small></span></label>)}
          </div>
          {paymentType === 'Partial' && <label className="form-field paid-input">Amount paid<input type="number" min="0" max={subtotal} value={paidAmount || ''} onChange={(event) => setPaidAmount(Number(event.target.value))} placeholder="0" /></label>}
        </div>

        <aside className="panel purchase-summary-card">
          <h2>Purchase summary</h2>
          <dl><div><dt>Total rolls</dt><dd>{items.length}</dd></div><div><dt>Total meters</dt><dd>{totalMeters.toFixed(2)} m</dd></div><div><dt>Purchase total</dt><dd>{money(subtotal)}</dd></div><div><dt>Cash paid</dt><dd>{money(effectivePaid)}</dd></div><div className="summary-balance"><dt>Remaining amount</dt><dd>{money(balance)}</dd></div></dl>
        </aside>
      </section>
      {showQuickSupplier && <AddSupplierModal quick onClose={() => setShowQuickSupplier(false)} onAdd={handleQuickSupplier} />}
    </form>
  )
}


import { ArrowLeft, Check, ChevronDown, Plus, Save, Trash2, UserRoundPlus } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../shared/api/client'
import { useInventory } from '../../inventory/context/useInventory'
import { AddSupplierModal } from '../../suppliers/components/AddSupplierModal'
import { useSuppliers } from '../../suppliers/context/useSuppliers'
import type { Supplier, SupplierInput } from '../../suppliers/types'
import { FabricSelect } from '../components/FabricSelect'
import { QuickFabricModal } from '../components/QuickFabricModal'
import { usePurchases } from '../context/usePurchases'

type DraftItem = {
  id: number
  fabricId: number
  color: string
  thaanQuantity: number
  metersPerThaan: number
  pricePerThaan: number
}

const emptyItem = (id: number): DraftItem => ({
  id,
  fabricId: 0,
  color: '',
  thaanQuantity: 1,
  metersPerThaan: 0,
  pricePerThaan: 0,
})

const money = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const today = () => new Date().toLocaleDateString('en-CA')

const firstErrorText = (value: unknown): string | null => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorText(item)
      if (message) return message
    }
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const message = firstErrorText(item)
      if (message) return message
    }
  }
  return null
}

const apiErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && error.details && typeof error.details === 'object') {
    const first = firstErrorText(error.details)
    if (first) return String(first)
  }
  return error instanceof Error ? error.message : 'Could not save the purchase.'
}

export function NewPurchasePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addPurchase } = usePurchases()
  const { refresh: refreshInventory } = useInventory()
  const { suppliers, addSupplier, refresh: refreshSuppliers } = useSuppliers()
  const initialSupplierId = Number(searchParams.get('supplier')) || 0
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplierId)
  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierDropdownOpen, setSupplierDropdownOpen] = useState(false)
  const [showQuickSupplier, setShowQuickSupplier] = useState(false)
  const [quickFabricLineId, setQuickFabricLineId] = useState<number | null>(null)
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(today())
  const [items, setItems] = useState<DraftItem[]>([emptyItem(1)])
  const [paymentType, setPaymentType] = useState('Partial')
  const [paidAmount, setPaidAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const matchingSuppliers = useMemo(() => {
    const term = supplierSearch.trim().toLowerCase()
    return suppliers.filter((supplier) =>
      !term || [supplier.name, supplier.contactPerson, supplier.phone].some((value) =>
        value.toLowerCase().includes(term),
      ),
    )
  }, [supplierSearch, suppliers])

  const totalThaans = items.reduce((sum, item) => sum + item.thaanQuantity, 0)
  const totalMeters = items.reduce(
    (sum, item) => sum + item.thaanQuantity * item.metersPerThaan,
    0,
  )
  const subtotal = items.reduce(
    (sum, item) => sum + item.thaanQuantity * item.pricePerThaan,
    0,
  )
  const effectivePaid = paymentType === 'Paid'
    ? subtotal
    : paymentType === 'Unpaid'
      ? 0
      : Math.min(paidAmount, subtotal)
  const balance = subtotal - effectivePaid

  const updateItem = <K extends keyof DraftItem>(id: number, key: K, value: DraftItem[K]) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item))
  }

  const chooseSupplier = (supplier: Supplier) => {
    setSelectedSupplierId(supplier.id)
    setSupplierSearch('')
    setSupplierDropdownOpen(false)
    setError('')
  }

  const handleQuickSupplier = async (input: SupplierInput) => {
    const supplier = await addSupplier(input)
    chooseSupplier(supplier)
    setShowQuickSupplier(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedSupplier) {
      setError('Select or create a supplier.')
      setSupplierDropdownOpen(true)
      return
    }
    if (items.some((item) => !item.fabricId)) {
      setError('Select a fabric for every row.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const purchase = await addPurchase({
        supplierId: selectedSupplier.id,
        supplierInvoiceNumber,
        purchaseDate,
        paidAmount: effectivePaid,
        items: items.map((item) => ({
          fabricId: item.fabricId,
          color: item.color,
          thaanQuantity: item.thaanQuantity,
          metersPerThaan: item.metersPerThaan,
          pricePerThaan: item.pricePerThaan,
        })),
      })
      await Promise.all([refreshInventory(), refreshSuppliers()])
      navigate(`/purchases/${purchase.number}`)
    } catch (requestError) {
      setError(apiErrorMessage(requestError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="purchase-form-page" onSubmit={handleSubmit}>
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/purchases" aria-label="Back to purchases"><ArrowLeft size={19} /></Link>
          <div><h1>New purchase</h1><p>Record received thaans and supplier payment.</p></div>
        </div>
        <div className="heading-actions">
          <Link className="button button--secondary" to="/purchases">Cancel</Link>
          <button className="button button--primary" type="submit" disabled={saving}>
            <Save size={17} /> {saving ? 'Saving...' : 'Save purchase'}
          </button>
        </div>
      </div>

      {error && <p className="form-api-error" role="alert">{error}</p>}

      <section className="panel form-section">
        <div className="section-heading"><h2>Purchase details</h2><p>Select the supplier and enter invoice details.</p></div>
        <div className="purchase-details-grid">
          <div className="form-field customer-picker" onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setSupplierDropdownOpen(false)
          }}>
            <span>Supplier</span>
            <div className="customer-select-row">
              <button type="button" className="customer-select-trigger" onClick={() => setSupplierDropdownOpen((open) => !open)} aria-haspopup="listbox" aria-expanded={supplierDropdownOpen}>
                <span>{selectedSupplier?.name ?? 'Select supplier'}</span><ChevronDown size={16} />
              </button>
              <button type="button" className="button button--secondary quick-customer-button" onClick={() => { setSupplierDropdownOpen(false); setShowQuickSupplier(true) }}>
                <UserRoundPlus size={16} /> New
              </button>
            </div>
            {supplierDropdownOpen && <div className="customer-select-menu">
              <input className="customer-menu-search" value={supplierSearch} onChange={(event) => setSupplierSearch(event.target.value)} placeholder="Search by name or phone number" aria-label="Search suppliers" autoFocus />
              <div className="customer-menu-options" role="listbox">
                {matchingSuppliers.map((supplier) => <button type="button" key={supplier.id} onClick={() => chooseSupplier(supplier)}>
                  <span><strong>{supplier.name}</strong><small>{supplier.phone}</small></span>
                  {selectedSupplierId === supplier.id && <Check size={15} />}
                </button>)}
                {!matchingSuppliers.length && <p>No supplier found.</p>}
              </div>
            </div>}
          </div>
          <label className="form-field">Purchase no.<input value="Auto generated" readOnly /></label>
          <label className="form-field"><span className="field-label">Supplier invoice no. <small className="optional-label">Optional</small></span><input value={supplierInvoiceNumber} onChange={(event) => setSupplierInvoiceNumber(event.target.value)} placeholder="e.g. NF-8841" /></label>
          <label className="form-field">Purchase date<input type="date" value={purchaseDate} onChange={(event) => setPurchaseDate(event.target.value)} required /></label>
        </div>
      </section>

      <section className="panel form-section">
        <div className="section-heading section-heading--row">
          <div><h2>Purchased thaans</h2><p>Use one row for thaans with the same fabric, color, meters and price.</p></div>
          <div className="heading-actions">
            <button className="button button--secondary" type="button" onClick={() => setQuickFabricLineId(items.find((item) => !item.fabricId)?.id ?? items[items.length - 1]?.id ?? 1)}><Plus size={16} /> New fabric</button>
            <button className="button button--secondary" type="button" onClick={() => setItems((current) => [...current, emptyItem(Date.now())])}><Plus size={16} /> Add row</button>
          </div>
        </div>
        <div className="purchase-items-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to complete thaan details →</p>
          <table className="purchase-items-table">
            <thead><tr><th>Fabric</th><th>Color</th><th>Thaans</th><th>Meters per thaan</th><th>Price per thaan</th><th>Total meters</th><th>Total</th><th aria-label="Actions" /></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id}>
              <td><FabricSelect value={item.fabricId} onChange={(fabricId) => updateItem(item.id, 'fabricId', fabricId)} /></td>
              <td><input value={item.color} onChange={(event) => updateItem(item.id, 'color', event.target.value)} placeholder="e.g. Navy Blue" required /></td>
              <td><input type="number" min="1" step="1" value={item.thaanQuantity || ''} onChange={(event) => updateItem(item.id, 'thaanQuantity', Number(event.target.value))} required /></td>
              <td><input type="number" min="0.01" step="0.01" value={item.metersPerThaan || ''} onChange={(event) => updateItem(item.id, 'metersPerThaan', Number(event.target.value))} required /></td>
              <td><input type="number" min="0.01" step="0.01" value={item.pricePerThaan || ''} onChange={(event) => updateItem(item.id, 'pricePerThaan', Number(event.target.value))} required /></td>
              <td><strong>{(item.thaanQuantity * item.metersPerThaan).toLocaleString(undefined, { maximumFractionDigits: 2 })} m</strong></td>
              <td><strong>{money(item.thaanQuantity * item.pricePerThaan)}</strong></td>
              <td><button className="row-action" type="button" aria-label="Remove row" onClick={() => setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))} disabled={items.length === 1}><Trash2 size={16} /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="purchase-bottom-grid">
        <div className="panel form-section">
          <div className="section-heading"><h2>Payment</h2><p>Record cash paid to the supplier.</p></div>
          <div className="payment-options">{['Paid', 'Partial', 'Unpaid'].map((option) => <label key={option} className={paymentType === option ? 'payment-option active' : 'payment-option'}>
            <input type="radio" name="paymentType" value={option} checked={paymentType === option} onChange={() => setPaymentType(option)} />
            <span><strong>{option}</strong><small>{option === 'Paid' ? 'Full payment done' : option === 'Partial' ? 'Some amount paid' : 'No payment made'}</small></span>
          </label>)}</div>
          {paymentType === 'Partial' && <label className="form-field paid-input">Amount paid<input type="number" min="0" max={subtotal} step="0.01" value={paidAmount || ''} onChange={(event) => setPaidAmount(Number(event.target.value))} placeholder="0" required /></label>}
        </div>
        <aside className="panel purchase-summary-card">
          <h2>Purchase summary</h2>
          <dl>
            <div><dt>Total thaans</dt><dd>{totalThaans}</dd></div>
            <div><dt>Total meters</dt><dd>{totalMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m</dd></div>
            <div><dt>Purchase total</dt><dd>{money(subtotal)}</dd></div>
            <div><dt>Cash paid</dt><dd>{money(effectivePaid)}</dd></div>
            <div className="summary-balance"><dt>Remaining amount</dt><dd>{money(balance)}</dd></div>
          </dl>
        </aside>
      </section>

      {showQuickSupplier && <AddSupplierModal quick onClose={() => setShowQuickSupplier(false)} onAdd={handleQuickSupplier} />}
      {quickFabricLineId !== null && <QuickFabricModal onClose={() => setQuickFabricLineId(null)} onSaved={(fabric) => {
        updateItem(quickFabricLineId, 'fabricId', fabric.id)
        setQuickFabricLineId(null)
      }} />}
    </form>
  )
}

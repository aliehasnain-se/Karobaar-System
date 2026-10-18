import { ArrowLeft, Search, Save } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { inventoryRolls } from '../../inventory/data/mockInventory'
import { returnableInvoices } from '../data/mockReturns'
import type { ReturnableInvoice } from '../types'

const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

export function NewReturnPage() {
  const [query, setQuery] = useState('')
  const [invoice, setInvoice] = useState<ReturnableInvoice | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [kind, setKind] = useState<'Return' | 'Exchange'>('Return')
  const [condition, setCondition] = useState('Resellable')
  const [reason, setReason] = useState('')
  const [replacementId, setReplacementId] = useState('')
  const [saved, setSaved] = useState(false)

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return returnableInvoices
    return returnableInvoices.filter((item) => [item.invoice, item.customer, item.date].some((value) => value.toLowerCase().includes(term)))
  }, [query])

  const returnAmount = invoice?.items.filter((item) => selectedIds.includes(item.id)).reduce((sum, item) => sum + item.amount, 0) ?? 0
  const replacementRoll = inventoryRolls.find((roll) => String(roll.id) === replacementId)
  const replacementAmount = replacementRoll ? replacementRoll.remainingMeters * 625 : 0
  const difference = replacementAmount - returnAmount

  const chooseInvoice = (item: ReturnableInvoice) => {
    setInvoice(item)
    setSelectedIds([])
    setQuery(item.invoice)
    setSaved(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!invoice || !selectedIds.length || (kind === 'Exchange' && !replacementId)) return
    setSaved(true)
  }

  return (
    <form className="return-form-page" onSubmit={handleSubmit}>
      <div className="page-heading"><div className="title-with-back"><Link className="back-button" to="/returns" aria-label="Back to returns"><ArrowLeft size={19} /></Link><div><h1>New return</h1><p>Original invoice search karke return ya exchange create karein.</p></div></div><div className="heading-actions"><Link className="button button--secondary" to="/returns">Cancel</Link><button className="button button--primary" type="submit" disabled={!invoice || !selectedIds.length}><Save size={17} /> Save request</button></div></div>
      {saved && <div className="form-notice" role="status"><strong>Return request ready.</strong> Owner/manager approval ke baad stock aur customer balance update hoga.</div>}

      <section className="panel form-section">
        <div className="section-heading"><h2>Find original invoice</h2><p>Invoice number, customer name ya date se search karein.</p></div>
        <label className="roll-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setInvoice(null); setSelectedIds([]) }} placeholder="e.g. SAL-0128 or customer name" /></label>
        {!invoice && <div className="invoice-results">{matches.map((item) => <button type="button" key={item.invoice} onClick={() => chooseInvoice(item)}><span><strong>{item.invoice}</strong><small>{item.customer} · {item.date}</small></span><b>{money(item.total)}</b></button>)}{!matches.length && <p className="empty-inline">Koi matching invoice nahi mili.</p>}</div>}
      </section>

      {invoice && <>
        <section className="panel form-section">
          <div className="section-heading section-heading--row"><div><h2>Select sold rolls</h2><p>{invoice.invoice} · {invoice.customer}</p></div><button className="text-link" type="button" onClick={() => { setInvoice(null); setQuery(''); setSelectedIds([]) }}>Change invoice</button></div>
          <div className="return-items">{invoice.items.map((item) => <label key={item.id} className={selectedIds.includes(item.id) ? 'return-item active' : 'return-item'}><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /><span><strong>{item.rollNumber} · {item.fabric}</strong><small>{item.color} · {item.meters} meters</small></span><b>{money(item.amount)}</b></label>)}</div>
        </section>

        <section className="return-details-grid">
          <div className="panel form-section">
            <div className="section-heading"><h2>Return details</h2><p>Returned stock ki condition aur reason.</p></div>
            <div className="payment-options return-kind-options">{(['Return', 'Exchange'] as const).map((option) => <label key={option} className={kind === option ? 'payment-option active' : 'payment-option'}><input type="radio" name="returnKind" checked={kind === option} onChange={() => setKind(option)} /><span><strong>{option}</strong><small>{option === 'Return' ? 'Return value adjusts customer balance' : 'Replace with another available roll'}</small></span></label>)}</div>
            <div className="return-fields"><label className="form-field">Stock condition<select value={condition} onChange={(event) => setCondition(event.target.value)}><option>Resellable</option><option>Damaged</option></select></label><label className="form-field">Reason<select value={reason} onChange={(event) => setReason(event.target.value)} required><option value="" disabled>Select reason</option><option>Wrong color</option><option>Wrong fabric</option><option>Damaged roll</option><option>Customer changed order</option><option>Other</option></select></label></div>
            {kind === 'Exchange' && <label className="form-field exchange-select">Replacement roll<select value={replacementId} onChange={(event) => setReplacementId(event.target.value)} required><option value="" disabled>Select available roll</option>{inventoryRolls.filter((roll) => roll.status === 'Available').map((roll) => <option value={roll.id} key={roll.id}>{roll.rollNumber} · {roll.fabric} · {roll.color} · {roll.remainingMeters} m</option>)}</select></label>}
          </div>

          <aside className="panel purchase-summary-card">
            <h2>Adjustment summary</h2><dl><div><dt>Selected rolls</dt><dd>{selectedIds.length}</dd></div><div><dt>Return value</dt><dd>{money(returnAmount)}</dd></div>{kind === 'Exchange' && <><div><dt>Replacement value</dt><dd>{money(replacementAmount)}</dd></div><div className="summary-balance"><dt>{difference > 0 ? 'Customer pays' : 'Customer balance adjustment'}</dt><dd>{money(Math.abs(difference))}</dd></div></>}{kind === 'Return' && <div className="summary-balance"><dt>Customer balance adjustment</dt><dd>{money(returnAmount)}</dd></div>}</dl><p className="approval-note">Status save hone par <strong>Pending</strong> hoga.</p>
          </aside>
        </section>
      </>}
    </form>
  )
}


import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import type { SupplierPaymentInput } from '../types'

type RecordPaymentModalProps = {
  supplierName: string
  balance: number
  onClose: () => void
  onSave: (payment: SupplierPaymentInput) => Promise<void>
}

export function RecordPaymentModal({
  supplierName,
  balance,
  onClose,
  onSave,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(0)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave({ amount, paymentDate, note })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save payment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card modal-card--small"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="payment-title">Record payment</h2>
            <p>
              {supplierName} · Balance Rs. {balance.toLocaleString()}
            </p>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">
              Cash amount
              <input
                type="number"
                min="1"
                max={balance}
                value={amount || ''}
                onChange={(event) => setAmount(Number(event.target.value))}
                placeholder="0"
                required
              />
            </label>
            <label className="form-field form-field--wide">
              Payment date
              <input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} required />
            </label>
            <label className="form-field form-field--wide">
              Note <span className="optional-label">Optional</span>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Payment reference or note" />
            </label>
          </div>
          {error && <p className="form-api-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save payment'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

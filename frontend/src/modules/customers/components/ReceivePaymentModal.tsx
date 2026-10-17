import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'

type ReceivePaymentModalProps = {
  customerName: string
  balance: number
  onClose: () => void
  onSave: (amount: number) => void
}

export function ReceivePaymentModal({ customerName, balance, onClose, onSave }: ReceivePaymentModalProps) {
  const [amount, setAmount] = useState(0)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave(amount)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card modal-card--small" role="dialog" aria-modal="true" aria-labelledby="receive-payment-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="receive-payment-title">Receive payment</h2><p>{customerName} · Balance Rs. {balance.toLocaleString()}</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Cash received<input type="number" min="1" max={balance} value={amount || ''} onChange={(event) => setAmount(Number(event.target.value))} placeholder="0" required /></label>
            <label className="form-field form-field--wide">Receipt date<input type="date" defaultValue="2026-10-17" required /></label>
            <label className="form-field form-field--wide">Note <span className="optional-label">Optional</span><input placeholder="Payment reference or note" /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Save receipt</button></div>
        </form>
      </section>
    </div>
  )
}


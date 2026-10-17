import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import type { Supplier } from '../types'

type AddSupplierModalProps = {
  onClose: () => void
  onAdd: (supplier: Supplier) => void
}

export function AddSupplierModal({ onClose, onAdd }: AddSupplierModalProps) {
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd({ id: Date.now(), name, contactPerson, phone, city, purchases: 0, paid: 0, lastPurchase: 'No purchases yet' })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-supplier-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="add-supplier-title">Add supplier</h2><p>Supplier ki basic contact information save karein.</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Business name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Noor Fabrics" required /></label>
            <label className="form-field">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} placeholder="Full name" required /></label>
            <label className="form-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="03XX XXXXXXX" required /></label>
            <label className="form-field form-field--wide">City<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Faisalabad" required /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Save supplier</button></div>
        </form>
      </section>
    </div>
  )
}


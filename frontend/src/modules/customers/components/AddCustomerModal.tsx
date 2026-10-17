import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import type { Customer } from '../types'

type AddCustomerModalProps = {
  onClose: () => void
  onAdd: (customer: Customer) => void
}

export function AddCustomerModal({ onClose, onAdd }: AddCustomerModalProps) {
  const [businessName, setBusinessName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd({ id: Date.now(), businessName, contactPerson, phone, city, sales: 0, received: 0, lastSale: 'No sales yet' })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-customer-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="add-customer-title">Add customer</h2><p>Customer ki basic business aur contact details save karein.</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Business name<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="e.g. Madina Fabrics" required /></label>
            <label className="form-field">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} placeholder="Full name" required /></label>
            <label className="form-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="03XX XXXXXXX" required /></label>
            <label className="form-field form-field--wide">City<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Lahore" required /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Save customer</button></div>
        </form>
      </section>
    </div>
  )
}


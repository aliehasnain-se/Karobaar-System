import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Customer } from '../types'

type AddCustomerModalProps = {
  onClose: () => void
  onAdd: (customer: Customer) => void
  quick?: boolean
}

export function AddCustomerModal({ onClose, onAdd, quick = false }: AddCustomerModalProps) {
  const [businessName, setBusinessName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd({ id: Date.now(), businessName, contactPerson: contactPerson || businessName, phone, city, sales: 0, received: 0, lastSale: 'No sales yet' })
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-customer-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="add-customer-title">{quick ? 'Quick new customer' : 'Add customer'}</h2><p>{quick ? 'Sirf name aur phone enter karein. Baqi details baad mein add ho sakti hain.' : 'Customer ki basic business aur contact details save karein.'}</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">{quick ? 'Customer / business name' : 'Business name'}<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="e.g. Madina Fabrics" required autoFocus /></label>
            {!quick && <label className="form-field">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} placeholder="Full name" required /></label>}
            <label className="form-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="03XX XXXXXXX" required /></label>
            {!quick && <label className="form-field form-field--wide">City<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Lahore" required /></label>}
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">{quick ? 'Add to sale' : 'Save customer'}</button></div>
        </form>
      </section>
    </div>,
    document.body,
  )
}


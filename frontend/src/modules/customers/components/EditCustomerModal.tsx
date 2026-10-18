import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Customer } from '../types'

type EditCustomerModalProps = {
  customer: Customer
  onClose: () => void
  onSave: (customer: Customer) => void
}

export function EditCustomerModal({ customer, onClose, onSave }: EditCustomerModalProps) {
  const [businessName, setBusinessName] = useState(customer.businessName)
  const [contactPerson, setContactPerson] = useState(customer.contactPerson)
  const [phone, setPhone] = useState(customer.phone)
  const [city, setCity] = useState(customer.city)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({ ...customer, businessName, contactPerson, phone, city })
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-customer-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="edit-customer-title">Edit customer</h2><p>Customer ki profile details update karein.</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Business name<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required autoFocus /></label>
            <label className="form-field">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} required /></label>
            <label className="form-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
            <label className="form-field form-field--wide"><span className="field-label">City <small className="optional-label">Optional</small></span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Lahore" /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Save changes</button></div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Supplier } from '../types'

type EditSupplierModalProps = {
  supplier: Supplier
  onClose: () => void
  onSave: (supplier: Supplier) => void
}

export function EditSupplierModal({ supplier, onClose, onSave }: EditSupplierModalProps) {
  const [name, setName] = useState(supplier.name)
  const [contactPerson, setContactPerson] = useState(supplier.contactPerson)
  const [phone, setPhone] = useState(supplier.phone)
  const [city, setCity] = useState(supplier.city)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSave({ ...supplier, name, contactPerson, phone, city })
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-supplier-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><h2 id="edit-supplier-title">Edit supplier</h2><p>Supplier ki profile details update karein.</p></div><button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Business name<input value={name} onChange={(event) => setName(event.target.value)} required autoFocus /></label>
            <label className="form-field">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} required /></label>
            <label className="form-field">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
            <label className="form-field form-field--wide"><span className="field-label">City <small className="optional-label">Optional</small></span><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="e.g. Faisalabad" /></label>
          </div>
          <div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Save changes</button></div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

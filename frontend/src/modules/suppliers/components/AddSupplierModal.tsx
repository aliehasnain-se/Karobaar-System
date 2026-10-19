import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { SupplierInput } from '../types'

type AddSupplierModalProps = {
  onClose: () => void
  onAdd: (supplier: SupplierInput) => Promise<void>
  quick?: boolean
}

export function AddSupplierModal({
  onClose,
  onAdd,
  quick = false,
}: AddSupplierModalProps) {
  const [name, setName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onAdd({ name, contactPerson: contactPerson || name, phone, city })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save supplier.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-supplier-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="add-supplier-title">
              {quick ? 'Quick new supplier' : 'Add supplier'}
            </h2>
            <p>
              {quick
                ? 'Enter the business name and phone number. Other details can be added later.'
                : 'Save the supplier business and contact details.'}
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
              Business name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Noor Fabrics"
                required
                autoFocus
              />
            </label>
            {!quick && (
              <label className="form-field">
                Contact person
                <input
                  value={contactPerson}
                  onChange={(event) => setContactPerson(event.target.value)}
                  placeholder="Full name"
                  required
                />
              </label>
            )}
            <label className="form-field">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="03XX XXXXXXX"
                required
              />
            </label>
            {!quick && (
              <label className="form-field form-field--wide">
                City
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g. Faisalabad"
                  required
                />
              </label>
            )}
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
              {saving ? 'Saving...' : quick ? 'Add to purchase' : 'Save supplier'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

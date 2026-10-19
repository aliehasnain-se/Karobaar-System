import { X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { useInventory } from '../../inventory/context/useInventory'
import type { Fabric } from '../../inventory/types'

type QuickFabricModalProps = {
  onClose: () => void
  onSaved: (fabric: Fabric) => void
}

export function QuickFabricModal({ onClose, onSaved }: QuickFabricModalProps) {
  const { addFabric } = useInventory()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const fabric = await addFabric({
        name: String(data.get('name') || '').trim(),
        article: String(data.get('article') || '').trim(),
        category: String(data.get('category') || '').trim(),
        brand: String(data.get('brand') || '').trim(),
      })
      onSaved(fabric)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not add fabric.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="quick-fabric-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><h2 id="quick-fabric-title">New fabric</h2><p>Add the fabric once, then use it in this purchase.</p></div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Fabric name<input name="name" placeholder="e.g. Wash & Wear Premium" required /></label>
            <label className="form-field">Article code<input name="article" placeholder="e.g. WW-101" required /></label>
            <label className="form-field">Category<input name="category" placeholder="e.g. Wash & Wear" required /></label>
            <label className="form-field form-field--wide">Brand / mill<input name="brand" placeholder="e.g. Noor Mills" required /></label>
          </div>
          {error && <p className="form-api-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Saving...' : 'Add fabric'}</button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  )
}

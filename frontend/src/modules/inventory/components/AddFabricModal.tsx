import { FormEvent, useState } from 'react'
import { X } from 'lucide-react'
import type { Fabric } from '../types'

type AddFabricModalProps = {
  onClose: () => void
  onAdd: (fabric: Fabric) => void
}

export function AddFabricModal({ onClose, onAdd }: AddFabricModalProps) {
  const [name, setName] = useState('')
  const [article, setArticle] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd({
      id: Date.now(),
      name: name.trim(),
      article: article.trim().toUpperCase(),
      category: category.trim(),
      brand: brand.trim(),
      colors: 0,
      rolls: 0,
      totalMeters: 0,
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-fabric-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="add-fabric-title">Add fabric</h2>
            <p>Create the fabric first. Stock rolls will be added through purchases.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">
              Fabric name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Cotton Soft Finish" required />
            </label>
            <label className="form-field">
              Article code
              <input value={article} onChange={(event) => setArticle(event.target.value)} placeholder="e.g. CT-205" required />
            </label>
            <label className="form-field">
              Category
              <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="e.g. Cotton" required />
            </label>
            <label className="form-field form-field--wide">
              Brand / mill
              <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="e.g. Noor Fabrics" required />
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button--primary">Save fabric</button>
          </div>
        </form>
      </section>
    </div>
  )
}


import { X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../shared/api/client'
import { useInventory } from '../context/useInventory'

type SellingPriceBatch = {
  purchaseItemId: number | null
  rollId: number
  fabric: string
  article: string
  color: string
  availableQuantity: number
  metersPerThaan: number
  price: number
}

type SellingPriceModalProps = {
  batch: SellingPriceBatch
  onClose: () => void
  onSaved: () => void
}

export function SellingPriceModal({ batch, onClose, onSaved }: SellingPriceModalProps) {
  const { setSellingPrice } = useInventory()
  const [price, setPrice] = useState(batch.price)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await setSellingPrice({
        purchaseItemId: batch.purchaseItemId,
        rollId: batch.rollId,
        price,
      })
      onSaved()
    } catch (requestError) {
      setError(
        requestError instanceof ApiError || requestError instanceof Error
          ? requestError.message
          : 'Could not update the selling price.',
      )
    } finally {
      setSaving(false)
    }
  }

  const pricePerMeter = batch.metersPerThaan ? price / batch.metersPerThaan : 0

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="selling-price-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><h2 id="selling-price-title">{batch.price ? 'Edit price' : 'Set selling price'}</h2><p>{batch.fabric} · {batch.article} · {batch.color}</p></div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="form-field form-field--wide">Complete thaan price<input type="number" min="0.01" step="0.01" value={price || ''} onChange={(event) => setPrice(Number(event.target.value))} placeholder="Enter selling price" autoFocus required /></label>
            <div className="opening-cost-preview form-field--wide"><span>Calculated price per meter</span><strong>Rs. {pricePerMeter.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></div>
          </div>
          <p className="form-helper">This price will apply to {batch.availableQuantity} available thaan{batch.availableQuantity === 1 ? '' : 's'} in this batch.</p>
          {error && <p className="form-api-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button--secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Saving...' : 'Save price'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

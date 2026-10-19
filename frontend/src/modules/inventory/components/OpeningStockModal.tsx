import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { ApiError } from '../../../shared/api/client'
import { useInventory } from '../context/useInventory'

type OpeningStockModalProps = {
  onClose: () => void
  onSaved: (rollNumber: string) => void
}

export function OpeningStockModal({
  onClose,
  onSaved,
}: OpeningStockModalProps) {
  const { fabrics, addOpeningStock } = useInventory()
  const [fabricMode, setFabricMode] = useState<'existing' | 'new'>(
    fabrics.length ? 'existing' : 'new',
  )
  const [fabricId, setFabricId] = useState(fabrics[0]?.id ?? 0)
  const [meters, setMeters] = useState(0)
  const [purchaseCost, setPurchaseCost] = useState(0)
  const [price, setPrice] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      const roll = await addOpeningStock({
        fabricId: fabricMode === 'existing' ? fabricId : undefined,
        fabricName:
          fabricMode === 'new' ? String(data.get('fabricName')) : undefined,
        article: fabricMode === 'new' ? String(data.get('article')) : undefined,
        category:
          fabricMode === 'new' ? String(data.get('category')) : undefined,
        brand: fabricMode === 'new' ? String(data.get('brand')) : undefined,
        color: String(data.get('color')),
        meters,
        purchaseCost,
        price,
        rollNumber: String(data.get('rollNumber') || ''),
      })
      onSaved(roll.rollNumber)
    } catch (requestError) {
      const details =
        requestError instanceof ApiError ? requestError.details : null
      const firstFieldError =
        details && typeof details === 'object'
          ? Object.values(details as Record<string, string[]>).flat()[0]
          : null
      setError(
        String(
          firstFieldError ||
            (requestError instanceof Error
              ? requestError.message
              : 'Could not save the stock.'),
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opening-stock-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="opening-stock-title">Add opening stock</h2>
            <p>Add one existing shop roll with its complete details.</p>
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
          <div className="stock-mode" role="group" aria-label="Fabric choice">
            <button
              type="button"
              className={fabricMode === 'existing' ? 'active' : ''}
              disabled={!fabrics.length}
              onClick={() => setFabricMode('existing')}
            >
              Existing fabric
            </button>
            <button
              type="button"
              className={fabricMode === 'new' ? 'active' : ''}
              onClick={() => setFabricMode('new')}
            >
              New fabric
            </button>
          </div>
          <div className="form-grid">
            {fabricMode === 'existing' ? (
              <label className="form-field form-field--wide">
                Fabric
                <select
                  value={fabricId}
                  onChange={(event) => setFabricId(Number(event.target.value))}
                  required
                >
                  {fabrics.map((fabric) => (
                    <option key={fabric.id} value={fabric.id}>
                      {fabric.name} — {fabric.article}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <label className="form-field form-field--wide">
                  Fabric name
                  <input
                    name="fabricName"
                    placeholder="e.g. Cotton Soft Finish"
                    required
                  />
                </label>
                <label className="form-field">
                  Article code
                  <input name="article" placeholder="e.g. CT-205" required />
                </label>
                <label className="form-field">
                  Category
                  <input name="category" placeholder="e.g. Cotton" required />
                </label>
                <label className="form-field form-field--wide">
                  Brand / mill
                  <input
                    name="brand"
                    placeholder="e.g. Noor Fabrics"
                    required
                  />
                </label>
              </>
            )}
            <label className="form-field">
              Color
              <input name="color" placeholder="e.g. Navy Blue" required />
            </label>
            <label className="form-field">
              Roll number <small className="optional-label">Optional</small>
              <input name="rollNumber" placeholder="Auto generated" />
            </label>
            <label className="form-field">
              Meters in roll
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 82.50"
                value={meters || ''}
                onChange={(event) => setMeters(Number(event.target.value))}
                required
              />
            </label>
            <label className="form-field">
              Complete roll purchase cost
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchaseCost || ''}
                onChange={(event) => setPurchaseCost(Number(event.target.value))}
                placeholder="Amount paid for this roll"
                required
              />
            </label>
            <label className="form-field">
              Complete roll price
              <input
                type="number"
                min="0"
                step="0.01"
                value={price || ''}
                onChange={(event) => setPrice(Number(event.target.value))}
                placeholder="Price for the complete roll"
                required
              />
            </label>
            <div className="opening-cost-preview form-field--wide">
              <span>Calculated price per meter</span>
              <strong>Rs. {meters ? (price / meters).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}</strong>
            </div>
          </div>
          {error && (
            <p className="form-api-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button--primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save roll'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

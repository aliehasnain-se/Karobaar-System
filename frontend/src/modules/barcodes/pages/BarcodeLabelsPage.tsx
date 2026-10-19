import { Printer, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Barcode from 'react-barcode'
import { useInventory } from '../../inventory/context/useInventory'
import type { FabricRoll } from '../../inventory/types'
import { useShopSettings } from '../../settings/hooks/useShopSettings'

type BarcodeBatch = {
  key: string
  purchaseNumber: string
  rolls: FabricRoll[]
}

const groupRolls = (rolls: FabricRoll[]): BarcodeBatch[] => {
  const groups = new Map<string, BarcodeBatch>()
  for (const roll of rolls) {
    const key = roll.purchaseItemId ? `purchase-${roll.purchaseItemId}` : `opening-${roll.id}`
    const existing = groups.get(key)
    if (existing) existing.rolls.push(roll)
    else groups.set(key, { key, purchaseNumber: roll.purchaseNumber, rolls: [roll] })
  }
  return [...groups.values()]
}

export function BarcodeLabelsPage() {
  const shopSettings = useShopSettings()
  const { rolls, loading } = useInventory()
  const inventoryRolls = useMemo(() => rolls.filter((roll) => roll.status === 'Available'), [rolls])
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase()
    return groupRolls(inventoryRolls).filter((batch) => {
      const first = batch.rolls[0]
      return !term || [
        batch.purchaseNumber,
        first.fabric,
        first.article,
        first.color,
        ...batch.rolls.flatMap((roll) => [roll.rollNumber, roll.barcode]),
      ].some((value) => value.toLowerCase().includes(term))
    })
  }, [inventoryRolls, search])

  const selectedRolls = inventoryRolls.filter((roll) => selectedIds.includes(roll.id))
  const allVisibleSelected = filteredBatches.length > 0 && filteredBatches.every(
    (batch) => batch.rolls.every((roll) => selectedIds.includes(roll.id)),
  )

  const toggleBatch = (batch: BarcodeBatch) => {
    const batchIds = batch.rolls.map((roll) => roll.id)
    const selected = batchIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => selected
      ? current.filter((id) => !batchIds.includes(id))
      : [...new Set([...current, ...batchIds])],
    )
  }

  const toggleAllVisible = () => {
    const visibleIds = new Set(filteredBatches.flatMap((batch) => batch.rolls.map((roll) => roll.id)))
    if (allVisibleSelected) {
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)))
      return
    }
    setSelectedIds((current) => [...new Set([...current, ...visibleIds])])
  }

  return (
    <div className="barcodes-page">
      <div className="page-heading">
        <div><h1>Barcode Labels</h1><p>Select a purchase batch to print its thaan labels.</p></div>
        <button className="button button--primary" disabled={!selectedRolls.length} onClick={() => window.print()}>
          <Printer size={17} /> {selectedRolls.length ? `Print ${selectedRolls.length} label${selectedRolls.length === 1 ? '' : 's'}` : 'Print labels'}
        </button>
      </div>

      <section className="barcode-workspace">
        <article className="panel barcode-picker">
          <div className="barcode-picker-header">
            <div><h2>Select batches</h2><p>{selectedRolls.length} labels selected</p></div>
            <button type="button" className="text-action" onClick={toggleAllVisible}>{allVisibleSelected ? 'Clear visible' : 'Select all visible'}</button>
          </div>
          <label className="table-search barcode-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Purchase, fabric or barcode..." /></label>
          <div className="barcode-roll-list">
            {loading && <p className="empty-inline">Loading thaans...</p>}
            {filteredBatches.map((batch) => {
              const first = batch.rolls[0]
              const selected = batch.rolls.every((roll) => selectedIds.includes(roll.id))
              return (
                <label className={selected ? 'barcode-roll active' : 'barcode-roll'} key={batch.key}>
                  <input type="checkbox" checked={selected} onChange={() => toggleBatch(batch)} />
                  <span>
                    <strong>{batch.purchaseNumber || first.rollNumber} · {first.fabric}</strong>
                    <small>{first.color} · {batch.rolls.length} thaan{batch.rolls.length === 1 ? '' : 's'} · {first.remainingMeters} m each</small>
                  </span>
                </label>
              )
            })}
            {!filteredBatches.length && <p className="empty-inline">No matching batch found.</p>}
          </div>
        </article>

        <article className="panel barcode-preview">
          <div className="barcode-preview-header"><div><h2>Label preview</h2><p>Prices are not printed on barcode labels.</p></div></div>
          <div className="barcode-labels-grid">
            {selectedRolls.map((roll) => <section className="barcode-label" key={roll.id}>
              <div className="barcode-label-top"><strong>{shopSettings.shopName}</strong><span>{roll.rollNumber}</span></div>
              <div className="barcode-product"><strong>{roll.fabric}</strong><span>{roll.article} · {roll.color} · {roll.remainingMeters} m</span></div>
              <Barcode value={roll.barcode} format="CODE128" width={1.35} height={42} margin={0} displayValue={false} background="#ffffff" />
              <small>{roll.barcode}</small>
            </section>)}
            {!selectedRolls.length && <div className="barcode-empty"><Printer size={24} /><p>Select a batch to preview its labels.</p></div>}
          </div>
        </article>
      </section>
    </div>
  )
}

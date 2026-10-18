import { Printer, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Barcode from 'react-barcode'
import { inventoryRolls } from '../../inventory/data/mockInventory'
import { useShopSettings } from '../../settings/hooks/useShopSettings'

export function BarcodeLabelsPage() {
  const shopSettings = useShopSettings()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([inventoryRolls[0].id])

  const filteredRolls = useMemo(() => {
    const term = search.trim().toLowerCase()
    return inventoryRolls.filter((roll) => !term || [roll.rollNumber, roll.barcode, roll.fabric, roll.article, roll.color].some((value) => value.toLowerCase().includes(term)))
  }, [search])

  const selectedRolls = inventoryRolls.filter((roll) => selectedIds.includes(roll.id))
  const allVisibleSelected = filteredRolls.length > 0 && filteredRolls.every((roll) => selectedIds.includes(roll.id))

  const toggleRoll = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredRolls.map((roll) => roll.id))
      setSelectedIds((current) => current.filter((id) => !visibleIds.has(id)))
      return
    }
    setSelectedIds((current) => [...new Set([...current, ...filteredRolls.map((roll) => roll.id)])])
  }

  return (
    <div className="barcodes-page">
      <div className="page-heading">
        <div><h1>Barcode Labels</h1><p>Rolls select karke labels preview aur print karein.</p></div>
        <button className="button button--primary" disabled={!selectedRolls.length} onClick={() => window.print()}><Printer size={17} /> {selectedRolls.length ? `Print ${selectedRolls.length} label${selectedRolls.length === 1 ? '' : 's'}` : 'Print labels'}</button>
      </div>

      <section className="barcode-workspace">
        <article className="panel barcode-picker">
          <div className="barcode-picker-header"><div><h2>Select rolls</h2><p>{selectedRolls.length} selected</p></div><button type="button" className="text-action" onClick={toggleAllVisible}>{allVisibleSelected ? 'Clear visible' : 'Select all visible'}</button></div>
          <label className="table-search barcode-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Roll, fabric or barcode..." /></label>
          <div className="barcode-roll-list">
            {filteredRolls.map((roll) => <label className={selectedIds.includes(roll.id) ? 'barcode-roll active' : 'barcode-roll'} key={roll.id}><input type="checkbox" checked={selectedIds.includes(roll.id)} onChange={() => toggleRoll(roll.id)} /><span><strong>{roll.rollNumber} · {roll.fabric}</strong><small>{roll.color} · {roll.remainingMeters} m · {roll.barcode}</small></span></label>)}
            {!filteredRolls.length && <p className="empty-inline">Koi matching roll nahi mila.</p>}
          </div>
        </article>

        <article className="panel barcode-preview">
          <div className="barcode-preview-header"><div><h2>Label preview</h2><p>Cost aur sale price label par show nahi hoti.</p></div></div>
          <div className="barcode-labels-grid">
            {selectedRolls.map((roll) => <section className="barcode-label" key={roll.id}>
              <div className="barcode-label-top"><strong>{shopSettings.shopName}</strong><span>{roll.rollNumber}</span></div>
              <div className="barcode-product"><strong>{roll.fabric}</strong><span>{roll.article} · {roll.color} · {roll.remainingMeters} m</span></div>
              <Barcode value={roll.barcode} format="CODE128" width={1.35} height={42} margin={0} displayValue={false} background="#ffffff" />
              <small>{roll.barcode}</small>
            </section>)}
            {!selectedRolls.length && <div className="barcode-empty"><Printer size={24} /><p>Preview ke liye roll select karein.</p></div>}
          </div>
        </article>
      </section>
    </div>
  )
}

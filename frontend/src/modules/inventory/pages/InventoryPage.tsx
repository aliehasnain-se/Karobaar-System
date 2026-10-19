import { PackagePlus, Pencil, Search, Tags } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SellingPriceModal } from '../components/SellingPriceModal'
import { useInventory } from '../context/useInventory'
import type { FabricRoll } from '../types'

type InventoryTab = 'stock' | 'fabrics'
type StockState = 'Ready' | 'Price needed' | 'Partially sold' | 'Sold out'
type StockFilter = 'Available stock' | 'All stock' | StockState

type InventoryBatch = {
  key: string
  purchaseItemId: number | null
  purchaseNumber: string
  rollId: number
  rollNumbers: string[]
  barcodes: string[]
  fabric: string
  article: string
  brand: string
  color: string
  supplier: string
  totalQuantity: number
  availableQuantity: number
  metersPerThaan: number
  remainingMeters: number
  price: number
  state: StockState
}

const stockFilters: StockFilter[] = [
  'Available stock',
  'Ready',
  'Price needed',
  'Partially sold',
  'Sold out',
  'All stock',
]

const groupRolls = (rolls: FabricRoll[]): InventoryBatch[] => {
  const groups = new Map<string, FabricRoll[]>()
  for (const roll of rolls) {
    const key = roll.purchaseItemId ? `purchase-${roll.purchaseItemId}` : `opening-${roll.id}`
    groups.set(key, [...(groups.get(key) ?? []), roll])
  }
  return [...groups.entries()].map(([key, batchRolls]) => {
    const first = batchRolls[0]
    const available = batchRolls.filter((roll) => roll.statusCode === 'AVAILABLE')
    const price = available[0]?.price ?? first.price
    const state: StockState = available.length === 0
      ? 'Sold out'
      : price <= 0
        ? 'Price needed'
        : available.length < batchRolls.length
          ? 'Partially sold'
          : 'Ready'
    return {
      key,
      purchaseItemId: first.purchaseItemId,
      purchaseNumber: first.purchaseNumber,
      rollId: first.id,
      rollNumbers: batchRolls.map((roll) => roll.rollNumber),
      barcodes: batchRolls.map((roll) => roll.barcode),
      fabric: first.fabric,
      article: first.article,
      brand: first.brand,
      color: first.color,
      supplier: first.supplier,
      totalQuantity: batchRolls.length,
      availableQuantity: available.length,
      metersPerThaan: first.originalMeters,
      remainingMeters: available.reduce((sum, roll) => sum + roll.remainingMeters, 0),
      price,
      state,
    }
  })
}

const money = (value: number) => `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const statusClass = (state: StockState) => {
  if (state === 'Ready') return 'status--paid'
  if (state === 'Price needed') return 'status--unpaid'
  if (state === 'Partially sold') return 'status--partial'
  return 'stock-status--sold'
}

export function InventoryPage() {
  const { fabrics, rolls, loading, error, refresh } = useInventory()
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceBatch, setPriceBatch] = useState<InventoryBatch | null>(null)
  const [notice, setNotice] = useState('')
  const search = searchParams.get('q') ?? ''
  const activeTab: InventoryTab = searchParams.get('tab') === 'fabrics' ? 'fabrics' : 'stock'
  const rawFilter = searchParams.get('status')
  const stockFilter = stockFilters.find((item) => item.toLowerCase() === rawFilter) ?? 'Available stock'
  const batches = useMemo(() => groupRolls(rolls), [rolls])

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  const changeTab = (tab: InventoryTab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'fabrics') next.set('tab', 'fabrics')
    else next.delete('tab')
    setSearchParams(next, { replace: true })
  }

  const filteredBatches = useMemo(() => {
    const term = search.trim().toLowerCase()
    return batches.filter((batch) => {
      const matchesSearch = !term || [
        batch.fabric,
        batch.article,
        batch.brand,
        batch.color,
        batch.supplier,
        batch.purchaseNumber,
        ...batch.rollNumbers,
        ...batch.barcodes,
      ].some((value) => value.toLowerCase().includes(term))
      const matchesFilter = stockFilter === 'All stock'
        || (stockFilter === 'Available stock' && batch.availableQuantity > 0)
        || batch.state === stockFilter
      return matchesSearch && matchesFilter
    })
  }, [batches, search, stockFilter])

  const filteredFabrics = useMemo(() => {
    const term = search.trim().toLowerCase()
    return fabrics.filter((fabric) => !term || [fabric.name, fabric.article, fabric.category, fabric.brand]
      .some((value) => value.toLowerCase().includes(term)))
  }, [fabrics, search])

  const availableRolls = rolls.filter((roll) => roll.statusCode === 'AVAILABLE')
  const availableMeters = availableRolls.reduce((sum, roll) => sum + roll.remainingMeters, 0)
  const priceNeeded = batches.filter((batch) => batch.availableQuantity > 0 && batch.price <= 0).length

  return (
    <div className="inventory-page">
      <div className="page-heading">
        <div><h1>Inventory</h1><p>Current stock created automatically from purchases.</p></div>
        <div className="heading-actions">
          <Link className="button button--secondary" to="/barcodes"><Tags size={17} /> Barcode labels</Link>
          <Link className="button button--primary" to="/purchases/new"><PackagePlus size={17} /> New purchase</Link>
        </div>
      </div>

      {notice && <div className="form-notice" role="status"><strong>{notice}</strong></div>}
      {error && <div className="form-api-error" role="alert">{error} <button type="button" className="text-action" onClick={() => void refresh()}>Try again</button></div>}

      <section className="inventory-summary" aria-label="Inventory summary">
        <div><span>Available thaans</span><strong>{availableRolls.length}</strong></div>
        <div><span>Available meters</span><strong>{availableMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m</strong></div>
        <div><span>Fabric designs</span><strong>{fabrics.length}</strong></div>
        <div><span>Price needed</span><strong>{priceNeeded}</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="tabs" role="tablist" aria-label="Inventory view">
            <button className={activeTab === 'stock' ? 'tab active' : 'tab'} onClick={() => changeTab('stock')}>Stock</button>
            <button className={activeTab === 'fabrics' ? 'tab active' : 'tab'} onClick={() => changeTab('fabrics')}>Fabrics</button>
          </div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => updateParam('q', event.target.value || undefined)} placeholder="Search fabric, article or purchase..." /></label>
            {activeTab === 'stock' && <select className="plain-select" value={stockFilter} onChange={(event) => updateParam('status', event.target.value === 'Available stock' ? undefined : event.target.value.toLowerCase())} aria-label="Filter stock">
              {stockFilters.map((item) => <option key={item}>{item}</option>)}
            </select>}
          </div>
        </div>

        {loading ? <p className="empty-state">Inventory loading...</p> : activeTab === 'stock' ? (
          <div className="inventory-table-wrap">
            <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
            <table>
              <thead><tr><th>Fabric</th><th>Color</th><th>Purchase</th><th>Stock</th><th>Meters per thaan</th><th>Remaining meters</th><th>Price</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>{filteredBatches.map((batch) => <tr key={batch.key}>
                <td><strong>{batch.fabric}</strong><small className="cell-subtext">{batch.brand} · {batch.article}</small></td>
                <td>{batch.color}</td>
                <td>{batch.purchaseNumber ? <><Link className="table-primary-link" to={`/purchases/${batch.purchaseNumber}`}>{batch.purchaseNumber}</Link><small className="cell-subtext">{batch.supplier}</small></> : <span>Opening stock</span>}</td>
                <td>
                  <strong>
                    {batch.availableQuantity === batch.totalQuantity
                      ? `${batch.availableQuantity} ${batch.availableQuantity === 1 ? 'thaan' : 'thaans'}`
                      : `${batch.availableQuantity} available`}
                  </strong>
                  {batch.availableQuantity !== batch.totalQuantity && (
                    <small className="cell-subtext">Purchased: {batch.totalQuantity}</small>
                  )}
                </td>
                <td>{batch.metersPerThaan.toLocaleString()} m</td>
                <td><strong>{batch.remainingMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} m</strong></td>
                <td>{batch.price ? <><strong>{money(batch.price)}</strong><small className="cell-subtext">{money(batch.price / batch.metersPerThaan)} / meter</small></> : <span>Not set</span>}</td>
                <td><span className={`status ${statusClass(batch.state)}`}>{batch.state}</span></td>
                <td>{batch.availableQuantity > 0 && <button className="button button--secondary inventory-price-button" type="button" onClick={() => setPriceBatch(batch)}><Pencil size={14} /> {batch.price ? 'Edit price' : 'Set price'}</button>}</td>
              </tr>)}</tbody>
            </table>
            {!filteredBatches.length && <p className="empty-state">No matching stock found.</p>}
          </div>
        ) : (
          <div className="inventory-table-wrap">
            <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
            <table>
              <thead><tr><th>Fabric</th><th>Article</th><th>Category</th><th>Brand / Mill</th><th>Colors</th><th>Available thaans</th><th>Total meters</th></tr></thead>
              <tbody>{filteredFabrics.map((fabric) => <tr key={fabric.id}><td><strong>{fabric.name}</strong></td><td>{fabric.article}</td><td>{fabric.category}</td><td>{fabric.brand}</td><td>{fabric.colors}</td><td>{fabric.rolls}</td><td>{fabric.totalMeters.toLocaleString()} m</td></tr>)}</tbody>
            </table>
            {!filteredFabrics.length && <p className="empty-state">No matching fabric found.</p>}
          </div>
        )}
      </section>

      {priceBatch && <SellingPriceModal batch={priceBatch} onClose={() => setPriceBatch(null)} onSaved={() => { setNotice('Selling price updated.'); setPriceBatch(null) }} />}
    </div>
  )
}

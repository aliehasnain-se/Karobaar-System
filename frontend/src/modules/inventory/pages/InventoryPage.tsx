import { PackagePlus, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddFabricModal } from '../components/AddFabricModal'
import { initialFabrics, inventoryRolls } from '../data/mockInventory'
import type { Fabric } from '../types'

type InventoryTab = 'rolls' | 'fabrics'

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('rolls')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [fabrics, setFabrics] = useState<Fabric[]>(initialFabrics)
  const [showAddFabric, setShowAddFabric] = useState(false)

  const filteredRolls = useMemo(() => {
    const term = search.trim().toLowerCase()
    return inventoryRolls.filter((roll) => {
      const matchesSearch = !term || [roll.fabric, roll.article, roll.color, roll.rollNumber, roll.barcode]
        .some((value) => value.toLowerCase().includes(term))
      const matchesStatus = status === 'All statuses' || roll.status === status
      return matchesSearch && matchesStatus
    })
  }, [search, status])

  const filteredFabrics = useMemo(() => {
    const term = search.trim().toLowerCase()
    return fabrics.filter((fabric) => !term || [fabric.name, fabric.article, fabric.category, fabric.brand]
      .some((value) => value.toLowerCase().includes(term)))
  }, [fabrics, search])

  const totalMeters = inventoryRolls.reduce((sum, roll) => sum + roll.remainingMeters, 0)
  const availableRolls = inventoryRolls.filter((roll) => roll.status === 'Available').length

  const addFabric = (fabric: Fabric) => {
    setFabrics((current) => [fabric, ...current])
    setShowAddFabric(false)
    setActiveTab('fabrics')
  }

  return (
    <div className="inventory-page">
      <div className="page-heading">
        <div><h1>Inventory</h1><p>Fabric catalog aur roll-wise stock manage karein.</p></div>
        <div className="heading-actions">
          <button className="button button--secondary" onClick={() => setShowAddFabric(true)}><Plus size={17} /> Add fabric</button>
          <Link className="button button--primary" to="/purchases"><PackagePlus size={17} /> Record purchase</Link>
        </div>
      </div>

      <section className="inventory-summary" aria-label="Inventory summary">
        <div><span>Total stock</span><strong>{totalMeters.toLocaleString()} m</strong></div>
        <div><span>Available rolls</span><strong>{availableRolls}</strong></div>
        <div><span>Fabric designs</span><strong>{fabrics.length}</strong></div>
        <div><span>Low stock</span><strong>6</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="tabs" role="tablist" aria-label="Inventory view">
            <button className={activeTab === 'rolls' ? 'tab active' : 'tab'} onClick={() => setActiveTab('rolls')}>Rolls</button>
            <button className={activeTab === 'fabrics' ? 'tab active' : 'tab'} onClick={() => setActiveTab('fabrics')}>Fabrics</button>
          </div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory..." /></label>
            {activeTab === 'rolls' && <>
              <select className="plain-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter status"><option>All statuses</option><option>Available</option><option>Low stock</option><option>In transit</option></select>
            </>}
          </div>
        </div>

        {activeTab === 'rolls' ? (
          <div className="inventory-table-wrap">
            <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
            <table>
              <thead><tr><th>Roll / Barcode</th><th>Fabric</th><th>Color</th><th>Original</th><th>Remaining</th><th>Status</th></tr></thead>
              <tbody>
                {filteredRolls.map((roll) => (
                  <tr key={roll.id}>
                    <td><strong>{roll.rollNumber}</strong><small className="cell-subtext">{roll.barcode}</small></td>
                    <td><strong>{roll.fabric}</strong><small className="cell-subtext">{roll.article}</small></td>
                    <td><span className="color-dot" />{roll.color}</td>
                    <td>{roll.originalMeters} m</td><td><strong>{roll.remainingMeters} m</strong></td>
                    <td><span className={`stock-status stock-status--${roll.status.toLowerCase().replace(' ', '-')}`}>{roll.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredRolls.length && <p className="empty-state">Koi matching roll nahi mila.</p>}
          </div>
        ) : (
          <div className="inventory-table-wrap">
            <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
            <table>
              <thead><tr><th>Fabric</th><th>Article</th><th>Category</th><th>Brand / Mill</th><th>Colors</th><th>Rolls</th><th>Total stock</th></tr></thead>
              <tbody>
                {filteredFabrics.map((fabric) => (
                  <tr key={fabric.id}><td><strong>{fabric.name}</strong></td><td>{fabric.article}</td><td>{fabric.category}</td><td>{fabric.brand}</td><td>{fabric.colors}</td><td>{fabric.rolls}</td><td><strong>{fabric.totalMeters.toLocaleString()} m</strong></td></tr>
                ))}
              </tbody>
            </table>
            {!filteredFabrics.length && <p className="empty-state">Koi matching fabric nahi mila.</p>}
          </div>
        )}
      </section>

      {showAddFabric && <AddFabricModal onClose={() => setShowAddFabric(false)} onAdd={addFabric} />}
    </div>
  )
}

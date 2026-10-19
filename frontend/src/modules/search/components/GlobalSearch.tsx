import { ArrowRight, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useInventory } from '../../inventory/context/useInventory'
import { usePurchases } from '../../purchases/context/usePurchases'
import { useSuppliers } from '../../suppliers/context/useSuppliers'
import { globalSearchItems, type GlobalSearchItem } from '../data/mockSearchItems'

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { fabrics, rolls } = useInventory()
  const { suppliers } = useSuppliers()
  const { purchases } = usePurchases()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []

    const rollGroups = new Map<string, typeof rolls>()
    for (const roll of rolls) {
      const key = roll.purchaseItemId ? `purchase-${roll.purchaseItemId}` : `opening-${roll.id}`
      rollGroups.set(key, [...(rollGroups.get(key) ?? []), roll])
    }
    const inventoryItems: GlobalSearchItem[] = [
      ...[...rollGroups.entries()].map(([key, batchRolls]) => {
        const first = batchRolls[0]
        const searchValue = first.purchaseNumber || first.barcode
        return {
          id: `stock-${key}`,
          category: 'Thaan' as const,
          title: first.purchaseNumber || first.rollNumber,
          subtitle: `${first.fabric} · ${first.color} · ${batchRolls.length} thaans`,
          keywords: `${first.fabric} ${first.article} ${first.color} ${batchRolls.flatMap((roll) => [roll.rollNumber, roll.barcode]).join(' ')}`,
          to: `/inventory?q=${encodeURIComponent(searchValue)}&status=all stock`,
        }
      }),
      ...fabrics.map((fabric) => ({
        id: `fabric-${fabric.id}`,
        category: 'Fabric' as const,
        title: fabric.name,
        subtitle: `${fabric.article} · ${fabric.category}`,
        keywords: `${fabric.name} ${fabric.article} ${fabric.category} ${fabric.brand}`,
        to: `/inventory?tab=fabrics&q=${encodeURIComponent(fabric.article)}`,
      })),
    ]
    const supplierItems: GlobalSearchItem[] = suppliers.map((supplier) => ({
      id: `supplier-${supplier.id}`,
      category: 'Supplier' as const,
      title: supplier.name,
      subtitle: `${supplier.phone} · ${supplier.city}`,
      keywords: `${supplier.name} ${supplier.contactPerson} ${supplier.phone} ${supplier.city}`,
      to: `/suppliers/${supplier.id}`,
    }))
    const purchaseItems: GlobalSearchItem[] = purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      category: 'Purchase' as const,
      title: purchase.number,
      subtitle: `${purchase.supplier} · Rs. ${purchase.total.toLocaleString()}`,
      keywords: `${purchase.number} ${purchase.supplierInvoiceNumber} ${purchase.supplier}`,
      to: `/purchases/${purchase.number}`,
    }))
    return [...globalSearchItems, ...inventoryItems, ...supplierItems, ...purchaseItems]
      .filter((item) => `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase().includes(term))
      .slice(0, 8)
  }, [fabrics, purchases, query, rolls, suppliers])

  useEffect(() => {
    const focusSearch = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const closeSearch = () => {
    setQuery('')
    setOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      inputRef.current?.blur()
      setOpen(false)
    }
    if (event.key === 'Enter' && results[0]) {
      event.preventDefault()
      navigate(results[0].to)
      closeSearch()
    }
  }

  return (
    <div className="global-search" onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <Search size={18} />
      <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} onKeyDown={handleKeyDown} aria-label="Global search" placeholder="Search purchase, supplier, fabric or barcode..." />
      <kbd>Ctrl K</kbd>
      {open && query.trim().length >= 2 && <div className="global-search-results">
        {results.map((item) => <Link to={item.to} className="global-search-result" key={item.id} onClick={closeSearch}>
          <span className="search-result-type">{item.category}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowRight size={15} />
        </Link>)}
        {!results.length && <p className="global-search-empty">No matching record found.</p>}
      </div>}
    </div>
  )
}

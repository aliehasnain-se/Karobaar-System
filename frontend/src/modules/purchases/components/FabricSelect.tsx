import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { initialFabrics } from '../../inventory/data/mockInventory'

type FabricSelectProps = {
  value: string
  onChange: (fabric: string) => void
}

export function FabricSelect({ value, onChange }: FabricSelectProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 340 })

  const matchingFabrics = useMemo(() => {
    const term = search.trim().toLowerCase()
    return initialFabrics.filter((fabric) => !term || [fabric.name, fabric.article, fabric.category, fabric.brand].some((field) => field.toLowerCase().includes(term)))
  }, [search])

  useEffect(() => {
    if (!open) return
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = Math.min(340, window.innerWidth - 24)
      setPosition({ top: rect.bottom + 5, left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), width })
    }
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false)
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [open])

  return (
    <>
      <button ref={buttonRef} type="button" className="fabric-picker-button" onClick={() => { setOpen((current) => !current); setSearch('') }} aria-haspopup="listbox" aria-expanded={open}><span>{value}</span><ChevronDown size={15} /></button>
      {open && createPortal(
        <div ref={menuRef} className="customer-select-menu fabric-select-menu" style={position}>
          <input className="customer-menu-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by fabric or article" aria-label="Search fabrics" autoFocus />
          <div className="customer-menu-options" role="listbox">
            {matchingFabrics.map((fabric) => <button type="button" key={fabric.id} onClick={() => { onChange(fabric.name); setOpen(false); setSearch('') }}><span><strong>{fabric.name}</strong><small>{fabric.article} · {fabric.category}</small></span>{value === fabric.name && <Check size={15} />}</button>)}
            {!matchingFabrics.length && <p>No fabric found.</p>}
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

import { ArrowRight, Search } from 'lucide-react'
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { globalSearchItems } from '../data/mockSearchItems'

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (term.length < 2) return []
    return globalSearchItems.filter((item) => `${item.title} ${item.subtitle} ${item.keywords}`.toLowerCase().includes(term)).slice(0, 8)
  }, [query])

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
      <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true) }} onKeyDown={handleKeyDown} aria-label="Global search" placeholder="Search invoice, customer, roll or barcode..." />
      <kbd>Ctrl K</kbd>
      {open && query.trim().length >= 2 && <div className="global-search-results">
        {results.map((item) => <Link to={item.to} className="global-search-result" key={item.id} onClick={closeSearch}><span className="search-result-type">{item.category}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowRight size={15} /></Link>)}
        {!results.length && <p className="global-search-empty">Koi matching record nahi mila.</p>}
      </div>}
    </div>
  )
}

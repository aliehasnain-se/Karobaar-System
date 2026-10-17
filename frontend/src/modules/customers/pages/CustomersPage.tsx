import { ChevronRight, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddCustomerModal } from '../components/AddCustomerModal'
import { initialCustomers } from '../data/mockCustomers'
import type { Customer } from '../types'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState('')
  const [balanceFilter, setBalanceFilter] = useState('All customers')
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const balance = customer.sales - customer.received
      const matchesSearch = !term || [customer.businessName, customer.contactPerson, customer.phone, customer.city].some((value) => value.toLowerCase().includes(term))
      const matchesBalance = balanceFilter === 'All customers' || (balanceFilter === 'With balance' ? balance > 0 : balance === 0)
      return matchesSearch && matchesBalance
    })
  }, [balanceFilter, customers, search])

  const totalSales = customers.reduce((sum, customer) => sum + customer.sales, 0)
  const totalReceived = customers.reduce((sum, customer) => sum + customer.received, 0)

  return (
    <div className="customers-page">
      <div className="page-heading">
        <div><h1>Customers</h1><p>Customer accounts, sales aur remaining balances.</p></div>
        <button className="button button--primary" onClick={() => setShowAddCustomer(true)}><Plus size={17} /> Add customer</button>
      </div>

      <section className="inventory-summary" aria-label="Customer summary">
        <div><span>Total customers</span><strong>{customers.length}</strong></div>
        <div><span>Total sales</span><strong>{money(totalSales)}</strong></div>
        <div><span>Cash received</span><strong>{money(totalReceived)}</strong></div>
        <div><span>Total customer balance</span><strong>{money(totalSales - totalReceived)}</strong></div>
      </section>

      <section className="panel inventory-panel">
        <div className="inventory-toolbar">
          <div className="panel-heading"><div><h2>Customer accounts</h2><p>{filteredCustomers.length} customers</p></div></div>
          <div className="inventory-filters">
            <label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone or city..." /></label>
            <select className="plain-select" value={balanceFilter} onChange={(event) => setBalanceFilter(event.target.value)} aria-label="Filter customer balance"><option>All customers</option><option>With balance</option><option>Fully paid</option></select>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">Swipe left to see more columns →</p>
          <table>
            <thead><tr><th>Customer</th><th>Contact</th><th>City</th><th>Total sales</th><th>Received</th><th>Balance</th><th>Last sale</th><th aria-label="Open" /></tr></thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const balance = customer.sales - customer.received
                return <tr key={customer.id}>
                  <td><Link className="table-primary-link" to={`/customers/${customer.id}`}>{customer.businessName}</Link></td>
                  <td>{customer.contactPerson}<small className="cell-subtext">{customer.phone}</small></td><td>{customer.city}</td>
                  <td>{money(customer.sales)}</td><td>{money(customer.received)}</td><td><strong className={balance > 0 ? 'amount-due' : ''}>{money(balance)}</strong></td>
                  <td>{customer.lastSale}</td>
                  <td><Link className="row-open" to={`/customers/${customer.id}`} aria-label={`Open ${customer.businessName}`}><ChevronRight size={17} /></Link></td>
                </tr>
              })}
            </tbody>
          </table>
          {!filteredCustomers.length && <p className="empty-state">Koi matching customer nahi mila.</p>}
        </div>
      </section>

      {showAddCustomer && <AddCustomerModal onClose={() => setShowAddCustomer(false)} onAdd={(customer) => { setCustomers((current) => [customer, ...current]); setShowAddCustomer(false) }} />}
    </div>
  )
}


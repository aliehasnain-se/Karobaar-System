import { ArrowRight, ClipboardPlus, ScanBarcode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCustomers } from '../../customers/context/useCustomers'
import { useInventory } from '../../inventory/context/useInventory'
import { usePurchases } from '../../purchases/context/usePurchases'
import { useSuppliers } from '../../suppliers/context/useSuppliers'

const money = (value: number) => `Rs. ${value.toLocaleString()}`

export function DashboardPage() {
  const { customers } = useCustomers()
  const { rolls } = useInventory()
  const { purchases } = usePurchases()
  const { suppliers } = useSuppliers()
  const availableRolls = rolls.filter((roll) => roll.statusCode === 'AVAILABLE')
  const availableMeters = availableRolls.reduce((sum, roll) => sum + roll.remainingMeters, 0)
  const customerBalance = customers.reduce((sum, customer) => sum + customer.sales - customer.received, 0)
  const supplierBalance = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0)
  const activePurchases = purchases.filter((purchase) => purchase.status !== 'Cancelled')
  const totalPurchases = activePurchases.reduce((sum, purchase) => sum + purchase.total, 0)
  const recentPurchases = purchases.slice(0, 5)
  const stats = [
    { label: 'Total purchases', value: money(totalPurchases), note: `${activePurchases.length} active records` },
    { label: 'Available stock', value: `${availableMeters.toLocaleString()} m`, note: `${availableRolls.length} thaans` },
    { label: 'Customer balance', value: money(customerBalance), note: `${customers.length} customers` },
    { label: 'Supplier balance', value: money(supplierBalance), note: `${suppliers.length} suppliers` },
  ]

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div><h1>Dashboard</h1><p>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
        <div className="heading-actions">
          <Link to="/purchases/new" className="button button--secondary"><ClipboardPlus size={17} /> New purchase</Link>
          <Link to="/sales/new" className="button button--primary"><ScanBarcode size={17} /> Create sale</Link>
        </div>
      </div>

      <section className="stat-grid" aria-label="Business summary">
        {stats.map((stat) => <article className="stat-card" key={stat.label}><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.note}</small></article>)}
      </section>

      <section className="dashboard-grid">
        <article className="panel table-panel">
          <div className="panel-heading"><div><h2>Recent purchases</h2><p>Latest supplier purchases</p></div><Link to="/purchases" className="text-link">View all <ArrowRight size={15} /></Link></div>
          <div className="table-scroll">
            <table><thead><tr><th>Purchase</th><th>Supplier</th><th>Thaans</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{recentPurchases.map((purchase) => <tr key={purchase.id}>
                <td><Link className="table-primary-link" to={`/purchases/${purchase.number}`}>{purchase.number}</Link></td><td>{purchase.supplier}</td><td>{purchase.thaans}</td><td><strong>{money(purchase.total)}</strong></td><td><span className={`status status--${purchase.status.toLowerCase()}`}>{purchase.status}</span></td>
              </tr>)}</tbody>
            </table>
            {!recentPurchases.length && <p className="empty-state">No purchases recorded yet.</p>}
          </div>
        </article>

        <article className="panel tasks-panel">
          <div className="panel-heading"><div><h2>Getting started</h2><p>Your real records will appear here</p></div></div>
          <div className="task-list">
            <Link className="task-item" to="/suppliers"><span><strong>Suppliers</strong><small>{suppliers.length} records</small></span><ArrowRight size={16} /></Link>
            <Link className="task-item" to="/purchases"><span><strong>Purchases</strong><small>{purchases.length} records</small></span><ArrowRight size={16} /></Link>
            <Link className="task-item" to="/inventory"><span><strong>Inventory</strong><small>{availableRolls.length} available thaans</small></span><ArrowRight size={16} /></Link>
          </div>
        </article>
      </section>
    </div>
  )
}

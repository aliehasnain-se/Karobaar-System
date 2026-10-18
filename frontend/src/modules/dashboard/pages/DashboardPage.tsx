import {
  ArrowRight,
  Boxes,
  ClipboardPlus,
  RotateCcw,
  ScanBarcode,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const stats = [
  { label: "Today's sales", value: 'Rs. 684,500', note: '12 invoices' },
  { label: 'Available stock', value: '18,420 m', note: '284 rolls' },
  { label: 'Customer balance', value: 'Rs. 1,240,000', note: '38 customers' },
  { label: 'Supplier balance', value: 'Rs. 870,000', note: '11 suppliers' },
]

const recentSales = [
  { invoice: 'SAL-0128', customer: 'Madina Fabrics', quantity: '4 rolls · 312 m', total: 'Rs. 187,200', status: 'Partial' },
  { invoice: 'SAL-0127', customer: 'Al-Rehman Cloth', quantity: '2 rolls · 144 m', total: 'Rs. 82,800', status: 'Paid' },
  { invoice: 'SAL-0126', customer: 'Usman Traders', quantity: '6 rolls · 465 m', total: 'Rs. 269,700', status: 'Unpaid' },
  { invoice: 'SAL-0125', customer: 'New City Garments', quantity: '1 roll · 78 m', total: 'Rs. 46,800', status: 'Paid' },
]

const tasks = [
  { title: 'Return history', detail: '4 recent records', to: '/returns', icon: RotateCcw },
  { title: 'Overdue customer payments', detail: '4 customers · Rs. 1,240,000', to: '/customers?balance=with-balance', icon: Users },
  { title: 'Low stock rolls', detail: '1 roll below minimum', to: '/inventory?tab=rolls&status=low-stock', icon: Boxes },
]

export function DashboardPage() {
  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Saturday, 17 October 2026</p>
        </div>
        <div className="heading-actions">
          <Link to="/purchases/new" className="button button--secondary">
            <ClipboardPlus size={17} /> New purchase
          </Link>
          <Link to="/sales/new" className="button button--primary">
            <ScanBarcode size={17} /> Create sale
          </Link>
        </div>
      </div>

      <section className="stat-grid" aria-label="Business summary">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent sales</h2>
              <p>Latest shop invoices</p>
            </div>
            <Link to="/sales" className="text-link">View all <ArrowRight size={15} /></Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Invoice</th><th>Customer</th><th>Quantity</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.invoice}>
                    <td><strong>{sale.invoice}</strong></td><td>{sale.customer}</td><td>{sale.quantity}</td>
                    <td><strong>{sale.total}</strong></td>
                    <td><span className={`status status--${sale.status.toLowerCase()}`}>{sale.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel tasks-panel">
          <div className="panel-heading"><div><h2>Needs attention</h2><p>Items that require action</p></div></div>
          <div className="task-list">
            {tasks.map(({ title, detail, to, icon: Icon }) => (
              <Link className="task-item" to={to} key={title}>
                <span className="task-icon"><Icon size={18} /></span>
                <span><strong>{title}</strong><small>{detail}</small></span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

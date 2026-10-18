import {
  BadgeDollarSign,
  Boxes,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PackageSearch,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/returns', label: 'Returns', icon: RotateCcw },
  { to: '/expenses', label: 'Cash & Expenses', icon: BadgeDollarSign },
  { to: '/reports', label: 'Reports', icon: PackageSearch },
]

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">K</div>
          <div>
            <strong>Karobaar</strong>
            <small>Business Management</small>
          </div>
          <button
            className="icon-button sidebar-close"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">AH</div>
          <div>
            <strong>Ali Hasnain</strong>
            <small>Owner</small>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>

      <div className="page-column">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="global-search">
            <Search size={18} />
            <input
              aria-label="Search"
              placeholder="Search invoice, customer, roll or barcode..."
            />
            <kbd>Ctrl K</kbd>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


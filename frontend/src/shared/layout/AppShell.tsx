import {
  Boxes,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PackageSearch,
  RotateCcw,
  ScanBarcode,
  Settings as SettingsIcon,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { GlobalSearch } from '../../modules/search/components/GlobalSearch'
import { useShopSettings } from '../../modules/settings/hooks/useShopSettings'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/barcodes', label: 'Barcode Labels', icon: ScanBarcode },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart },
  { to: '/sales', label: 'Sales', icon: ClipboardList },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/returns', label: 'Returns', icon: RotateCcw },
  { to: '/reports', label: 'Reports', icon: PackageSearch },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const shopSettings = useShopSettings()

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
            <strong>{shopSettings.shopName}</strong>
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
            <strong>{shopSettings.ownerName}</strong>
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
          <GlobalSearch />
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


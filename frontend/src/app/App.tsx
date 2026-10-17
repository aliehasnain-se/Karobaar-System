import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { InventoryPage } from '../modules/inventory/pages/InventoryPage'
import { ModulePlaceholder } from '../shared/components/ModulePlaceholder'
import { AppShell } from '../shared/layout/AppShell'

const modules = [
  ['purchases', 'Purchases', 'Supplier se aane wale rolls aur payment status yahan record hoga.'],
  ['sales', 'Sales', 'Barcode scan, complete thaan sale aur cash/udhaar invoice yahan banega.'],
  ['customers', 'Customers', 'Customer profiles, payment receipts aur udhaar ledger yahan milega.'],
  ['suppliers', 'Suppliers', 'Supplier purchases, payments aur payable ledger yahan milega.'],
  ['transfers', 'Stock Transfers', 'Branch transfer request, approval, transit aur receiving workflow.'],
  ['returns', 'Returns', 'Online invoice search, return approval aur exchange adjustment.'],
  ['expenses', 'Cash & Expenses', 'Branch cash movement, supplier payments aur daily expenses.'],
  ['reports', 'Reports', 'Stock, sales, ledgers, transfers aur profit reports.'],
] as const

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        {modules.map(([path, title, description]) => (
          <Route
            key={path}
            path={path}
            element={<ModulePlaceholder title={title} description={description} />}
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


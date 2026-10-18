import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { InventoryPage } from '../modules/inventory/pages/InventoryPage'
import { NewPurchasePage } from '../modules/purchases/pages/NewPurchasePage'
import { PurchasesPage } from '../modules/purchases/pages/PurchasesPage'
import { SupplierDetailPage } from '../modules/suppliers/pages/SupplierDetailPage'
import { SuppliersPage } from '../modules/suppliers/pages/SuppliersPage'
import { CustomerDetailPage } from '../modules/customers/pages/CustomerDetailPage'
import { CustomersPage } from '../modules/customers/pages/CustomersPage'
import { NewSalePage } from '../modules/sales/pages/NewSalePage'
import { SalesPage } from '../modules/sales/pages/SalesPage'
import { NewReturnPage } from '../modules/returns/pages/NewReturnPage'
import { ReturnsPage } from '../modules/returns/pages/ReturnsPage'
import { ModulePlaceholder } from '../shared/components/ModulePlaceholder'
import { AppShell } from '../shared/layout/AppShell'

const modules = [
  ['expenses', 'Cash & Expenses', 'Cash movement, supplier payments aur daily expenses.'],
  ['reports', 'Reports', 'Stock, sales, ledgers aur profit reports.'],
] as const

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<NewPurchasePage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="returns/new" element={<NewReturnPage />} />
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


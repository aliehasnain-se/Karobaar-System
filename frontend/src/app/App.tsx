import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage'
import { InventoryPage } from '../modules/inventory/pages/InventoryPage'
import { BarcodeLabelsPage } from '../modules/barcodes/pages/BarcodeLabelsPage'
import { NewPurchasePage } from '../modules/purchases/pages/NewPurchasePage'
import { PurchasesPage } from '../modules/purchases/pages/PurchasesPage'
import { PurchaseDetailPage } from '../modules/purchases/pages/PurchaseDetailPage'
import { SupplierDetailPage } from '../modules/suppliers/pages/SupplierDetailPage'
import { SuppliersPage } from '../modules/suppliers/pages/SuppliersPage'
import { CustomerDetailPage } from '../modules/customers/pages/CustomerDetailPage'
import { CustomersPage } from '../modules/customers/pages/CustomersPage'
import { NewSalePage } from '../modules/sales/pages/NewSalePage'
import { SalesPage } from '../modules/sales/pages/SalesPage'
import { SaleDetailPage } from '../modules/sales/pages/SaleDetailPage'
import { NewReturnPage } from '../modules/returns/pages/NewReturnPage'
import { ReturnsPage } from '../modules/returns/pages/ReturnsPage'
import { ReportsPage } from '../modules/reports/pages/ReportsPage'
import { SettingsPage } from '../modules/settings/pages/SettingsPage'
import { AppShell } from '../shared/layout/AppShell'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="barcodes" element={<BarcodeLabelsPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<NewPurchasePage />} />
        <Route path="purchases/:purchaseNumber" element={<PurchaseDetailPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:supplierId" element={<SupplierDetailPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="sales/:invoiceNumber" element={<SaleDetailPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="returns/new" element={<NewReturnPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


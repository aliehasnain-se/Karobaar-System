import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import { App } from './app/App'
import { AuthProvider } from './modules/auth/context/AuthProvider'
import { CustomersProvider } from './modules/customers/context/CustomersProvider'
import { InventoryProvider } from './modules/inventory/context/InventoryProvider'
import { PurchasesProvider } from './modules/purchases/context/PurchasesProvider'
import { SuppliersProvider } from './modules/suppliers/context/SuppliersProvider'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <CustomersProvider>
            <SuppliersProvider>
              <PurchasesProvider>
                <App />
              </PurchasesProvider>
            </SuppliersProvider>
          </CustomersProvider>
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

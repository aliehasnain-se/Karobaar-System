# Karobaar System - Product Requirements Document

## 1. Product summary

Karobaar System is a web application for a wholesale fabric business currently managing stock, sales, purchases, payments, and ledgers in physical registers.

The first release will be an online, responsive web application for desktop and mobile browsers. A separate mobile application and offline support are outside the first release.

## 2. Primary users

- Owner: access to all settings, reports, and approvals
- Shop manager: manages daily shop operations and approvals
- Salesperson: creates sales, receives customer payments, and starts returns
- Store keeper: receives purchased rolls and manages stock records

There will be no public registration. The owner or an authorized administrator will create employee accounts and assign their permissions.

## 3. Core business rules

- The base inventory unit is meter.
- Yard entries will be converted to meters while preserving the originally entered value and unit.
- Stock is tracked by individual roll/thaan and also shown as total meters per fabric.
- A roll records its original and remaining quantity.
- The current business normally sells a complete roll, but quantities will support decimals for future flexibility.
- Products can have multiple colors and multiple rolls.
- Sales and purchases can be fully paid, partially paid, or unpaid.
- All payments in the first release are recorded as cash payments.
- A paper invoice is not required for a return. Employees can find the original sale online.
- Return and exchange actions must remain linked to the original sale.

## 4. Phase 1 modules

### Authentication and access

- Secure login and logout
- Owner-created employee accounts
- Role and permission-based access
- Active/inactive employee status

### Fabric and roll inventory

- Fabric, article/design, category, brand, and color
- Unique barcode for each roll
- Original meters, remaining meters, cost rate, sale rate, and status
- Roll statuses such as available, in transit, sold, returned, and damaged
- Stock movement history

### Suppliers and purchases

- Supplier profiles
- Purchase with one or more rolls
- Full, partial, or unpaid purchase
- Supplier ledger and later payments
- Purchase return support

### Customers, sales, and balances

- Customer profiles
- Sale of one or more rolls
- Full, partial, or unpaid sale
- Customer ledger and later payment receipts
- Search by customer, phone, invoice, article, barcode, roll, or date

### Returns and exchanges

- Return linked to the original sale
- Return reason and manager approval
- Restock or damaged-stock decision
- Exchange handled through linked return and new sale entries
- Automatic cash and ledger adjustment

### Cash and expenses

- Shop opening and closing cash summary
- Cash sales and customer receipts
- Supplier payments and shop expenses
- Categorized expenses

### Dashboard and reports

- Current shop stock
- Roll-wise remaining stock
- Sales, purchases, returns, and expenses
- Customer and supplier balances
- Estimated gross and net profit
- Employee activity

## 5. First-release exclusions

- Native Android or iOS application
- Offline operation
- Card or online payment gateway
- Receipt-printer integration
- E-commerce storefront
- Advanced accounting or tax filing
- Automated WhatsApp messages

These can be considered after Phase 1 is stable.

## 6. Main workflow

1. Owner creates employee accounts and assigns permissions.
2. A purchase adds individual fabric rolls to shop stock and updates the supplier ledger.
3. A sale selects rolls, reduces stock, records received cash, and updates the customer balance.
4. Later customer or supplier payments update the appropriate ledger.
5. Returns remain connected to the original sale and require authorized approval.

## 7. Acceptance goals

- The owner can view accurate shop stock and financial balances.
- Employees only access actions allowed by their roles.
- Every stock or ledger change has a traceable source and user.
- No completed transaction leaves stock and financial records out of sync.
- The interface works clearly on desktop and mobile browsers.


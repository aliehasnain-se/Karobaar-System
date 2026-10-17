# Karobaar System - Product Requirements Document

## 1. Product summary

Karobaar System is a web application for a wholesale fabric business currently managing stock, sales, purchases, payments, and ledgers in physical registers.

The first release will be an online, responsive web application for desktop and mobile browsers. A separate mobile application and offline support are outside the first release.

## 2. Primary users

- Owner: access to all branches, settings, reports, and approvals
- Branch manager: manages one assigned branch and branch-level approvals
- Salesperson: creates sales, receives customer payments, and starts returns
- Store keeper: receives purchased rolls and creates stock-transfer requests

There will be no public registration. The owner or an authorized administrator will create employee accounts and assign their branch and permissions.

## 3. Core business rules

- The base inventory unit is meter.
- Yard entries will be converted to meters while preserving the originally entered value and unit.
- Stock is tracked by individual roll/thaan and also shown as total meters per fabric.
- A roll records its original and remaining quantity.
- The current business normally sells a complete roll, but quantities will support decimals for future flexibility.
- Products can have multiple colors and multiple rolls.
- Sales and purchases can be fully paid, partially paid, or unpaid.
- All payments in the first release are recorded as cash payments.
- Stock transfers require approval and confirmation by the receiving branch.
- A paper invoice is not required for a return. Employees can find the original sale online.
- Return and exchange actions must remain linked to the original sale.

## 4. Phase 1 modules

### Authentication and access

- Secure login and logout
- Owner-created employee accounts
- Role and permission-based access
- Branch assignment
- Active/inactive employee status

### Branches

- Create and manage branches
- Separate branch inventory, employees, sales, expenses, and cash records
- Combined owner dashboard

### Fabric and roll inventory

- Fabric, article/design, category, brand, and color
- Unique barcode for each roll
- Original meters, remaining meters, cost rate, sale rate, status, and current branch
- Roll statuses such as available, in transit, sold, returned, and damaged
- Stock movement history

### Suppliers and purchases

- Supplier profiles
- Purchase with one or more rolls
- Full, partial, or unpaid purchase
- Supplier ledger and later payments
- Purchase return support

### Customers, sales, and udhaar

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

### Branch stock transfers

- Transfer request from one branch to another
- Approval or rejection
- In-transit state
- Receiving-branch confirmation
- Complete audit history

### Cash and expenses

- Branch opening and closing cash summary
- Cash sales and customer receipts
- Supplier payments and branch expenses
- Categorized expenses

### Dashboard and reports

- Branch-wise and combined stock
- Roll-wise remaining stock
- Sales, purchases, returns, and expenses
- Customer receivables and supplier payables
- Estimated gross and net profit
- Stock transfers and employee activity

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

1. Owner creates branches and employee accounts.
2. A purchase adds individual fabric rolls to a branch and updates the supplier ledger.
3. A sale selects rolls, reduces stock, records received cash, and updates customer udhaar.
4. Later customer or supplier payments update the appropriate ledger.
5. Returns remain connected to the original sale and require authorized approval.
6. Branch transfers move through request, approval, transit, and receipt states.

## 7. Acceptance goals

- The owner can view accurate stock and financial balances for every branch.
- Employees only access actions and branches allowed by their roles.
- Every stock or ledger change has a traceable source and user.
- No completed transaction leaves stock and financial records out of sync.
- The interface works clearly on desktop and mobile browsers.


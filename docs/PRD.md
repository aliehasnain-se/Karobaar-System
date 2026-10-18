# Karobaar System - Product Requirements Document

## 1. Product summary

Karobaar System is a web application for a wholesale fabric business currently managing stock, sales, purchases, payments, and ledgers in physical registers.

The first release will be an online, responsive web application for desktop and mobile browsers. A separate mobile application and offline support are outside the first release.

## 2. Primary user

- Owner: full access to the system

Phase 1 has one owner account and no public registration. Employee accounts and roles can be added later without changing the business modules.

## 3. Core business rules

- The base inventory unit is meter.
- Yard entries will be converted to meters while preserving the originally entered value and unit.
- Stock is tracked by individual roll/thaan and also shown as total meters per fabric.
- A roll records its original and remaining quantity.
- The current business sells complete rolls/thaans. Each thaan keeps its meter quantity for stock detail, while the owner enters one final selling price for the complete thaan.
- Products can have multiple colors and multiple rolls.
- Sales and purchases can be fully paid, partially paid, or unpaid.
- All payments in the first release are recorded as cash payments.
- A paper invoice is not required for a return. The original sale can be found online.
- Return and exchange actions must remain linked to the original sale.

## 4. Phase 1 modules

### Authentication and access

- Secure login and logout
- One owner account in Phase 1
- Authentication remains separate from business modules so roles can be added later

### Shop settings

- Shop name, owner name, phone, city, and address
- Shop name used on barcode labels
- No passwords, API keys, or private credentials stored in shop settings

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
- Return reason
- Restock or damaged-stock decision
- Exchange handled through linked return and new sale entries
- Automatic cash and ledger adjustment

### Dashboard and reports

- Current shop stock
- Roll-wise remaining stock
- Sales, purchases, and returns
- Customer and supplier balances
- Estimated gross profit

## 5. First-release exclusions

- Native Android or iOS application
- Offline operation
- Card or online payment gateway
- Receipt-printer integration
- E-commerce storefront
- Advanced accounting or tax filing
- Shop expense and opening/closing cash tracking
- Employee accounts, roles, and permissions
- Automated WhatsApp messages

These can be considered after Phase 1 is stable.

## 5.1 Future purchase automation

- CSV or Excel purchase import
- Supplier bill image/PDF reading with OCR
- Review screen before imported purchase data is saved
- Automatic roll and barcode creation when the source contains roll-wise quantities
- Bulk roll entry when a bill only provides combined quantities

## 6. Main workflow

1. A purchase adds individual fabric rolls to shop stock and updates the supplier ledger.
2. A sale selects rolls, reduces stock, records received cash, and updates the customer balance.
3. Later customer or supplier payments update the appropriate ledger.
4. A return stays connected to the original sale and updates stock and balance directly.

## 7. Acceptance goals

- The owner can view accurate shop stock and financial balances.
- Every stock or ledger change has a traceable source and user.
- No completed transaction leaves stock and financial records out of sync.
- The interface works clearly on desktop and mobile browsers.


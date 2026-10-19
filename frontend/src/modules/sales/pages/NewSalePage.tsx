import {
  ArrowLeft,
  Check,
  ChevronDown,
  Plus,
  Save,
  ScanBarcode,
  Search,
  Trash2,
  UserRoundPlus,
} from 'lucide-react'
import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AddCustomerModal } from '../../customers/components/AddCustomerModal'
import { useCustomers } from '../../customers/context/useCustomers'
import type { Customer } from '../../customers/types'
import { useInventory } from '../../inventory/context/useInventory'
import type { SaleItem } from '../types'

const money = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

type ScanMessage = { type: 'success' | 'error'; text: string } | null

export function NewSalePage() {
  const scanInputRef = useRef<HTMLInputElement>(null)
  const { rolls } = useInventory()
  const inventoryRolls = useMemo(
    () => rolls.filter((roll) => roll.status === 'Available'),
    [rolls],
  )
  const { customers, addCustomer, updateCustomer } = useCustomers()
  const [searchParams] = useSearchParams()
  const customerFromProfile = customers.find(
    (customer) => customer.id === Number(searchParams.get('customer')),
  )
  const [selectedCustomer, setSelectedCustomer] = useState<
    Customer | 'walk-in' | null
  >(customerFromProfile ?? 'walk-in')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
  const [showQuickCustomer, setShowQuickCustomer] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const [rollSearch, setRollSearch] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [scanMessage, setScanMessage] = useState<ScanMessage>(null)
  const [discount, setDiscount] = useState(0)
  const [paymentType, setPaymentType] = useState('Paid')
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [saved, setSaved] = useState(false)

  const availableRolls = useMemo(() => {
    const term = rollSearch.trim().toLowerCase()
    return inventoryRolls.filter((roll) => {
      const isAvailable =
        roll.status === 'Available' &&
        !items.some((item) => item.rollId === roll.id)
      const matchesSearch =
        !term ||
        [
          roll.barcode,
          roll.rollNumber,
          roll.fabric,
          roll.article,
          roll.color,
        ].some((value) => value.toLowerCase().includes(term))
      return isAvailable && matchesSearch
    })
  }, [inventoryRolls, items, rollSearch])

  const matchingCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase()
    return customers.filter(
      (customer) =>
        !term ||
        [customer.businessName, customer.contactPerson, customer.phone].some(
          (value) => value.toLowerCase().includes(term),
        ),
    )
  }, [customerSearch, customers])

  const subtotal = items.reduce((sum, item) => sum + item.price, 0)
  const total = Math.max(0, subtotal - discount)
  const effectiveReceived =
    paymentType === 'Paid'
      ? total
      : paymentType === 'Unpaid'
        ? 0
        : Math.min(receivedAmount, total)
  const balance = total - effectiveReceived

  const addRoll = (rollId: number, scanned = false) => {
    const roll = inventoryRolls.find((item) => item.id === rollId)
    if (!roll) return
    if (items.some((item) => item.rollId === roll.id)) {
      setScanMessage({
        type: 'error',
        text: `${roll.rollNumber} is already added to this bill.`,
      })
      setRollSearch('')
      scanInputRef.current?.focus()
      return
    }
    if (roll.status !== 'Available') {
      setScanMessage({
        type: 'error',
        text: `${roll.rollNumber} is not available for sale.`,
      })
      setRollSearch('')
      scanInputRef.current?.focus()
      return
    }
    setItems((current) => [
      ...current,
      {
        rollId: roll.id,
        rollNumber: roll.rollNumber,
        barcode: roll.barcode,
        fabric: roll.fabric,
        article: roll.article,
        color: roll.color,
        meters: roll.remainingMeters,
        saleType: 'ROLL',
        availableMeters: roll.remainingMeters,
        soldMeters: roll.remainingMeters,
        pricePerMeter: roll.price / roll.originalMeters,
        price: (roll.price / roll.originalMeters) * roll.remainingMeters,
      },
    ])
    setScanMessage(
      scanned
        ? {
            type: 'success',
            text: `${roll.rollNumber} was added to the bill.`,
          }
        : null,
    )
    setRollSearch('')
    scanInputRef.current?.focus()
  }

  const handleScan = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const scannedValue = rollSearch.trim().toLowerCase()
    if (!scannedValue) return
    const roll = inventoryRolls.find(
      (item) =>
        item.barcode.toLowerCase() === scannedValue ||
        item.rollNumber.toLowerCase() === scannedValue,
    )
    if (!roll) {
      setScanMessage({
        type: 'error',
        text: 'Barcode not found. Scan the label again.',
      })
      setRollSearch('')
      scanInputRef.current?.focus()
      return
    }
    addRoll(roll.id, true)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!items.length) return
    if (balance > 0 && selectedCustomer === 'walk-in') {
      setCustomerError(
        'Select or create a customer for a sale with a remaining payment.',
      )
      return
    }
    if (!selectedCustomer) {
      setCustomerError(
        'Select a customer or choose Walk-in Customer.',
      )
      return
    }
    if (saved) return
    if (typeof selectedCustomer === 'object') {
      const updatedCustomer = {
        ...selectedCustomer,
        sales: selectedCustomer.sales + total,
        received: selectedCustomer.received + effectiveReceived,
        lastSale: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
      }
      updateCustomer(updatedCustomer)
      setSelectedCustomer(updatedCustomer)
    }
    setCustomerError('')
    setSaved(true)
  }

  const chooseCustomer = (customer: Customer | 'walk-in') => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
    setCustomerDropdownOpen(false)
    setCustomerError('')
  }

  const handleQuickCustomer = (customer: Customer) => {
    addCustomer(customer)
    chooseCustomer(customer)
    setShowQuickCustomer(false)
  }

  return (
    <form className="sale-form-page" onSubmit={handleSubmit}>
      <div className="page-heading">
        <div className="title-with-back">
          <Link className="back-button" to="/sales" aria-label="Back to sales">
            <ArrowLeft size={19} />
          </Link>
          <div>
            <h1>New sale</h1>
            <p>Select a customer and complete rolls to create an invoice.</p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="button button--secondary" to="/sales">
            Cancel
          </Link>
          <button
            className="button button--primary"
            type="submit"
            disabled={!items.length || saved}
          >
            <Save size={17} /> {saved ? 'Sale saved' : 'Save sale'}
          </button>
        </div>
      </div>
      {saved && (
        <div className="form-notice" role="status">
          <strong>Demo sale ready.</strong> After backend integration, the
          invoice, stock, and customer balance will update together.
        </div>
      )}

      <section className="panel form-section">
        <div className="section-heading">
          <h2>Sale details</h2>
          <p>Enter the customer and invoice details.</p>
        </div>
        <div className="purchase-details-grid sale-details-grid">
          <div
            className="form-field customer-picker"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setCustomerDropdownOpen(false)
            }}
          >
            <span>Customer</span>
            <div className="customer-select-row">
              <button
                type="button"
                className={`customer-select-trigger${customerError ? ' input-error' : ''}`}
                onClick={() => setCustomerDropdownOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={customerDropdownOpen}
              >
                <span>
                  {selectedCustomer === 'walk-in'
                    ? 'Walk-in Customer'
                    : (selectedCustomer?.businessName ?? 'Select customer')}
                </span>
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="button button--secondary quick-customer-button"
                onClick={() => {
                  setCustomerDropdownOpen(false)
                  setShowQuickCustomer(true)
                }}
              >
                <UserRoundPlus size={16} /> New
              </button>
            </div>
            {customerDropdownOpen && (
              <div className="customer-select-menu">
                <input
                  className="customer-menu-search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search by name or phone number"
                  aria-label="Search customers"
                  autoFocus
                />
                <div className="customer-menu-options" role="listbox">
                  <button
                    type="button"
                    onClick={() => chooseCustomer('walk-in')}
                  >
                    <span>
                      <strong>Walk-in Customer</strong>
                      <small>Cash sale without profile</small>
                    </span>
                    {selectedCustomer === 'walk-in' && <Check size={15} />}
                  </button>
                  {matchingCustomers.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => chooseCustomer(item)}
                    >
                      <span>
                        <strong>{item.businessName}</strong>
                        <small>{item.phone}</small>
                      </span>
                      {selectedCustomer &&
                        typeof selectedCustomer === 'object' &&
                        selectedCustomer.id === item.id && <Check size={15} />}
                    </button>
                  ))}
                  {!matchingCustomers.length && <p>No customer found.</p>}
                </div>
              </div>
            )}
            {customerError && (
              <small className="field-error">{customerError}</small>
            )}
          </div>
          <label className="form-field">
            Invoice date
            <input type="date" defaultValue="2026-10-18" required />
          </label>
          <label className="form-field">
            <span className="field-label">
              Reference note <small className="optional-label">Optional</small>
            </span>
            <input placeholder="Customer order reference" />
          </label>
        </div>
      </section>

      <section className="panel form-section">
        <div className="section-heading">
          <h2>Scan or find roll</h2>
          <p>
            Scan a barcode to add the roll to the bill automatically.
          </p>
        </div>
        <label className="roll-search">
          <ScanBarcode size={19} />
          <input
            ref={scanInputRef}
            value={rollSearch}
            onChange={(event) => {
              setRollSearch(event.target.value)
              setScanMessage(null)
            }}
            onKeyDown={handleScan}
            placeholder="Scan barcode or search available rolls..."
            autoFocus
          />
          <Search size={17} />
        </label>
        <div className="scan-helper">
          <span>Scan a barcode label or search for a roll</span>
          <span>The scanner submits with Enter</span>
        </div>
        {scanMessage && (
          <div
            className={`scan-message scan-message--${scanMessage.type}`}
            role="status"
          >
            {scanMessage.text}
          </div>
        )}
        {rollSearch && (
          <div className="available-rolls">
            {availableRolls.map((roll) => (
              <div className="available-roll" key={roll.id}>
                <div>
                  <strong>
                    {roll.rollNumber} · {roll.fabric}
                  </strong>
                  <small>
                    {roll.article} · {roll.color} · {roll.barcode}
                  </small>
                </div>
                <span>{roll.remainingMeters} m</span>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => addRoll(roll.id)}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            ))}
            {!availableRolls.length && (
              <p className="empty-inline">
                No matching available roll found.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="panel form-section">
        <div className="section-heading">
          <h2>Selected rolls</h2>
          <p>
            Sell a complete roll or enter the required meters. The price is
            calculated automatically.
          </p>
        </div>
        {items.length ? (
          <div className="purchase-items-wrap">
            <p className="mobile-scroll-hint" aria-hidden="true">
              Swipe left to see more columns →
            </p>
            <table className="sale-items-table">
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Fabric</th>
                  <th>Color</th>
                  <th>Sale type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.rollId}>
                    <td>
                      <strong>{item.rollNumber}</strong>
                      <small className="cell-subtext">{item.barcode}</small>
                    </td>
                    <td>
                      <strong>{item.fabric}</strong>
                      <small className="cell-subtext">{item.article}</small>
                    </td>
                    <td>{item.color}</td>
                    <td>
                      <select
                        value={item.saleType ?? 'ROLL'}
                        onChange={(event) => {
                          const saleType = event.target.value as 'ROLL' | 'METER'
                          const soldMeters = saleType === 'ROLL' ? (item.availableMeters ?? item.meters) : 1
                          setItems((current) => current.map((row) => row.rollId === item.rollId ? { ...row, saleType, soldMeters, price: soldMeters * (row.pricePerMeter ?? 0) } : row))
                        }}
                      >
                        <option value="ROLL">Complete roll</option>
                        <option value="METER">By meter</option>
                      </select>
                    </td>
                    <td>
                      {item.saleType === 'METER' ? (
                        <input
                          type="number"
                          min="0.01"
                          max={item.availableMeters}
                          step="0.01"
                          value={item.soldMeters || ''}
                          onChange={(event) => {
                            const soldMeters = Math.min(Number(event.target.value), item.availableMeters ?? item.meters)
                            setItems((current) => current.map((row) => row.rollId === item.rollId ? { ...row, soldMeters, price: soldMeters * (row.pricePerMeter ?? 0) } : row))
                          }}
                          required
                        />
                      ) : `${item.availableMeters ?? item.meters} m`}
                    </td>
                    <td><strong>{money(item.price)}</strong></td>
                    <td>
                      <button
                        className="row-action"
                        type="button"
                        aria-label="Remove roll"
                        onClick={() =>
                          setItems((current) =>
                            current.filter((row) => row.rollId !== item.rollId),
                          )
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-selection">
            No rolls selected. Scan a barcode or search for a roll to add it.
          </p>
        )}
      </section>

      <section className="purchase-bottom-grid">
        <div className="panel form-section">
          <div className="section-heading">
            <h2>Payment</h2>
            <p>Record the cash received and remaining amount.</p>
          </div>
          <div className="payment-options">
            {['Paid', 'Partial', 'Unpaid'].map((option) => (
              <label
                key={option}
                className={
                  paymentType === option
                    ? 'payment-option active'
                    : 'payment-option'
                }
              >
                <input
                  type="radio"
                  name="salePaymentType"
                  value={option}
                  checked={paymentType === option}
                  onChange={() => {
                    setPaymentType(option)
                    setCustomerError('')
                  }}
                />
                <span>
                  <strong>{option}</strong>
                  <small>
                    {option === 'Paid'
                      ? 'Full cash received'
                      : option === 'Partial'
                        ? 'Some cash received'
                        : 'No payment received'}
                  </small>
                </span>
              </label>
            ))}
          </div>
          {paymentType === 'Partial' && (
            <label className="form-field paid-input">
              Cash received
              <input
                type="number"
                min="0"
                max={total}
                value={receivedAmount || ''}
                onChange={(event) =>
                  setReceivedAmount(Number(event.target.value))
                }
                placeholder="0"
              />
            </label>
          )}
          {paymentType !== 'Paid' && selectedCustomer === 'walk-in' && (
            <p className="payment-customer-note">
              A customer profile is required for a remaining payment.
            </p>
          )}
        </div>
        <aside className="panel purchase-summary-card">
          <h2>Invoice summary</h2>
          <dl>
            <div>
              <dt>Total rolls</dt>
              <dd>{items.length}</dd>
            </div>
            <div>
              <dt>Meters sold</dt>
              <dd>{items.reduce((sum, item) => sum + (item.soldMeters ?? item.meters), 0).toFixed(2)} m</dd>
            </div>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div className="summary-discount">
              <dt>Discount</dt>
              <dd>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={(event) =>
                    setDiscount(Math.min(Number(event.target.value), subtotal))
                  }
                  placeholder="0"
                />
              </dd>
            </div>
            <div>
              <dt>Cash received</dt>
              <dd>{money(effectiveReceived)}</dd>
            </div>
            <div className="summary-balance">
              <dt>Remaining amount</dt>
              <dd>{money(balance)}</dd>
            </div>
          </dl>
        </aside>
      </section>
      {showQuickCustomer && (
        <AddCustomerModal
          quick
          onClose={() => setShowQuickCustomer(false)}
          onAdd={handleQuickCustomer}
        />
      )}
    </form>
  )
}

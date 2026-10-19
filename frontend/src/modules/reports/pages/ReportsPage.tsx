import { Download, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { reports, reportSummary } from '../data/mockReports'
import type { ReportKey } from '../types'

const reportTabs: { key: ReportKey; label: string }[] = [
  { key: 'sales', label: 'Sales' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'stock', label: 'Stock' },
  { key: 'balances', label: 'Balances' },
]

const csvValue = (value: string | number) =>
  `"${String(value).replaceAll('"', '""')}"`

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportKey>('sales')
  const [search, setSearch] = useState('')
  const report = reports[activeReport]

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return report.rows.filter(
      (row) =>
        !term ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(term),
        ),
    )
  }, [report, search])

  const selectReport = (key: ReportKey) => {
    setActiveReport(key)
    setSearch('')
  }

  const downloadCsv = () => {
    const header = report.columns
      .map((column) => csvValue(column.label))
      .join(',')
    const rows = filteredRows.map((row) =>
      report.columns.map((column) => csvValue(row[column.key] ?? '')).join(','),
    )
    const blob = new Blob([[header, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeReport}-report.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-page">
      <div className="page-heading">
        <div>
          <h1>Reports</h1>
          <p>Automatic reports from your business records.</p>
        </div>
      </div>

      <section className="inventory-summary" aria-label="Report summary">
        {reportSummary.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small className="report-summary-note">{item.note}</small>
          </div>
        ))}
      </section>

      <section className="panel inventory-panel">
        <div className="report-tabs" role="tablist" aria-label="Select report">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeReport === tab.key}
              className={
                activeReport === tab.key ? 'report-tab active' : 'report-tab'
              }
              onClick={() => selectReport(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="inventory-toolbar report-toolbar">
          <div className="panel-heading">
            <div>
              <h2>{report.title}</h2>
              <p>{report.description}</p>
            </div>
          </div>
          <div className="inventory-filters">
            <label className="table-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report..."
              />
            </label>
            <button className="button button--secondary" onClick={downloadCsv}>
              <Download size={16} /> Export CSV
            </button>
          </div>
        </div>
        <div className="inventory-table-wrap">
          <p className="mobile-scroll-hint" aria-hidden="true">
            Swipe left to see more columns →
          </p>
          <table className="report-table">
            <thead>
              <tr>
                {report.columns.map((column) => (
                  <th
                    className={column.align === 'right' ? 'text-right' : ''}
                    key={column.key}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={`${activeReport}-${index}`}>
                  {report.columns.map((column) => (
                    <td
                      className={column.align === 'right' ? 'text-right' : ''}
                      key={column.key}
                    >
                      {column.key === 'reference' || column.key === 'party' ? (
                        <strong>{row[column.key]}</strong>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredRows.length && (
            <p className="empty-state">No matching record found.</p>
          )}
        </div>
        <div className="report-footer">
          <span>{filteredRows.length} records</span>
          <span>Reports will update as each module is connected.</span>
        </div>
      </section>
    </div>
  )
}

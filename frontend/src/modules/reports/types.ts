export type ReportKey = 'sales' | 'purchases' | 'stock' | 'balances'

export type ReportColumn = {
  key: string
  label: string
  align?: 'right'
}

export type ReportRow = Record<string, string | number>

export type ReportDefinition = {
  title: string
  description: string
  columns: ReportColumn[]
  rows: ReportRow[]
}

// Date parsing and formatting utilities
import { Period, PERIOD_CONFIG, PERIOD_ORDER } from './config'

export function parseDate(dateStr: string): Date {
  const currentYear = new Date().getFullYear()
  let date = new Date(dateStr)

  if (isNaN(date.getTime())) {
    date = new Date(`${currentYear}-${dateStr}`)
  }

  if (isNaN(date.getTime())) {
    const match = dateStr.match(/^(\d{1,2})[-/.](\d{1,2})$/)
    if (match) {
      const [, month, day] = match
      date = new Date(currentYear, parseInt(month, 10) - 1, parseInt(day, 10))
    }
  }

  if (!isNaN(date.getTime()) && !dateStr.includes(String(date.getFullYear()))) {
    if (dateStr.length <= 5) {
      date.setFullYear(currentYear)
    }
  }

  if (isNaN(date.getTime())) {
    console.error(`Error: Unable to parse date "${dateStr}"`)
    process.exit(1)
  }

  return date
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calculate date range from period (counting back from today)
export function getDateRangeFromPeriod(period: Period): {
  startDate: Date
  endDate: Date
} {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - PERIOD_CONFIG[period].days + 1)
  return { startDate, endDate }
}

// Infer period from actual number of days
export function inferPeriod(days: number): Period {
  for (let i = PERIOD_ORDER.length - 1; i >= 0; i--) {
    const p = PERIOD_ORDER[i]
    if (days >= PERIOD_CONFIG[p].days) {
      return p
    }
  }
  return 'day'
}

// Date parsing and formatting utilities

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

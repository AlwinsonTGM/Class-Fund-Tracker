/**
 * Export Validation Helpers for CSV and PDF Financial Reports (RFC 4180 Compliant)
 */

export function parseCSV(csvContent: string): { headers: string[]; rows: string[][] } {
  const records: string[][] = []
  let currentRecord: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i]
    const nextChar = csvContent[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      currentRecord.push(currentField)
      currentField = ''
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++
      }
      currentRecord.push(currentField)
      records.push(currentRecord)
      currentRecord = []
      currentField = ''
    } else {
      currentField += char
    }
  }

  if (currentField.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentField)
    records.push(currentRecord)
  }

  const validRecords = records.filter(r => r.length > 0 && r.some(f => f.trim().length > 0))
  if (validRecords.length === 0) {
    return { headers: [], rows: [] }
  }

  return {
    headers: validRecords[0],
    rows: validRecords.slice(1)
  }
}

export function validateCSVHeaders(csvContent: string, expectedHeaders: string[]): boolean {
  const { headers } = parseCSV(csvContent)
  if (headers.length !== expectedHeaders.length) return false
  return expectedHeaders.every((h, i) => headers[i].trim() === h.trim())
}

export function validatePDFHTMLStructure(htmlContent: string): {
  hasTitle: boolean
  hasMetrics: boolean
  hasExpenseTable: boolean
  hasSignatures: boolean
} {
  return {
    hasTitle: htmlContent.includes('Financial Audit Statement') || htmlContent.includes('Class Fund'),
    hasMetrics: htmlContent.includes('Total Collections') && htmlContent.includes('Remaining Balance'),
    hasExpenseTable: htmlContent.includes('<table') && htmlContent.includes('Spent By'),
    hasSignatures: htmlContent.includes('Prepared by') && htmlContent.includes('Verified by')
  }
}

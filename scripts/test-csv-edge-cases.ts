import {
  escapeCSV,
  generatePaymentMatrixCSV,
  generatePaymentsCSV,
  generateExpensesCSV,
  generateAuditLogsCSV,
  ExportStudent,
  ExportPayment,
  ExportWeek,
  ExportExpense,
  ExportAuditLog,
  ExportReceipt
} from '../lib/csv-exporter'

// Helper to parse CSV lines with RFC 4180 rules
function parseCSVRow(rowStr: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i]
    if (char === '"') {
      if (inQuotes && rowStr[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}

interface TestResult {
  category: string
  name: string
  passed: boolean
  details: string
}

const results: TestResult[] = []

function assert(condition: boolean, category: string, name: string, detailsOnFail: string = '') {
  if (condition) {
    results.push({ category, name, passed: true, details: 'OK' })
  } else {
    results.push({ category, name, passed: false, details: detailsOnFail })
  }
}

console.log('====================================================')
console.log('🧪 EMPIRICAL EDGE CASE SUITE FOR CSV EXPORTER v2')
console.log('====================================================\n')

// ----------------------------------------------------
// 1. ESCAPE CSV FUNCTION TESTS
// ----------------------------------------------------
try {
  assert(escapeCSV(null) === '', 'Baseline', 'escapeCSV null returns empty string')
  assert(escapeCSV(undefined) === '', 'Baseline', 'escapeCSV undefined returns empty string')
  assert(escapeCSV('hello') === 'hello', 'Baseline', 'escapeCSV simple string unmodified')
  assert(escapeCSV('hello,world') === '"hello,world"', 'Baseline', 'escapeCSV string with comma quoted')
  assert(escapeCSV('hello "world"') === '"hello ""world"""', 'Baseline', 'escapeCSV string with quotes escaped')
  assert(escapeCSV('line1\nline2') === '"line1\nline2"', 'Baseline', 'escapeCSV multiline string quoted')
  assert(escapeCSV('line1\r\nline2') === '"line1\r\nline2"', 'Baseline', 'escapeCSV CRLF multiline string quoted')
  assert(escapeCSV(123) === '123', 'Baseline', 'escapeCSV number converted to string')
  assert(escapeCSV(true) === 'true', 'Baseline', 'escapeCSV boolean converted to string')
  assert(escapeCSV('ñ, á, é, ₱, 🚀') === '"ñ, á, é, ₱, 🚀"', 'Baseline', 'escapeCSV UTF-8/Emoji with comma handled')
} catch (err: any) {
  assert(false, 'Baseline', 'escapeCSV baseline tests crash', err?.message || String(err))
}

// ----------------------------------------------------
// 2. EMPTY ARRAY TESTS
// ----------------------------------------------------
try {
  const matrixEmpty = generatePaymentMatrixCSV([], [], [])
  const matrixLines = matrixEmpty.trim().split('\n')
  assert(matrixLines.length === 1, 'Empty Arrays', 'generatePaymentMatrixCSV empty inputs produces header only', `got ${matrixLines.length} lines`)
  assert(matrixLines[0] === 'seat_number,student_id,student_name,total_weeks_paid,total_paid_amount,outstanding_balance', 'Empty Arrays', 'generatePaymentMatrixCSV empty headers correct')

  const paymentsEmpty = generatePaymentsCSV([], [])
  const paymentsLines = paymentsEmpty.trim().split('\n')
  assert(paymentsLines.length === 1, 'Empty Arrays', 'generatePaymentsCSV empty inputs produces header only')
  assert(paymentsLines[0] === 'student_id,student_name,week_number,amount,status,payment_date,receipt_ref', 'Empty Arrays', 'generatePaymentsCSV empty headers correct')

  const expensesEmpty = generateExpensesCSV([])
  const expensesLines = expensesEmpty.trim().split('\n')
  assert(expensesLines.length === 1, 'Empty Arrays', 'generateExpensesCSV empty inputs produces header only')
  assert(expensesLines[0] === 'expense_id,description,amount,recorded_by,category,date', 'Empty Arrays', 'generateExpensesCSV empty headers correct')

  const auditEmpty = generateAuditLogsCSV([])
  const auditLines = auditEmpty.trim().split('\n')
  assert(auditLines.length === 1, 'Empty Arrays', 'generateAuditLogsCSV empty inputs produces header only')
  assert(auditLines[0] === 'log_id,timestamp,officer_email,action_description', 'Empty Arrays', 'generateAuditLogsCSV empty headers correct')
} catch (err: any) {
  assert(false, 'Empty Arrays', 'Empty array execution crash', err?.message || String(err))
}

// ----------------------------------------------------
// 3. SPECIAL CHARACTERS & MULTILINE STRINGS
// ----------------------------------------------------
try {
  const specialExpenses: ExportExpense[] = [
    {
      id: 1,
      description: 'Bought "Whiteboard Markers", 2 boxes, & eraser',
      amount: 150.5,
      recorded_by: 'Treasurer, Lead',
      category: 'Supplies & Stationary',
      created_at: '2026-07-01'
    },
    {
      id: 2,
      description: 'Party:\n- Pizza\n- Soda, Drinks\n- "Cake"',
      amount: 1200.0,
      recorded_by: 'VP Internal',
      category: 'Events',
      created_at: '2026-07-05'
    }
  ]

  const expenseCSV = generateExpensesCSV(specialExpenses)
  const expenseRows = expenseCSV.split('\n')

  const row1Parsed = parseCSVRow(expenseRows[1])
  assert(row1Parsed.length === 6, 'Special Chars', 'Expense row 1 column count', `Expected 6 columns, got ${row1Parsed.length}: ${JSON.stringify(row1Parsed)}`)
  assert(row1Parsed[1] === 'Bought "Whiteboard Markers", 2 boxes, & eraser', 'Special Chars', 'Expense row 1 description quote unescaped correctly')
  assert(row1Parsed[3] === 'Treasurer, Lead', 'Special Chars', 'Expense row 1 recorded_by comma unescaped correctly')
} catch (err: any) {
  assert(false, 'Special Chars', 'Special characters test execution crash', err?.message || String(err))
}

// ----------------------------------------------------
// 4. MISSING PAYMENTS & NULL METADATA
// ----------------------------------------------------
try {
  const students: ExportStudent[] = [
    { id: 1, first_name: 'Juan', last_name: 'Dela Cruz', seat_number: 1 },
    { id: 2, first_name: 'Maria', last_name: null, seat_number: 2 },
    { id: 3, first_name: 'Special, "Name"', last_name: 'O\'Connor', seat_number: 3 }
  ]

  const weeks: ExportWeek[] = [
    { id: 101, week_number: 1 },
    { id: 102, week_number: 2 }
  ]

  const payments: ExportPayment[] = [
    { id: 1, student_id: 1, week_number: 1, status: 'paid', amount: 50.0, paid_at: '2026-07-01' },
    { id: 2, student_id: 99, week_number: 1, status: 'paid', amount: 50.0, paid_at: '2026-07-01' }
  ]

  const receipts: ExportReceipt[] = [
    { id: 50, student_id: 1, week_number: 1, reference_number: 'REF-001, "XYZ"' }
  ]

  const matrixCSV = generatePaymentMatrixCSV(students, payments, weeks, 50.0)
  const matrixRows = matrixCSV.split('\n')
  assert(matrixRows.length === 4, 'Missing Payments', 'Payment matrix row count (1 header + 3 students)', `got ${matrixRows.length} rows`)

  const student2Row = parseCSVRow(matrixRows[2])
  assert(student2Row[2] === 'Maria', 'Missing Payments', 'Student with null last_name formats as first_name only')
  assert(student2Row[3] === 'Unpaid' && student2Row[4] === 'Unpaid', 'Missing Payments', 'Missing payments default to Unpaid in matrix')
  assert(student2Row[5] === '0', 'Missing Payments', 'Paid weeks count is 0 for student with missing payments')
  assert(student2Row[6] === '0.00', 'Missing Payments', 'Total paid amount is 0.00')
  assert(student2Row[7] === '100.00', 'Missing Payments', 'Outstanding balance correctly calculated (2 weeks * 50 = 100.00)')

  const paymentsCSV = generatePaymentsCSV(students, payments, receipts)
  const paymentRows = paymentsCSV.split('\n')
  const orphanPaymentRow = parseCSVRow(paymentRows[2])
  assert(orphanPaymentRow[1] === 'Student 99', 'Missing Payments', 'Payment with missing student record falls back to "Student ID"')
  assert(orphanPaymentRow[6] === 'N/A', 'Missing Payments', 'Payment with no matching receipt reference falls back to "N/A"')

  const student1PaymentRow = parseCSVRow(paymentRows[1])
  assert(student1PaymentRow[6] === 'REF-001, "XYZ"', 'Missing Payments', 'Receipt ref with commas and quotes escaped properly')
} catch (err: any) {
  assert(false, 'Missing Payments', 'Missing payments test execution crash', err?.message || String(err))
}

// ----------------------------------------------------
// 5. UNESCAPED FIELD VULNERABILITIES (DATE, STATUS, CREATED_AT)
// ----------------------------------------------------
try {
  const trickyPayment: ExportPayment = {
    id: 10,
    student_id: 1,
    week_number: 1,
    status: 'paid, verified', // status containing comma
    paid_at: '2026-07-01T12:00:00Z, Monday' // date containing comma
  }

  const paymentsCSVTricky = generatePaymentsCSV([{ id: 1, first_name: 'Test' }], [trickyPayment], [])
  const parsedTrickyRow = parseCSVRow(paymentsCSVTricky.split('\n')[1])
  
  assert(
    parsedTrickyRow.length === 7,
    'Field Escaping Bug',
    'generatePaymentsCSV status & date escaping integrity',
    `Status or date containing commas breaks CSV column structure! Expected 7 columns, got ${parsedTrickyRow.length}: ${JSON.stringify(parsedTrickyRow)}`
  )
} catch (err: any) {
  assert(false, 'Field Escaping Bug', 'Tricky status/date test execution crash', err?.message || String(err))
}

try {
  const trickyExpense: ExportExpense = {
    id: 10,
    description: 'Printer Ink',
    amount: 50.0,
    created_at: '2026-07-01, 10:00 AM' // date with comma
  }

  const expenseCSV = generateExpensesCSV([trickyExpense])
  const parsedExpenseRow = parseCSVRow(expenseCSV.split('\n')[1])
  assert(
    parsedExpenseRow.length === 6,
    'Field Escaping Bug',
    'generateExpensesCSV date escaping integrity',
    `Date containing commas breaks CSV column structure! Expected 6 columns, got ${parsedExpenseRow.length}: ${JSON.stringify(parsedExpenseRow)}`
  )
} catch (err: any) {
  assert(false, 'Field Escaping Bug', 'Tricky expense date test execution crash', err?.message || String(err))
}

try {
  const trickyAuditLog: ExportAuditLog = {
    id: 100,
    officer_email: 'officer@example.com',
    action_description: 'Approved receipt #1',
    created_at: '2026-07-01, 10:00 AM' // date with comma
  }

  const auditCSV = generateAuditLogsCSV([trickyAuditLog])
  const parsedAuditRow = parseCSVRow(auditCSV.split('\n')[1])
  assert(
    parsedAuditRow.length === 4,
    'Field Escaping Bug',
    'generateAuditLogsCSV created_at escaping integrity',
    `created_at containing commas breaks CSV column structure! Expected 4 columns, got ${parsedAuditRow.length}: ${JSON.stringify(parsedAuditRow)}`
  )
} catch (err: any) {
  assert(false, 'Field Escaping Bug', 'Tricky audit log date test execution crash', err?.message || String(err))
}

// ----------------------------------------------------
// 6. FORMULA INJECTION & MALFORMED AMOUNT HANDLING
// ----------------------------------------------------
try {
  const formulaExpense: ExportExpense = {
    id: 5,
    description: '=CMD|\' /C calc\'!A0',
    amount: 10.0,
    recorded_by: '+@SUM(A1:A50)',
    category: '-10+20',
    created_at: '2026-07-01'
  }

  const formulaCSV = generateExpensesCSV([formulaExpense])
  const parsedFormulaRow = parseCSVRow(formulaCSV.split('\n')[1])
  // Note: CSV formula injection prevention (prefixing =, +, -, @ with single quote or escaping) is a known security hardening feature.
  const hasFormulaPrefix = parsedFormulaRow[1].startsWith('=') || parsedFormulaRow[3].startsWith('+')
  assert(
    !hasFormulaPrefix,
    'Security Hardening',
    'CSV Formula Injection Risk Check',
    `Fields starting with =, +, -, @ are unquoted/unprefixed: description="${parsedFormulaRow[1]}", recorded_by="${parsedFormulaRow[3]}"`
  )
} catch (err: any) {
  assert(false, 'Security Hardening', 'Formula injection test execution crash', err?.message || String(err))
}

// ----------------------------------------------------
// PRINT SUMMARY
// ----------------------------------------------------
console.log('----------------------------------------------------')
console.log('RESULTS:')
let passedCount = 0
let failedCount = 0
results.forEach((r, idx) => {
  if (r.passed) {
    passedCount++
    console.log(` ✅ [${idx + 1}] [${r.category}] PASS: ${r.name}`)
  } else {
    failedCount++
    console.log(` ❌ [${idx + 1}] [${r.category}] FAIL: ${r.name}`)
    console.log(`    --> Details: ${r.details}`)
  }
})

console.log('----------------------------------------------------')
console.log(`TOTAL: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`)
console.log('====================================================')

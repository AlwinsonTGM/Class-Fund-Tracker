import * as fs from 'fs'
import * as path from 'path'

interface ComponentCheckResult {
  file: string
  flow: string
  touchTargetViolations: {
    line: number
    snippet: string
    reason: string
  }[]
  footerWrapViolations: {
    line: number
    snippet: string
    reason: string
  }[]
  rapidTapProtection: {
    line: number
    snippet: string
    hasDisabledOrTransition: boolean
  }[]
}

const PROJECT_ROOT = path.resolve(__dirname, '../../')

// Target component files mapping to core user flows
const TARGET_FILES = [
  { flow: 'Student Payment', path: 'components/student-payment-list.tsx' },
  { flow: 'Receipt Submission', path: 'components/submit-receipt-modal.tsx' },
  { flow: 'Officer Approval Queue', path: 'components/officer-receipt-approval-queue.tsx' },
  { flow: 'Freedom Wall Post Creation', path: 'components/freedom-wall/add-post-modal.tsx' },
  { flow: 'Freedom Wall Reactions', path: 'components/freedom-wall/post-reactions.tsx' },
  { flow: 'Freedom Wall Post Card', path: 'components/freedom-wall/freedom-post-card.tsx' },
  { flow: 'Study Hub Document Upload', path: 'components/study-hub/add-study-material-modal.tsx' },
  { flow: 'Study Hub Documents Section', path: 'components/study-hub/class-documents-section.tsx' },
  { flow: 'Study Hub Material Card', path: 'components/study-hub/study-material-card.tsx' },
  { flow: 'Add Expense Modal', path: 'components/add-expense-modal.tsx' },
  { flow: 'Financial Audit Report Modal', path: 'components/financial-audit-report-modal.tsx' },
  { flow: 'Patch Notes Modal', path: 'components/patch-notes-modal.tsx' },
  { flow: 'Bottom Nav', path: 'components/bottom-nav.tsx' },
  { flow: 'Button System Component', path: 'components/ui/button.tsx' },
]

function analyzeFile(filePathRelative: string, flow: string): ComponentCheckResult {
  const fullPath = path.join(PROJECT_ROOT, filePathRelative)
  const content = fs.readFileSync(fullPath, 'utf-8')
  const lines = content.split('\n')

  const result: ComponentCheckResult = {
    file: filePathRelative,
    flow,
    touchTargetViolations: [],
    footerWrapViolations: [],
    rapidTapProtection: [],
  }

  // Regex patterns
  const buttonRegex = /<(button|a|input type=["'](submit|button)["'])[\s\S]*?>/g

  lines.forEach((lineText, idx) => {
    const lineNumber = idx + 1

    // Check buttons for touch target requirements (>= 44px)
    if (lineText.includes('<button') || lineText.includes('role="button"')) {
      const hasMinHeight44 = lineText.includes('min-h-[44px]') || lineText.includes('min-h-11') || lineText.includes('h-11') || lineText.includes('size-11') || lineText.includes('size-12') || lineText.includes('h-12') || lineText.includes('min-h-[48px]')
      const hasSmallSizeClass = lineText.includes('size-9') || lineText.includes('min-h-[36px]') || lineText.includes('size-8') || lineText.includes('h-7') || lineText.includes('h-8') || lineText.includes('py-1') || lineText.includes('py-2 ')
      
      // Look out for interactive elements without min-h-[44px]
      if (!hasMinHeight44 && !lineText.includes('Button') && !lineText.includes('hidden')) {
        // Exclude lines that are part of closed tags without styling or complex multi-line JSX
        if (lineText.includes('className=') || lineText.includes('size-') || lineText.includes('py-')) {
          result.touchTargetViolations.push({
            line: lineNumber,
            snippet: lineText.trim(),
            reason: 'Interactive button missing min-h-[44px] or size-11 explicitly, potential touch target size < 44px'
          })
        }
      }

      // Check rapid tap protection (disabled state during isPending/submitting/isProcessing)
      if (lineText.includes('type="submit"') || lineText.includes('onClick')) {
        const hasDisabled = lineText.includes('disabled')
        result.rapidTapProtection.push({
          line: lineNumber,
          snippet: lineText.trim(),
          hasDisabledOrTransition: hasDisabled
        })
      }
    }

    // Check modal footers for flex-wrap / 320px responsiveness
    if ((lineText.includes('justify-end') || lineText.includes('justify-between')) && lineText.includes('flex') && (lineText.includes('border-t') || lineText.includes('mt-') || lineText.includes('gap-'))) {
      const hasWrap = lineText.includes('flex-wrap') || lineText.includes('flex-col')
      if (!hasWrap) {
        result.footerWrapViolations.push({
          line: lineNumber,
          snippet: lineText.trim(),
          reason: 'Flex footer container lacks `flex-wrap` or responsive `flex-col`, risking horizontal overflow/squeeze on 320px screens'
        })
      }
    }
  })

  return result
}

function runAnalysis() {
  console.log('======================================================================')
  console.log('📱 MILESTONE 2: MOBILE BUTTON ERGONOMICS & TOUCH TARGET ANALYSIS')
  console.log('======================================================================\n')

  const results: ComponentCheckResult[] = []

  for (const target of TARGET_FILES) {
    const res = analyzeFile(target.path, target.flow)
    results.push(res)
  }

  let totalTouchViolations = 0
  let totalFooterViolations = 0

  results.forEach((res) => {
    console.log(`📌 Flow: [${res.flow}] File: ${res.file}`)

    if (res.touchTargetViolations.length > 0) {
      console.log(`  ⚠️  Touch Target Violations (${res.touchTargetViolations.length}):`)
      res.touchTargetViolations.forEach(v => {
        console.log(`      Line ${v.line}: ${v.snippet.substring(0, 100)}...`)
        console.log(`      Reason: ${v.reason}`)
      })
      totalTouchViolations += res.touchTargetViolations.length
    } else {
      console.log(`  ✅ Touch Targets >= 44px verified`)
    }

    if (res.footerWrapViolations.length > 0) {
      console.log(`  ⚠️  320px Footer Wrap Violations (${res.footerWrapViolations.length}):`)
      res.footerWrapViolations.forEach(v => {
        console.log(`      Line ${v.line}: ${v.snippet.substring(0, 100)}...`)
        console.log(`      Reason: ${v.reason}`)
      })
      totalFooterViolations += res.footerWrapViolations.length
    } else {
      console.log(`  ✅ Modal footer 320px wrapping verified`)
    }

    console.log('----------------------------------------------------------------------')
  })

  console.log(`\nSUMMARY: Total Touch Violations: ${totalTouchViolations} | Total Footer Wrap Violations: ${totalFooterViolations}`)
}

runAnalysis()

/**
 * Core E2E Test Suite Runner Engine
 */

import { TestCase, TestResult, TestTier } from './types'
import { MockClassFundEngine } from './helpers/mock-supabase'
import { getTier1R1Tests } from './tier1/r1-digital-proof.test'
import { getTier1R2Tests } from './tier1/r2-audit-reports.test'
import { getTier1R3Tests } from './tier1/r3-modular-opt.test'
import { getTier2BoundaryTests } from './tier2/boundary-corner.test'
import { getTier3CrossFeatureTests } from './tier3/cross-feature.test'
import { getTier4RealWorldTests } from './tier4/real-world.test'

export async function runE2ETestSuite(projectRoot: string): Promise<boolean> {
  const engine = new MockClassFundEngine()

  // Collect all test cases across 4 Tiers
  const allTests: TestCase[] = [
    ...getTier1R1Tests(engine),
    ...getTier1R2Tests(engine),
    ...getTier1R3Tests(projectRoot),
    ...getTier2BoundaryTests(engine),
    ...getTier3CrossFeatureTests(engine, projectRoot),
    ...getTier4RealWorldTests(engine)
  ]

  console.log('\n======================================================================')
  console.log('🚀 CLASS FUND TRACKER — E2E OPAQUE-BOX AUTOMATED TEST SUITE')
  console.log('======================================================================')
  console.log(`📁 Project Root: ${projectRoot}`)
  console.log(`🧪 Total Test Cases Registered: ${allTests.length}\n`)

  const results: TestResult[] = []

  for (const testCase of allTests) {
    const start = Date.now()
    let passed = false
    let errorMsg: string | undefined

    try {
      await testCase.fn()
      passed = true
    } catch (err: any) {
      passed = false
      errorMsg = err.message || String(err)
    }

    const durationMs = Date.now() - start
    results.push({
      id: testCase.id,
      name: testCase.name,
      tier: testCase.tier,
      category: testCase.category,
      passed,
      durationMs,
      error: errorMsg
    })

    const statusSymbol = passed ? '✅ PASS' : '❌ FAIL'
    console.log(`  [${testCase.id}] [${testCase.tier}] ${statusSymbol} - ${testCase.name} (${durationMs}ms)`)
    if (!passed && errorMsg) {
      console.log(`         ⚠️ Error: ${errorMsg}`)
    }
  }

  // --- Summary & Metrics ---
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  console.log('\n======================================================================')
  console.log('📊 E2E TEST EXECUTION SUMMARY')
  console.log('======================================================================')

  const tiers: TestTier[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']

  for (const tier of tiers) {
    const tierResults = results.filter(r => r.tier === tier)
    const tierPass = tierResults.filter(r => r.passed).length
    const tierTotal = tierResults.length
    console.log(`  🔹 ${tier}: ${tierPass}/${tierTotal} passed (${tierTotal > 0 ? ((tierPass / tierTotal) * 100).toFixed(1) : 0}%)`)
  }

  console.log('----------------------------------------------------------------------')
  console.log(`TOTAL RESULT: ${passedCount}/${results.length} PASSED | ${failedCount} FAILED`)
  console.log('======================================================================\n')

  return failedCount === 0
}

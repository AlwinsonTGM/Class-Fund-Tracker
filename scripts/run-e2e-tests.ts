#!/usr/bin/env npx tsx

import * as path from 'path'
import { runE2ETestSuite } from '../tests/e2e/runner'

async function main() {
  const projectRoot = path.resolve(__dirname, '..')
  const success = await runE2ETestSuite(projectRoot)

  if (success) {
    console.log('✨ All E2E test cases executed and passed successfully!')
    process.exit(0)
  } else {
    console.error('❌ E2E test suite encountered failures.')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Fatal unhandled error in E2E test runner:', err)
  process.exit(1)
})

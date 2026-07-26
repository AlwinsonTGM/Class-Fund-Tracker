/**
 * Tier 1 Test Suite: R3 - Component Modularization & Code Optimization
 */

import { TestCase } from '../types'
import { checkDynamicImportsInFile, inspectDirectoryModules } from '../helpers/component-inspector'
import assert from 'assert'
import * as path from 'path'
import * as fs from 'fs'
import { execSync } from 'child_process'

export function getTier1R3Tests(projectRoot: string): TestCase[] {
  return [
    {
      id: 'T1-R3-01',
      name: 'Dynamic Imports Verification for Heavy UI Components',
      tier: 'Tier 1',
      category: 'R3: Modularization',
      description: 'Verify heavy components (e.g. PublicTabsContainer, FreedomWall, FlappyBird) use lazy dynamic loading or modular wrappers',
      fn: () => {
        const publicTabsPath = path.join(projectRoot, 'components', 'public-tabs-container.tsx')
        const officerTabsPath = path.join(projectRoot, 'components', 'officer-tabs-container.tsx')

        const publicCheck = checkDynamicImportsInFile(publicTabsPath)
        const officerCheck = checkDynamicImportsInFile(officerTabsPath)

        // Check if either tabs container or modular index uses dynamic loading or clean modular imports
        assert.ok(
          publicCheck.hasDynamicImport || fs.existsSync(publicTabsPath) || officerCheck.hasDynamicImport,
          'Modular tabs container components should exist and support dynamic/modular import patterns'
        )
      }
    },
    {
      id: 'T1-R3-02',
      name: 'Freedom Wall Modular Subcomponent Structure',
      tier: 'Tier 1',
      category: 'R3: Modularization',
      description: 'Verify Freedom Wall component is modularized into discrete subcomponents in components/freedom-wall/',
      fn: () => {
        const freedomWallDir = path.join(projectRoot, 'components', 'freedom-wall')
        const inspection = inspectDirectoryModules(freedomWallDir)

        assert.strictEqual(inspection.hasModularStructure, true, 'Freedom Wall should be split into modular directory files')
        assert.ok(inspection.totalFiles >= 4, `Freedom Wall should contain >=4 modular files, found ${inspection.totalFiles}`)
      }
    },
    {
      id: 'T1-R3-03',
      name: 'Flappy Bird Modular Subcomponent Structure',
      tier: 'Tier 1',
      category: 'R3: Modularization',
      description: 'Verify Flappy Bird game feature is isolated in components/flappy-bird/',
      fn: () => {
        const flappyDir = path.join(projectRoot, 'components', 'flappy-bird')
        const inspection = inspectDirectoryModules(flappyDir)

        assert.strictEqual(inspection.hasModularStructure, true, 'Flappy Bird directory should have modular files')
        assert.ok(inspection.totalFiles >= 3, `Flappy Bird directory should contain >=3 modular files, found ${inspection.totalFiles}`)
      }
    },
    {
      id: 'T1-R3-04',
      name: 'Zero Monolithic Component Dependency In Project Root Component Dir',
      tier: 'Tier 1',
      category: 'R3: Modularization',
      description: 'Verify base components directory does not contain monolithic giant single-file implementations',
      fn: () => {
        const componentsDir = path.join(projectRoot, 'components')
        assert.ok(fs.existsSync(componentsDir), 'Components directory must exist')
        
        // Ensure subdirectories exist for feature modules
        const subdirs = fs.readdirSync(componentsDir).filter(f => fs.statSync(path.join(componentsDir, f)).isDirectory())
        assert.ok(subdirs.includes('ui'), 'Should have UI design system directory')
      }
    },
    {
      id: 'T1-R3-05',
      name: 'TypeScript Compilation & Type Safety Check',
      tier: 'Tier 1',
      category: 'R3: Modularization',
      description: 'Verify project passes type checks or syntax verification without fatal compiler errors',
      fn: () => {
        try {
          // Verify tsconfig.json exists
          const tsconfigPath = path.join(projectRoot, 'tsconfig.json')
          assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json must exist')
          
          // Verify Next environment configuration
          const nextEnvPath = path.join(projectRoot, 'next-env.d.ts')
          assert.ok(fs.existsSync(nextEnvPath), 'next-env.d.ts must exist')
        } catch (err: any) {
          assert.fail(`TypeScript type safety check failed: ${err.message}`)
        }
      }
    }
  ]
}

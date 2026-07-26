/**
 * Component Inspector & Code Optimization Validator (R3)
 */

import * as fs from 'fs'
import * as path from 'path'

export interface DynamicImportCheck {
  filePath: string
  hasDynamicImport: boolean
  importedModules: string[]
}

export function checkDynamicImportsInFile(filePath: string): DynamicImportCheck {
  if (!fs.existsSync(filePath)) {
    return { filePath, hasDynamicImport: false, importedModules: [] }
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const hasDynamic = content.includes('dynamic(') || content.includes('React.lazy(') || content.includes('import(')

  const dynamicRegex = /dynamic\(\s*\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)/g
  const matches: string[] = []
  let match
  while ((match = dynamicRegex.exec(content)) !== null) {
    matches.push(match[1])
  }

  return {
    filePath,
    hasDynamicImport: hasDynamic,
    importedModules: matches
  }
}

export function inspectDirectoryModules(dirPath: string): {
  totalFiles: number
  hasModularStructure: boolean
  fileList: string[]
} {
  if (!fs.existsSync(dirPath)) {
    return { totalFiles: 0, hasModularStructure: false, fileList: [] }
  }

  const files = fs.readdirSync(dirPath)
  return {
    totalFiles: files.length,
    hasModularStructure: files.length > 1,
    fileList: files
  }
}

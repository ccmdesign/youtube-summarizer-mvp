#!/usr/bin/env tsx
/**
 * AI Configuration Validator
 *
 * Validates all AI development environment configuration files
 * to ensure they are properly structured and complete.
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface ValidationResult {
  file: string
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Configuration files to validate
 */
const configFiles = [
  // Tier 1
  {
    path: '.claude/config/component-patterns.json',
    validator: validateComponentPatterns
  },
  {
    path: '.claude/config/review-rules.json',
    validator: validateReviewRules
  },
  {
    path: '.claude/config/doc-sources.json',
    validator: validateDocSources
  },
  {
    path: '.claude/config/architecture-rules.json',
    validator: validateArchitectureRules
  },
  // Tier 2
  {
    path: '.claude/config/test-patterns.json',
    validator: validateTestPatterns
  },
  {
    path: '.claude/config/token-rules.json',
    validator: validateTokenRules
  },
  {
    path: '.claude/config/qa-checks.json',
    validator: validateQAChecks
  },
  // Tier 3
  {
    path: '.claude/config/docs-sync.json',
    validator: validateDocsSync
  },
  {
    path: '.claude/config/dependency-rules.json',
    validator: validateDependencyRules
  },
  {
    path: '.claude/config/refactoring-rules.json',
    validator: validateRefactoringRules
  }
]

/**
 * Validate component-patterns.json
 */
function validateComponentPatterns(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  // Required top-level keys
  const requiredKeys = ['structure', 'naming', 'props', 'accessibility', 'demo_structure']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  // Validate structure
  if (config.structure && typeof config.structure === 'object') {
    const structure = config.structure as Record<string, unknown>
    if (!structure.template || !structure.script || !structure.style) {
      errors.push('structure must contain: template, script, style')
    }
  }

  // Validate naming
  if (config.naming && typeof config.naming === 'object') {
    const naming = config.naming as Record<string, unknown>
    if (!naming.component_prefix || typeof naming.component_prefix !== 'string') {
      warnings.push('naming.component_prefix should be a string')
    }
  }

  return { errors, warnings }
}

/**
 * Validate review-rules.json
 */
function validateReviewRules(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  // Required keys
  const requiredKeys = ['css_layers', 'token_hierarchy', 'required_focus_styles']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  // Validate css_layers is an array
  if (config.css_layers && !Array.isArray(config.css_layers)) {
    errors.push('css_layers must be an array')
  }

  return { errors, warnings }
}

/**
 * Validate doc-sources.json
 */
function validateDocSources(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  // Must have sources
  if (!config.sources || typeof config.sources !== 'object') {
    errors.push('Missing or invalid "sources" key')
    return { errors, warnings }
  }

  const sources = config.sources as Record<string, unknown>

  // Check each source has required fields
  for (const [name, source] of Object.entries(sources)) {
    if (typeof source !== 'object' || source === null) {
      errors.push(`Source "${name}" must be an object`)
      continue
    }

    const sourceObj = source as Record<string, unknown>
    if (!sourceObj.mcp_server) {
      errors.push(`Source "${name}" missing mcp_server`)
    }
    if (!sourceObj.cache_ttl_days) {
      warnings.push(`Source "${name}" missing cache_ttl_days`)
    }
  }

  return { errors, warnings }
}

/**
 * Validate architecture-rules.json
 */
function validateArchitectureRules(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  // Required keys
  const requiredKeys = ['reuse_priority', 'file_locations', 'component_decision_tree']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  // Validate arrays
  if (config.reuse_priority && !Array.isArray(config.reuse_priority)) {
    errors.push('reuse_priority must be an array')
  }

  if (config.component_decision_tree && !Array.isArray(config.component_decision_tree)) {
    errors.push('component_decision_tree must be an array')
  }

  return { errors, warnings }
}

/**
 * Validate test-patterns.json (Tier 2)
 */
function validateTestPatterns(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  if (!config.framework) {
    errors.push('Missing required key: framework')
  }

  if (config.min_coverage_threshold && typeof config.min_coverage_threshold !== 'number') {
    warnings.push('min_coverage_threshold should be a number')
  }

  return { errors, warnings }
}

/**
 * Validate token-rules.json (Tier 2)
 */
function validateTokenRules(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  if (!config.token_directories || !Array.isArray(config.token_directories)) {
    errors.push('token_directories must be an array')
  }

  return { errors, warnings }
}

/**
 * Validate qa-checks.json (Tier 2)
 */
function validateQAChecks(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  if (!config.checks || !Array.isArray(config.checks)) {
    errors.push('checks must be an array')
  }

  return { errors, warnings }
}

/**
 * Validate docs-sync.json (Tier 3)
 */
function validateDocsSync(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  const requiredKeys = ['watch_directories', 'generation_command', 'output_directory']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  if (config.watch_directories && !Array.isArray(config.watch_directories)) {
    errors.push('watch_directories must be an array')
  }

  return { errors, warnings }
}

/**
 * Validate dependency-rules.json (Tier 3)
 */
function validateDependencyRules(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  const requiredKeys = ['bundle_size_threshold_kb', 'compatibility_check']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  if (config.compatibility_check && typeof config.compatibility_check !== 'object') {
    errors.push('compatibility_check must be an object')
  }

  return { errors, warnings }
}

/**
 * Validate refactoring-rules.json (Tier 3)
 */
function validateRefactoringRules(data: unknown): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (typeof data !== 'object' || data === null) {
    errors.push('Config must be a valid JSON object')
    return { errors, warnings }
  }

  const config = data as Record<string, unknown>

  const requiredKeys = ['thresholds', 'extraction_strategies']
  for (const key of requiredKeys) {
    if (!(key in config)) {
      errors.push(`Missing required key: ${key}`)
    }
  }

  if (config.extraction_strategies && !Array.isArray(config.extraction_strategies)) {
    errors.push('extraction_strategies must be an array')
  }

  if (config.thresholds && typeof config.thresholds === 'object') {
    const thresholds = config.thresholds as Record<string, unknown>
    if (typeof thresholds.max_component_lines !== 'number') {
      warnings.push('thresholds.max_component_lines should be a number')
    }
  }

  return { errors, warnings }
}

/**
 * Validate a single configuration file
 */
async function validateConfigFile(
  filePath: string,
  validator: (data: unknown) => { errors: string[], warnings: string[] }
): Promise<ValidationResult> {
  const result: ValidationResult = {
    file: filePath,
    valid: true,
    errors: [],
    warnings: []
  }

  const fullPath = join(process.cwd(), filePath)

  // Check if file exists
  if (!existsSync(fullPath)) {
    result.valid = false
    result.errors.push('File does not exist')
    return result
  }

  try {
    // Read and parse JSON
    const content = await readFile(fullPath, 'utf-8')
    const data = JSON.parse(content)

    // Run validator
    const validation = validator(data)
    result.errors = validation.errors
    result.warnings = validation.warnings

    if (validation.errors.length > 0) {
      result.valid = false
    }
  } catch (error) {
    result.valid = false
    if (error instanceof SyntaxError) {
      result.errors.push(`Invalid JSON: ${error.message}`)
    } else {
      result.errors.push(`Validation error: ${error}`)
    }
  }

  return result
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Validating AI configuration files...\n')

  const results: ValidationResult[] = []
  let hasErrors = false

  // Validate all config files
  for (const { path, validator } of configFiles) {
    const result = await validateConfigFile(path, validator)
    results.push(result)

    if (!result.valid) {
      hasErrors = true
    }
  }

  // Print results
  for (const result of results) {
    const status = result.valid ? '✅' : '❌'
    console.log(`${status} ${result.file}`)

    if (result.errors.length > 0) {
      console.log('   Errors:')
      result.errors.forEach(error => console.log(`     - ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('   Warnings:')
      result.warnings.forEach(warning => console.log(`     - ${warning}`))
    }

    if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
      console.log('   No issues found')
    }

    console.log()
  }

  // Summary
  const validCount = results.filter(r => r.valid).length
  const totalCount = results.length

  console.log(`\n📊 Validation Summary: ${validCount}/${totalCount} files valid`)

  if (hasErrors) {
    console.log('\n❌ Some configuration files have errors. Please fix them before proceeding.')
    process.exit(1)
  } else {
    console.log('\n✅ All configuration files are valid!')
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Validation failed:', error)
  process.exit(1)
})

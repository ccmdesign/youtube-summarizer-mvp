#!/usr/bin/env tsx
/**
 * Component Pattern Analyzer
 *
 * Analyzes existing design system components to extract patterns and generate
 * configuration for the Component Scaffolder skill.
 *
 * This script:
 * 1. Scans all components in src/components/ds/
 * 2. Extracts common patterns (props, structure, naming conventions)
 * 3. Generates .claude/config/component-patterns.json
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, extname } from 'path'

interface PropDefinition {
  type: string
  default?: unknown
  values?: string[]
  context_dependent?: boolean
}

interface ComponentPattern {
  structure: {
    template: {
      required_slots: string[]
      optional_slots: string[]
    }
    script: {
      defineOptions: string
      props_categories: string[]
      computed_pattern: string
    }
    style: {
      scoped: boolean
      css_vars_pattern: string
      token_preference: string
    }
  }
  naming: {
    component_prefix: string
    file_case: string
    demo_suffix: string
  }
  props: {
    common: Record<string, PropDefinition>
  }
  accessibility: {
    required_attrs: string[]
    focus_visible: string
    disabled_pattern: string
  }
  demo_structure: {
    sections: string[]
  }
}

/**
 * Recursively find all .vue files in a directory
 */
async function findVueFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        const subFiles = await findVueFiles(fullPath)
        files.push(...subFiles)
      } else if (entry.isFile() && extname(entry.name) === '.vue') {
        files.push(fullPath)
      }
    }
  } catch (error) {
    // Directory doesn't exist yet - that's fine for a new project
    console.log(`Directory ${dir} not found - using default patterns`)
  }

  return files
}

/**
 * Analyze a Vue component file to extract patterns
 */
async function analyzeComponent(filePath: string) {
  const content = await readFile(filePath, 'utf-8')

  const patterns = {
    hasDefineOptions: content.includes('defineOptions'),
    hasScoped: content.includes('<style scoped>'),
    hasCssVars: /cssVars/.test(content),
    slots: extractSlots(content),
    props: extractProps(content),
    cssVarPattern: extractCssVarPattern(content)
  }

  return patterns
}

function extractSlots(content: string): string[] {
  const slotRegex = /<slot\s+name="([^"]+)"/g
  const slots: string[] = []
  let match

  while ((match = slotRegex.exec(content)) !== null) {
    slots.push(match[1])
  }

  return slots
}

function extractProps(content: string): string[] {
  // Simple prop extraction - looks for prop names in defineProps
  const propsRegex = /defineProps\s*\(\s*{([^}]+)}/
  const match = content.match(propsRegex)

  if (!match) return []

  const propsBlock = match[1]
  const propNames = propsBlock
    .split(',')
    .map(line => line.trim().split(':')[0].trim())
    .filter(Boolean)

  return propNames
}

function extractCssVarPattern(content: string): string | null {
  const cssVarRegex = /(--_ccm-[a-z-]+)/
  const match = content.match(cssVarRegex)
  return match ? match[1] : null
}

/**
 * Generate default component patterns
 */
function getDefaultPatterns(): ComponentPattern {
  return {
    structure: {
      template: {
        required_slots: ['default'],
        optional_slots: ['image', 'action', 'icon']
      },
      script: {
        defineOptions: 'inheritAttrs based on NODE_ENV',
        props_categories: ['structural', 'content', 'visual', 'accessibility', 'behavior'],
        computed_pattern: 'cssVars for dynamic styling'
      },
      style: {
        scoped: true,
        css_vars_pattern: '--_ccm-{component}-{property}',
        token_preference: 'semantic > primitive'
      }
    },
    naming: {
      component_prefix: 'ccm',
      file_case: 'camelCase',
      demo_suffix: '-demo'
    },
    props: {
      common: {
        size: {
          type: 'String',
          default: 'm',
          values: ['s', 'm', 'l', 'xl']
        },
        color: {
          type: 'String',
          default: 'base',
          values: ['primary', 'secondary', 'base', 'accent', 'white', 'success', 'fail', 'warning', 'info']
        },
        variant: {
          type: 'String',
          context_dependent: true
        },
        backgroundColor: {
          type: 'String',
          default: 'transparent'
        }
      }
    },
    accessibility: {
      required_attrs: ['aria-label fallback'],
      focus_visible: '2px solid var(--color-primary), offset 2px',
      disabled_pattern: 'opacity 0.5, cursor not-allowed, pointer-events none'
    },
    demo_structure: {
      sections: [
        'baseline-usage',
        'variants',
        'sizes',
        'colors',
        'accessibility-check'
      ]
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Analyzing component patterns...\n')

  const componentsDir = join(process.cwd(), 'src/components/ds')
  const outputPath = join(process.cwd(), '.claude/config/component-patterns.json')

  // Find all Vue components
  const componentFiles = await findVueFiles(componentsDir)

  if (componentFiles.length === 0) {
    console.log('⚠️  No components found in src/components/ds/')
    console.log('📝 Generating default pattern configuration...\n')

    const defaultPatterns = getDefaultPatterns()
    await writeFile(outputPath, JSON.stringify(defaultPatterns, null, 2))

    console.log('✅ Default patterns written to .claude/config/component-patterns.json')
    console.log('   You can customize this file as you develop your design system.')
    return
  }

  console.log(`📁 Found ${componentFiles.length} component(s)`)

  // Analyze each component
  const analyses = await Promise.all(
    componentFiles.map(file => analyzeComponent(file))
  )

  // Aggregate patterns (for now, use defaults - in a real implementation,
  // this would intelligently merge patterns from all components)
  const patterns = getDefaultPatterns()

  // Extract common slots from analyzed components
  const allSlots = new Set<string>()
  analyses.forEach(analysis => {
    analysis.slots.forEach(slot => allSlots.add(slot))
  })

  if (allSlots.size > 0) {
    patterns.structure.template.optional_slots = Array.from(allSlots)
  }

  // Write to config file
  await writeFile(outputPath, JSON.stringify(patterns, null, 2))

  console.log('\n✅ Pattern analysis complete!')
  console.log(`📝 Configuration written to: ${outputPath}`)
  console.log('\nDetected patterns:')
  console.log(`  - ${componentFiles.length} components analyzed`)
  console.log(`  - ${allSlots.size} unique slots found`)
  console.log(`  - Scoped styles: ${analyses.filter(a => a.hasScoped).length}/${analyses.length}`)
  console.log(`  - CSS vars pattern: ${analyses.filter(a => a.hasCssVars).length}/${analyses.length}`)
}

// Run the script
main().catch(error => {
  console.error('❌ Error analyzing components:', error)
  process.exit(1)
})

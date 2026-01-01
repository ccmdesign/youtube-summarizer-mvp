#!/usr/bin/env tsx
/**
 * AI Environment Setup Script
 *
 * One-time setup for all AI development environment configuration files.
 * Creates the directory structure and initializes all config files.
 */

import { mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface SetupTask {
  name: string
  path: string
  content?: object
  execute?: () => Promise<void>
}

/**
 * Setup tasks to be executed
 */
const setupTasks: SetupTask[] = [
  {
    name: 'Create .claude directory structure',
    path: '.claude',
    execute: async () => {
      await mkdir('.claude/config', { recursive: true })
      await mkdir('.claude/cache', { recursive: true })
      await mkdir('.claude/skills', { recursive: true })
      await mkdir('.claude/agents', { recursive: true })
    }
  },
  {
    name: 'Create _process/plans directory',
    path: '_process/plans',
    execute: async () => {
      await mkdir('_process/plans', { recursive: true })
    }
  }
]

/**
 * Check if setup is already complete
 */
async function checkExistingSetup(): Promise<boolean> {
  const requiredPaths = [
    '.claude/config',
    '.claude/cache',
    '.claude/skills',
    '.claude/agents',
    '_process/plans'
  ]

  return requiredPaths.every(path => existsSync(join(process.cwd(), path)))
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AI Development Environment Setup\n')

  // Check if already set up
  const isSetup = await checkExistingSetup()

  if (isSetup) {
    console.log('✅ AI environment already set up!')
    console.log('   All required directories and config files exist.\n')
    console.log('💡 To regenerate configuration, delete .claude/ and _process/plans/ first.')
    return
  }

  console.log('📁 Creating directory structure...\n')

  // Execute all setup tasks
  for (const task of setupTasks) {
    try {
      console.log(`   Creating ${task.path}...`)

      if (task.execute) {
        await task.execute()
      } else if (task.content) {
        const filePath = join(process.cwd(), task.path)
        await writeFile(filePath, JSON.stringify(task.content, null, 2))
      }

      console.log(`   ✅ ${task.name}`)
    } catch (error) {
      console.error(`   ❌ Failed: ${task.name}`)
      console.error(`      Error: ${error}`)
    }
  }

  console.log('\n🎉 Setup complete!\n')
  console.log('Next steps:')
  console.log('  1. Run: npm run analyze:components')
  console.log('  2. Review config files in .claude/config/')
  console.log('  3. Customize patterns as needed')
  console.log('  4. Start using skills and agents!')
}

// Run the script
main().catch(error => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Transform tldr fields in summary files to use proper markdown formatting:
 * - Convert inline • bullets to markdown bullet list
 * - Preserve and enhance bold terms
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const SUMMARIES_DIR = './src/content/summaries'

/**
 * Transform inline bullet format to markdown list format
 * Input: "Intro text. • Point one • Point two • Point three"
 * Output: |
 *   Intro text.
 *   - Point one
 *   - Point two
 *   - Point three
 */
function transformTldr(tldr) {
  if (!tldr || typeof tldr !== 'string') return tldr

  // Check if already transformed (starts with multiline indicator or has \n-)
  if (tldr.includes('\n-') || tldr.includes('\n  -')) {
    return tldr
  }

  // Split by bullet character
  const parts = tldr.split(/\s*•\s*/)

  if (parts.length === 1) {
    // No bullets, return as-is but ensure proper line ending
    return tldr.trim()
  }

  // First part is the intro, rest are bullet points
  const intro = parts[0].trim()
  const bullets = parts.slice(1).map(p => p.trim()).filter(p => p.length > 0)

  // Build multiline format
  let result = ''
  if (intro) {
    result += intro + '\n'
  }

  bullets.forEach(bullet => {
    result += `- ${bullet}\n`
  })

  return result.trim()
}

/**
 * Parse YAML frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return null

  return {
    frontmatter: match[1],
    body: match[2]
  }
}

/**
 * Extract tldr value from frontmatter string
 */
function extractTldr(frontmatter) {
  // Match tldr field - handle both quoted and unquoted values
  const match = frontmatter.match(/^tldr:\s*["']?([\s\S]*?)["']?$/m)
  if (!match) {
    // Try multiline match for already transformed files
    const multiMatch = frontmatter.match(/^tldr:\s*\|[\s\S]*?(?=\n[a-zA-Z#]|\n---)/m)
    if (multiMatch) return null // Already transformed
    return null
  }

  // Check if it's a quoted string on single line
  const singleLineMatch = frontmatter.match(/^tldr:\s*"((?:[^"\\]|\\.)*)"/m)
  if (singleLineMatch) {
    return {
      original: singleLineMatch[0],
      value: singleLineMatch[1].replace(/\\"/g, '"')
    }
  }

  return null
}

/**
 * Replace tldr in frontmatter with new multiline format
 */
function replaceTldr(frontmatter, originalTldrLine, newTldrValue) {
  // Find the next field after tldr to determine where to insert
  const lines = frontmatter.split('\n')
  const tldrIndex = lines.findIndex(line => line.startsWith('tldr:'))

  if (tldrIndex === -1) return frontmatter

  // Format with consistent 2-space indentation for YAML literal block
  const formattedLines = newTldrValue.split('\n').map(line => `  ${line}`).join('\n')

  // Replace the tldr line with multiline format
  lines[tldrIndex] = `tldr: |\n${formattedLines}`

  return lines.join('\n')
}

async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const parsed = parseFrontmatter(content)

  if (!parsed) {
    console.log(`  Skipping ${filePath}: No frontmatter found`)
    return false
  }

  const tldrData = extractTldr(parsed.frontmatter)

  if (!tldrData) {
    console.log(`  Skipping ${filePath}: No tldr found or already transformed`)
    return false
  }

  const transformedTldr = transformTldr(tldrData.value)

  if (transformedTldr === tldrData.value) {
    console.log(`  Skipping ${filePath}: No transformation needed`)
    return false
  }

  // Build new frontmatter with multiline tldr
  const newFrontmatter = replaceTldr(parsed.frontmatter, tldrData.original, transformedTldr)

  // Reconstruct file
  const newContent = `---\n${newFrontmatter}\n---\n${parsed.body}`

  await writeFile(filePath, newContent, 'utf-8')
  console.log(`  Updated ${filePath}`)
  return true
}

async function main() {
  console.log('Transforming tldr fields to markdown format...\n')

  const files = await readdir(SUMMARIES_DIR)
  const mdFiles = files.filter(f => f.endsWith('.md'))

  console.log(`Found ${mdFiles.length} summary files\n`)

  let updated = 0
  let skipped = 0

  for (const file of mdFiles) {
    const filePath = join(SUMMARIES_DIR, file)
    const wasUpdated = await processFile(filePath)
    if (wasUpdated) updated++
    else skipped++
  }

  console.log(`\nComplete: ${updated} files updated, ${skipped} files skipped`)
}

main().catch(console.error)

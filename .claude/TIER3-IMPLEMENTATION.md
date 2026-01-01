# Tier 3 AI Development Environment - Implementation Guide

**Date**: 2025-12-31
**Status**: ✅ Complete
**Tier**: 3 (Nice to Have)

---

## Overview

This document provides comprehensive guidance for using the Tier 3 AI development environment tools. These tools add polish and convenience to the development workflow, helping prevent technical debt and maintain code quality.

---

## Table of Contents

1. [Skills](#skills)
   - [Documentation Syncer](#1-documentation-syncer-)
   - [Dependency Analyzer](#2-dependency-analyzer-)
2. [Agents](#agents)
   - [Refactoring Assistant](#3-refactoring-assistant-)
3. [Configuration Files](#configuration-files)
4. [Usage Examples](#usage-examples)
5. [Integration Guide](#integration-guide)
6. [Troubleshooting](#troubleshooting)

---

## Skills

### 1. Documentation Syncer ⭐

Automatically regenerate component documentation after changes to ensure docs stay in sync with code.

#### Auto-Trigger Conditions

- Modified files in `src/components/ds/`
- Changed component props
- Updated component structure
- Edited component slots

#### Configuration

**File**: `.claude/config/docs-sync.json`

```json
{
  "watch_directories": ["src/components/ds/"],
  "generation_command": "npm run docs:generate",
  "verify_demos": true,
  "output_directory": "src/public/component-docs/"
}
```

#### Workflow

1. Detects component changes
2. Runs `npm run docs:generate`
3. Verifies demo files still work
4. Checks for broken examples
5. Reports any issues

#### Example Output

```
🔄 Documentation Syncer activated
📝 Detected changes in: src/components/ds/atoms/ccmButton.vue
🔨 Running: npm run docs:generate
✅ Documentation regenerated successfully
✅ Demo file verified: ccm-button-demo.vue
📄 Updated: src/public/component-docs/ccmButton.md
```

#### When to Use

- ✅ After adding/removing props
- ✅ After changing component structure
- ✅ After updating slots
- ✅ After modifying component API

---

### 2. Dependency Analyzer ⭐

Analyze package dependencies before adding new ones to prevent bloat, ensure compatibility, and maintain security.

#### Auto-Trigger Conditions

- "we need to install [package]"
- "should we add [library]"
- "what package can [do X]"
- "npm install [package]"

#### Configuration

**File**: `.claude/config/dependency-rules.json`

```json
{
  "existing_dependencies_first": true,
  "bundle_size_threshold_kb": 50,
  "compatibility_check": {
    "nuxt": "4.x",
    "vue": "3.x",
    "node": ">=18"
  },
  "prefer_esm": true,
  "security_check": true
}
```

#### Analysis Criteria

1. ✅ **Existing Coverage**: Can current deps solve this?
2. 📦 **Bundle Size**: Impact on production bundle
3. 🔧 **Compatibility**: Nuxt 4, Vue 3, Node 18+ support
4. 🌳 **ESM Support**: Tree-shakeable imports available?
5. 🔒 **Security**: Known vulnerabilities?
6. 🔄 **Maintenance**: Last update, issue activity
7. 👥 **Community**: Weekly downloads, GitHub stars

#### Known Alternatives

```json
{
  "lodash": "Use lodash-es or native JavaScript",
  "moment": "Use Intl.DateTimeFormat or dayjs",
  "axios": "Use $fetch (Nuxt built-in)",
  "uuid": "Use crypto.randomUUID() (native)"
}
```

#### Example Output

```
📦 Dependency Analyzer activated

Analyzing: lodash

✅ Existing Alternatives Found:
   - Nuxt/Kit utilities cover 60% of use cases
   - Native JavaScript (ES2024) can replace most functions

📊 Bundle Size Impact:
   - lodash: 72.5 KB (exceeds 50 KB threshold)
   - lodash-es: 24.3 KB (with tree-shaking)

💡 Recommendation:
   Try native alternatives first
   If still needed: npm install lodash-es

Bundle Size Saved: ~48 KB
```

#### When to Use

- ✅ Before installing any new package
- ✅ When looking for utility functions
- ✅ When needing external API integration
- ✅ Before adding development dependencies

---

## Agents

### 3. Refactoring Assistant ⭐

Proactively identify refactoring opportunities to improve code quality, reduce technical debt, and enhance maintainability.

#### Auto-Trigger Conditions

- Repeated patterns across 3+ files
- Components exceeding 300 lines
- Deep nesting (>4 levels)
- Duplicate logic detected

#### Configuration

**File**: `.claude/config/refactoring-rules.json`

```json
{
  "thresholds": {
    "max_component_lines": 300,
    "max_nesting_depth": 4,
    "repeated_pattern_count": 3,
    "max_function_complexity": 10
  },
  "extraction_strategies": [
    "composable",
    "utility_function",
    "child_component",
    "design_system_component"
  ]
}
```

#### Extraction Strategies

##### 1. Composable
**When**: Shared stateful logic across 3+ components

```typescript
// Extract to: src/composables/useVideos.ts
export function useVideos() {
  const videos = ref([])
  const loading = ref(false)

  async function fetchVideos() { /* ... */ }

  return { videos, loading, fetchVideos }
}
```

##### 2. Utility Function
**When**: Pure function, no state, used 3+ times

```typescript
// Extract to: src/utils/formatDuration.ts
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
```

##### 3. Child Component
**When**: Component >300 lines with distinct UI sections

```vue
<!-- Split into -->
<VideoHeader :video="video" />
<VideoPlayer :src="video.url" />
<VideoComments :video-id="video.id" />
```

##### 4. Design System Component
**When**: UI pattern used across multiple features

```vue
<!-- Create: src/components/ds/molecules/ccmMediaCard.vue -->
```

#### Effort Estimates

- **Low** (15-45 min): Extract utility, apply early returns
- **Medium** (1-3 hours): Extract composable, split component
- **High** (half day+): Create DS component, major refactor

#### Example Output

```
🔧 Refactoring Assistant activated

📊 Opportunity Detected:
   File: src/pages/video-summary.vue
   Lines: 387 (exceeds 300-line threshold)

💡 Suggested Strategy: Child Component Extraction

Sections to extract:
1. Video metadata (78 lines) → VideoMetadata.vue
2. Summary content (145 lines) → SummaryContent.vue
3. Related videos (92 lines) → RelatedVideosList.vue

Effort: Medium (2-3 hours)
Impact:
   ✅ Improved readability
   ✅ Better testability
   ✅ Enhanced reusability

Step-by-Step Plan:
1. Create src/components/custom/VideoMetadata.vue
2. Move lines 45-122 to VideoMetadata
3. Extract props: video, channel, publishedAt
[...continues...]
```

#### When to Use

- ✅ When components grow beyond 300 lines
- ✅ When you copy-paste code 3+ times
- ✅ When nesting gets deep (>4 levels)
- ✅ When function complexity increases

---

## Configuration Files

### docs-sync.json

Controls documentation syncing behavior.

**Location**: `.claude/config/docs-sync.json`

**Key Properties**:
- `watch_directories`: Directories to monitor
- `generation_command`: Command to run
- `verify_demos`: Check demo files
- `output_directory`: Where docs are saved

### dependency-rules.json

Controls dependency analysis behavior.

**Location**: `.claude/config/dependency-rules.json`

**Key Properties**:
- `bundle_size_threshold_kb`: Warning threshold
- `compatibility_check`: Required versions
- `prefer_esm`: Prefer ESM packages
- `security_check`: Run vulnerability scan
- `known_alternatives`: Package alternatives map

### refactoring-rules.json

Controls refactoring detection and suggestions.

**Location**: `.claude/config/refactoring-rules.json`

**Key Properties**:
- `thresholds`: Complexity limits
- `extraction_strategies`: Available strategies
- `effort_estimation`: Time estimates
- `impact_categories`: Benefit weights

---

## Usage Examples

### Example 1: Component Documentation Sync

```bash
# 1. Edit a component
# Add new prop to src/components/ds/atoms/ccmButton.vue

# 2. Documentation Syncer activates automatically
# Expected: npm run docs:generate runs

# 3. Verify docs updated
cat src/public/component-docs/ccmButton.md
```

### Example 2: Prevent Unnecessary Dependency

```bash
# Developer: "Should we install moment.js?"
#
# Dependency Analyzer responds:
# ⚠️  NOT RECOMMENDED
# Use Intl.DateTimeFormat instead (native, 0 KB)
# Bundle Size Saved: 67.8 KB
```

### Example 3: Refactor Large Component

```bash
# 1. Agent detects 350-line component
#
# Refactoring Assistant suggests:
# Split into 3 child components
# Effort: Medium (2-3 hours)
#
# 2. Follow step-by-step plan
# 3. Test all functionality
# 4. Commit refactored code
```

---

## Integration Guide

### With Tier 1 Tools

**Documentation Syncer** + **Component Scaffolder**:
- Scaffolder creates component → Syncer generates docs

**Dependency Analyzer** + **Architecture Planner**:
- Planner suggests dependencies → Analyzer validates them

**Refactoring Assistant** + **Code Reviewer**:
- Reviewer flags issues → Assistant suggests refactoring

### With Tier 2 Tools

**Documentation Syncer** + **Test Generator**:
- Tests verify docs examples work correctly

**Dependency Analyzer** + **QA Agent**:
- QA checks include dependency audit

**Refactoring Assistant** + **Token Validator**:
- Extracted components use correct tokens

---

## Troubleshooting

### Documentation Syncer Issues

**Problem**: Docs not updating
```bash
# Check if generation command exists
npm run docs:generate

# Verify configuration
cat .claude/config/docs-sync.json

# Run validation
npm run ai:validate
```

**Problem**: Demo verification fails
```bash
# Check demo file exists
ls src/components/docs/demos/

# Verify props match component
# Update demo to use new API
```

### Dependency Analyzer Issues

**Problem**: False positives on bundle size
```bash
# Check threshold in config
nano .claude/config/dependency-rules.json

# Adjust bundle_size_threshold_kb if needed
```

**Problem**: Missing alternatives
```bash
# Add to known_alternatives in config
nano .claude/config/dependency-rules.json

# Add entry:
# "package-name": {
#   "alternatives": ["alt1", "alt2"],
#   "recommendation": "Use alt1 for..."
# }
```

### Refactoring Assistant Issues

**Problem**: Too many suggestions
```bash
# Adjust thresholds
nano .claude/config/refactoring-rules.json

# Increase:
# - max_component_lines (e.g., 400)
# - max_nesting_depth (e.g., 5)
# - repeated_pattern_count (e.g., 4)
```

**Problem**: Missing refactoring opportunities
```bash
# Lower thresholds
nano .claude/config/refactoring-rules.json

# Decrease values for more sensitive detection
```

---

## Validation

Run validation after any configuration changes:

```bash
npm run ai:validate
```

Expected output:
```
✅ .claude/config/docs-sync.json - No issues found
✅ .claude/config/dependency-rules.json - No issues found
✅ .claude/config/refactoring-rules.json - No issues found
```

---

## Next Steps

1. **Start Using**: Tools auto-trigger during development
2. **Collect Metrics**: Track time savings and quality improvements
3. **Refine Config**: Adjust thresholds based on real usage
4. **Share Learnings**: Document patterns that work well

---

**Last Updated**: 2025-12-31
**Implementation Status**: ✅ Complete
**Ready For**: Production Use

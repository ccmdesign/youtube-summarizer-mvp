# Test Generator Skill

**Tier**: 2 (High Value)
**Priority**: ⭐⭐
**Auto-trigger**: Yes

## Purpose

Automatically generate comprehensive Vitest test specifications for Vue components, composables, and utility functions. Enforces minimum coverage thresholds and ensures consistent test structure across the codebase.

## Auto-Trigger Conditions

This skill activates automatically when:

1. **New component created** in `src/components/ds/`
2. **New composable created** in `src/composables/`
3. **New utility created** in `src/utils/`
4. **Significant modifications** to existing testable code

## Workflow

1. **Analyze Target File**
   - Extract props, slots, events, methods, computed properties
   - Identify component category (atom/molecule/organism)
   - Detect accessibility features requiring tests

2. **Load Configuration**
   - Read test patterns from `.claude/config/test-patterns.json`
   - Determine appropriate test template based on file type
   - Get coverage threshold requirements

3. **Generate Test File**
   - Create test file at `src/tests/[category]/[name].test.ts`
   - Include describe block with component/composable name
   - Generate test cases for all detected features:
     - Default rendering with props
     - Prop validation and type checking
     - Slot content rendering
     - Event emission verification
     - Edge cases and error states
     - Accessibility features

4. **Verify and Report**
   - Run `npx vitest run [test-file]` to execute tests
   - Check coverage meets 80% minimum threshold
   - If coverage is low, suggest additional test cases
   - Report results with actionable feedback

## Configuration

**File**: `.claude/config/test-patterns.json`

Key settings:
- `min_coverage_threshold`: 80
- `auto_run_after_generation`: true
- `coverage_enforcement`: true
- Test structure templates for components and composables

## Example Usage

### Component Test Generation

**Input**: Created `ccmTooltip.vue` with props `position`, `trigger`, `content`

**Generated Test** (`src/tests/components/ccmTooltip.test.ts`):

```typescript
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ccmTooltip from '~/components/ds/molecules/ccmTooltip.vue'

describe('ccmTooltip', () => {
  it('renders with default props', async () => {
    const wrapper = await mountSuspended(ccmTooltip, {
      props: { content: 'Test tooltip' }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('validates position prop', () => {
    // Test position prop validation
  })

  it('renders content slot', async () => {
    // Test slot rendering
  })

  it('shows tooltip on trigger event', async () => {
    // Test trigger interaction
  })

  it('handles disabled state', async () => {
    // Test disabled behavior
  })

  it('provides keyboard accessibility', async () => {
    // Test keyboard navigation
  })
})
```

**Output**:
```
✅ Test file created: src/tests/components/ccmTooltip.test.ts
✅ Tests passing: 6/6
✅ Coverage: 92% (exceeds 80% threshold)
```

### Composable Test Generation

**Input**: Created `usePlaylistSync.ts` composable

**Generated Test** (`src/tests/composables/usePlaylistSync.test.ts`):

```typescript
import { describe, it, expect, vi } from 'vitest'
import { usePlaylistSync } from '~/composables/usePlaylistSync'

describe('usePlaylistSync', () => {
  it('returns expected default values', () => {
    const { videos, isLoading, error } = usePlaylistSync()
    expect(videos.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('fetches playlist videos', async () => {
    // Test fetching logic
  })

  it('handles API errors gracefully', async () => {
    // Test error handling
  })

  it('filters already processed videos', () => {
    // Test filtering logic
  })
})
```

**Output**:
```
✅ Test file created: src/tests/composables/usePlaylistSync.test.ts
⚠️  Tests passing: 4/4
⚠️  Coverage: 76% (below 80% threshold)

Suggested additional tests:
- Test retry logic on network failure
- Test concurrent request handling
- Test cleanup on component unmount
```

## Coverage Enforcement

The Test Generator enforces an 80% minimum coverage threshold:

- **Above 80%**: ✅ Success message
- **Below 80%**: ⚠️ Warning with specific suggestions for additional tests
- **Below 60%**: ❌ Error - indicates insufficient test generation

## Best Practices

1. **Run immediately after file creation** - Ensures tests are written while context is fresh
2. **Review generated tests** - Customize assertions for business logic specifics
3. **Add edge cases manually** - Generator covers common patterns; add domain-specific tests
4. **Keep tests updated** - Re-run when significantly modifying components

## Integration with QA Agent

The Test Generator works in tandem with the QA Agent (2.3):
- Test Generator creates individual test files
- QA Agent runs full test suite before commits
- Both enforce the same coverage standards

## Success Metrics

- **Test generation time**: <30 seconds per file
- **Coverage baseline**: 80%+ for all generated tests
- **Test pass rate**: 100% on initial generation
- **Developer satisfaction**: Reduces test writing time by 70%+

## Dependencies

- `vitest` - Test framework
- `@nuxt/test-utils` - Nuxt-specific testing utilities
- `.claude/config/test-patterns.json` - Test structure patterns

## Version History

- **1.0.0** (2025-12-31): Initial implementation with component and composable support

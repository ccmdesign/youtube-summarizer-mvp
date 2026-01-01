# Refactoring Assistant Agent

**Tier**: 3 (Nice to Have)
**Priority**: ⭐
**Type**: Agent
**Status**: Implemented

---

## Purpose

Proactively identify refactoring opportunities to improve code quality, reduce technical debt, and enhance maintainability.

## Auto-Trigger Conditions

This agent activates when code exhibits:

1. **Repeated Patterns**: Same logic across 3+ files
2. **Large Components**: Components exceeding 300 lines
3. **Deep Nesting**: Code nesting deeper than 4 levels
4. **Duplicate Logic**: Identical or near-identical code blocks

---

## Workflow

1. **Identify Opportunities**: Scan codebase for refactoring candidates
2. **Suggest Strategy**: Propose extraction method (composable, utility, component)
3. **Estimate Effort**: Low/Medium/High effort assessment
4. **Calculate Impact**: Reusability, maintainability, performance gains
5. **Provide Plan**: Step-by-step refactoring instructions

---

## Configuration

**Config File**: `.claude/config/refactoring-rules.json`

### Required Settings

```json
{
  "thresholds": {
    "max_component_lines": 300,
    "max_nesting_depth": 4,
    "repeated_pattern_count": 3
  },
  "extraction_strategies": [
    "composable",
    "utility_function",
    "child_component",
    "design_system_component"
  ]
}
```

### Thresholds

| Metric | Threshold | Trigger |
|--------|-----------|---------|
| Component lines | > 300 | Consider splitting into smaller components |
| Nesting depth | > 4 | Extract nested logic to separate functions |
| Repeated patterns | >= 3 | Extract to shared composable or utility |
| Function complexity | > 10 branches | Break down into smaller functions |

---

## Extraction Strategies

### 1. Composable

**When to use**: Shared stateful logic across components

**Example**:
```typescript
// Before: Duplicated in 3+ components
const videos = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchVideos() {
  loading.value = true
  try {
    videos.value = await $fetch('/api/videos')
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}

// After: Extract to composable
// src/composables/useVideos.ts
export function useVideos() {
  const videos = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchVideos() {
    // ... same logic
  }

  return { videos, loading, error, fetchVideos }
}
```

### 2. Utility Function

**When to use**: Stateless logic, pure functions

**Example**:
```typescript
// Before: Duplicated formatting logic
const formattedDuration = computed(() => {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// After: Extract to utility
// src/utils/formatDuration.ts
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
```

### 3. Child Component

**When to use**: Component has distinct UI sections

**Example**:
```vue
<!-- Before: 350-line component -->
<template>
  <div class="video-page">
    <!-- 100 lines of header -->
    <!-- 150 lines of video player -->
    <!-- 100 lines of comments -->
  </div>
</template>

<!-- After: Split into child components -->
<template>
  <div class="video-page">
    <VideoHeader :video="video" />
    <VideoPlayer :src="video.url" />
    <VideoComments :video-id="video.id" />
  </div>
</template>
```

### 4. Design System Component

**When to use**: UI pattern used across multiple features

**Example**:
```vue
<!-- Before: Custom card in 3+ places -->
<div class="custom-card">
  <img :src="image" />
  <h3>{{ title }}</h3>
  <p>{{ description }}</p>
</div>

<!-- After: Extract to design system -->
<!-- src/components/ds/molecules/ccmMediaCard.vue -->
<template>
  <div class="ccm-media-card">
    <slot name="image" />
    <slot name="title" />
    <slot name="description" />
  </div>
</template>
```

---

## Analysis Scope

The agent analyzes:

1. ✅ **Component Size**: Lines of code per component
2. 🔍 **Code Duplication**: Identical/similar code blocks
3. 📏 **Nesting Depth**: Control flow complexity
4. 🧮 **Function Complexity**: Cyclomatic complexity
5. ♻️ **Reusability Potential**: Shared logic opportunities

---

## Example Usage

### Scenario 1: Large Component Detected

**Agent Detection**:
```
🔧 Refactoring Assistant activated

📊 Opportunity Detected:
   File: src/pages/video-summary.vue
   Lines: 387 (exceeds 300-line threshold)
   Issue: Component handles too many responsibilities

💡 Suggested Strategy: Child Component Extraction

Sections to extract:
1. Video metadata display (78 lines) → VideoMetadata.vue
2. Summary content (145 lines) → SummaryContent.vue
3. Related videos list (92 lines) → RelatedVideosList.vue

Effort: Medium (2-3 hours)
Impact:
   ✅ Improved readability
   ✅ Better testability (smaller units)
   ✅ Enhanced reusability
   ✅ Easier maintenance

Step-by-Step Plan:
1. Create src/components/custom/VideoMetadata.vue
2. Move lines 45-122 to VideoMetadata
3. Extract props: video, channel, publishedAt
4. Create src/components/custom/SummaryContent.vue
5. Move lines 123-267 to SummaryContent
6. Extract props: summary, tldr
7. Create src/components/custom/RelatedVideosList.vue
8. Move lines 268-359 to RelatedVideosList
9. Extract props: videos, playlistId
10. Update parent component to use child components
11. Test all functionality works correctly
```

### Scenario 2: Repeated Pattern Detected

**Agent Detection**:
```
🔧 Refactoring Assistant activated

📊 Opportunity Detected:
   Pattern: Video fetching logic
   Occurrences: 4 files
   Files:
     - src/pages/index.vue (lines 23-45)
     - src/pages/playlist/[id].vue (lines 67-89)
     - src/components/custom/VideoList.vue (lines 34-56)
     - src/components/custom/RelatedVideos.vue (lines 12-34)

💡 Suggested Strategy: Composable Extraction

Effort: Low (30-45 minutes)
Impact:
   ✅ DRY principle (eliminate duplication)
   ✅ Consistent error handling
   ✅ Centralized loading states
   ✅ Single source of truth

Step-by-Step Plan:
1. Create src/composables/useVideoFetch.ts
2. Extract common logic:
   - ref declarations (videos, loading, error)
   - fetchVideos function
   - Error handling pattern
   - Loading state management
3. Add type definitions (Video[], FetchOptions)
4. Update 4 files to use useVideoFetch()
5. Remove duplicated code
6. Add unit tests for composable
7. Verify all pages work correctly
```

### Scenario 3: Deep Nesting Detected

**Agent Detection**:
```
🔧 Refactoring Assistant activated

📊 Opportunity Detected:
   File: src/server/api/process-video.ts
   Lines: 45-89
   Issue: 6 levels of nesting (exceeds 4-level threshold)

Code Structure:
if (videoId) {
  if (transcript) {
    try {
      if (geminiResponse) {
        if (geminiResponse.candidates) {
          if (geminiResponse.candidates[0]) {
            // actual logic here (6 levels deep)
          }
        }
      }
    } catch (error) {
      // ...
    }
  }
}

💡 Suggested Strategy: Early Returns + Utility Functions

Effort: Low (15-30 minutes)
Impact:
   ✅ Improved readability
   ✅ Reduced cognitive load
   ✅ Easier to test
   ✅ Better error handling

Step-by-Step Plan:
1. Apply early returns for validation:
   if (!videoId) return error
   if (!transcript) return error

2. Extract Gemini response parsing:
   const summary = parseGeminiResponse(geminiResponse)
   if (!summary) return error

3. Create utility: parseGeminiResponse()
   - Handle candidates array safely
   - Return null if invalid
   - Add proper typing

4. Flatten to 2-3 levels max:
   if (!videoId) return
   if (!transcript) return
   try {
     const summary = parseGeminiResponse(response)
     if (!summary) return
     // process summary
   } catch (error) {
     // handle error
   }

5. Add tests for edge cases
```

---

## Output Format

Each refactoring opportunity includes:

1. **Description**: What can be refactored
2. **Strategy**: How to refactor (composable/utility/component)
3. **Effort**: Low/Medium/High (with time estimate)
4. **Impact**: Benefits (readability, reusability, performance)
5. **Plan**: Step-by-step refactoring instructions

---

## Expected Impact

- **Reduced Technical Debt**: Proactive code quality improvements
- **Better Organization**: Clear separation of concerns
- **Enhanced Reusability**: Shared logic in composables/utilities
- **Improved Maintainability**: Smaller, focused components
- **Developer Experience**: Easier to understand and modify code

---

## Integration with Other Skills/Agents

- **Code Reviewer**: Flags refactoring opportunities during review
- **Component Scaffolder**: Uses extracted components as templates
- **Architecture Planner**: Considers refactoring in implementation plans
- **Test Generator**: Generates tests for extracted code

---

## Verification

After implementation, test with:

```bash
# Test 1: Large component
# Create a 350-line component
# Expected: Agent suggests splitting

# Test 2: Repeated code
# Duplicate logic in 3+ files
# Expected: Agent suggests composable extraction

# Test 3: Deep nesting
# Create function with 5+ levels of nesting
# Expected: Agent suggests flattening with early returns
```

---

## Notes

- Agent focuses on **actionable** refactoring opportunities
- Estimates are based on typical developer experience
- Plans are step-by-step to minimize risk
- All suggestions preserve existing functionality
- Refactoring should be followed by thorough testing

---

**Last Updated**: 2025-12-31
**Implementation Status**: ✅ Complete

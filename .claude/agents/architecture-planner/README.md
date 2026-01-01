# Architecture Planner Agent

**Version**: 1.0.0
**Priority**: ⭐⭐⭐ Tier 1 Essential

## Purpose

Plan implementation strategy before writing code to ensure architectural consistency and maximize component reuse.

## Auto-trigger Patterns

This agent automatically activates when the user says:
- "I need to build [feature]"
- "let's implement [feature]"
- "how should I structure [feature]"

## Workflow

When triggered, this agent:

1. **Analyze Project Structure**: Read the `src/` directory tree to understand current organization
2. **Review Documentation**: Read `CLAUDE.md` and `_process/youtube-summarizer-spec.md` for context
3. **Identify Reuse Opportunities**: Find existing components/composables that can be reused
4. **Propose Architecture**: Design file structure and component breakdown
5. **Create Checklist**: Generate step-by-step implementation plan
6. **Output Plan**: Write to `_process/plans/[feature-name]-plan.md`

## Reuse Priority

The agent prioritizes reuse in this order:

1. **Existing DS Components**: Use or extend design system components
2. **Composables**: Leverage existing composition utilities
3. **Utilities**: Reuse helper functions
4. **New Components**: Create only when necessary

## Component Decision Tree

For each UI element, the agent asks:

1. ❓ **Can existing DS component be extended?**
   - If yes → Use and extend via props/slots
   - If no → Continue to next question

2. ❓ **Is this a domain-specific component (custom)?**
   - If yes → Create in `src/components/custom/`
   - If no → Continue to next question

3. ❓ **Does this need to be in the design system?**
   - If yes → Create in `src/components/ds/`
   - If no → Continue to next question

4. ❓ **Should this be a composable instead?**
   - If yes → Create in `src/composables/`
   - If no → Reconsider architecture

## File Locations

The agent uses these conventions:

- Design System Components: `src/components/ds/`
- Custom Components: `src/components/custom/`
- Composables: `src/composables/`
- Pages: `src/pages/`
- Server Routes: `src/server/`

## Plan Output Format

Plans are generated in Markdown with these sections:

### 1. Feature Overview
Brief description of what's being built and why.

### 2. Files to Create/Modify
Detailed list of files that will be created or modified:

```markdown
**Create**:
- `src/components/custom/VideoSummaryCard.vue` - Display video summary
- `src/composables/useVideoSummaries.ts` - Fetch and manage summaries
- `src/pages/summaries/index.vue` - Summary list page

**Modify**:
- `src/layouts/default.vue` - Add navigation link
```

### 3. Components to Reuse
List of existing components that will be leveraged:

```markdown
**Reusable**:
- `ccmCard` - Base card component for summary display
- `ccmButton` - Action buttons
- `ccmStack` - Layout organization
```

### 4. Implementation Steps
Step-by-step checklist:

```markdown
1. Create `useVideoSummaries` composable
   - [ ] Fetch summaries from Nuxt Content
   - [ ] Add filtering/sorting logic
   - [ ] Handle loading and error states

2. Build `VideoSummaryCard` component
   - [ ] Extend ccmCard for structure
   - [ ] Add video metadata display
   - [ ] Implement TL;DR preview
   - [ ] Add expand/collapse for full summary

3. Create summaries index page
   - [ ] Set up page layout
   - [ ] Integrate useVideoSummaries
   - [ ] Render VideoSummaryCard list
   - [ ] Add pagination/infinite scroll

4. Update navigation
   - [ ] Add "Summaries" link to default layout
```

### 5. Testing Requirements
What needs to be tested:

```markdown
**Unit Tests**:
- `useVideoSummaries.test.ts` - Composable logic
- `VideoSummaryCard.test.ts` - Component rendering

**Integration Tests**:
- Summary list page E2E flow

**Coverage Target**: 80%
```

## Example Plan

Here's an example of a complete plan:

```markdown
# Implementation Plan: Video Summary Display

## Feature Overview

Build a page to display all video summaries from the YouTube playlist. Users should be able to browse summaries, see TL;DR previews, and expand to read full summaries.

## Files to Create/Modify

**Create**:
- `src/components/custom/VideoSummaryCard.vue` - Card component for individual summary
- `src/composables/useVideoSummaries.ts` - Fetch and manage summaries
- `src/pages/summaries/index.vue` - Main summary list page
- `src/tests/components/VideoSummaryCard.test.ts` - Component tests
- `src/tests/composables/useVideoSummaries.test.ts` - Composable tests

**Modify**:
- `src/layouts/default.vue` - Add "Summaries" navigation link

## Components to Reuse

**From Design System**:
- `ccmCard` - Base card structure
- `ccmButton` - "Read More" / "Collapse" buttons
- `ccmStack` - Vertical layout for summary list
- `ccmHeading` - Summary titles

## Implementation Steps

1. **Create useVideoSummaries composable**
   - [ ] Query Nuxt Content for all summaries
   - [ ] Add sorting (newest first)
   - [ ] Implement search/filter logic
   - [ ] Handle loading states

2. **Build VideoSummaryCard component**
   - [ ] Extend ccmCard with custom styling
   - [ ] Display video metadata (title, channel, duration)
   - [ ] Show TL;DR by default
   - [ ] Implement expand/collapse for full summary
   - [ ] Add link to original YouTube video

3. **Create summaries index page**
   - [ ] Set up page layout with ccmStack
   - [ ] Use useVideoSummaries to fetch data
   - [ ] Map summaries to VideoSummaryCard components
   - [ ] Add loading skeleton
   - [ ] Add empty state

4. **Update navigation**
   - [ ] Add "Summaries" link to default layout navigation

5. **Write tests**
   - [ ] Test useVideoSummaries composable
   - [ ] Test VideoSummaryCard rendering
   - [ ] Test expand/collapse interaction
   - [ ] Verify 80% coverage

## Testing Requirements

**Unit Tests**:
- `useVideoSummaries.test.ts`
  - Fetches summaries correctly
  - Sorts by date
  - Handles empty state

- `VideoSummaryCard.test.ts`
  - Renders video metadata
  - Shows TL;DR by default
  - Expands to show full summary
  - Links to YouTube video

**Coverage Target**: 80%

## Estimated Effort

- Composable: ~30 minutes
- Component: ~1 hour
- Page: ~30 minutes
- Tests: ~1 hour
- **Total**: ~3 hours
```

## Configuration

Configuration is loaded from `.claude/config/architecture-rules.json`.

## Output Location

All plans are saved to: `_process/plans/[feature-name]-plan.md`

## Dependencies

- Configuration: `.claude/config/architecture-rules.json`
- Project docs: `CLAUDE.md`, `_process/youtube-summarizer-spec.md`
- Directory structure: `src/` tree

## Success Criteria

A good architecture plan:
- ✅ Maximizes component reuse
- ✅ Follows existing patterns
- ✅ Provides clear implementation steps
- ✅ Identifies testing requirements
- ✅ Is specific and actionable
- ✅ Estimates effort realistically

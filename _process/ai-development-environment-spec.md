# AI Development Environment Specification

**Project**: YouTube Playlist Summarizer MVP
**Date**: 2025-12-31
**Purpose**: Define tiered skills, agents, and MCP servers for efficient AI-assisted development

---

## Overview

This document outlines the AI development environment setup for building the YouTube Summarizer MVP. The system is organized into three tiers based on priority and impact, with automatic triggers to streamline the development workflow.

### Configuration Principles

1. **Auto-trigger**: Skills and agents trigger automatically without asking permission
2. **Pattern learning**: Skills analyze existing components once to generate configuration files
3. **Public MCPs**: Focus on publicly available MCP servers (Nuxt, Gemini, YouTube APIs)
4. **Coverage enforcement**: Test generator enforces minimum coverage thresholds
5. **Static configuration**: Agent memory and preferences stored in configuration files

---

## Tier 1: Essential (Highest Priority)

These are critical for day-to-day development and should be implemented first.

### Skills

#### 1.1 Component Scaffolder ⭐⭐⭐

**Purpose**: Generate new design system components following established patterns

**Auto-trigger**: When phrases detected:
- "create a new [component type] component"
- "add a ccm[ComponentName] component"
- "scaffold a [component] in the design system"

**Workflow**:
1. Check `.claude/config/component-patterns.json` for learned patterns
2. Determine component category (atom/molecule/organism) based on request
3. Scaffold component file in `src/components/ds/[category]/ccm[Name].vue`
4. Generate demo file in `src/components/docs/demos/ccm-[name]-demo.vue`
5. Create test file in `src/tests/components/ccm[Name].test.ts`
6. Run `npm run docs:generate`

**Configuration File**: `.claude/config/component-patterns.json`
```json
{
  "structure": {
    "template": {
      "required_slots": ["default"],
      "optional_slots": ["image", "action", "icon"]
    },
    "script": {
      "defineOptions": "inheritAttrs based on NODE_ENV",
      "props_categories": ["structural", "content", "visual", "accessibility", "behavior"],
      "computed_pattern": "cssVars for dynamic styling"
    },
    "style": {
      "scoped": true,
      "css_vars_pattern": "--_ccm-{component}-{property}",
      "token_preference": "semantic > primitive"
    }
  },
  "naming": {
    "component_prefix": "ccm",
    "file_case": "camelCase",
    "demo_suffix": "-demo"
  },
  "props": {
    "common": {
      "size": {
        "type": "String",
        "default": "m",
        "values": ["s", "m", "l", "xl"]
      },
      "color": {
        "type": "String",
        "default": "base",
        "values": ["primary", "secondary", "base", "accent", "white", "success", "fail", "warning", "info"]
      },
      "variant": {
        "type": "String",
        "context_dependent": true
      },
      "backgroundColor": {
        "type": "String",
        "default": "transparent"
      }
    }
  },
  "accessibility": {
    "required_attrs": ["aria-label fallback"],
    "focus_visible": "2px solid var(--color-primary), offset 2px",
    "disabled_pattern": "opacity 0.5, cursor not-allowed, pointer-events none"
  },
  "demo_structure": {
    "sections": [
      "baseline-usage",
      "variants",
      "sizes",
      "colors",
      "accessibility-check"
    ]
  }
}
```

**Generation Command**:
```bash
# One-time setup: analyze existing components to generate config
npm run analyze:components
```

**Implementation Script**: `scripts/analyze-components.ts`
- Reads all components in `src/components/ds/`
- Extracts common patterns (props, structure, naming)
- Generates `.claude/config/component-patterns.json`

---

#### 1.2 Code Reviewer ⭐⭐⭐

**Purpose**: Proactively review code changes for quality, consistency, and standards compliance

**Auto-trigger**: After any of these actions:
- Editing or creating `.vue` files in `src/components/ds/`
- Modifying files in `src/public/css/`
- Creating new composables in `src/composables/`

**Review Checklist**:
1. **CUBE CSS compliance**
   - Styles wrapped in appropriate `@layer` directive
   - Token usage follows semantic > primitive hierarchy

2. **Component standards**
   - Props organized by category (structural, content, visual, accessibility, behavior)
   - `defineOptions` follows production/dev pattern
   - `cssVars` computed property for dynamic styling
   - Component follows `--_ccm-{component}-{property}` pattern

3. **Accessibility**
   - ARIA labels present on interactive elements
   - Keyboard focus visible (`:focus-visible` styles)
   - Semantic HTML elements used
   - Disabled states use `aria-disabled`

4. **TypeScript safety**
   - Props have explicit types
   - No `any` types without justification
   - Composables have return type inference

5. **Performance**
   - No unnecessary re-renders
   - Computed properties used for derived state
   - Event handlers not recreated on each render

**Configuration File**: `.claude/config/review-rules.json`
```json
{
  "css_layers": ["reset", "defaults", "tokens", "themes", "components", "utils", "overrides"],
  "token_hierarchy": ["semantic", "primitive"],
  "required_focus_styles": true,
  "disabled_pattern": {
    "opacity": 0.5,
    "cursor": "not-allowed",
    "pointer_events": "none"
  },
  "prop_categories_required": true,
  "min_accessibility_score": 95,
  "auto_fix": {
    "token_references": true,
    "focus_styles": false,
    "aria_labels": false
  }
}
```

**Output**: Inline suggestions with severity levels (error, warning, info)

---

#### 1.3 Documentation Researcher ⭐⭐⭐

**Purpose**: Search official documentation for external APIs and libraries

**Auto-trigger**: When questions detected about:
- "how do I use [library/API]"
- "what's the syntax for [API method]"
- "does [library] support [feature]"
- Working with: YouTube Data API, Gemini API, Nuxt Content, Nuxt 4

**Workflow**:
1. Identify the library/API from context
2. Check `.claude/cache/docs-[library].json` for cached results
3. If not cached or stale (>7 days), fetch from MCP server
4. Extract relevant API methods, examples, and best practices
5. Return concise summary with code examples
6. Cache results for session

**Configuration File**: `.claude/config/doc-sources.json`
```json
{
  "sources": {
    "nuxt": {
      "mcp_server": "nuxt-docs",
      "version": "4.2.0",
      "cache_ttl_days": 7
    },
    "gemini": {
      "mcp_server": "google-ai-docs",
      "focus_areas": ["generative-ai", "multimodal"],
      "cache_ttl_days": 3
    },
    "youtube": {
      "mcp_server": "google-apis-docs",
      "version": "v3",
      "focus_areas": ["playlists", "videos", "quota"],
      "cache_ttl_days": 14
    },
    "nuxt-content": {
      "mcp_server": "nuxt-docs",
      "version": "3.7.1",
      "cache_ttl_days": 7
    }
  },
  "output_format": {
    "include_examples": true,
    "include_version_notes": true,
    "max_length_chars": 1500
  }
}
```

---

### Agents

#### 1.4 Architecture Planner ⭐⭐⭐

**Purpose**: Plan implementation strategy before writing code

**Auto-trigger**: When requests detected like:
- "I need to build [feature]"
- "let's implement [feature]"
- "how should I structure [feature]"

**Workflow**:
1. Read project structure (`src/` directory tree)
2. Review `CLAUDE.md` and `_process/youtube-summarizer-spec.md`
3. Identify existing components/composables that can be reused
4. Propose file structure and component breakdown
5. Create implementation checklist
6. Output plan to `_process/plans/[feature-name]-plan.md`

**Configuration File**: `.claude/config/architecture-rules.json`
```json
{
  "reuse_priority": ["existing_ds_components", "composables", "utilities", "new_components"],
  "file_locations": {
    "components_ds": "src/components/ds/",
    "components_custom": "src/components/custom/",
    "composables": "src/composables/",
    "pages": "src/pages/",
    "server": "src/server/"
  },
  "component_decision_tree": [
    "Can existing DS component be extended?",
    "Is this a domain-specific component (custom)?",
    "Does this need to be in the design system?",
    "Should this be a composable instead?"
  ],
  "plan_template": "feature-implementation-plan.md"
}
```

**Output Format**: Markdown plan with:
- Feature overview
- Files to create/modify
- Components to reuse
- Implementation steps
- Testing requirements

---

### MCP Servers

#### 1.5 Nuxt Documentation MCP ⭐⭐⭐

**Server**: `@nuxt/mcp-server` (public)
**Provides**: Nuxt 4.x documentation, Nuxt Content 3.x docs, Vue 3.5 patterns

**Why Essential**: Core framework documentation for SSR, routing, and content management

---

#### 1.6 Google AI (Gemini) MCP ⭐⭐⭐

**Server**: `@google/generative-ai-mcp` (public)
**Provides**: Gemini API documentation, model capabilities, pricing, multimodal features

**Why Essential**: Critical for implementing the summarization pipeline correctly

---

## Tier 2: High Value (Implement Second)

These improve quality and velocity but aren't blocking initial development.

### Skills

#### 2.1 Test Generator ⭐⭐

**Purpose**: Automatically generate Vitest specs for components and composables

**Auto-trigger**: After creating or significantly modifying:
- New component in `src/components/ds/`
- New composable in `src/composables/`
- New utility in `src/utils/`

**Workflow**:
1. Analyze the target file (props, methods, computed properties)
2. Generate test file in `src/tests/[category]/[name].test.ts`
3. Create test cases for:
   - Prop validation
   - Slot rendering
   - Event emissions
   - Edge cases
4. Run `npx vitest run [test-file]` to verify
5. Check coverage meets minimum threshold (80%)
6. If coverage < threshold, add warning and suggest additional tests

**Configuration File**: `.claude/config/test-patterns.json`
```json
{
  "framework": "vitest",
  "min_coverage_threshold": 80,
  "test_structure": {
    "describe_block": "component/composable name",
    "test_categories": [
      "renders correctly",
      "prop validation",
      "slot rendering",
      "event handling",
      "edge cases"
    ]
  },
  "imports": {
    "components": "@nuxt/test-utils",
    "composables": "vitest"
  },
  "coverage_enforcement": true,
  "auto_run_after_generation": true
}
```

**Example Test Template**:
```typescript
// Generated test structure
describe('ccmButton', () => {
  it('renders with default props', () => { /* ... */ })
  it('validates size prop', () => { /* ... */ })
  it('renders slot content', () => { /* ... */ })
  it('emits click event', () => { /* ... */ })
  it('handles disabled state', () => { /* ... */ })
})
```

---

#### 2.2 Design Token Validator ⭐⭐

**Purpose**: Validate and fix design token usage across CSS and components

**Auto-trigger**: After editing:
- Files in `src/public/css/tokens/`
- Component `<style>` blocks with CSS custom properties
- Any file referencing `var(--*)`

**Workflow**:
1. Run `npm run validate:tokens`
2. Check component CSS uses semantic tokens (not primitive)
3. Identify unused tokens
4. Detect missing token definitions
5. Auto-fix with `npm run validate:tokens:fix` (if `auto_fix: true`)
6. Report remaining issues

**Configuration File**: `.claude/config/token-rules.json`
```json
{
  "token_directories": ["src/public/css/tokens/"],
  "semantic_token_prefix": "color-",
  "primitive_token_prefix": "color-base-",
  "auto_fix": true,
  "fix_strategies": {
    "primitive_to_semantic": true,
    "unused_token_warning": true,
    "missing_token_error": true
  },
  "validation_script": "npm run validate:tokens",
  "fix_script": "npm run validate:tokens:fix"
}
```

---

#### 2.3 Quality Assurance Agent ⭐⭐

**Purpose**: Run comprehensive quality checks before commits

**Auto-trigger**: When developer says:
- "I'm done with [feature]"
- "ready to commit"
- "run QA checks"
- "validate everything"

**Workflow**:
1. Run `npm run validate:tokens`
2. Run `npm run lint:css`
3. Run `npx eslint src --ext .ts,.vue`
4. Run `npx vitest run --coverage`
5. Check TypeScript compilation (`npm run typecheck`)
6. Consolidate all errors/warnings into single report
7. Categorize by severity (blocking, warning, info)

**Configuration File**: `.claude/config/qa-checks.json`
```json
{
  "checks": [
    {
      "name": "Design Tokens",
      "command": "npm run validate:tokens",
      "blocking": false
    },
    {
      "name": "CSS Linting",
      "command": "npm run lint:css",
      "blocking": true
    },
    {
      "name": "ESLint",
      "command": "npx eslint src --ext .ts,.vue",
      "blocking": true
    },
    {
      "name": "Tests",
      "command": "npx vitest run --coverage",
      "blocking": true,
      "min_coverage": 80
    },
    {
      "name": "TypeScript",
      "command": "npm run typecheck",
      "blocking": true
    }
  ],
  "output_format": "consolidated",
  "severity_levels": ["error", "warning", "info"],
  "auto_fix_safe_issues": true
}
```

**Output Format**:
```
QA Report
=========

✅ Design Tokens: PASSED
⚠️  CSS Linting: 2 warnings
❌ ESLint: 1 error, 3 warnings
✅ Tests: PASSED (coverage: 87%)
✅ TypeScript: PASSED

Blocking Issues (1):
- src/components/ds/molecules/ccmButton.vue:42 - Unexpected console.log

Non-blocking Issues (5):
- [list warnings]
```

---

### MCP Servers

#### 2.4 YouTube Data API MCP ⭐⭐

**Server**: `@google/youtube-api-mcp` (public)
**Provides**: YouTube Data API v3 documentation, quota limits, playlist/video endpoints

**Why High Value**: Essential for playlist fetching implementation

---

## Tier 3: Nice to Have (Implement Last)

These add polish and convenience but aren't critical for MVP delivery.

### Skills

#### 3.1 Documentation Syncer ⭐

**Purpose**: Regenerate component documentation after changes

**Auto-trigger**: After modifying files in `src/components/ds/`

**Workflow**:
1. Detect which components changed
2. Run `npm run docs:generate`
3. Verify demo files still work
4. Check for broken examples in generated docs
5. Report any issues

**Configuration File**: `.claude/config/docs-sync.json`
```json
{
  "watch_directories": ["src/components/ds/"],
  "generation_command": "npm run docs:generate",
  "verify_demos": true,
  "output_directory": "src/public/component-docs/"
}
```

---

#### 3.2 Dependency Analyzer ⭐

**Purpose**: Analyze package dependencies before adding new ones

**Auto-trigger**: When developer mentions:
- "we need to install [package]"
- "should we add [library]"
- "what package can [do X]"

**Workflow**:
1. Check if existing dependencies can solve the problem
2. Search npm for alternatives
3. Compare bundle size impact
4. Verify Nuxt 4 compatibility
5. Suggest tree-shakeable import strategies
6. Report security vulnerabilities (via npm audit)

**Configuration File**: `.claude/config/dependency-rules.json`
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

---

### Agents

#### 3.3 Refactoring Assistant ⭐

**Purpose**: Suggest refactoring opportunities for code quality

**Auto-trigger**: When code exhibits:
- Repeated patterns across 3+ files
- Components exceeding 300 lines
- Deep nesting (>4 levels)
- Duplicate logic

**Workflow**:
1. Identify refactoring opportunities
2. Suggest extraction strategies (composable, utility, component)
3. Estimate effort and impact
4. Provide step-by-step refactoring plan

**Configuration File**: `.claude/config/refactoring-rules.json`
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

---

## Implementation Roadmap

### Phase 1: Essential Setup (Week 1)
1. Create configuration directory structure
2. Implement component pattern analyzer script
3. Set up Tier 1 skills: Component Scaffolder, Code Reviewer
4. Configure Tier 1 agents: Architecture Planner, Documentation Researcher
5. Connect Tier 1 MCP servers: Nuxt, Gemini

### Phase 2: Quality Tooling (Week 2)
1. Implement Tier 2 skills: Test Generator, Token Validator
2. Set up QA Agent with consolidated reporting
3. Connect YouTube API MCP server
4. Test auto-trigger workflows

### Phase 3: Polish (Week 3+)
1. Add Tier 3 skills as time permits
2. Refine auto-trigger sensitivity
3. Optimize configuration files based on usage
4. Document lessons learned

---

## Configuration File Structure

All configuration files live in `.claude/config/`:

```
.claude/
├── config/
│   ├── component-patterns.json       # Component scaffolder patterns
│   ├── review-rules.json             # Code reviewer rules
│   ├── doc-sources.json              # Documentation sources
│   ├── architecture-rules.json       # Architecture planner rules
│   ├── test-patterns.json            # Test generator templates
│   ├── token-rules.json              # Token validator rules
│   ├── qa-checks.json                # QA agent checklist
│   ├── docs-sync.json                # Docs syncer config
│   ├── dependency-rules.json         # Dependency analyzer rules
│   └── refactoring-rules.json        # Refactoring thresholds
├── cache/
│   └── docs-*.json                   # Cached documentation
└── skills/
    └── [skill-name]/
        ├── skill.json
        └── README.md
```

---

## Scripts to Create

Add these to `package.json`:

```json
{
  "scripts": {
    "analyze:components": "tsx scripts/analyze-components.ts",
    "ai:setup": "tsx scripts/setup-ai-environment.ts",
    "ai:validate": "tsx scripts/validate-ai-config.ts"
  }
}
```

**`scripts/analyze-components.ts`**: Analyzes existing components to generate `component-patterns.json`

**`scripts/setup-ai-environment.ts`**: One-time setup for all configuration files

**`scripts/validate-ai-config.ts`**: Validates all config files are properly structured

---

## Success Metrics

**Tier 1 (Essential)**:
- Component scaffolding time reduced by 80% (from 30min to 6min)
- Code review catches 95%+ of style/accessibility issues
- Documentation lookup time reduced by 70%
- Architecture plans generated in <5min

**Tier 2 (High Value)**:
- Test coverage maintained above 80% automatically
- Token validation issues caught before commit
- Pre-commit QA checks run in <2min

**Tier 3 (Nice to Have)**:
- Documentation always in sync with code
- Zero unnecessary dependencies added
- Refactoring suggestions reduce technical debt

---

## Answers to Implementation Questions

1. ✅ **Auto-trigger aggressiveness**: Auto-trigger without asking permission
2. ✅ **MCP server preference**: Focus on public MCP servers (Nuxt, Google APIs)
3. ✅ **Test coverage threshold**: Yes, enforce minimum 80% coverage
4. ✅ **Component scaffolding**: Analyze components once, generate static config file
5. ✅ **Agent memory**: No session memory; use static configuration files

---

**Last Updated**: 2025-12-31
**Status**: Ready for implementation
**Next Steps**: Begin Phase 1 - Essential Setup

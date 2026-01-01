# Design Token Validator Skill

**Tier**: 2 (High Value)
**Priority**: ⭐⭐
**Auto-trigger**: Yes

## Purpose

Validate and automatically fix design token usage across CSS files and Vue components. Ensures consistency, maintainability, and adherence to the CUBE CSS methodology by enforcing semantic token usage over primitive tokens.

## Auto-Trigger Conditions

This skill activates automatically when:

1. **Token files edited** in `src/public/css/tokens/`
2. **Component styles modified** with CSS custom properties (`var(--*)`)
3. **New tokens referenced** in component `<style>` blocks

## Workflow

1. **Initial Validation**
   - Run `npm run validate:tokens` to check token consistency
   - Load validation rules from `.claude/config/token-rules.json`

2. **Scan Components**
   - Analyze all Vue components for CSS custom property usage
   - Check for hardcoded values (colors, spacing) that should be tokens
   - Verify semantic token usage (prefer `--color-primary` over `--color-base-blue-500`)

3. **Identify Issues**
   - **Missing tokens**: Referenced but not defined
   - **Unused tokens**: Defined but never referenced
   - **Primitive usage**: Components using primitive instead of semantic tokens
   - **Hardcoded values**: Direct CSS values instead of tokens

4. **Auto-Fix (if enabled)**
   - Run `npm run validate:tokens:fix` for safe corrections
   - Map primitive tokens to semantic equivalents
   - Only apply fixes that don't change visual appearance

5. **Report Results**
   - Categorize issues by severity (error/warning)
   - Show auto-fixed items
   - Suggest manual fixes for complex cases

## Configuration

**File**: `.claude/config/token-rules.json`

Key settings:
- `auto_fix`: true
- `prefer_semantic`: true
- Token type patterns (color, spacing, typography)
- Validation rules and severity levels
- Auto-fix mapping (primitive → semantic)

## Validation Rules

### 1. No Hardcoded Values ❌

**Rule**: Use design tokens instead of hardcoded CSS values

**Examples**:

```css
/* ❌ Bad - Hardcoded value */
.button {
  background: #3b82f6;
  padding: 16px;
}

/* ✅ Good - Using tokens */
.button {
  background: var(--color-primary);
  padding: var(--spacing-default);
}
```

**Exceptions**: `transparent`, `inherit`, `currentColor`

### 2. Prefer Semantic Tokens ⚠️

**Rule**: Use semantic tokens in components, not primitive tokens

**Examples**:

```css
/* ⚠️ Warning - Using primitive token */
.button {
  background: var(--color-base-blue-500);
  color: var(--color-base-gray-50);
}

/* ✅ Good - Using semantic tokens */
.button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
```

**Auto-fixable**: Yes (if mapping exists in config)

### 3. Token Must Exist ❌

**Rule**: All referenced tokens must be defined in token files

**Example**:

```css
/* ❌ Error - Token not defined */
.card {
  border-color: var(--color-accent-purple); /* undefined */
}
```

**Auto-fixable**: No (requires manual token definition)

### 4. Unused Tokens ⚠️

**Rule**: Warn about tokens that are defined but never used

**Purpose**: Helps identify token bloat and cleanup opportunities

**Auto-fixable**: No (requires human decision)

## Example Usage

### Scenario 1: Auto-Fix Primitive to Semantic

**Input** - Component using primitive token:

```vue
<style scoped>
.ccm-button {
  background: var(--color-base-blue-500);
  color: var(--color-base-white);
}
</style>
```

**Validation Output**:

```
⚠️  Primitive token usage detected in ccmButton.vue:42
   Found: var(--color-base-blue-500)
   Suggestion: Use var(--color-primary)

⚠️  Primitive token usage detected in ccmButton.vue:43
   Found: var(--color-base-white)
   Suggestion: Use var(--color-text-inverse)

Auto-fixing enabled...
```

**Auto-Fixed Result**:

```vue
<style scoped>
.ccm-button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}
</style>
```

```
✅ Auto-fixed 2 token references in ccmButton.vue
```

### Scenario 2: Hardcoded Value Detection

**Input** - Component with hardcoded color:

```vue
<style scoped>
.ccm-card {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
```

**Validation Output**:

```
❌ Hardcoded color detected in ccmCard.vue:42
   Found: background: #ffffff
   Suggestion: Consider using var(--color-background) or define semantic token

❌ Hardcoded shadow detected in ccmCard.vue:43
   Found: box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
   Suggestion: Define --shadow-card token in tokens/shadows.css

⚠️  Hardcoded radius detected in ccmCard.vue:44
   Found: border-radius: 8px
   Suggestion: Use var(--radius-default) or define semantic token
```

**Cannot auto-fix**: Requires human decision on which semantic token to use

### Scenario 3: Missing Token Definition

**Input** - Component referencing undefined token:

```vue
<style scoped>
.ccm-tooltip {
  background: var(--color-tooltip-bg);
  color: var(--color-tooltip-text);
}
</style>
```

**Validation Output**:

```
❌ Token not defined: --color-tooltip-bg
   Referenced in: ccmTooltip.vue:56
   Action: Add token definition to src/public/css/tokens/semantic-colors.css

❌ Token not defined: --color-tooltip-text
   Referenced in: ccmTooltip.vue:57
   Action: Add token definition to src/public/css/tokens/semantic-colors.css

Suggested additions to semantic-colors.css:
--color-tooltip-bg: var(--color-base-gray-900);
--color-tooltip-text: var(--color-base-white);
```

### Scenario 4: Unused Token Detection

**Validation Output**:

```
⚠️  Unused tokens detected:

Tokens defined but never used (5):
- --color-accent-purple (defined in tokens/semantic-colors.css:34)
- --spacing-card-large (defined in tokens/spacing.css:28)
- --font-display (defined in tokens/typography.css:12)

Consider:
1. Remove if truly unused
2. Document if reserved for future use
3. Check if token should be used somewhere
```

## Token Types and Patterns

### Color Tokens

**Semantic**: `--color-{semantic-name}`
- `--color-primary`, `--color-secondary`, `--color-text`, `--color-background`

**Primitive**: `--color-base-{color}-{shade}`
- `--color-base-blue-500`, `--color-base-gray-100`

### Spacing Tokens

**Semantic**: `--spacing-{semantic-name}`
- `--spacing-section`, `--spacing-card`, `--spacing-default`

**Primitive**: `--spacing-base-{size}`
- `--spacing-base-xs`, `--spacing-base-m`, `--spacing-base-xl`

### Typography Tokens

**Semantic**: `--font-{semantic-name}`
- `--font-heading`, `--font-body`, `--font-code`

**Primitive**: `--font-base-{property}`
- `--font-base-family-sans`, `--font-base-size-16`

## Auto-Fix Mapping

Common primitive-to-semantic mappings (configurable in `token-rules.json`):

```json
{
  "auto_fix_rules": {
    "primitive_to_semantic_mapping": {
      "--color-base-blue-500": "--color-primary",
      "--color-base-gray-900": "--color-text",
      "--color-base-gray-100": "--color-background-light",
      "--color-base-white": "--color-text-inverse",
      "--spacing-base-m": "--spacing-default"
    }
  }
}
```

## Integration with Code Reviewer

The Design Token Validator works with the Code Reviewer skill (1.2):
- Code Reviewer flags token issues during code review
- Token Validator provides automated fixes
- Both enforce the same token hierarchy (semantic > primitive)

## Best Practices

1. **Define semantic tokens first** - Create meaningful semantic tokens before using primitives
2. **Run before commits** - Integrate with QA Agent to catch issues early
3. **Review auto-fixes** - Verify automated changes maintain intended design
4. **Document token usage** - Add comments explaining semantic token purposes

## NPM Scripts Required

Ensure these scripts exist in `package.json`:

```json
{
  "scripts": {
    "validate:tokens": "tsx scripts/validate-tokens.ts",
    "validate:tokens:fix": "tsx scripts/validate-tokens.ts --fix"
  }
}
```

## Success Metrics

- **Auto-fix rate**: 70%+ of token issues auto-fixed
- **Validation time**: <5 seconds for full codebase scan
- **Token consistency**: 95%+ components using semantic tokens
- **Zero hardcoded values** in production components

## Dependencies

- `npm run validate:tokens` - Token validation script
- `npm run validate:tokens:fix` - Auto-fix script
- `.claude/config/token-rules.json` - Validation rules and mappings

## Version History

- **1.0.0** (2025-12-31): Initial implementation with auto-fix capabilities

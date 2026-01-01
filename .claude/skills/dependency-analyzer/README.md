# Dependency Analyzer Skill

**Tier**: 3 (Nice to Have)
**Priority**: ⭐
**Status**: Implemented

---

## Purpose

Analyze package dependencies before adding new ones to prevent bloat, ensure compatibility, and maintain security.

## Auto-Trigger Conditions

This skill activates when developer mentions:

- "we need to install [package]"
- "should we add [library]"
- "what package can [do X]"
- "npm install [package]"
- "add dependency for [feature]"
- "install package to [solve problem]"

---

## Workflow

1. **Check Existing Dependencies**: Can current packages solve this?
2. **Search Alternatives**: Find npm packages that match requirements
3. **Compare Bundle Size**: Analyze impact on final bundle
4. **Verify Compatibility**: Check Nuxt 4, Vue 3, Node 18+ compatibility
5. **Import Strategy**: Suggest tree-shakeable import patterns
6. **Security Scan**: Run `npm audit` to check vulnerabilities

---

## Configuration

**Config File**: `.claude/config/dependency-rules.json`

### Required Settings

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

### Configuration Properties

- **existing_dependencies_first**: Always check if current deps can solve the problem
- **bundle_size_threshold_kb**: Warn if package exceeds this size
- **compatibility_check**: Required framework/runtime versions
- **prefer_esm**: Prefer ESM packages over CommonJS
- **security_check**: Run security vulnerability scan

---

## Analysis Criteria

When evaluating a package, the skill checks:

1. ✅ **Existing Coverage**: Can current dependencies solve this?
2. 📦 **Bundle Size**: Impact on production bundle
3. 🔧 **Compatibility**: Nuxt 4, Vue 3, Node 18+ support
4. 🌳 **ESM Support**: Tree-shakeable imports available?
5. 🔒 **Security**: Known vulnerabilities?
6. 🔄 **Maintenance**: Last update, issue activity
7. 👥 **Community**: Weekly downloads, GitHub stars

---

## Example Usage

### Scenario 1: Proposing New Dependency

**Developer**: "We need to install lodash for utility functions"

**Skill Response**:
```
📦 Dependency Analyzer activated

Analyzing: lodash

✅ Existing Alternatives Found:
   - Nuxt/Kit utilities cover 60% of use cases
   - Native JavaScript (ES2024) can replace most lodash functions

📊 Bundle Size Impact:
   - lodash: 72.5 KB (minified)
   - lodash-es: 24.3 KB (with tree-shaking)
   - Recommendation: Use lodash-es with named imports

🔧 Compatibility:
   ✅ Nuxt 4: Compatible
   ✅ Vue 3: Compatible
   ✅ Node 18+: Compatible
   ✅ ESM Support: Yes (lodash-es)

🔒 Security:
   ✅ No known vulnerabilities

💡 Recommendation:
   Before installing, try:
   1. Native Array methods: map, filter, reduce
   2. Nuxt Kit utilities: $fetch, useAsyncData
   3. If still needed: npm install lodash-es
      Import pattern: import { debounce } from 'lodash-es'

Bundle Size Saved: ~48 KB by using native/existing alternatives
```

### Scenario 2: Unnecessary Dependency

**Developer**: "Should we add moment.js for date formatting?"

**Skill Response**:
```
📦 Dependency Analyzer activated

Analyzing: moment.js

⚠️  WARNING: Not Recommended

❌ Bundle Size: 67.8 KB (exceeds 50 KB threshold)
❌ Maintenance: In maintenance mode (legacy project)

✅ Better Alternatives:
   1. Native Intl.DateTimeFormat (built-in, 0 KB)
   2. date-fns (modern, tree-shakeable, 2-10 KB)
   3. dayjs (moment.js-compatible API, 6.5 KB)

💡 Recommendation:
   Use native Intl.DateTimeFormat for this project:

   // Format date
   new Intl.DateTimeFormat('en-US', {
     dateStyle: 'medium',
     timeStyle: 'short'
   }).format(new Date())

   If you need more features: npm install dayjs
   (96% smaller than moment.js)

Avoided Bloat: 67.8 KB
```

### Scenario 3: Existing Dependency Coverage

**Developer**: "What package can make HTTP requests?"

**Skill Response**:
```
📦 Dependency Analyzer activated

Checking existing dependencies...

✅ Already Available:
   - $fetch (from Nuxt) - Recommended for this project
   - useAsyncData (server-side data fetching)
   - useFetch (client + server data fetching)

Examples:

// Client-side fetch
const { data } = await useFetch('/api/videos')

// Server route fetch
const videos = await $fetch('https://api.example.com/videos')

💡 Recommendation:
   No new dependency needed. Use built-in Nuxt utilities.

Additional Dependencies Avoided: 1
Bundle Size Saved: ~15 KB
```

---

## Expected Impact

- **Zero unnecessary dependencies**: Prevent bloat
- **Smaller bundle size**: Faster load times
- **Better security**: Proactive vulnerability prevention
- **Lower maintenance**: Fewer packages to update
- **Framework alignment**: Use Nuxt/Vue built-ins

---

## Integration with Other Skills

- **Architecture Planner**: Considers dependency strategy in plans
- **Code Reviewer**: Flags direct imports instead of tree-shakeable ones
- **Test Generator**: Tests work with chosen dependencies

---

## Verification

After implementation, test with:

```bash
# Test 1: Suggest unnecessary dependency
# Say: "Should we install lodash?"
# Expected: Skill suggests native alternatives

# Test 2: Propose large package
# Say: "We need to install axios"
# Expected: Skill suggests $fetch (built-in)

# Test 3: Security check
# Say: "Install <old-package-with-vulnerabilities>"
# Expected: Skill warns about vulnerabilities
```

---

## Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Bundle size | > 50 KB | Warn, suggest alternatives |
| Security vulnerabilities | > 0 | Block, require user override |
| Last update | > 2 years | Warn about maintenance status |
| ESM support | No | Suggest ESM alternative |

---

## Notes

- Skill prioritizes existing project dependencies first
- Security checks run via `npm audit` when available
- Bundle size estimates use minified (not gzipped) sizes
- Compatibility checks against Nuxt 4, Vue 3, Node 18+
- ESM packages preferred for optimal tree-shaking

---

**Last Updated**: 2025-12-31
**Implementation Status**: ✅ Complete

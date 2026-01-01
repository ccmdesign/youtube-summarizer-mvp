# Documentation Syncer Skill

**Tier**: 3 (Nice to Have)
**Priority**: ⭐
**Status**: Implemented

---

## Purpose

Automatically regenerate component documentation after changes to ensure docs stay in sync with code.

## Auto-Trigger Conditions

This skill activates when:

- Files modified in `src/components/ds/`
- Component props are added/changed/removed
- Component structure is updated
- Component slots are modified

### File Pattern Triggers

```
src/components/ds/**/*.vue
```

---

## Workflow

1. **Detect Changes**: Identify which components were modified
2. **Generate Docs**: Run `npm run docs:generate`
3. **Verify Demos**: Check that demo files still work correctly
4. **Check Examples**: Scan generated docs for broken examples
5. **Report Issues**: Highlight any documentation generation errors

---

## Configuration

**Config File**: `.claude/config/docs-sync.json`

### Required Settings

```json
{
  "watch_directories": ["src/components/ds/"],
  "generation_command": "npm run docs:generate",
  "verify_demos": true,
  "output_directory": "src/public/component-docs/"
}
```

### Configuration Properties

- **watch_directories**: Directories to monitor for component changes
- **generation_command**: Script to run for doc generation
- **verify_demos**: Whether to verify demo files still work
- **output_directory**: Where generated docs are saved

---

## Example Usage

### Scenario 1: Component Props Updated

**Action**: Developer adds new `variant` prop to `ccmButton.vue`

**Skill Response**:
```
🔄 Documentation Syncer activated
📝 Detected changes in: src/components/ds/atoms/ccmButton.vue
🔨 Running: npm run docs:generate
✅ Documentation regenerated successfully
✅ Demo file verified: ccm-button-demo.vue
📄 Updated: src/public/component-docs/ccmButton.md
```

### Scenario 2: Broken Demo Detected

**Action**: Developer changes component API, breaking demo

**Skill Response**:
```
🔄 Documentation Syncer activated
📝 Detected changes in: src/components/ds/molecules/ccmCard.vue
🔨 Running: npm run docs:generate
⚠️  WARNING: Demo file may be broken
   File: src/components/docs/demos/ccm-card-demo.vue
   Issue: Props no longer match component definition

Suggested fix: Update demo to use new API
```

---

## Expected Impact

- **Documentation always in sync**: Never outdated docs
- **Time saved**: Eliminates manual regeneration
- **Quality improvement**: Catches breaking changes in demos
- **Developer experience**: Seamless doc updates

---

## Integration with Other Skills

- **Component Scaffolder**: Auto-generates docs for new components
- **Code Reviewer**: Ensures doc comments are accurate
- **Test Generator**: Verifies examples in docs work correctly

---

## Verification

After implementation, verify with:

```bash
# 1. Make a change to a component
# Edit src/components/ds/atoms/ccmButton.vue

# 2. Documentation Syncer should auto-trigger
# Expected output:
# - Doc generation command runs
# - Docs are updated
# - Demo verification completes

# 3. Check generated documentation
cat src/public/component-docs/ccmButton.md
```

---

## Notes

- Skill only triggers for design system components (`src/components/ds/`)
- Custom components (`src/components/custom/`) are not monitored by default
- Demo verification can be disabled via `verify_demos: false`
- Documentation generation requires `npm run docs:generate` to be configured

---

**Last Updated**: 2025-12-31
**Implementation Status**: ✅ Complete

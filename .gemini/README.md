# Gemini Agent System

**Purpose**: Gemini configurations and commands for this Nuxt 3 project repository.

**Status**: Limited Usage - Primary instructions in GEMINI.md at repository root.

**Last Updated**: 2025-10-28

---

## Overview

This directory contains Gemini-specific agent configurations in TOML format. However, the primary Gemini instructions are located in the repository root at [GEMINI.md](../GEMINI.md).

### System Architecture

```
.gemini/
└── commands/         # Gemini commands in TOML format
```

---

## Commands (`commands/`)

Gemini commands are stored in TOML format rather than Markdown. These primarily contain Speckit framework commands for spec-driven development.

### Speckit Framework Commands

| Command | Format | Purpose |
|---------|--------|---------|
| `speckit.analyze.toml` | TOML | Analyze spec consistency |
| `speckit.checklist.toml` | TOML | Generate implementation checklist |
| `speckit.clarify.toml` | TOML | Clarify requirements ambiguities |
| `speckit.constitution.toml` | TOML | Update project constitution |
| `speckit.implement.toml` | TOML | Implement features from plan |
| `speckit.plan.toml` | TOML | Create implementation plan |
| `speckit.specify.toml` | TOML | Create feature specifications |
| `speckit.tasks.toml` | TOML | Generate task list from plan |

**Note**: These commands are part of the Speckit framework and are distributed across all agent systems. The TOML format is specific to Gemini's configuration requirements.

---

## Current Usage Status

### Primary Instructions
- **Main File**: [GEMINI.md](../GEMINI.md) at repository root
- **Format**: Markdown with comprehensive project guidance
- **Usage**: Active - contains detailed project instructions

### Directory Commands
- **Location**: `.gemini/commands/`
- **Format**: TOML files
- **Usage**: Limited - primarily for Speckit framework integration
- **Status**: Available but not actively used in current workflow

---

## Recommendations

### For Current Project
1. **Use GEMINI.md** as primary instruction source
2. **Maintain TOML commands** for Speckit framework compatibility
3. **Consider consolidating** if Gemini usage increases

### Future Considerations
- **Evaluate Usage**: Determine if TOML commands should be actively used
- **Format Consistency**: Consider standardizing to Markdown if needed
- **Documentation**: Update this README if usage patterns change
- **Integration**: Enhance integration with shared knowledge base

---

## Configuration

### Agent Instructions
- **Primary**: [GEMINI.md](../GEMINI.md) - Detailed project guidance
- **General**: [AGENTS.md](../AGENTS.md) - Cross-agent guidelines

### TOML Structure
Gemini commands follow this TOML structure:
```toml
description = "Command description"
prompt = """
Detailed prompt content with execution steps
"""
```

---

## Maintenance

### Current State
- **Documentation**: Minimal - this README serves as basic documentation
- **Commands**: Present but not actively used
- **Integration**: Limited - primary instructions in root GEMINI.md

### Updates
- **Monitor Usage**: Track if Gemini agent usage increases
- **Evaluate Format**: Assess if TOML format should be maintained
- **Enhance Documentation**: Expand this README if usage grows
- **Maintain Compatibility**: Keep Speckit commands updated with other agents

---

## Related Files

- **Primary Instructions**: [GEMINI.md](../GEMINI.md)
- **Project Guidelines**: [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md)

---

## Speckit Framework Version

**Current Version**: Compatible with Speckit v0.0.79 (latest as of 2025-10-28)

**Status**: Commands present but format differs from other agent systems.

---

**Last Updated**: 2025-10-28  
**Maintainer**: AI Instructions Implementation Phase 4.1  
**Status**: Limited usage - primary instructions in GEMINI.md

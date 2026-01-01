# Claude Code Agent System

**Purpose**: Claude Code commands and skills for this Nuxt 3 project repository.

**Last Updated**: 2025-10-28

---

## Overview

This directory contains the Claude Code-specific agent configuration, including slash commands and skills for efficient development workflows.

### System Architecture

```
.claude/
├── commands/           # Slash commands for quick actions
├── skills/             # Advanced multi-step workflows
├── agents/            # Agent-specific configurations
└── settings.local.json # Local Claude Code settings
```

---

## Commands (`commands/`)

Slash commands provide quick access to common development tasks. Use them in the Claude Code CLI with the `/` prefix.

### Component Development Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `/component-draft` | Create initial component structure | `/component-draft` |
| `/create-component` | Create complete component with demo page | `/create-component` |

### Speckit Framework Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `/speckit.analyze` | Analyze spec consistency | `/speckit.analyze` |
| `/speckit.checklist` | Generate implementation checklist | `/speckit.checklist` |
| `/speckit.clarify` | Clarify requirements ambiguities | `/speckit.clarify` |
| `/speckit.constitution` | Update project constitution | `/speckit.constitution` |
| `/speckit.implement` | Implement features from plan | `/speckit.implement` |
| `/speckit.plan` | Create implementation plan | `/speckit.plan` |
| `/speckit.specify` | Create feature specifications | `/speckit.specify` |
| `/speckit.tasks` | Generate task list from plan | `/speckit.tasks` |

**Note**: Speckit is a third-party spec-driven development framework. These commands are distributed across all agent systems (`.claude/`, `.codex/`, `.factory/`) as required by each system.

---

## Skills (`skills/`)

Skills provide advanced multi-step workflows for complex development tasks. They are automatically available in Claude Code conversations.

### Available Skills

| Skill | Purpose | Directory |
|-------|---------|-----------|
| **Component Builder** | Complete workflow for creating new components | `skill-builder/` |
| **Component Validator** | Audit components against all standards | `validating-components/` |
| **Demo Page Builder** | Generate comprehensive demo pages | `documenting-components/` |
| **Building Components** | Component construction workflows | `building-components/` |

### Skill Usage

Skills are invoked automatically by Claude Code based on context. You can also explicitly request them:

- "Use the component builder skill to create a new button"
- "Run the component validator on ccmCard"
- "Generate a demo page with the demo page builder skill"

**See**: [`skills/README.md`](skills/README.md) for detailed skill documentation.

---

## Commands vs Skills

### When to Use Commands
- **Quick, single actions**: Create component draft, run analysis
- **Immediate results**: Generate checklist, clarify requirements
- **User-initiated**: You explicitly trigger the command

### When to Use Skills
- **Complex workflows**: Complete component creation with validation
- **Multi-step processes**: Build → validate → document
- **Context-aware**: Claude determines when to use them
- **Comprehensive tasks**: End-to-end development workflows

### Example Workflow
```bash
# 1. Use command for quick draft
/component-draft

# 2. Use skill for complete implementation
"Use component builder skill to finish this component"

# 3. Use command for validation
/speckit.checklist
```

---

## Integration with Project Documentation

This agent system references project documentation for consistency:

**Essential References**:
- [CLAUDE.md](../../CLAUDE.md) - Complete project guidance for Claude Code
- [AGENTS.md](../../AGENTS.md) - Cross-agent guidelines and conventions
- [Component Standards](../../src/content/docs/guidelines/component-standards.md) - Component development standards
- [Implementation Guidelines](../../src/content/docs/guidelines/general-implementation-guidelines.md) - Development workflows

**Always reference project documentation first** for project-wide knowledge and consistency.

---

## Project-Specific Guidelines

For this Nuxt 3 project, Claude Code follows these specific patterns:

### Component Development
- Use design system components (`ccm` prefix) when possible
- Follow the 8 component standards without exception
- Reference semantic tokens over primitive tokens
- Create demo pages for all DS components

### Workflow Integration
- Use composition-first approach
- Follow the decision tree: DS components → utilities → tokens → custom CSS
- Validate work with `npm run validate:ai-instructions`
- Run quality checks before committing

### File Organization
- Application code in `src/`
- Components in `src/components/ds/` (design system) or `src/components/content/`
- Tests mirror source structure in `src/tests/`
- Documentation in `src/content/docs/`

---

## Configuration

### Local Settings
`settings.local.json` contains Claude Code-specific configuration for this repository.

### Agent Instructions
- **Primary**: [CLAUDE.md](../../CLAUDE.md) - Detailed project guidance
- **General**: [AGENTS.md](../../AGENTS.md) - Cross-agent guidelines
- **Documentation**: [src/content/docs/guidelines/](../../src/content/docs/guidelines/) - Development guidelines

---

## Troubleshooting

### Common Issues

**Command not found**: Ensure command file exists in `commands/` directory
**Skill not responding**: Check skill directory structure and README
**Context issues**: Reference project documentation in `CLAUDE.md` and `src/content/docs/guidelines/`

### Validation

Run the AI instruction validation to check system health:
```bash
npm run validate:ai-instructions
```

### Getting Help

1. Reference project-specific guidelines in `CLAUDE.md` and `AGENTS.md`
2. Check component standards in `src/content/docs/guidelines/`
3. Run validation to identify issues
4. Consult implementation guidelines for development guidance

---

## Maintenance

### Adding New Commands
1. Create `.md` file in `commands/` directory
2. Follow existing command structure
3. Update this README with command details
4. Test command functionality
5. Run validation to ensure consistency

### Adding New Skills
1. Create directory in `skills/`
2. Follow skill template structure
3. Update `skills/README.md`
4. Test skill workflow
5. Update this README if needed

### Updates
- Review and update commands when project structure changes
- Maintain consistency with project documentation
- Update documentation when adding new features
- Run validation after changes

---

## Related Files

- **Project Instructions**: [CLAUDE.md](../../CLAUDE.md), [AGENTS.md](../../AGENTS.md)
- **Documentation**: [src/content/docs/guidelines/](../../src/content/docs/guidelines/) directory
- **Validation**: [`npm run validate:ai-instructions`](../../package.json)
- **Component Standards**: [component-standards.md](../../src/content/docs/guidelines/component-standards.md)

---

**Last Updated**: 2025-10-28  
**Maintainer**: AI Instructions Implementation Phase 4.1

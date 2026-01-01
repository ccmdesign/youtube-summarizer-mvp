# Codex Agent System

**Purpose**: Codex prompts and configurations for this Nuxt 3 project repository.

**Last Updated**: 2025-10-28

---

## Overview

This directory contains Codex-specific agent configurations, including prompts for development workflows and spec-driven development.

### System Architecture

```
.codex/
└── prompts/           # Development prompts and workflows
```

---

## Prompts (`prompts/`)

Prompts provide structured workflows for development tasks using the Codex agent system. These are primarily focused on spec-driven development using the Speckit framework.

### Speckit Framework Prompts

| Prompt | Purpose | Usage |
|--------|---------|-------|
| `speckit.analyze.md` | Analyze spec consistency across artifacts | Analyze phase |
| `speckit.checklist.md` | Generate implementation checklist from plan | Task generation |
| `speckit.clarify.md` | Clarify requirements and ambiguities | Requirements phase |
| `speckit.constitution.md` | Update project constitution and principles | Governance |
| `speckit.implement.md` | Implement features from technical plan | Implementation phase |
| `speckit.plan.md` | Create technical implementation plan | Planning phase |
| `speckit.specify.md` | Create feature specifications from ideas | Specification phase |
| `speckit.tasks.md` | Generate detailed task list from plan | Task breakdown |

### Speckit Workflow

The Speckit framework follows this structured workflow:

1. **Specify** → Define feature requirements and user stories
2. **Clarify** → Resolve ambiguities and gaps in requirements
3. **Plan** → Create technical implementation plan
4. **Tasks** → Generate detailed task breakdown
5. **Analyze** → Validate consistency across artifacts
6. **Implement** → Execute development tasks

**Note**: Speckit is a third-party spec-driven development framework. These prompts are distributed across all agent systems (`.claude/`, `.codex/`, `.factory/`) as required by each system, with agent-specific customizations where needed.

---


## Project-Specific Guidelines

For this Nuxt 3 project, Codex follows these specific patterns:

### Spec-Driven Development
- Use Speckit framework for feature development
- Follow structured workflow from specification to implementation
- Maintain consistency across all artifacts
- Validate cross-artifact consistency before implementation

### Component Development
- Reference component standards in shared knowledge base
- Use design system components (`ccm` prefix) when appropriate
- Follow composition-first approach
- Validate components against all 8 standards

### Quality Assurance
- Run validation checks: `npm run validate:ai-instructions`
- Ensure all paths and references are current
- Maintain consistency with other agent systems
- Document architectural decisions

---

## Usage Patterns

### Starting New Features
1. Use `speckit.specify` to define requirements
2. Use `speckit.clarify` to resolve ambiguities
3. Use `speckit.plan` to create technical plan
4. Use `speckit.tasks` to generate task list
5. Use `speckit.analyze` to validate consistency
6. Use `speckit.implement` to execute development

### Maintenance and Updates
1. Use `speckit.constitution` to update project principles
2. Use `speckit.checklist` to track implementation progress
3. Run validation to ensure system health
4. Update documentation as needed

---

## Configuration

### Agent Instructions
- **Primary**: [CLAUDE.md](../../CLAUDE.md) - Detailed project guidance
- **General**: [AGENTS.md](../../AGENTS.md) - Cross-agent guidelines

### Prompt Structure
Each Speckit prompt follows this structure:
- **Description**: Clear purpose and context
- **User Input**: Handling of command arguments
- **Execution Steps**: Detailed workflow instructions
- **Output Requirements**: Expected deliverables

---

## Agent-Specific Customizations

### Codex vs Other Agents
- **Format**: Uses Markdown prompts (vs commands in Claude)
- **Context**: Optimized for Codex agent capabilities
- **Integration**: References shared knowledge base
- **Workflow**: Follows spec-driven development methodology

### Content Differences
- Most Speckit prompts are identical across agent systems
- `speckit.plan.md` has Codex-specific agent context configuration
- All other prompts maintain consistency with framework standards

---

## Troubleshooting

### Common Issues

**Prompt not found**: Ensure prompt file exists in `prompts/` directory
**Workflow gaps**: Check Speckit framework documentation

### Validation

Run the AI instruction validation to check system health:
```bash
npm run validate:ai-instructions
```

### Getting Help

1. Reference project-specific guidelines in `CLAUDE.md`
2. Consult Speckit framework documentation
3. Run validation to identify issues

---

## Maintenance

### Adding New Prompts
1. Create `.md` file in `prompts/` directory
2. Follow existing prompt structure and format
3. Include proper description and execution steps
4. Test prompt workflow and functionality
5. Update this README with prompt details

### Updates
- Review and update prompts when project requirements change
- Maintain consistency with Speckit framework standards
- Update documentation when adding new workflows
- Run validation after changes

### Framework Updates
- Monitor Speckit framework for new versions
- Update prompts when framework changes
- Maintain compatibility with other agent systems
- Document version changes in shared knowledge base

---

## Related Files

- **Project Instructions**: [CLAUDE.md](../../CLAUDE.md), [AGENTS.md](../../AGENTS.md)
- **Validation**: [`npm run validate:ai-instructions`](../../package.json)

---

## Speckit Framework Version

**Current Version**: Compatible with Speckit v0.0.79 (latest as of 2025-10-28)

**Status**: Up-to-date and functioning correctly. No immediate upgrade required.

---

**Last Updated**: 2025-10-28  
**Maintainer**: AI Instructions Implementation Phase 4.1

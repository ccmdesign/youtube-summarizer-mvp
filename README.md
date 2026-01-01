# Nuxt + Content Boilerplate

A modern Nuxt boilerplate configured with `@nuxt/content`, CUBE CSS methodology, and comprehensive design system support.

## Overview

This boilerplate provides a production-ready Nuxt setup with:
- **Source organization**: All application code under `src/`
- **Content management**: `@nuxt/content` for Markdown/JSON collections
- **Design system**: CUBE CSS with design tokens and reusable components
- **Testing**: Vitest with coverage support
- **Quality tooling**: ESLint, Stylelint, TypeScript
- **AI-friendly**: Documentation for Claude, Gemini, Cursor, and other AI assistants

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── pages/          # File-based routing
├── layouts/        # Layout templates
├── components/
│   ├── ds/         # Design system components (ccm-prefixed)
│   ├── content/    # Content-specific components
│   └── docs/       # Documentation components
├── composables/    # Vue composition utilities
├── content/        # Markdown collections (optional, adapt to your needs)
├── public/         # Static assets and CSS
├── server/         # API routes
├── tests/          # Vitest test suites
└── utils/          # TypeScript utilities

Root:
├── _archive/       # Archived files (gitignored)
├── _process/       # Project-specific planning/specs
├── .claude/        # Claude Code commands and skills
├── .codex/         # Codex workflows
├── .cursor/        # Cursor IDE config
├── .gemini/        # Gemini instructions
├── CLAUDE.md       # Claude Code guidance
├── AGENTS.md       # General AI agent guidelines
├── GEMINI.md       # Gemini-specific instructions
└── .cursorrules    # Cursor IDE rules
```

## Available Scripts

### Development
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run postinstall` - Regenerate Nuxt types

### Quality Assurance
- `npx vitest run` - Run test suite
- `npx vitest run --coverage` - Run tests with coverage
- `npx eslint src --ext .ts,.vue` - Lint TypeScript/Vue files
- `npm run lint:css` - Lint CSS/Vue styles
- `npm run lint:css:fix` - Auto-fix CSS issues
- `npm run validate:tokens` - Validate design token consistency
- `npm run validate:tokens:fix` - Auto-fix token issues
- `npm run typecheck` - TypeScript type checking

### Documentation
- `npm run docs:generate` - Generate component documentation
- `npm run docs:watch` - Watch and regenerate docs on changes

## Key Features

### CUBE CSS Architecture
- Layered CSS with explicit cascade control
- Design token system (primitive + semantic)
- Utility classes for rapid development
- Component-scoped CSS variables

### Design System
- Reusable components with `ccm` prefix
- Consistent styling via design tokens
- Auto-generated component documentation
- Interactive component demos

### Content Management
- Markdown-based content with frontmatter
- Type-safe schemas via Zod
- Collections for blogs, docs, etc.
- Query API for content retrieval

### Testing
- Vitest for unit/component testing
- Coverage reporting with V8
- Test utilities from `@nuxt/test-utils`
- Organized test structure mirroring source

## AI Assistant Support

This boilerplate includes comprehensive instructions for AI coding assistants:

- **Claude Code**: See `CLAUDE.md` and `.claude/` directory
- **Gemini**: See `GEMINI.md` and `.gemini/` directory
- **Cursor**: See `.cursorrules` and `.cursor/` directory
- **Codex**: See `.codex/` directory
- **General**: See `AGENTS.md` for universal guidelines

## Customization

### Content Files
The `src/content/` directory contains example content. For new projects:
1. Remove or adapt existing Markdown files
2. Update `content.config.ts` collections
3. Modify schemas to match your content structure

### Design System
Customize the design system by:
1. Editing design tokens in `src/public/css/tokens/`
2. Creating new components in `src/components/ds/`
3. Following component standards in `src/content/docs/guidelines/` (if exists)

### Configuration
- **Nuxt**: Edit `nuxt.config.ts` (or `src/nuxt.config.ts`)
- **Content**: Edit `content.config.ts`
- **ESLint**: Edit `eslint.config.mjs`
- **TypeScript**: Edit `tsconfig.json`
- **Stylelint**: Edit `stylelint.config.mjs`

## Guidelines & Standards

See `src/content/docs/guidelines/` for available documentation:
- Component development standards
- CUBE CSS methodology
- Design token governance
- Documentation standards
- Implementation playbooks

Note: Not all guideline files exist in every project fork.

## Tech Stack

- **Framework**: Nuxt 3/4
- **UI**: Vue 3.5 (Composition API)
- **Content**: `@nuxt/content`
- **Styling**: CUBE CSS + PostCSS
- **Testing**: Vitest + @nuxt/test-utils
- **Linting**: ESLint + Stylelint
- **Type Safety**: TypeScript + Vue TSC
- **Package Manager**: npm

## License

MIT (or your preferred license)

## Important Notes

**This is a boilerplate template:**
- The core value is the **Nuxt + Nuxt Content setup**, not the content files
- Content files in `src/content/` are **examples** - adapt or remove them for your project
- Some scripts may not be configured in every fork
- Check `package.json` for available commands in your specific project
- Verify file existence before referencing in code

For detailed guidance, see:
- `CLAUDE.md` - Claude Code instructions
- `AGENTS.md` - General AI agent guidelines
- `GEMINI.md` - Gemini-specific instructions
- `.cursorrules` - Cursor IDE rules

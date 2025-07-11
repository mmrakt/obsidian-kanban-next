# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian Kanban Next is a TypeScript plugin for Obsidian that creates markdown-backed Kanban boards. The plugin uses Preact (React compatibility layer) for UI components and integrates deeply with Obsidian's API.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development build with watch mode
pnpm dev

# Production build
pnpm build

# Type checking
pnpm typecheck

# Code quality with Biome
pnpm lint       # Check for lint and format issues  
pnpm lint:fix   # Auto-fix lint and format issues
pnpm format     # Format code only

# Clean (lint + format + organize imports)
pnpm clean
```

## Architecture Overview

### Core Components

1. **KanbanPlugin** (`src/main.ts`): Main plugin entry point
   - Handles Obsidian plugin lifecycle
   - Manages settings and state persistence
   - Coordinates between Obsidian API and Kanban views

2. **KanbanView** (`src/KanbanView.tsx`): Main view component
   - Renders the Kanban board interface
   - Manages board state and user interactions
   - Handles drag-and-drop operations

3. **StateManager** (`src/StateManager.ts`): Central state management
   - Uses EventEmitter pattern for state updates
   - Manages lanes, cards, and board metadata
   - Handles undo/redo functionality

4. **DragManager** (`src/dnd/managers/DragManager.ts`): Drag-and-drop system
   - Custom implementation (not using external DnD libraries)
   - Handles card and lane dragging
   - Manages drag preview and drop zones

### Key Directories

- `/src/components/`: Preact UI components (Item, Lane, Board)
- `/src/dnd/`: Drag-and-drop implementation
- `/src/parsers/`: Markdown parsing and serialization
- `/src/helpers/`: Utility functions and helpers
- `/src/lang/`: Internationalization files (25+ languages)
- `/styles/`: SCSS stylesheets

## Code Style Guidelines

- Use TypeScript with strict type checking
- Preact components use `.tsx` extension
- Follow existing naming conventions:
  - Components: PascalCase
  - Functions/variables: camelCase
  - CSS classes: kebab-case with `kanban-plugin` prefix
- Import ordering: External deps → Obsidian API → Local imports
- **Package Manager**: Always use `pnpm` instead of `yarn` for all package management commands

## Working with Obsidian API

Key Obsidian concepts used:
- `FileView`: Base class for custom views
- `MarkdownView`: For editing markdown files
- `TFile`: File operations
- `Vault`: File system operations
- `Workspace`: UI and view management

## Markdown Format

Kanban boards are stored as markdown with special syntax:
```markdown
---
kanban-plugin: board
---

## Lane Name

- [ ] Card content
  - Nested content supported
  - Metadata stored in YAML frontmatter

## Another Lane

- [x] Completed card
```

## Common Development Tasks

### Adding a New Component
1. Create component in `/src/components/`
2. Use Preact's `h` function or JSX syntax
3. Follow existing component patterns (see Item/Lane components)

### Modifying Drag-and-Drop Behavior
1. Check `/src/dnd/managers/DragManager.ts`
2. Entity-specific logic in `/src/dnd/dragHandlers/`
3. Drop zone logic in `/src/dnd/managers/DropManager.ts`

### Adding Translations
1. Add keys to `/src/lang/en.ts`
2. Update other language files or mark for translation
3. Use `t()` helper function in components

### Working with State
1. State changes go through `StateManager`
2. Use `stateManager.setState()` for updates
3. Subscribe to changes with `stateManager.onChange()`
4. State is automatically persisted to markdown

## Performance Considerations

- Board state is parsed from markdown on load
- Changes are debounced before writing to disk
- Large boards (100+ cards) may need optimization
- Use React.memo/Preact.memo for expensive components

## Debugging Tips

- Enable Obsidian developer console: Ctrl+Shift+I
- Check for errors in plugin loading
- Use `console.log` with `[Kanban]` prefix
- Test with sample vault before production use

## Security Notes

- Never store sensitive data in board content
- All data is stored in local markdown files
- No external API calls or data transmission
- Sanitize user input when rendering HTML

## Build System

Uses esbuild with custom configuration:
- Handles Obsidian plugin requirements
- Copies manifest.json and styles.css
- Supports both development and production builds
- No external CDN dependencies
# MegaMenu Component Module

This module implements a sophisticated mega menu navigation system inspired by the Euronews design pattern.

## Directory Structure

```
src/components/MegaMenu/
├── index.ts                    # Barrel export file
├── types.ts                    # TypeScript interfaces and types
├── README.md                   # This file
├── MegaMenu.tsx               # Container component (to be implemented)
├── MegaMenuContext.tsx        # Context provider (to be implemented)
├── MegaMenuTrigger.tsx        # Trigger component (to be implemented)
├── MegaMenuContent.tsx        # Dropdown panel component (to be implemented)
├── CategoriesColumn.tsx       # Categories column component (to be implemented)
├── ProgrammesColumn.tsx       # Programmes column component (to be implemented)
├── FeaturedColumn.tsx         # Featured column component (to be implemented)
├── FeaturedCard.tsx           # Featured card component (to be implemented)
└── __tests__/                 # Test files
    ├── types.test.ts          # Type validation tests
    ├── MegaMenu.test.tsx      # Unit tests
    └── MegaMenu.property.test.tsx  # Property-based tests
```

## Component Hierarchy

```
MegaMenu (Container)
├── MegaMenuTrigger (Navigation Item)
├── MegaMenuContent (Dropdown Panel)
│   ├── MegaMenuColumn (Layout Container)
│   │   ├── CategoriesColumn
│   │   │   └── CategoryLink[]
│   │   ├── ProgrammesColumn
│   │   │   └── ProgrammeGroup[]
│   │   │       ├── ProgrammeLink
│   │   │       └── SubProgrammeLink[]
│   │   └── FeaturedColumn
│   │       └── FeaturedCard[]
│   │           ├── FeaturedImage
│   │           ├── FeaturedTitle
│   │           └── FeaturedDescription
```

## Key Features

- **Accessibility-First**: Full keyboard navigation, screen reader support, and ARIA compliance
- **Performance**: Fast rendering, lazy loading, and optimized animations
- **Flexibility**: Configuration-driven content supporting multiple menu instances
- **Responsiveness**: Adaptive layouts for mobile, tablet, and desktop viewports
- **Maintainability**: Clean separation of concerns with reusable components

## Testing

The module uses three types of tests:

1. **Type Tests**: Validate TypeScript interfaces and type safety
2. **Unit Tests**: Test specific examples, edge cases, and error conditions
3. **Property-Based Tests**: Verify universal properties hold across all inputs using fast-check

## Configuration

Mega menus are configured using the `MegaMenuConfig` interface:

```typescript
const config: MegaMenuConfig = {
  menuId: 'unique-id',
  categories: {
    heading: 'Categories',
    items: [
      { id: 'cat-1', label: 'Category 1', href: '/category-1' },
      // ... 3-12 items
    ]
  },
  programmes: {
    heading: 'Programmes',
    groups: [
      {
        id: 'prog-1',
        label: 'Programme 1',
        href: '/programme-1',
        subProgrammes: [
          { id: 'sub-1', label: 'Sub Programme 1', href: '/programme-1/sub-1' }
        ]
      },
      // ... 2-8 groups
    ]
  },
  featured: {
    heading: 'Featured',
    items: [
      {
        id: 'feat-1',
        title: 'Featured Title',
        description: 'Featured description',
        imageUrl: '/images/featured.jpg',
        imageAlt: 'Featured image',
        href: '/featured-1'
      },
      // ... 1-4 items
    ]
  }
};
```

## Requirements Validation

This module implements requirements 14.1-14.5:
- 14.1: Accepts configuration object defining all column content
- 14.2: Supports defining Categories column items with label and URL
- 14.3: Supports defining Programmes column items with nested sub-programmes
- 14.4: Supports defining Featured column items with image, title, description, and URL
- 14.5: Supports defining column headings for each column

## Implementation Status

- [x] Task 1: Project structure and core types
- [ ] Task 2: MegaMenuContext and state management
- [ ] Task 3: MegaMenu container component
- [ ] Task 5: MegaMenuTrigger component
- [ ] Task 6: MegaMenuContent component
- [ ] Task 8: CategoriesColumn component
- [ ] Task 9: ProgrammesColumn component
- [ ] Task 10: FeaturedColumn and FeaturedCard components
- [ ] Task 12: Keyboard navigation
- [ ] Task 13: Accessibility features
- [ ] Task 14: Configuration system
- [ ] Task 16: Styling and visual design
- [ ] Task 17: Performance optimizations
- [ ] Task 18: Error handling
- [ ] Task 19: Reduced motion support
- [ ] Task 20: Z-index and layering
- [ ] Task 22: Example configurations
- [ ] Task 23: Integration and wiring

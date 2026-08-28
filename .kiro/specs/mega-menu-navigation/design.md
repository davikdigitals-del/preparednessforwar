# Design Document: Mega Menu Navigation

## Overview

The mega menu navigation system is a sophisticated dropdown interface inspired by the Euronews design pattern. It provides a hierarchical, multi-column navigation experience that displays on user interaction with main navigation items. The system organizes content into three distinct columns: categories (simple links), programmes (two-level hierarchy), and featured content (visual cards with images).

This design leverages React 18, TypeScript, and Tailwind CSS to create a performant, accessible, and maintainable navigation component that integrates seamlessly with the existing "Preparedness for War" site architecture.

### Key Design Goals

1. **Accessibility-First**: Full keyboard navigation, screen reader support, and ARIA compliance
2. **Performance**: Fast rendering, lazy loading, and optimized animations
3. **Flexibility**: Configuration-driven content supporting multiple menu instances
4. **Responsiveness**: Adaptive layouts for mobile, tablet, and desktop viewports
5. **Maintainability**: Clean separation of concerns with reusable components

## Architecture

### Component Hierarchy

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

### State Management Architecture

The mega menu uses a combination of local component state and React Context for managing interaction state:

**Local State (within MegaMenu component)**:
- `activeMenuId`: Tracks which navigation item has an open dropdown
- `isHovering`: Boolean tracking hover state for delay logic
- `isFocused`: Boolean tracking keyboard focus state

**Context Provider (MegaMenuContext)**:
```typescript
interface MegaMenuContextValue {
  activeMenuId: string | null;
  openMenu: (menuId: string) => void;
  closeMenu: () => void;
  registerMenu: (menuId: string, config: MegaMenuConfig) => void;
  unregisterMenu: (menuId: string) => void;
}
```

This architecture allows:
- Multiple menu instances to coordinate (only one open at a time)
- Centralized state management for complex interactions
- Easy testing and debugging of menu state

### Event Flow Architecture

```
User Interaction → Event Handler → State Update → Re-render → DOM Update
                                                            ↓
                                                    Animation/Transition
```

**Hover Flow**:
1. Mouse enters trigger → Start 200ms timer
2. Timer completes → Update `activeMenuId` state
3. React re-renders with dropdown visible
4. CSS transition animates opacity/transform

**Click Flow**:
1. Click event on trigger → Immediate state update
2. React re-renders with dropdown visible
3. Focus moves to first focusable element

**Close Flow**:
1. Mouse leaves both trigger and dropdown for 300ms → Start timer
2. Timer completes → Clear `activeMenuId` state
3. React re-renders with dropdown hidden
4. CSS transition animates out

## Components and Interfaces

### Core Component: MegaMenu

**Purpose**: Container component managing menu state and providing context

**Props Interface**:
```typescript
interface MegaMenuProps {
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}
```

**Responsibilities**:
- Manage open/close state
- Provide context to child components
- Handle click-outside detection
- Coordinate multiple menu instances

### Component: MegaMenuTrigger

**Purpose**: Navigation item that triggers the dropdown

**Props Interface**:
```typescript
interface MegaMenuTriggerProps {
  menuId: string;
  label: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}
```

**Responsibilities**:
- Render navigation link with proper ARIA attributes
- Handle hover and click events
- Manage hover delay timers
- Display active/hover states

**Key Attributes**:
- `aria-expanded`: Indicates dropdown state (true/false)
- `aria-haspopup`: Set to "true" to indicate dropdown presence
- `aria-controls`: References dropdown panel ID
- `role`: "button" when interactive

### Component: MegaMenuContent

**Purpose**: Dropdown panel container with three-column layout

**Props Interface**:
```typescript
interface MegaMenuContentProps {
  menuId: string;
  config: MegaMenuConfig;
  className?: string;
}
```

**Responsibilities**:
- Render three-column grid layout
- Handle responsive breakpoints
- Manage focus trap when open
- Animate entrance/exit

**Key Attributes**:
- `aria-hidden`: Set to "true" when closed
- `role`: "region"
- `aria-labelledby`: References trigger element

### Component: CategoriesColumn

**Purpose**: Left column displaying simple category links

**Props Interface**:
```typescript
interface CategoriesColumnProps {
  heading: string;
  categories: CategoryItem[];
}

interface CategoryItem {
  id: string;
  label: string;
  href: string;
}
```

**Responsibilities**:
- Render column heading
- Render list of category links
- Apply hover styles

### Component: ProgrammesColumn

**Purpose**: Middle column displaying two-level programme hierarchy

**Props Interface**:
```typescript
interface ProgrammesColumnProps {
  heading: string;
  programmes: ProgrammeGroup[];
}

interface ProgrammeGroup {
  id: string;
  label: string;
  href: string;
  subProgrammes?: SubProgramme[];
}

interface SubProgramme {
  id: string;
  label: string;
  href: string;
}
```

**Responsibilities**:
- Render column heading
- Render programme groups with visual hierarchy
- Indent sub-programmes appropriately
- Apply distinct styling for parent/child items

### Component: FeaturedColumn

**Purpose**: Right column displaying visual cards with images

**Props Interface**:
```typescript
interface FeaturedColumnProps {
  heading: string;
  featured: FeaturedItem[];
}

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  imageAlt?: string;
}
```

**Responsibilities**:
- Render column heading
- Render featured cards in vertical stack
- Handle image loading states
- Apply hover effects

### Component: FeaturedCard

**Purpose**: Individual featured content card with image and text

**Props Interface**:
```typescript
interface FeaturedCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  imageAlt?: string;
  loading?: 'lazy' | 'eager';
}
```

**Responsibilities**:
- Render 16:9 aspect ratio image
- Display title and description
- Handle image loading errors
- Apply hover scale effect

## Data Models

### MegaMenuConfig

Complete configuration object for a single mega menu instance:

```typescript
interface MegaMenuConfig {
  menuId: string;
  categories: {
    heading: string;
    items: CategoryItem[];
  };
  programmes: {
    heading: string;
    groups: ProgrammeGroup[];
  };
  featured: {
    heading: string;
    items: FeaturedItem[];
  };
}
```

**Validation Rules**:
- `menuId`: Required, unique string identifier
- `categories.items`: Array with 3-12 items
- `programmes.groups`: Array with 2-8 groups
- `featured.items`: Array with 1-4 items
- All `href` values must be valid URLs or paths
- All `imageUrl` values must be valid URLs

### Example Configuration

```typescript
const emergencyNewsMenu: MegaMenuConfig = {
  menuId: 'emergency-news',
  categories: {
    heading: 'Categories',
    items: [
      { id: 'breaking', label: 'Breaking News', href: '/emergency-news/breaking' },
      { id: 'alerts', label: 'Emergency Alerts', href: '/emergency-news/alerts' },
      { id: 'updates', label: 'Live Updates', href: '/emergency-news/updates' },
      { id: 'analysis', label: 'Situation Analysis', href: '/emergency-news/analysis' },
    ]
  },
  programmes: {
    heading: 'Programmes',
    groups: [
      {
        id: 'daily-brief',
        label: 'Daily Security Brief',
        href: '/programmes/daily-brief',
        subProgrammes: [
          { id: 'morning', label: 'Morning Edition', href: '/programmes/daily-brief/morning' },
          { id: 'evening', label: 'Evening Roundup', href: '/programmes/daily-brief/evening' }
        ]
      },
      {
        id: 'crisis-watch',
        label: 'Crisis Watch',
        href: '/programmes/crisis-watch',
        subProgrammes: [
          { id: 'global', label: 'Global Hotspots', href: '/programmes/crisis-watch/global' },
          { id: 'regional', label: 'Regional Focus', href: '/programmes/crisis-watch/regional' }
        ]
      }
    ]
  },
  featured: {
    heading: 'Featured',
    items: [
      {
        id: 'feature-1',
        title: 'NATO Response Protocol',
        description: 'Understanding the alliance\'s rapid response mechanisms',
        imageUrl: '/images/nato-response.jpg',
        imageAlt: 'NATO forces in training exercise',
        href: '/featured/nato-response'
      },
      {
        id: 'feature-2',
        title: 'Civilian Preparedness Guide',
        description: 'Essential steps for household emergency readiness',
        imageUrl: '/images/civilian-prep.jpg',
        imageAlt: 'Emergency supply kit',
        href: '/featured/civilian-prep'
      }
    ]
  }
};
```

### State Models

**Menu State**:
```typescript
interface MenuState {
  activeMenuId: string | null;
  hoverTimerId: number | null;
  closeTimerId: number | null;
  focusedElement: HTMLElement | null;
}
```

**Interaction Timers**:
```typescript
interface TimerConfig {
  hoverOpenDelay: number;    // 200ms
  hoverCloseDelay: number;   // 300ms
  clickOpenDelay: number;    // 0ms (immediate)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidation opportunities:

**Redundancy Analysis**:
1. **Column Structure Properties (3.1-3.4)**: These four properties all test the same structural invariant—that dropdowns have three columns in a specific order. These can be combined into one comprehensive property.

2. **Hover State Properties (2.1, 4.2, 5.4, 6.5)**: Multiple properties test hover state display across different component types. These can be consolidated into one property about hover state behavior.

3. **Column Heading Properties (4.3, 5.5, 6.7)**: Three properties test that columns have headings. These can be combined into one property about column structure.

4. **Configuration Range Properties (4.5, 5.6, 6.6)**: Three properties test that columns support specific item count ranges. These can be combined into one property about configuration constraints.

5. **ARIA Attribute Properties (10.2, 10.3, 10.5)**: Multiple properties test ARIA attributes on navigation items and dropdowns. These can be consolidated.

6. **Focus Management Properties (17.1, 17.2, 17.3, 17.4)**: Four properties test focus behavior. Properties 17.3 and 17.4 both test focus trapping and can be combined.

7. **Click-Outside Properties (16.1, 16.2)**: Both test closing on outside click, just with different wording. These are redundant.

**Consolidated Properties**:
After reflection, I've reduced 60+ testable properties to 35 unique, non-redundant properties that provide comprehensive coverage.

### Property 1: Three-Column Layout Structure

*For any* valid MegaMenuConfig, the rendered Dropdown_Panel SHALL contain exactly three columns in the order: Categories (left), Programmes (middle), Featured (right), with equal widths.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 2: Hover State Timing

*For any* Navigation_Item with a mega menu, hovering for 200ms SHALL open the Dropdown_Panel, and the Navigation_Item SHALL display a Hover_State within 100ms of cursor entry.

**Validates: Requirements 2.1, 2.2**

### Property 3: Click Opens Immediately

*For any* Navigation_Item with a mega menu, clicking SHALL immediately open the Dropdown_Panel without delay.

**Validates: Requirements 2.3**

### Property 4: Hover-Away Closes Menu

*For any* open Dropdown_Panel, moving the cursor away from both the Navigation_Item and Dropdown_Panel for 300ms SHALL close the menu.

**Validates: Requirements 2.4**

### Property 5: Active State Synchronization

*For any* Navigation_Item, when its Dropdown_Panel is open, the Navigation_Item SHALL display an Active_State.

**Validates: Requirements 2.5**

### Property 6: Universal Hover State Display

*For any* interactive element within the mega menu (category links, programme links, sub-programme links, featured cards), hovering SHALL display a Hover_State with visual feedback.

**Validates: Requirements 4.2, 5.4, 6.5**

### Property 7: Column Heading Structure

*For any* column (Categories, Programmes, Featured), the column heading SHALL appear as the first child element and use an appropriate heading element (h2, h3, or h4).

**Validates: Requirements 4.3, 5.5, 6.7, 10.6**

### Property 8: Configuration Item Count Constraints

*For any* valid MegaMenuConfig, the Categories column SHALL contain 3-12 items, the Programmes column SHALL contain 2-8 groups, and the Featured column SHALL contain 1-4 items.

**Validates: Requirements 4.5, 5.6, 6.6**

### Property 9: Vertical List Layout

*For any* column content (categories, programmes, featured cards), items SHALL be displayed in a vertical list or stack layout.

**Validates: Requirements 4.1, 5.1, 6.1**

### Property 10: Programme Hierarchy Indentation

*For any* ProgrammeGroup with sub-programmes, the Sub_Programme items SHALL be visually indented beneath their parent programme.

**Validates: Requirements 5.2**

### Property 11: Visual Hierarchy Distinction

*For any* ProgrammeGroup with sub-programmes, parent programme links SHALL use a font weight at least 100 units heavier than Sub_Programme links.

**Validates: Requirements 5.3, 11.2**

### Property 12: Featured Card Structure

*For any* FeaturedCard, it SHALL contain an image with 16:9 aspect ratio, a title element, and a description element.

**Validates: Requirements 6.2, 6.3, 6.4**

### Property 13: Mobile Single-Column Layout

*For any* MegaMenuConfig rendered at viewport width less than 768 pixels, the Dropdown_Panel SHALL display in a single-column layout with columns ordered: Categories, Programmes, Featured.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 14: Tablet Two-Column Layout

*For any* MegaMenuConfig rendered at viewport width between 768 and 1024 pixels, the Dropdown_Panel SHALL display in a two-column layout with Categories and Programmes in the first column, and Featured in the second column.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4**

### Property 15: Keyboard Tab Navigation

*For any* Navigation_Bar, pressing Tab SHALL move focus to the next Navigation_Item in sequence.

**Validates: Requirements 9.1**

### Property 16: Keyboard Open Menu

*For any* focused Navigation_Item with a mega menu, pressing Enter or Space SHALL open the Dropdown_Panel.

**Validates: Requirements 9.2**

### Property 17: Keyboard Tab Through Menu

*For any* open Dropdown_Panel, pressing Tab SHALL move focus through all focusable links within the panel in DOM order.

**Validates: Requirements 9.3**

### Property 18: Keyboard Escape Closes Menu

*For any* open Dropdown_Panel, pressing Escape SHALL close the menu.

**Validates: Requirements 9.4**

### Property 19: Focus Loss Closes Menu

*For any* open Dropdown_Panel, when focus moves outside the Navigation_Bar and Dropdown_Panel, the menu SHALL close.

**Validates: Requirements 9.5**

### Property 20: ARIA Navigation Semantics

*For any* Navigation_Bar, it SHALL use a nav element with an aria-label attribute.

**Validates: Requirements 10.1**

### Property 21: ARIA Expanded State

*For any* Navigation_Item with a mega menu, it SHALL have aria-expanded attribute that reflects the Dropdown_Panel state (true when open, false when closed).

**Validates: Requirements 10.2**

### Property 22: ARIA Haspopup Attribute

*For any* Navigation_Item with a mega menu, it SHALL have aria-haspopup attribute set to "true".

**Validates: Requirements 10.3**

### Property 23: ARIA Dropdown Role

*For any* Dropdown_Panel, it SHALL have an appropriate ARIA role (region or menu).

**Validates: Requirements 10.4**

### Property 24: ARIA Hidden State

*For any* Dropdown_Panel, when closed, it SHALL have aria-hidden set to "true".

**Validates: Requirements 10.5**

### Property 25: Typography Hierarchy

*For any* mega menu, column headings SHALL use a font size at least 1.2 times larger than link text, and Featured_Card titles SHALL use a font size at least 1.1 times larger than description text.

**Validates: Requirements 11.1, 11.3**

### Property 26: Hover Feedback Timing

*For any* interactive element, the Hover_State transition SHALL complete within 150ms of cursor entry.

**Validates: Requirements 11.5**

### Property 27: Open Animation Timing

*For any* Dropdown_Panel, when opening, it SHALL animate from hidden to visible over 200ms using an easing function.

**Validates: Requirements 12.1, 12.3**

### Property 28: Close Animation Timing

*For any* Dropdown_Panel, when closing, it SHALL animate from visible to hidden over 150ms using an easing function.

**Validates: Requirements 12.2, 12.3**

### Property 29: Reduced Motion Respect

*For any* animation or transition, when the user's system has prefers-reduced-motion enabled, animations SHALL be disabled or significantly reduced.

**Validates: Requirements 12.5**

### Property 30: Lazy Loading When Closed

*For any* Featured_Card in a closed Dropdown_Panel, images SHALL have loading="lazy" attribute.

**Validates: Requirements 13.4**

### Property 31: Configuration Acceptance

*For any* valid MegaMenuConfig object, the MegaMenu component SHALL render without errors and display all configured content.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

### Property 32: Configuration Reactivity

*For any* MegaMenuConfig, when the configuration object changes, the MegaMenu SHALL re-render with the updated content.

**Validates: Requirements 14.6**

### Property 33: Multi-Instance Configuration Isolation

*For any* set of Navigation_Items with different MegaMenuConfig objects, each SHALL render its own unique Dropdown_Panel content when triggered.

**Validates: Requirements 15.1, 15.2**

### Property 34: Fallback Link Behavior

*For any* Navigation_Item without a MegaMenuConfig, it SHALL function as a standard link without dropdown functionality.

**Validates: Requirements 15.3**

### Property 35: Multi-Instance Scale Support

*For any* set of up to 10 different MegaMenuConfig objects, the system SHALL support all configurations simultaneously without conflicts.

**Validates: Requirements 15.4**

### Property 36: Click Outside Closes Menu

*For any* open Dropdown_Panel, clicking outside the Navigation_Bar and Dropdown_Panel SHALL close the menu.

**Validates: Requirements 16.1, 16.2**

### Property 37: Internal Link Click Closes Menu

*For any* open Dropdown_Panel, clicking a link within the panel SHALL close the menu.

**Validates: Requirements 16.3**

### Property 38: Click Detection Activation Timing

*For any* Dropdown_Panel, click-outside detection SHALL activate within 50ms of the panel opening.

**Validates: Requirements 16.5**

### Property 39: Keyboard Open Focus Movement

*For any* Dropdown_Panel opened via keyboard, focus SHALL move to the first focusable element in the panel.

**Validates: Requirements 17.1**

### Property 40: Keyboard Close Focus Restoration

*For any* Dropdown_Panel closed via keyboard, focus SHALL return to the Navigation_Item that opened it.

**Validates: Requirements 17.2**

### Property 41: Focus Trap

*For any* open Dropdown_Panel, focus SHALL remain trapped within the Navigation_Bar and Dropdown_Panel, cycling back to the first element after the last.

**Validates: Requirements 17.3, 17.4**

### Property 42: Focus Indicator Contrast

*For any* focusable element, the focus indicator SHALL have at least 3:1 contrast ratio against its background.

**Validates: Requirements 17.5**

### Property 43: Image Load Error Handling

*For any* Featured_Card with an invalid or failed image URL, a placeholder image SHALL be displayed.

**Validates: Requirements 18.1**

### Property 44: Empty Column Fallback

*For any* column with an empty items array, a fallback message SHALL be displayed.

**Validates: Requirements 18.2**

### Property 45: Invalid Configuration Handling

*For any* invalid MegaMenuConfig object, the MegaMenu SHALL log an error and not render, without causing JavaScript errors.

**Validates: Requirements 18.3, 18.5**

### Property 46: Missing URL Fallback

*For any* link item with a missing or empty href value, the item SHALL render as non-interactive text.

**Validates: Requirements 18.4**

### Property 47: Z-Index Layering

*For any* Dropdown_Panel, it SHALL have a z-index value higher than standard page content but lower than modal dialogs.

**Validates: Requirements 19.1, 19.2, 19.4**

### Property 48: Most Recent Panel On Top

*For any* scenario where multiple Dropdown_Panels could theoretically overlap, the most recently opened SHALL have the highest z-index.

**Validates: Requirements 19.3**


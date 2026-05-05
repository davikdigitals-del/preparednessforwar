# Mega Menu Navigation Guide

## How the Mega Menu Works

### Overview
The mega menu is a dropdown navigation system that appears when you hover over or click main navigation items in the header. It displays a large panel with three columns of content.

### Three-Column Layout

#### 1. **Categories Column (Left)**
- Lists all categories within that section
- Example: For "Emergency News" section:
  - UK Alerts
  - NATO Updates
  - Global Situation
  - Infrastructure Disruptions

#### 2. **Programmes Column (Middle)**
- Quick links and related sections
- Can have nested sub-items
- Example:
  - Main Section → View All, Latest Updates
  - Related Resources → Library, Encyclopaedia

#### 3. **Featured Column (Right)**
- Visual content with images
- Highlights important or trending content
- Shows image, title, and description
- Currently configured to show section updates

### How Featured Items Work

Featured items are defined in `SiteHeader.tsx` in the `createMenuConfig` function:

```typescript
featured: {
  heading: 'Featured',
  items: [
    {
      id: 'featured-1',
      title: `${section.title} Updates`,
      description: `Stay informed with the latest ${section.title.toLowerCase()} information`,
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=225&fit=crop',
      href: `/${sectionSlug}`,
    },
  ],
}
```

### Customizing Featured Items

To customize featured items for each section:

1. **Open:** `src/components/layout/SiteHeader.tsx`
2. **Find:** The `createMenuConfig` function (around line 25)
3. **Modify:** The `featured.items` array

**Example - Adding multiple featured items:**

```typescript
featured: {
  heading: 'Featured',
  items: [
    {
      id: 'featured-1',
      title: 'Breaking: New Emergency Guidelines',
      description: 'UK Government releases updated preparedness guidelines for 2026',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=225&fit=crop',
      href: '/emergency-news/uk-alerts/new-guidelines',
    },
    {
      id: 'featured-2',
      title: 'Essential Supplies Checklist',
      description: 'Download our comprehensive emergency supplies checklist',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=225&fit=crop',
      href: '/resources/checklists/essential-supplies',
    },
  ],
}
```

### Dynamic Featured Items from Database

To show actual posts as featured items, you can fetch them from the database:

```typescript
// In SiteHeader.tsx, add useData hook
const { publishedPosts } = useData();

// Then in createMenuConfig:
const sectionPosts = publishedPosts
  .filter(p => p.section === sectionSlug && p.isPinned)
  .slice(0, 2);

featured: {
  heading: 'Featured',
  items: sectionPosts.map(post => ({
    id: post.id,
    title: post.title,
    description: post.standfirst,
    imageUrl: post.image,
    href: `/${post.section}/${post.category}/${post.id}`,
  })),
}
```

### Interaction Behavior

1. **Hover:** Menu opens after 200ms delay
2. **Click:** Menu opens immediately
3. **Mouse Leave:** Menu closes after 300ms delay
4. **Click Outside:** Menu closes immediately
5. **Click Link:** Menu closes when any link is clicked
6. **Keyboard:** 
   - Tab to navigate through items
   - Escape to close
   - Focus trapped within open menu

### Mobile Behavior

On mobile devices (< 1024px):
- Mega menu is **disabled**
- Simple accordion-style menu is shown instead
- Categories appear as nested items under each section
- No featured items on mobile (simplified for performance)

### Responsive Breakpoints

- **Desktop (≥1024px):** Full 3-column mega menu
- **Tablet (768px-1023px):** 2-column layout (categories + programmes)
- **Mobile (<768px):** Simple accordion menu (no mega menu)

### Accessibility Features

- ✅ Keyboard navigation (Tab, Shift+Tab, Escape)
- ✅ Focus trap within open menu
- ✅ ARIA labels and roles
- ✅ Screen reader announcements
- ✅ Reduced motion support

### Configuration Location

All mega menu configuration is in:
- **Main Config:** `src/components/layout/SiteHeader.tsx` (line 25-75)
- **Component:** `src/components/MegaMenu/`
- **Types:** `src/components/MegaMenu/types.ts`

### Adding New Sections to Mega Menu

1. Add section to `mainNavItems` array in `SiteHeader.tsx`
2. Ensure section exists in `navSections` in `src/data/mockData.ts`
3. Section must have at least 3 categories to show mega menu
4. Customize featured items for that section

### Disabling Mega Menu for a Section

If a section has fewer than 3 categories, it automatically renders as a regular link without a mega menu.

To force disable mega menu for a section:
```typescript
// In mainNavItems, don't include the 'section' property
{ label: "About", to: "/about" }, // No mega menu
```

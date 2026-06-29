# Implementation Plan: Mega Menu Navigation

## Overview

This implementation plan breaks down the mega menu navigation feature into discrete, actionable coding tasks. The mega menu is a sophisticated dropdown navigation system with three columns (Categories, Programmes, Featured), built with React 18, TypeScript, and Tailwind CSS. The implementation follows an incremental approach, building core functionality first, then adding interactions, accessibility, and polish.

## Tasks

- [x] 1. Set up project structure and core types
  - Create directory structure: `src/components/MegaMenu/`
  - Define all TypeScript interfaces and types from design document
  - Set up testing framework (Jest + React Testing Library + fast-check for property tests)
  - Create barrel export file for the MegaMenu module
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 2. Implement MegaMenuContext and state management
  - [x] 2.1 Create MegaMenuContext with provider component
    - Implement `MegaMenuContextValue` interface
    - Create context provider with state management for `activeMenuId`
    - Implement `openMenu`, `closeMenu`, `registerMenu`, `unregisterMenu` functions
    - Add state for hover and focus tracking
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 15.1, 15.2_
  
  - [x] 2.2 Write property test for state management
    - **Property 5: Active State Synchronization**
    - **Validates: Requirements 2.5**
    - Test that when a dropdown is open, the corresponding navigation item shows active state
  
  - [x] 2.3 Write unit tests for context functions
    - Test `openMenu` updates `activeMenuId` correctly
    - Test `closeMenu` clears `activeMenuId`
    - Test `registerMenu` and `unregisterMenu` manage menu registry
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Implement MegaMenu container component
  - [x] 3.1 Create MegaMenu component with props interface
    - Implement component accepting `children`, `onOpenChange`, `defaultOpen` props
    - Wrap children with MegaMenuContext provider
    - Add click-outside detection logic
    - Implement multi-instance coordination (only one menu open at a time)
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 16.1, 16.2_
  
  - [x] 3.2 Write property test for multi-instance coordination
    - **Property 33: Multi-Instance Configuration Isolation**
    - **Validates: Requirements 15.1, 15.2**
    - Test that each navigation item renders its own unique dropdown content
  
  - [x] 3.3 Write property test for click-outside behavior
    - **Property 36: Click Outside Closes Menu**
    - **Validates: Requirements 16.1, 16.2**
    - Test that clicking outside closes the menu
  
  - [x] 3.4 Write unit tests for MegaMenu component
    - Test `onOpenChange` callback is invoked correctly
    - Test `defaultOpen` prop initializes state
    - Test click-outside detection activates within 50ms
    - _Requirements: 16.5_

- [x] 4. Checkpoint - Ensure core structure tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement MegaMenuTrigger component
  - [x] 5.1 Create MegaMenuTrigger with hover and click handling
    - Implement component with `menuId`, `label`, `href`, `className` props
    - Add hover event handlers with 200ms delay timer
    - Add click event handler for immediate open
    - Implement hover-away detection with 300ms delay timer
    - Add ARIA attributes: `aria-expanded`, `aria-haspopup`, `aria-controls`
    - Display active state when dropdown is open
    - Display hover state on cursor entry
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 11.4_
  
  - [x] 5.2 Write property test for hover timing
    - **Property 2: Hover State Timing**
    - **Validates: Requirements 2.1, 2.2**
    - Test that hovering for 200ms opens the dropdown and hover state appears within 100ms
  
  - [x] 5.3 Write property test for click behavior
    - **Property 3: Click Opens Immediately**
    - **Validates: Requirements 2.3**
    - Test that clicking opens the dropdown immediately without delay
  
  - [x] 5.4 Write property test for hover-away behavior
    - **Property 4: Hover-Away Closes Menu**
    - **Validates: Requirements 2.4**
    - Test that moving cursor away for 300ms closes the menu
  
  - [x] 5.5 Write property test for ARIA attributes
    - **Property 21: ARIA Expanded State**
    - **Property 22: ARIA Haspopup Attribute**
    - **Validates: Requirements 10.2, 10.3**
    - Test that ARIA attributes reflect dropdown state correctly
  
  - [x] 5.6 Write unit tests for MegaMenuTrigger
    - Test hover state displays within 100ms
    - Test active state displays when dropdown is open
    - Test fallback link behavior when no config provided
    - _Requirements: 2.1, 2.5, 15.3_

- [ ] 6. Implement MegaMenuContent component
  - [x] 6.1 Create MegaMenuContent with three-column layout
    - Implement component with `menuId`, `config`, `className` props
    - Create three-column grid layout using Tailwind CSS Grid
    - Add ARIA attributes: `role="region"`, `aria-hidden`, `aria-labelledby`
    - Implement focus trap logic for keyboard navigation
    - Add entrance/exit animations (200ms open, 150ms close)
    - Handle responsive breakpoints (mobile single-column, tablet two-column)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 10.4, 10.5, 12.1, 12.2, 12.3_
  
  - [x] 6.2 Write property test for three-column layout
    - **Property 1: Three-Column Layout Structure**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Test that dropdown contains exactly three columns in correct order with equal widths
  
  - [x] 6.3 Write property test for mobile responsive layout
    - **Property 13: Mobile Single-Column Layout**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
    - Test that viewport < 768px displays single-column layout in correct order
  
  - [x] 6.4 Write property test for tablet responsive layout
    - **Property 14: Tablet Two-Column Layout**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
    - Test that viewport 768-1024px displays two-column layout correctly
  
  - [x] 6.5 Write property test for ARIA dropdown attributes
    - **Property 23: ARIA Dropdown Role**
    - **Property 24: ARIA Hidden State**
    - **Validates: Requirements 10.4, 10.5**
    - Test that dropdown has appropriate ARIA role and hidden state when closed
  
  - [x] 6.6 Write property test for animation timing
    - **Property 27: Open Animation Timing**
    - **Property 28: Close Animation Timing**
    - **Validates: Requirements 12.1, 12.2, 12.3**
    - Test that animations complete in specified timeframes with easing
  
  - [x] 6.7 Write unit tests for MegaMenuContent
    - Test focus trap cycles through elements correctly
    - Test animations respect prefers-reduced-motion
    - Test z-index layering is correct
    - _Requirements: 12.5, 19.1, 19.2, 19.4_

- [x] 7. Checkpoint - Ensure core components tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement CategoriesColumn component
  - [x] 8.1 Create CategoriesColumn with vertical list layout
    - Implement component with `heading`, `categories` props
    - Render column heading using appropriate heading element (h2/h3/h4)
    - Render category links as vertical list with left alignment
    - Add hover state styling with transition within 150ms
    - Support 3-12 category items
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 10.6, 11.5_
  
  - [x] 8.2 Write property test for column structure
    - **Property 7: Column Heading Structure**
    - **Validates: Requirements 4.3, 10.6**
    - Test that column heading appears first and uses appropriate heading element
  
  - [x] 8.3 Write property test for item count constraints
    - **Property 8: Configuration Item Count Constraints**
    - **Validates: Requirements 4.5**
    - Test that column supports 3-12 items
  
  - [x] 8.4 Write property test for hover state
    - **Property 6: Universal Hover State Display**
    - **Validates: Requirements 4.2**
    - Test that category links display hover state with visual feedback
  
  - [x] 8.5 Write property test for vertical layout
    - **Property 9: Vertical List Layout**
    - **Validates: Requirements 4.1**
    - Test that items are displayed in vertical list layout
  
  - [x] 8.6 Write unit tests for CategoriesColumn
    - Test empty categories array displays fallback message
    - Test hover transition completes within 150ms
    - _Requirements: 11.5, 18.2_

- [ ] 9. Implement ProgrammesColumn component
  - [x] 9.1 Create ProgrammesColumn with two-level hierarchy
    - Implement component with `heading`, `programmes` props
    - Render column heading using appropriate heading element
    - Render programme groups with parent and sub-programme items
    - Implement visual indentation for sub-programmes
    - Use font weight distinction (parent heavier than children by 100+ units)
    - Add hover state styling for all links
    - Support 2-8 programme groups
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 10.6, 11.2_
  
  - [x] 9.2 Write property test for programme hierarchy
    - **Property 10: Programme Hierarchy Indentation**
    - **Validates: Requirements 5.2**
    - Test that sub-programmes are visually indented beneath parent
  
  - [x] 9.3 Write property test for visual hierarchy
    - **Property 11: Visual Hierarchy Distinction**
    - **Validates: Requirements 5.3, 11.2**
    - Test that parent links use font weight at least 100 units heavier than children
  
  - [x] 9.4 Write property test for typography hierarchy
    - **Property 25: Typography Hierarchy**
    - **Validates: Requirements 11.1**
    - Test that column heading font size is at least 1.2x larger than link text
  
  - [x] 9.5 Write unit tests for ProgrammesColumn
    - Test programmes without sub-programmes render correctly
    - Test empty programmes array displays fallback message
    - Test hover state on parent and child links
    - _Requirements: 5.4, 18.2_

- [ ] 10. Implement FeaturedColumn and FeaturedCard components
  - [x] 10.1 Create FeaturedCard component
    - Implement component with `title`, `description`, `imageUrl`, `href`, `imageAlt`, `loading` props
    - Render image with 16:9 aspect ratio
    - Display title and description elements
    - Add hover scale effect
    - Implement image loading error handling with placeholder
    - Use lazy loading when dropdown is closed
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 13.4, 18.1_
  
  - [x] 10.2 Create FeaturedColumn component
    - Implement component with `heading`, `featured` props
    - Render column heading using appropriate heading element
    - Render featured cards in vertical stack
    - Support 1-4 featured items
    - _Requirements: 6.1, 6.6, 6.7, 10.6_
  
  - [x] 10.3 Write property test for featured card structure
    - **Property 12: Featured Card Structure**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - Test that card contains image with 16:9 aspect ratio, title, and description
  
  - [x] 10.4 Write property test for lazy loading
    - **Property 30: Lazy Loading When Closed**
    - **Validates: Requirements 13.4**
    - Test that images in closed dropdown have loading="lazy" attribute
  
  - [x] 10.5 Write property test for image error handling
    - **Property 43: Image Load Error Handling**
    - **Validates: Requirements 18.1**
    - Test that failed image URLs display placeholder
  
  - [x] 10.6 Write unit tests for FeaturedColumn
    - Test featured cards display hover state
    - Test empty featured array displays fallback message
    - Test images load within 1000ms when dropdown opens
    - _Requirements: 6.5, 13.5, 18.2_

- [x] 11. Checkpoint - Ensure column components tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement keyboard navigation
  - [x] 12.1 Add keyboard event handlers to MegaMenu
    - Implement Tab key navigation through navigation items
    - Implement Enter/Space key to open dropdown from trigger
    - Implement Tab key navigation through dropdown links
    - Implement Escape key to close dropdown
    - Implement focus loss detection to close dropdown
    - Move focus to first element when opening via keyboard
    - Restore focus to trigger when closing via keyboard
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 17.1, 17.2_
  
  - [x] 12.2 Write property test for keyboard tab navigation
    - **Property 15: Keyboard Tab Navigation**
    - **Validates: Requirements 9.1**
    - Test that Tab moves focus to next navigation item in sequence
  
  - [x] 12.3 Write property test for keyboard open
    - **Property 16: Keyboard Open Menu**
    - **Validates: Requirements 9.2**
    - Test that Enter/Space opens dropdown from focused trigger
  
  - [x] 12.4 Write property test for keyboard tab through menu
    - **Property 17: Keyboard Tab Through Menu**
    - **Validates: Requirements 9.3**
    - Test that Tab moves through all focusable links in DOM order
  
  - [x] 12.5 Write property test for keyboard escape
    - **Property 18: Keyboard Escape Closes Menu**
    - **Validates: Requirements 9.4**
    - Test that Escape closes the menu
  
  - [x] 12.6 Write property test for focus loss
    - **Property 19: Focus Loss Closes Menu**
    - **Validates: Requirements 9.5**
    - Test that focus moving outside closes the menu
  
  - [x] 12.7 Write property test for focus management
    - **Property 39: Keyboard Open Focus Movement**
    - **Property 40: Keyboard Close Focus Restoration**
    - **Validates: Requirements 17.1, 17.2**
    - Test that focus moves to first element on open and returns to trigger on close
  
  - [x] 12.8 Write property test for focus trap
    - **Property 41: Focus Trap**
    - **Validates: Requirements 17.3, 17.4**
    - Test that focus remains trapped and cycles within dropdown
  
  - [x] 12.9 Write property test for focus indicator contrast
    - **Property 42: Focus Indicator Contrast**
    - **Validates: Requirements 17.5**
    - Test that focus indicators have at least 3:1 contrast ratio

- [ ] 13. Implement accessibility features
  - [x] 13.1 Add ARIA attributes and semantic markup
    - Add nav element with aria-label to navigation bar
    - Ensure all ARIA attributes are correctly applied
    - Use appropriate heading levels for column headings
    - Add aria-labelledby to dropdown panels
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 13.2 Write property test for navigation semantics
    - **Property 20: ARIA Navigation Semantics**
    - **Validates: Requirements 10.1**
    - Test that navigation bar uses nav element with aria-label
  
  - [x] 13.3 Write unit tests for accessibility
    - Test screen reader announcements for state changes
    - Test heading hierarchy is correct
    - Test all interactive elements are keyboard accessible
    - _Requirements: 10.1, 10.6_

- [ ] 14. Implement configuration system
  - [x] 14.1 Create configuration validation logic
    - Implement validation for MegaMenuConfig structure
    - Validate item count constraints (categories: 3-12, programmes: 2-8, featured: 1-4)
    - Validate required fields (menuId, hrefs, imageUrls)
    - Log errors for invalid configurations
    - Handle missing URLs with fallback behavior
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 18.3, 18.4, 18.5_
  
  - [x] 14.2 Write property test for configuration acceptance
    - **Property 31: Configuration Acceptance**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**
    - Test that valid config objects render without errors
  
  - [x] 14.3 Write property test for configuration reactivity
    - **Property 32: Configuration Reactivity**
    - **Validates: Requirements 14.6**
    - Test that config changes trigger re-render with updated content
  
  - [x] 14.4 Write property test for invalid configuration handling
    - **Property 45: Invalid Configuration Handling**
    - **Validates: Requirements 18.3, 18.5**
    - Test that invalid configs log errors and don't cause JavaScript errors
  
  - [x] 14.5 Write property test for missing URL fallback
    - **Property 46: Missing URL Fallback**
    - **Validates: Requirements 18.4**
    - Test that items with missing hrefs render as non-interactive text
  
  - [x] 14.6 Write unit tests for configuration validation
    - Test validation catches out-of-range item counts
    - Test validation catches missing required fields
    - Test error logging works correctly
    - _Requirements: 14.1, 14.2, 14.3, 18.3_

- [x] 15. Checkpoint - Ensure configuration and accessibility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Implement styling and visual design
  - [x] 16.1 Create Tailwind CSS styles for all components
    - Style navigation bar with white background and shadow
    - Style navigation items with hover and active states
    - Style dropdown panel with white background and shadow
    - Style three-column grid layout with equal widths
    - Style category links with hover effects
    - Style programme hierarchy with indentation and font weights
    - Style featured cards with 16:9 images and hover scale
    - Implement responsive breakpoints (mobile, tablet, desktop)
    - Add smooth transitions for all interactive states
    - _Requirements: 1.5, 2.1, 2.5, 3.5, 4.2, 4.4, 5.2, 5.3, 5.4, 6.5, 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 16.2 Write property test for hover feedback timing
    - **Property 26: Hover Feedback Timing**
    - **Validates: Requirements 11.5**
    - Test that hover state transitions complete within 150ms
  
  - [x] 16.3 Write unit tests for styling
    - Test navigation bar has fixed position
    - Test dropdown panel aligns with navigation bar left edge
    - Test z-index values are correct
    - _Requirements: 1.4, 3.6, 19.1, 19.2, 19.4_

- [ ] 17. Implement performance optimizations
  - [x] 17.1 Add performance optimizations
    - Implement lazy loading for featured images
    - Use React.memo for column components
    - Optimize re-renders with useMemo and useCallback
    - Ensure component loads within 500ms
    - Ensure dropdown content renders within 100ms
    - Ensure images load within 1000ms when dropdown opens
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 17.2 Write unit tests for performance
    - Test component loads within 500ms
    - Test dropdown renders within 100ms
    - Test lazy loading is applied correctly
    - _Requirements: 13.1, 13.2, 13.4_

- [ ] 18. Implement error handling and edge cases
  - [x] 18.1 Add error handling for all edge cases
    - Handle image load failures with placeholder
    - Handle empty column content with fallback messages
    - Handle invalid configurations with error logging
    - Handle missing URLs with non-interactive text
    - Ensure errors don't break other page functionality
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 18.2 Write property test for empty column fallback
    - **Property 44: Empty Column Fallback**
    - **Validates: Requirements 18.2**
    - Test that empty columns display fallback message
  
  - [-] 18.3 Write unit tests for error handling
    - Test JavaScript errors are caught and logged
    - Test error handling doesn't break page functionality
    - _Requirements: 18.5_

- [ ] 19. Implement reduced motion support
  - [x] 19.1 Add prefers-reduced-motion support
    - Detect prefers-reduced-motion media query
    - Disable or reduce animations when enabled
    - Ensure functionality works without animations
    - _Requirements: 12.5_
  
  - [x] 19.2 Write property test for reduced motion
    - **Property 29: Reduced Motion Respect**
    - **Validates: Requirements 12.5**
    - Test that animations are disabled when prefers-reduced-motion is enabled

- [ ] 20. Implement z-index and layering
  - [x] 20.1 Add z-index management
    - Set dropdown panel z-index above standard content
    - Set dropdown panel z-index below modals
    - Ensure most recent panel appears on top
    - Set navigation bar z-index above scrolling content
    - _Requirements: 19.1, 19.2, 19.3, 19.4_
  
  - [x] 20.2 Write property test for z-index layering
    - **Property 47: Z-Index Layering**
    - **Validates: Requirements 19.1, 19.2, 19.4**
    - Test that dropdown has correct z-index relative to other elements
  
  - [x] 20.3 Write property test for most recent panel on top
    - **Property 48: Most Recent Panel On Top**
    - **Validates: Requirements 19.3**
    - Test that most recently opened panel has highest z-index

- [x] 21. Checkpoint - Ensure all feature tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Create example configurations and documentation
  - [x] 22.1 Create example configuration files
    - Create example config for "Emergency News" menu
    - Create example config for "Analysis" menu
    - Create example config for "Resources" menu
    - Document configuration structure and validation rules
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 22.2 Write component usage documentation
    - Document how to use MegaMenu component
    - Document how to create configurations
    - Document accessibility features
    - Document responsive behavior
    - Document browser compatibility

- [ ] 23. Integration and wiring
  - [x] 23.1 Integrate MegaMenu into navigation bar
    - Import MegaMenu components into main navigation
    - Wire up example configurations to navigation items
    - Test multi-instance support with multiple menus
    - Verify all navigation items work correctly
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 15.1, 15.2, 15.3, 15.4_
  
  - [x] 23.2 Write property test for multi-instance scale
    - **Property 35: Multi-Instance Scale Support**
    - **Validates: Requirements 15.4**
    - Test that system supports up to 10 different configs simultaneously
  
  - [x] 23.3 Write property test for fallback link behavior
    - **Property 34: Fallback Link Behavior**
    - **Validates: Requirements 15.3**
    - Test that navigation items without configs function as standard links
  
  - [x] 23.4 Write property test for internal link click closes menu
    - **Property 37: Internal Link Click Closes Menu**
    - **Validates: Requirements 16.3**
    - Test that clicking links within dropdown closes the menu
  
  - [x] 23.5 Write property test for click detection timing
    - **Property 38: Click Detection Activation Timing**
    - **Validates: Requirements 16.5**
    - Test that click-outside detection activates within 50ms
  
  - [x] 23.6 Write integration tests
    - Test complete user flows (hover, click, keyboard navigation)
    - Test switching between multiple menus
    - Test responsive behavior at different breakpoints
    - Test accessibility with screen reader simulation
    - _Requirements: 15.5, 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 24. Final checkpoint - Ensure all tests pass
  - Run complete test suite
  - Verify all property tests pass
  - Verify all unit tests pass
  - Verify all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout implementation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation uses TypeScript, React 18, and Tailwind CSS as specified in the design
- Testing uses Jest, React Testing Library, and fast-check for property-based testing
- Focus on accessibility-first approach with full keyboard navigation and screen reader support
- Performance optimizations include lazy loading, memoization, and efficient re-renders
- Error handling ensures graceful degradation when data is incomplete or invalid

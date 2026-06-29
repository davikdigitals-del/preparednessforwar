# Bugfix Design Document

## Overview

This document specifies the technical design for fixing the mega menu hover switching issue. The solution centralizes close timer management in the MegaMenuContext, allowing new triggers to cancel pending close timers when the user switches between menu items.

## Design Approach

### Solution Strategy

The fix implements **centralized close timer management** with the following approach:

1. **Move close timer to context**: Store the close timer reference in MegaMenuContext instead of individual triggers
2. **Expose timer cancellation**: Provide a method to cancel the pending close timer
3. **Immediate switching**: When hovering over a new trigger while a menu is open, cancel any pending close timer and open the new menu immediately (no 200ms delay)
4. **Preserve existing behavior**: Keep all other interactions unchanged (single trigger hover, click, hover away to empty space)

### Alternative Approaches Considered

**Alternative 1: Reduce close delay to less than open delay**
- Change close delay from 300ms to 150ms
- **Rejected**: Would make the menu close too quickly when hovering away, degrading UX

**Alternative 2: Coordinate timers between triggers**
- Have triggers communicate with each other to cancel timers
- **Rejected**: Complex, requires trigger registry and inter-component communication

**Alternative 3: Use a single shared timer for all operations**
- Manage all timing logic centrally in context
- **Rejected**: Over-engineered for this specific bug, would require major refactoring

**Selected Approach**: Centralized close timer management
- **Pros**: Minimal changes, solves the specific bug, maintains existing architecture
- **Cons**: Slightly increases context complexity
- **Justification**: Simplest solution that directly addresses the root cause

## Technical Specification

### Modified Components

#### 1. MegaMenuContext.tsx

**Changes Required**:

```typescript
// Add close timer ref to context state
const closeTimerRef = useRef<number | null>(null);

// Modify closeMenu to use the centralized timer
const closeMenu = useCallback(() => {
  // Clear any pending close timer
  if (closeTimerRef.current !== null) {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }
  
  setActiveMenuId(null);
  setIsHovering(false);
  setIsFocused(false);
}, []);

// Add new method to schedule a delayed close
const scheduleClose = useCallback((delay: number) => {
  // Clear any existing close timer
  if (closeTimerRef.current !== null) {
    window.clearTimeout(closeTimerRef.current);
  }
  
  // Schedule new close timer
  closeTimerRef.current = window.setTimeout(() => {
    closeMenu();
    closeTimerRef.current = null;
  }, delay);
}, [closeMenu]);

// Add new method to cancel pending close
const cancelScheduledClose = useCallback(() => {
  if (closeTimerRef.current !== null) {
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }
}, []);

// Update context value to include new methods
const contextValue: MegaMenuContextValue = {
  activeMenuId,
  openMenu,
  closeMenu,
  scheduleClose,
  cancelScheduledClose,
  registerMenu,
  unregisterMenu,
  isHovering,
  setIsHovering,
  isFocused,
  setIsFocused,
  getMenuConfig,
};
```

**Cleanup on unmount**:
```typescript
useEffect(() => {
  return () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
  };
}, []);
```

#### 2. types.ts

**Changes Required**:

```typescript
export interface MegaMenuContextValue {
  activeMenuId: string | null;
  openMenu: (menuId: string) => void;
  closeMenu: () => void;
  scheduleClose: (delay: number) => void;      // NEW
  cancelScheduledClose: () => void;            // NEW
  registerMenu: (menuId: string, config: MegaMenuConfig) => void;
  unregisterMenu: (menuId: string) => void;
  isHovering: boolean;
  setIsHovering: (isHovering: boolean) => void;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  getMenuConfig: (menuId: string) => MegaMenuConfig | undefined;
}
```

#### 3. MegaMenuTrigger.tsx

**Changes Required**:

```typescript
// Remove local hoverCloseTimerRef (no longer needed)
// Keep hoverOpenTimerRef for the open delay

const {
  activeMenuId,
  openMenu,
  closeMenu,
  scheduleClose,           // NEW
  cancelScheduledClose,    // NEW
} = useMegaMenuContext();

// Modified handleMouseEnter
const handleMouseEnter = () => {
  // Cancel any pending close timer (from any trigger)
  cancelScheduledClose();
  
  // Clear any pending open timer for this trigger
  if (hoverOpenTimerRef.current !== null) {
    window.clearTimeout(hoverOpenTimerRef.current);
    hoverOpenTimerRef.current = null;
  }
  
  // If a menu is already open, switch immediately (no delay)
  if (activeMenuId !== null && activeMenuId !== menuId) {
    openMenu(menuId);
  } else if (activeMenuId === null) {
    // No menu open, use normal 200ms delay
    hoverOpenTimerRef.current = window.setTimeout(() => {
      openMenu(menuId);
      hoverOpenTimerRef.current = null;
    }, DEFAULT_TIMER_CONFIG.hoverOpenDelay);
  }
  // If this menu is already active, do nothing
};

// Modified handleMouseLeave
const handleMouseLeave = () => {
  // Clear any pending open timer
  if (hoverOpenTimerRef.current !== null) {
    window.clearTimeout(hoverOpenTimerRef.current);
    hoverOpenTimerRef.current = null;
  }
  
  // Schedule close using centralized timer (300ms delay)
  if (isActive) {
    scheduleClose(DEFAULT_TIMER_CONFIG.hoverCloseDelay);
  }
};

// Modified handleClick (cancel scheduled close)
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  // Clear any pending timers
  if (hoverOpenTimerRef.current !== null) {
    window.clearTimeout(hoverOpenTimerRef.current);
    hoverOpenTimerRef.current = null;
  }
  cancelScheduledClose();
  
  // Toggle menu
  if (isActive) {
    closeMenu();
  } else {
    openMenu(menuId);
  }
  
  if (!href) {
    e.preventDefault();
  }
};

// Cleanup only needs to clear hoverOpenTimerRef
useEffect(() => {
  return () => {
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
    }
  };
}, []);
```

### Behavior Specification

#### Scenario 1: Switching Between Triggers (Bug Fix)

```
Initial: No menu open
1. User hovers "News" → starts 200ms open timer
2. After 200ms → "News" menu opens
3. User moves to "Programmes" trigger
4. "News" mouseLeave → schedules 300ms close
5. "Programmes" mouseEnter → cancels scheduled close, opens "Programmes" immediately
Result: Menu switches from "News" to "Programmes" without disappearing ✓
```

#### Scenario 2: Hover Single Trigger (Preserved)

```
Initial: No menu open
1. User hovers "News" → starts 200ms open timer
2. After 200ms → "News" menu opens
3. User hovers away to empty space → schedules 300ms close
4. After 300ms → menu closes
Result: Same as before ✓
```

#### Scenario 3: Click Interaction (Preserved)

```
Initial: No menu open
1. User clicks "News" → opens immediately (no delay)
2. User clicks "News" again → closes immediately
Result: Same as before ✓
```

#### Scenario 4: Rapid Switching

```
Initial: "News" menu open
1. User moves to "Programmes" → cancels close, opens "Programmes" immediately
2. User moves to "About" → cancels close, opens "About" immediately
3. User moves to "Contact" → cancels close, opens "Contact" immediately
Result: Smooth switching between all menus ✓
```

## Implementation Checklist

### Phase 1: Context Updates
- [ ] Add `closeTimerRef` to MegaMenuContext
- [ ] Implement `scheduleClose(delay)` method
- [ ] Implement `cancelScheduledClose()` method
- [ ] Update `closeMenu()` to clear the timer
- [ ] Add cleanup effect for timer on unmount
- [ ] Update `MegaMenuContextValue` type in types.ts

### Phase 2: Trigger Updates
- [ ] Remove `hoverCloseTimerRef` from MegaMenuTrigger
- [ ] Import `scheduleClose` and `cancelScheduledClose` from context
- [ ] Update `handleMouseEnter` to cancel scheduled close
- [ ] Update `handleMouseEnter` to switch immediately when menu is open
- [ ] Update `handleMouseLeave` to use `scheduleClose`
- [ ] Update `handleClick` to use `cancelScheduledClose`
- [ ] Update cleanup effect to only clear `hoverOpenTimerRef`

### Phase 3: Testing
- [ ] Test switching between two triggers
- [ ] Test switching between three or more triggers rapidly
- [ ] Test hover single trigger (unchanged behavior)
- [ ] Test hover away to empty space (unchanged behavior)
- [ ] Test click to open (unchanged behavior)
- [ ] Test click to close (unchanged behavior)
- [ ] Test hover over menu content (unchanged behavior)

## Risk Assessment

### Low Risk
- Changes are localized to timer management
- No changes to rendering logic or styles
- No changes to accessibility features

### Medium Risk
- Timer coordination logic is critical for UX
- Need to ensure no memory leaks from uncancelled timers

### Mitigation
- Comprehensive testing of all interaction scenarios
- Verify cleanup effects properly clear all timers
- Test rapid switching to ensure no timer accumulation

## Success Criteria

1. **Bug Fixed**: Moving between menu triggers switches content immediately without menu disappearing
2. **No Regressions**: All existing behaviors (single trigger hover, click, hover away) work identically
3. **No Memory Leaks**: All timers are properly cleaned up on unmount
4. **Smooth UX**: Menu switching feels instant and responsive

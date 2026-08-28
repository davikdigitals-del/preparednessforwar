# Bugfix Requirements Document

## Introduction

This document specifies the requirements for fixing the mega menu hover switching issue. Currently, when a user hovers from one mega menu trigger to another, the menu disappears completely before the new menu opens, creating a jarring user experience. The fix will ensure smooth content switching without the menu closing and reopening.

**Impact**: This bug affects the primary navigation experience, causing visual disruption and making the interface feel unresponsive when users explore different menu options.

**Scope**: The fix applies to the MegaMenuTrigger component and its interaction with the MegaMenuContext timer management system.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user hovers over the first menu trigger (e.g., "News") for 200ms and then moves the mouse to a second menu trigger (e.g., "Programmes") THEN the system closes the first menu completely before opening the second menu, causing a visible disappearance

1.2 WHEN a user hovers from one active menu trigger to another menu trigger THEN the system starts a 300ms close timer for the first menu and a 200ms open timer for the second menu, resulting in the close timer firing first and closing the menu before the new menu can open

1.3 WHEN multiple menu triggers are present and the user moves between them THEN each trigger's local timers (hoverOpenTimerRef, hoverCloseTimerRef) operate independently without coordination, causing timer conflicts

### Expected Behavior (Correct)

2.1 WHEN a user hovers over the first menu trigger (e.g., "News") for 200ms and then moves the mouse to a second menu trigger (e.g., "Programmes") THEN the system SHALL switch the menu content immediately to show the second menu's content without the menu disappearing

2.2 WHEN a user hovers from one active menu trigger to another menu trigger THEN the system SHALL cancel any pending close timers from the first trigger and open the second menu immediately, preventing the menu from closing

2.3 WHEN multiple menu triggers are present and the user moves between them THEN the system SHALL coordinate timer management centrally to prevent timer conflicts and ensure smooth menu switching

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user hovers over a menu trigger for 200ms without moving to another trigger THEN the system SHALL CONTINUE TO open the menu after the 200ms delay

3.2 WHEN a user hovers away from a menu trigger into empty space (not another trigger) for 300ms THEN the system SHALL CONTINUE TO close the menu after the 300ms delay

3.3 WHEN a user clicks on a menu trigger THEN the system SHALL CONTINUE TO open the menu immediately without delay

3.4 WHEN a user clicks on an active menu trigger THEN the system SHALL CONTINUE TO close the menu immediately

3.5 WHEN a menu is open and the user hovers over the menu content itself THEN the system SHALL CONTINUE TO keep the menu open without closing

3.6 WHEN only one menu trigger is present and the user interacts with it THEN the system SHALL CONTINUE TO function with the existing 200ms open delay and 300ms close delay

## Bug Condition Derivation

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type UserInteraction
  OUTPUT: boolean
  
  // Returns true when the bug condition is met
  // X.currentActiveMenu: the menu currently open (or null)
  // X.sourceTriggerId: the trigger being left
  // X.targetTriggerId: the trigger being entered
  // X.timeSinceLeave: time elapsed since leaving source trigger
  
  RETURN (X.currentActiveMenu IS NOT NULL) AND
         (X.sourceTriggerId IS NOT NULL) AND
         (X.targetTriggerId IS NOT NULL) AND
         (X.sourceTriggerId ≠ X.targetTriggerId) AND
         (X.timeSinceLeave < 300ms)
END FUNCTION
```

**Explanation**: The bug occurs when:
- A menu is currently open (currentActiveMenu is not null)
- The user is moving from one trigger to another (both source and target exist and are different)
- The movement happens within the 300ms close delay window

### Property Specification

```pascal
// Property: Fix Checking - Smooth Menu Switching
FOR ALL X WHERE isBugCondition(X) DO
  result ← handleTriggerSwitch'(X)
  ASSERT (menu_remains_visible(result)) AND
         (menu_content_switches_to(result, X.targetTriggerId)) AND
         (no_close_timer_fires(result))
END FOR
```

**Explanation**: For all interactions where the user switches between menu triggers while a menu is open, the fixed system must:
- Keep the menu visible (no disappearing)
- Switch the content to show the target menu
- Prevent the close timer from the source trigger from firing

### Preservation Property

```pascal
// Property: Preservation Checking - Existing Behavior Unchanged
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

**Explanation**: For all interactions that do NOT involve switching between triggers (e.g., hovering over a single trigger, hovering away to empty space, clicking), the behavior must remain identical to the original implementation.

### Counterexample

**Concrete example demonstrating the bug**:

```
Initial State: No menu open
1. User hovers over "News" trigger
2. After 200ms: "News" menu opens
3. User moves mouse to "Programmes" trigger (at t=250ms)
4. "News" trigger's mouseLeave fires → starts 300ms close timer (will fire at t=550ms)
5. "Programmes" trigger's mouseEnter fires → starts 200ms open timer (will fire at t=450ms)
6. At t=450ms: Open timer tries to open "Programmes" menu
7. At t=550ms: Close timer fires and closes the menu
8. Result: Menu disappears between t=550ms and when user hovers again

Expected behavior: At step 5, the close timer should be cancelled, and "Programmes" menu should open immediately or after 200ms without the menu ever closing.
```

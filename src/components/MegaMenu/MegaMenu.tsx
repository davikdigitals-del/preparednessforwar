/**
 * MegaMenu - Container component for mega menu navigation
 * 
 * This component wraps the entire mega menu system, providing context and handling
 * click-outside detection. It coordinates multiple menu instances to ensure only
 * one menu is open at a time.
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 16.1, 16.2
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { MegaMenuProvider, useMegaMenuContext } from './MegaMenuContext';
import type { MegaMenuProps } from './types';

/**
 * Internal component that uses the context
 * Separated to allow the provider to wrap it
 */
function MegaMenuInner({ children, onOpenChange, defaultOpen }: MegaMenuProps) {
  const { activeMenuId, closeMenu, openMenu } = useMegaMenuContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const clickOutsideTimerRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  // Handle defaultOpen prop
  useEffect(() => {
    if (defaultOpen && !isInitializedRef.current) {
      // Note: defaultOpen would need a menuId to work properly
      // This is a placeholder for the functionality
      isInitializedRef.current = true;
    }
  }, [defaultOpen, openMenu]);

  // Notify parent of open state changes
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(activeMenuId !== null);
    }
  }, [activeMenuId, onOpenChange]);

  /**
   * Handle click outside to close menu
   * Requirements: 16.1, 16.2
   * 
   * Activates within 50ms of menu opening (Requirement 16.5)
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Only handle if a menu is open
    if (activeMenuId === null) {
      return;
    }

    const target = event.target as Node;
    
    // Check if click is outside the container
    if (containerRef.current && !containerRef.current.contains(target)) {
      closeMenu();
    }
  }, [activeMenuId, closeMenu]);

  /**
   * Set up click-outside detection when menu opens
   * Activates within 50ms (Requirement 16.5)
   */
  useEffect(() => {
    if (activeMenuId !== null) {
      // Clear any existing timer
      if (clickOutsideTimerRef.current !== null) {
        window.clearTimeout(clickOutsideTimerRef.current);
      }

      // Activate click-outside detection within 50ms
      clickOutsideTimerRef.current = window.setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        clickOutsideTimerRef.current = null;
      }, 50);
    } else {
      // Clean up when menu closes
      document.removeEventListener('mousedown', handleClickOutside);
      
      if (clickOutsideTimerRef.current !== null) {
        window.clearTimeout(clickOutsideTimerRef.current);
        clickOutsideTimerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (clickOutsideTimerRef.current !== null) {
        window.clearTimeout(clickOutsideTimerRef.current);
      }
    };
  }, [activeMenuId, handleClickOutside]);

  return (
    <div ref={containerRef} className="mega-menu-container">
      {children}
    </div>
  );
}

/**
 * MegaMenu container component
 * 
 * Wraps children with MegaMenuContext provider and handles click-outside detection.
 * Ensures only one menu is open at a time through context coordination.
 * 
 * @param props - MegaMenuProps
 * @param props.children - Child components (typically MegaMenuTrigger and MegaMenuContent)
 * @param props.onOpenChange - Optional callback when menu open state changes
 * @param props.defaultOpen - Optional flag to open menu by default
 * 
 * @example
 * ```tsx
 * <MegaMenu onOpenChange={(isOpen) => console.log('Menu open:', isOpen)}>
 *   <MegaMenuTrigger menuId="news" label="News" />
 *   <MegaMenuContent menuId="news" config={newsConfig} />
 * </MegaMenu>
 * ```
 */
export function MegaMenu({ children, onOpenChange, defaultOpen }: MegaMenuProps) {
  return (
    <MegaMenuProvider>
      <MegaMenuInner onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
        {children}
      </MegaMenuInner>
    </MegaMenuProvider>
  );
}

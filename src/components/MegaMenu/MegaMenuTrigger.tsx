/**
 * MegaMenuTrigger - Navigation item that triggers the mega menu dropdown
 * 
 * This component renders a navigation link with hover and click handling,
 * managing timing delays and ARIA attributes for accessibility.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 11.4
 */

import React, { useRef, useEffect } from 'react';
import { useMegaMenuContext } from './MegaMenuContext';
import { DEFAULT_TIMER_CONFIG } from './types';
import { ChevronDown } from 'lucide-react';
import type { MegaMenuTriggerProps } from './types';

/**
 * MegaMenuTrigger component
 * 
 * Responsibilities:
 * - Render navigation link with proper ARIA attributes
 * - Handle hover events with 200ms delay for opening
 * - Handle click events for immediate opening
 * - Handle hover-away detection with 300ms delay for closing
 * - Display active state when dropdown is open
 * - Display hover state on cursor entry
 * 
 * @param props - Component props
 * @returns Navigation trigger element
 */
export function MegaMenuTrigger({
  menuId,
  label,
  href,
  className = '',
  children,
}: MegaMenuTriggerProps) {
  const {
    activeMenuId,
    openMenu,
    closeMenu,
    scheduleClose,
    cancelScheduledClose,
  } = useMegaMenuContext();

  // Timer ref for hover open delay only
  // Close timer is now managed centrally in context
  const hoverOpenTimerRef = useRef<number | null>(null);

  // Track if this menu is currently active
  const isActive = activeMenuId === menuId;

  /**
   * Clear open timer on unmount
   * Close timer is managed by context
   */
  useEffect(() => {
    return () => {
      if (hoverOpenTimerRef.current !== null) {
        window.clearTimeout(hoverOpenTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle mouse enter event
   * - Cancels any pending close timer from other triggers
   * - If a menu is already open, switches immediately (no delay)
   * - If no menu is open, starts 200ms timer to open
   * Requirement 2.2: Hover for 200ms opens dropdown
   * Bugfix: Immediate switching between triggers
   */
  const handleMouseEnter = () => {
    // Cancel any pending close timer (from any trigger)
    cancelScheduledClose();

    // Clear any pending open timer for this trigger
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }

    // If a different menu is already open, switch immediately (no delay)
    if (activeMenuId !== null && activeMenuId !== menuId) {
      openMenu(menuId);
    } 
    // If no menu is open, use normal 200ms delay
    else if (activeMenuId === null) {
      hoverOpenTimerRef.current = window.setTimeout(() => {
        openMenu(menuId);
        hoverOpenTimerRef.current = null;
      }, DEFAULT_TIMER_CONFIG.hoverOpenDelay);
    }
    // If this menu is already active, do nothing
  };

  /**
   * Handle mouse leave event
   * Schedules menu close using centralized timer (300ms delay)
   * Requirement 2.4: Hover away for 300ms closes dropdown
   */
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

  /**
   * Handle click event
   * Opens menu immediately without delay
   * Requirement 2.3: Click opens dropdown immediately
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Clear any pending timers
    if (hoverOpenTimerRef.current !== null) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    cancelScheduledClose();

    // If menu is already open, close it; otherwise open immediately
    if (isActive) {
      closeMenu();
    } else {
      openMenu(menuId);
    }

    // Prevent default navigation if href is not provided
    if (!href) {
      e.preventDefault();
    }
  };

  /**
   * Compute CSS classes for the trigger
   * - Base styles
   * - Hover state (Requirement 2.1)
   * - Active state (Requirement 2.5)
   */
  const triggerClasses = [
    // Base styles
    'inline-flex items-center justify-center',
    'px-2.5 py-2',
    'text-xs font-medium',
    'transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Hover state
    'hover:bg-gray-100 hover:text-gray-900',
    // Active state
    isActive && 'bg-gray-100 text-gray-900 border-b-2 border-blue-600',
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href || '#'}
      className={triggerClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-expanded={isActive}
      aria-haspopup="true"
      aria-controls={`mega-menu-${menuId}`}
      role="button"
    >
      {children || label}
      <ChevronDown className={`ml-1 w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
    </a>
  );
}

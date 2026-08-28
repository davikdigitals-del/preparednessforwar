/**
 * MegaMenuContext - State management for mega menu navigation
 * 
 * This context provides centralized state management for multiple mega menu instances,
 * ensuring only one menu is open at a time and coordinating hover/focus interactions.
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 15.1, 15.2
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { MegaMenuContextValue, MegaMenuConfig } from './types';

/**
 * Context for mega menu state management
 */
const MegaMenuContext = createContext<MegaMenuContextValue | undefined>(undefined);

/**
 * Props for MegaMenuProvider
 */
interface MegaMenuProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages mega menu state
 * 
 * Responsibilities:
 * - Track which menu is currently open (activeMenuId)
 * - Coordinate multiple menu instances (only one open at a time)
 * - Manage menu registration for configuration lookup
 * - Track hover and focus state for interaction logic
 */
export function MegaMenuProvider({ children }: MegaMenuProviderProps) {
  // Track which menu is currently open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Track hover state for delay logic
  const [isHovering, setIsHovering] = useState(false);
  
  // Track focus state for keyboard navigation
  const [isFocused, setIsFocused] = useState(false);
  
  // Registry of menu configurations by menuId
  const menuRegistry = useRef<Map<string, MegaMenuConfig>>(new Map());
  
  // Centralized close timer for coordinating between triggers
  const closeTimerRef = useRef<number | null>(null);

  /**
   * Open a menu by its ID
   * Closes any currently open menu first (only one menu open at a time)
   * 
   * @param menuId - Unique identifier for the menu to open
   */
  const openMenu = useCallback((menuId: string) => {
    setActiveMenuId(menuId);
    setIsHovering(true);
  }, []);

  /**
   * Close the currently open menu
   * Resets hover and focus state and clears any pending close timer
   */
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

  /**
   * Schedule a delayed close of the menu
   * Cancels any existing scheduled close before scheduling a new one
   * 
   * @param delay - Delay in milliseconds before closing
   */
  const scheduleClose = useCallback((delay: number) => {
    // Clear any existing close timer
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    
    // Schedule new close timer
    closeTimerRef.current = window.setTimeout(() => {
      setActiveMenuId(null);
      setIsHovering(false);
      setIsFocused(false);
      closeTimerRef.current = null;
    }, delay);
  }, []);

  /**
   * Cancel any pending scheduled close
   * Used when switching between triggers to prevent menu from closing
   */
  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  /**
   * Register a menu configuration
   * Allows the context to track available menus and their configs
   * 
   * @param menuId - Unique identifier for the menu
   * @param config - Configuration object for the menu
   */
  const registerMenu = useCallback((menuId: string, config: MegaMenuConfig) => {
    menuRegistry.current.set(menuId, config);
  }, []);

  /**
   * Unregister a menu configuration
   * Called when a menu component unmounts
   * 
   * @param menuId - Unique identifier for the menu to unregister
   */
  const unregisterMenu = useCallback((menuId: string) => {
    menuRegistry.current.delete(menuId);
    
    // If the unregistered menu was active, close it
    if (activeMenuId === menuId) {
      closeMenu();
    }
  }, [activeMenuId, closeMenu]);

  /**
   * Get the configuration for a specific menu
   * Internal helper for components that need config lookup
   * 
   * @param menuId - Unique identifier for the menu
   * @returns The menu configuration or undefined if not found
   */
  const getMenuConfig = useCallback((menuId: string): MegaMenuConfig | undefined => {
    return menuRegistry.current.get(menuId);
  }, []);

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const contextValue: MegaMenuContextValue = {
    activeMenuId,
    openMenu,
    closeMenu,
    scheduleClose,
    cancelScheduledClose,
    registerMenu,
    unregisterMenu,
    // Internal state exposed for components that need it
    isHovering,
    setIsHovering,
    isFocused,
    setIsFocused,
    getMenuConfig,
  };

  return (
    <MegaMenuContext.Provider value={contextValue}>
      {children}
    </MegaMenuContext.Provider>
  );
}

/**
 * Hook to access mega menu context
 * 
 * @throws Error if used outside of MegaMenuProvider
 * @returns MegaMenuContextValue
 */
export function useMegaMenuContext(): MegaMenuContextValue {
  const context = useContext(MegaMenuContext);
  
  if (context === undefined) {
    throw new Error('useMegaMenuContext must be used within a MegaMenuProvider');
  }
  
  return context;
}

/**
 * Export the context for testing purposes
 */
export { MegaMenuContext };

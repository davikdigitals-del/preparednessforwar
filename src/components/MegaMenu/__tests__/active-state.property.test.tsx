/**
 * Property-based tests for Active State Synchronization
 * **Validates: Requirements 2.5**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderHook, act } from '@testing-library/react';
import { MegaMenuProvider, useMegaMenuContext } from '../MegaMenuContext';

/**
 * Wrapper component for testing hooks
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MegaMenuProvider>{children}</MegaMenuProvider>
);

/**
 * Arbitrary generator for menu IDs
 * Generates valid menu ID strings
 */
const arbMenuId = (): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength: 50 });

describe('Active State Synchronization Property Tests', () => {
  /**
   * Property 5: Active State Synchronization
   * For any Navigation_Item, when its Dropdown_Panel is open, 
   * the Navigation_Item SHALL display an Active_State.
   * 
   * This property validates that the context correctly synchronizes the active state:
   * - When activeMenuId is set to a specific menu ID, that menu should be considered active
   * - When activeMenuId is null, no menu should be considered active
   * - The active state should update immediately when opening/closing menus
   * 
   * **Validates: Requirements 2.5**
   */
  it('Property 5: when a dropdown is open, the corresponding navigation item shows active state', () => {
    fc.assert(
      fc.property(arbMenuId(), (menuId: string) => {
        const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
        
        // Initially, no menu should be active
        expect(result.current.activeMenuId).toBeNull();
        
        // Open the menu with the generated menuId
        act(() => {
          result.current.openMenu(menuId);
        });
        
        // The activeMenuId should now match the opened menu
        // This indicates the navigation item should display active state
        expect(result.current.activeMenuId).toBe(menuId);
        
        // The menu should be considered active (not null)
        expect(result.current.activeMenuId).not.toBeNull();
        
        // Close the menu
        act(() => {
          result.current.closeMenu();
        });
        
        // After closing, no menu should be active
        expect(result.current.activeMenuId).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5 (Extended): Active state synchronization with multiple menus
   * When switching between multiple menus, only the most recently opened menu
   * should be active (only one menu can be active at a time)
   * 
   * **Validates: Requirements 2.5, 15.1, 15.2**
   */
  it('Property 5 (Extended): only one menu shows active state at a time', () => {
    fc.assert(
      fc.property(
        fc.array(arbMenuId(), { minLength: 2, maxLength: 5 }),
        (menuIds: string[]) => {
          const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
          
          // Open each menu in sequence
          for (let i = 0; i < menuIds.length; i++) {
            const currentMenuId = menuIds[i];
            
            act(() => {
              result.current.openMenu(currentMenuId);
            });
            
            // Only the current menu should be active
            expect(result.current.activeMenuId).toBe(currentMenuId);
            
            // Verify that previous menus are no longer active
            for (let j = 0; j < i; j++) {
              const previousMenuId = menuIds[j];
              expect(result.current.activeMenuId).not.toBe(previousMenuId);
            }
          }
          
          // After closing, no menu should be active
          act(() => {
            result.current.closeMenu();
          });
          
          expect(result.current.activeMenuId).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5 (Idempotence): Opening the same menu multiple times
   * Opening an already-open menu should maintain the active state
   * 
   * **Validates: Requirements 2.5**
   */
  it('Property 5 (Idempotence): opening an already-open menu maintains active state', () => {
    fc.assert(
      fc.property(arbMenuId(), (menuId: string) => {
        const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
        
        // Open the menu
        act(() => {
          result.current.openMenu(menuId);
        });
        
        expect(result.current.activeMenuId).toBe(menuId);
        
        // Open the same menu again
        act(() => {
          result.current.openMenu(menuId);
        });
        
        // The menu should still be active
        expect(result.current.activeMenuId).toBe(menuId);
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5 (State Consistency): Active state consistency with hover state
   * When a menu is opened, both activeMenuId and isHovering should be synchronized
   * 
   * **Validates: Requirements 2.5**
   */
  it('Property 5 (State Consistency): active state is synchronized with hover state', () => {
    fc.assert(
      fc.property(arbMenuId(), (menuId: string) => {
        const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
        
        // Open the menu
        act(() => {
          result.current.openMenu(menuId);
        });
        
        // Both activeMenuId and isHovering should be set
        expect(result.current.activeMenuId).toBe(menuId);
        expect(result.current.isHovering).toBe(true);
        
        // Close the menu
        act(() => {
          result.current.closeMenu();
        });
        
        // Both should be cleared
        expect(result.current.activeMenuId).toBeNull();
        expect(result.current.isHovering).toBe(false);
      }),
      { numRuns: 50 }
    );
  });
});

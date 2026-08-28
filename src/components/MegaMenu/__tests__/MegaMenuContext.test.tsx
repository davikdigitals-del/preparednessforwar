/**
 * Unit tests for MegaMenuContext
 * Tests the context provider and state management functions
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 15.1, 15.2
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MegaMenuProvider, useMegaMenuContext } from '../MegaMenuContext';
import { exampleConfig } from './test-utils';
import type { MegaMenuConfig } from '../types';

/**
 * Wrapper component for testing hooks
 */
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MegaMenuProvider>{children}</MegaMenuProvider>
);

describe('MegaMenuContext', () => {
  describe('useMegaMenuContext hook', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useMegaMenuContext());
      }).toThrow('useMegaMenuContext must be used within a MegaMenuProvider');
    });

    it('should provide context value when used inside provider', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current.activeMenuId).toBeNull();
      expect(typeof result.current.openMenu).toBe('function');
      expect(typeof result.current.closeMenu).toBe('function');
      expect(typeof result.current.registerMenu).toBe('function');
      expect(typeof result.current.unregisterMenu).toBe('function');
    });
  });

  describe('openMenu function', () => {
    it('should update activeMenuId correctly', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      expect(result.current.activeMenuId).toBeNull();
      
      act(() => {
        result.current.openMenu('test-menu-1');
      });
      
      expect(result.current.activeMenuId).toBe('test-menu-1');
      expect(result.current.isHovering).toBe(true);
    });

    it('should close previous menu when opening a new one', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.openMenu('test-menu-1');
      });
      
      expect(result.current.activeMenuId).toBe('test-menu-1');
      
      act(() => {
        result.current.openMenu('test-menu-2');
      });
      
      expect(result.current.activeMenuId).toBe('test-menu-2');
    });
  });

  describe('closeMenu function', () => {
    it('should clear activeMenuId', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.openMenu('test-menu-1');
      });
      
      expect(result.current.activeMenuId).toBe('test-menu-1');
      
      act(() => {
        result.current.closeMenu();
      });
      
      expect(result.current.activeMenuId).toBeNull();
      expect(result.current.isHovering).toBe(false);
      expect(result.current.isFocused).toBe(false);
    });
  });

  describe('registerMenu and unregisterMenu functions', () => {
    it('should register a menu configuration', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.registerMenu('test-menu', exampleConfig);
      });
      
      const config = result.current.getMenuConfig('test-menu');
      expect(config).toEqual(exampleConfig);
    });

    it('should unregister a menu configuration', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.registerMenu('test-menu', exampleConfig);
      });
      
      expect(result.current.getMenuConfig('test-menu')).toEqual(exampleConfig);
      
      act(() => {
        result.current.unregisterMenu('test-menu');
      });
      
      expect(result.current.getMenuConfig('test-menu')).toBeUndefined();
    });

    it('should close menu when unregistering active menu', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.registerMenu('test-menu', exampleConfig);
        result.current.openMenu('test-menu');
      });
      
      expect(result.current.activeMenuId).toBe('test-menu');
      
      act(() => {
        result.current.unregisterMenu('test-menu');
      });
      
      expect(result.current.activeMenuId).toBeNull();
    });

    it('should not affect other menus when unregistering', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      const config2: MegaMenuConfig = {
        ...exampleConfig,
        menuId: 'test-menu-2',
      };
      
      act(() => {
        result.current.registerMenu('test-menu-1', exampleConfig);
        result.current.registerMenu('test-menu-2', config2);
      });
      
      expect(result.current.getMenuConfig('test-menu-1')).toEqual(exampleConfig);
      expect(result.current.getMenuConfig('test-menu-2')).toEqual(config2);
      
      act(() => {
        result.current.unregisterMenu('test-menu-1');
      });
      
      expect(result.current.getMenuConfig('test-menu-1')).toBeUndefined();
      expect(result.current.getMenuConfig('test-menu-2')).toEqual(config2);
    });
  });

  describe('hover and focus state management', () => {
    it('should track hover state', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      expect(result.current.isHovering).toBe(false);
      
      act(() => {
        result.current.setIsHovering(true);
      });
      
      expect(result.current.isHovering).toBe(true);
      
      act(() => {
        result.current.setIsHovering(false);
      });
      
      expect(result.current.isHovering).toBe(false);
    });

    it('should track focus state', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      expect(result.current.isFocused).toBe(false);
      
      act(() => {
        result.current.setIsFocused(true);
      });
      
      expect(result.current.isFocused).toBe(true);
      
      act(() => {
        result.current.setIsFocused(false);
      });
      
      expect(result.current.isFocused).toBe(false);
    });

    it('should reset hover and focus state when closing menu', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.openMenu('test-menu');
        result.current.setIsFocused(true);
      });
      
      expect(result.current.isHovering).toBe(true);
      expect(result.current.isFocused).toBe(true);
      
      act(() => {
        result.current.closeMenu();
      });
      
      expect(result.current.isHovering).toBe(false);
      expect(result.current.isFocused).toBe(false);
    });
  });

  describe('multi-instance coordination', () => {
    it('should manage multiple menu registrations', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      const config1: MegaMenuConfig = { ...exampleConfig, menuId: 'menu-1' };
      const config2: MegaMenuConfig = { ...exampleConfig, menuId: 'menu-2' };
      const config3: MegaMenuConfig = { ...exampleConfig, menuId: 'menu-3' };
      
      act(() => {
        result.current.registerMenu('menu-1', config1);
        result.current.registerMenu('menu-2', config2);
        result.current.registerMenu('menu-3', config3);
      });
      
      expect(result.current.getMenuConfig('menu-1')).toEqual(config1);
      expect(result.current.getMenuConfig('menu-2')).toEqual(config2);
      expect(result.current.getMenuConfig('menu-3')).toEqual(config3);
    });

    it('should ensure only one menu is open at a time', () => {
      const { result } = renderHook(() => useMegaMenuContext(), { wrapper });
      
      act(() => {
        result.current.openMenu('menu-1');
      });
      
      expect(result.current.activeMenuId).toBe('menu-1');
      
      act(() => {
        result.current.openMenu('menu-2');
      });
      
      expect(result.current.activeMenuId).toBe('menu-2');
      
      act(() => {
        result.current.openMenu('menu-3');
      });
      
      expect(result.current.activeMenuId).toBe('menu-3');
    });
  });
});

/**
 * Type validation tests for MegaMenu interfaces
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { describe, it, expect } from 'vitest';
import type {
  CategoryItem,
  SubProgramme,
  ProgrammeGroup,
  FeaturedItem,
  MegaMenuConfig,
  MegaMenuProps,
  MegaMenuTriggerProps,
  MegaMenuContentProps,
  CategoriesColumnProps,
  ProgrammesColumnProps,
  FeaturedColumnProps,
  FeaturedCardProps,
  MegaMenuContextValue,
  MenuState,
  TimerConfig,
} from '../types';
import { DEFAULT_TIMER_CONFIG } from '../types';

describe('MegaMenu Types', () => {
  describe('CategoryItem', () => {
    it('should accept valid category item', () => {
      const item: CategoryItem = {
        id: 'cat-1',
        label: 'Category 1',
        href: '/category-1',
      };
      
      expect(item.id).toBe('cat-1');
      expect(item.label).toBe('Category 1');
      expect(item.href).toBe('/category-1');
    });
  });

  describe('SubProgramme', () => {
    it('should accept valid sub-programme', () => {
      const subProgramme: SubProgramme = {
        id: 'sub-1',
        label: 'Sub Programme 1',
        href: '/sub-1',
      };
      
      expect(subProgramme.id).toBe('sub-1');
      expect(subProgramme.label).toBe('Sub Programme 1');
      expect(subProgramme.href).toBe('/sub-1');
    });
  });

  describe('ProgrammeGroup', () => {
    it('should accept programme without sub-programmes', () => {
      const programme: ProgrammeGroup = {
        id: 'prog-1',
        label: 'Programme 1',
        href: '/programme-1',
      };
      
      expect(programme.id).toBe('prog-1');
      expect(programme.subProgrammes).toBeUndefined();
    });

    it('should accept programme with sub-programmes', () => {
      const programme: ProgrammeGroup = {
        id: 'prog-1',
        label: 'Programme 1',
        href: '/programme-1',
        subProgrammes: [
          { id: 'sub-1', label: 'Sub 1', href: '/sub-1' },
          { id: 'sub-2', label: 'Sub 2', href: '/sub-2' },
        ],
      };
      
      expect(programme.subProgrammes).toHaveLength(2);
    });
  });

  describe('FeaturedItem', () => {
    it('should accept featured item with required fields', () => {
      const featured: FeaturedItem = {
        id: 'feat-1',
        title: 'Featured Title',
        description: 'Featured description',
        imageUrl: '/images/featured.jpg',
        href: '/featured-1',
      };
      
      expect(featured.id).toBe('feat-1');
      expect(featured.imageAlt).toBeUndefined();
    });

    it('should accept featured item with optional imageAlt', () => {
      const featured: FeaturedItem = {
        id: 'feat-1',
        title: 'Featured Title',
        description: 'Featured description',
        imageUrl: '/images/featured.jpg',
        href: '/featured-1',
        imageAlt: 'Featured image',
      };
      
      expect(featured.imageAlt).toBe('Featured image');
    });
  });

  describe('MegaMenuConfig', () => {
    it('should accept valid configuration object', () => {
      const config: MegaMenuConfig = {
        menuId: 'test-menu',
        categories: {
          heading: 'Categories',
          items: [
            { id: 'cat-1', label: 'Category 1', href: '/cat-1' },
            { id: 'cat-2', label: 'Category 2', href: '/cat-2' },
            { id: 'cat-3', label: 'Category 3', href: '/cat-3' },
          ],
        },
        programmes: {
          heading: 'Programmes',
          groups: [
            {
              id: 'prog-1',
              label: 'Programme 1',
              href: '/prog-1',
              subProgrammes: [
                { id: 'sub-1', label: 'Sub 1', href: '/sub-1' },
              ],
            },
            {
              id: 'prog-2',
              label: 'Programme 2',
              href: '/prog-2',
            },
          ],
        },
        featured: {
          heading: 'Featured',
          items: [
            {
              id: 'feat-1',
              title: 'Featured 1',
              description: 'Description 1',
              imageUrl: '/images/feat-1.jpg',
              href: '/feat-1',
            },
          ],
        },
      };
      
      expect(config.menuId).toBe('test-menu');
      expect(config.categories.items).toHaveLength(3);
      expect(config.programmes.groups).toHaveLength(2);
      expect(config.featured.items).toHaveLength(1);
    });
  });

  describe('Component Props', () => {
    it('should accept valid MegaMenuProps', () => {
      const props: MegaMenuProps = {
        children: null,
        onOpenChange: (isOpen: boolean) => {},
        defaultOpen: false,
      };
      
      expect(props.defaultOpen).toBe(false);
    });

    it('should accept valid MegaMenuTriggerProps', () => {
      const props: MegaMenuTriggerProps = {
        menuId: 'test-menu',
        label: 'Test Menu',
        href: '/test',
        className: 'custom-class',
      };
      
      expect(props.menuId).toBe('test-menu');
      expect(props.label).toBe('Test Menu');
    });

    it('should accept valid MegaMenuContentProps', () => {
      const config: MegaMenuConfig = {
        menuId: 'test-menu',
        categories: { heading: 'Categories', items: [] },
        programmes: { heading: 'Programmes', groups: [] },
        featured: { heading: 'Featured', items: [] },
      };
      
      const props: MegaMenuContentProps = {
        menuId: 'test-menu',
        config,
        className: 'custom-class',
      };
      
      expect(props.menuId).toBe('test-menu');
      expect(props.config).toBe(config);
    });

    it('should accept valid FeaturedCardProps', () => {
      const props: FeaturedCardProps = {
        title: 'Card Title',
        description: 'Card description',
        imageUrl: '/images/card.jpg',
        href: '/card',
        imageAlt: 'Card image',
        loading: 'lazy',
      };
      
      expect(props.loading).toBe('lazy');
    });
  });

  describe('Context and State', () => {
    it('should accept valid MegaMenuContextValue', () => {
      const contextValue: MegaMenuContextValue = {
        activeMenuId: 'test-menu',
        openMenu: (menuId: string) => {},
        closeMenu: () => {},
        registerMenu: (menuId: string, config: MegaMenuConfig) => {},
        unregisterMenu: (menuId: string) => {},
      };
      
      expect(contextValue.activeMenuId).toBe('test-menu');
    });

    it('should accept valid MenuState', () => {
      const state: MenuState = {
        activeMenuId: 'test-menu',
        hoverTimerId: 123,
        closeTimerId: 456,
        focusedElement: null,
      };
      
      expect(state.hoverTimerId).toBe(123);
      expect(state.closeTimerId).toBe(456);
    });

    it('should accept valid TimerConfig', () => {
      const config: TimerConfig = {
        hoverOpenDelay: 200,
        hoverCloseDelay: 300,
        clickOpenDelay: 0,
      };
      
      expect(config.hoverOpenDelay).toBe(200);
      expect(config.hoverCloseDelay).toBe(300);
      expect(config.clickOpenDelay).toBe(0);
    });
  });

  describe('DEFAULT_TIMER_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_TIMER_CONFIG.hoverOpenDelay).toBe(200);
      expect(DEFAULT_TIMER_CONFIG.hoverCloseDelay).toBe(300);
      expect(DEFAULT_TIMER_CONFIG.clickOpenDelay).toBe(0);
    });
  });
});

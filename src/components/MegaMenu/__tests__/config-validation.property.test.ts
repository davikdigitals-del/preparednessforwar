/**
 * Property-based tests for MegaMenuConfig validation
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  arbMegaMenuConfig,
  arbCategoryItem,
  arbProgrammeGroup,
  arbFeaturedItem,
} from './test-utils';
import type { MegaMenuConfig } from '../types';

describe('MegaMenuConfig Property Tests', () => {
  /**
   * Property 31: Configuration Acceptance
   * For any valid MegaMenuConfig object, the structure should be well-formed
   * **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**
   */
  it('Property 31: valid MegaMenuConfig should have well-formed structure', () => {
    fc.assert(
      fc.property(arbMegaMenuConfig(), (config: MegaMenuConfig) => {
        // Validate menuId exists
        expect(config.menuId).toBeDefined();
        expect(typeof config.menuId).toBe('string');
        expect(config.menuId.length).toBeGreaterThan(0);

        // Validate categories structure (Requirement 14.2)
        expect(config.categories).toBeDefined();
        expect(config.categories.heading).toBeDefined();
        expect(typeof config.categories.heading).toBe('string');
        expect(config.categories.items).toBeDefined();
        expect(Array.isArray(config.categories.items)).toBe(true);
        expect(config.categories.items.length).toBeGreaterThanOrEqual(3);
        expect(config.categories.items.length).toBeLessThanOrEqual(12);

        // Validate each category item has required fields
        config.categories.items.forEach((item) => {
          expect(item.id).toBeDefined();
          expect(item.label).toBeDefined();
          expect(item.href).toBeDefined();
        });

        // Validate programmes structure (Requirement 14.3)
        expect(config.programmes).toBeDefined();
        expect(config.programmes.heading).toBeDefined();
        expect(typeof config.programmes.heading).toBe('string');
        expect(config.programmes.groups).toBeDefined();
        expect(Array.isArray(config.programmes.groups)).toBe(true);
        expect(config.programmes.groups.length).toBeGreaterThanOrEqual(2);
        expect(config.programmes.groups.length).toBeLessThanOrEqual(8);

        // Validate each programme group has required fields
        config.programmes.groups.forEach((group) => {
          expect(group.id).toBeDefined();
          expect(group.label).toBeDefined();
          expect(group.href).toBeDefined();
          
          // If subProgrammes exist, validate them
          if (group.subProgrammes) {
            expect(Array.isArray(group.subProgrammes)).toBe(true);
            group.subProgrammes.forEach((sub) => {
              expect(sub.id).toBeDefined();
              expect(sub.label).toBeDefined();
              expect(sub.href).toBeDefined();
            });
          }
        });

        // Validate featured structure (Requirement 14.4)
        expect(config.featured).toBeDefined();
        expect(config.featured.heading).toBeDefined();
        expect(typeof config.featured.heading).toBe('string');
        expect(config.featured.items).toBeDefined();
        expect(Array.isArray(config.featured.items)).toBe(true);
        expect(config.featured.items.length).toBeGreaterThanOrEqual(1);
        expect(config.featured.items.length).toBeLessThanOrEqual(4);

        // Validate each featured item has required fields
        config.featured.items.forEach((item) => {
          expect(item.id).toBeDefined();
          expect(item.title).toBeDefined();
          expect(item.description).toBeDefined();
          expect(item.imageUrl).toBeDefined();
          expect(item.href).toBeDefined();
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Configuration Item Count Constraints
   * For any valid MegaMenuConfig, item counts should be within specified ranges
   * **Validates: Requirements 4.5, 5.6, 6.6**
   */
  it('Property 8: configuration should respect item count constraints', () => {
    fc.assert(
      fc.property(arbMegaMenuConfig(), (config: MegaMenuConfig) => {
        // Categories: 3-12 items (Requirement 4.5)
        expect(config.categories.items.length).toBeGreaterThanOrEqual(3);
        expect(config.categories.items.length).toBeLessThanOrEqual(12);

        // Programmes: 2-8 groups (Requirement 5.6)
        expect(config.programmes.groups.length).toBeGreaterThanOrEqual(2);
        expect(config.programmes.groups.length).toBeLessThanOrEqual(8);

        // Featured: 1-4 items (Requirement 6.6)
        expect(config.featured.items.length).toBeGreaterThanOrEqual(1);
        expect(config.featured.items.length).toBeLessThanOrEqual(4);
      }),
      { numRuns: 100 }
    );
  });

  it('should generate valid category items', () => {
    fc.assert(
      fc.property(arbCategoryItem(), (item) => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.href).toBeDefined();
        expect(typeof item.id).toBe('string');
        expect(typeof item.label).toBe('string');
        expect(typeof item.href).toBe('string');
      }),
      { numRuns: 50 }
    );
  });

  it('should generate valid programme groups', () => {
    fc.assert(
      fc.property(arbProgrammeGroup(), (group) => {
        expect(group.id).toBeDefined();
        expect(group.label).toBeDefined();
        expect(group.href).toBeDefined();
        expect(typeof group.id).toBe('string');
        expect(typeof group.label).toBe('string');
        expect(typeof group.href).toBe('string');
        
        if (group.subProgrammes) {
          expect(Array.isArray(group.subProgrammes)).toBe(true);
          group.subProgrammes.forEach((sub) => {
            expect(sub.id).toBeDefined();
            expect(sub.label).toBeDefined();
            expect(sub.href).toBeDefined();
          });
        }
      }),
      { numRuns: 50 }
    );
  });

  it('should generate valid featured items', () => {
    fc.assert(
      fc.property(arbFeaturedItem(), (item) => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.description).toBeDefined();
        expect(item.imageUrl).toBeDefined();
        expect(item.href).toBeDefined();
        expect(typeof item.id).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(typeof item.description).toBe('string');
        expect(typeof item.imageUrl).toBe('string');
        expect(typeof item.href).toBe('string');
        
        if (item.imageAlt !== undefined) {
          expect(typeof item.imageAlt).toBe('string');
        }
      }),
      { numRuns: 50 }
    );
  });
});

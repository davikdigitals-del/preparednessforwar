/**
 * Test utilities and generators for MegaMenu property-based tests
 * Uses fast-check for generating test data
 */

import * as fc from 'fast-check';
import type {
  CategoryItem,
  SubProgramme,
  ProgrammeGroup,
  FeaturedItem,
  MegaMenuConfig,
} from '../types';

/**
 * Arbitrary generator for CategoryItem
 */
export const arbCategoryItem = (): fc.Arbitrary<CategoryItem> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    label: fc.string({ minLength: 1, maxLength: 100 }),
    href: fc.webUrl(),
  });

/**
 * Arbitrary generator for SubProgramme
 */
export const arbSubProgramme = (): fc.Arbitrary<SubProgramme> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    label: fc.string({ minLength: 1, maxLength: 100 }),
    href: fc.webUrl(),
  });

/**
 * Arbitrary generator for ProgrammeGroup
 */
export const arbProgrammeGroup = (): fc.Arbitrary<ProgrammeGroup> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    label: fc.string({ minLength: 1, maxLength: 100 }),
    href: fc.webUrl(),
    subProgrammes: fc.option(
      fc.array(arbSubProgramme(), { minLength: 1, maxLength: 5 }),
      { nil: undefined }
    ),
  });

/**
 * Arbitrary generator for FeaturedItem
 */
export const arbFeaturedItem = (): fc.Arbitrary<FeaturedItem> =>
  fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    title: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    imageUrl: fc.webUrl(),
    href: fc.webUrl(),
    imageAlt: fc.option(
      fc.string({ minLength: 1, maxLength: 150 }),
      { nil: undefined }
    ),
  });

/**
 * Arbitrary generator for valid MegaMenuConfig
 * Respects constraints:
 * - Categories: 3-12 items
 * - Programmes: 2-8 groups
 * - Featured: 1-4 items
 */
export const arbMegaMenuConfig = (): fc.Arbitrary<MegaMenuConfig> =>
  fc.record({
    menuId: fc.string({ minLength: 1, maxLength: 50 }),
    categories: fc.record({
      heading: fc.string({ minLength: 1, maxLength: 50 }),
      items: fc.array(arbCategoryItem(), { minLength: 3, maxLength: 12 }),
    }),
    programmes: fc.record({
      heading: fc.string({ minLength: 1, maxLength: 50 }),
      groups: fc.array(arbProgrammeGroup(), { minLength: 2, maxLength: 8 }),
    }),
    featured: fc.record({
      heading: fc.string({ minLength: 1, maxLength: 50 }),
      items: fc.array(arbFeaturedItem(), { minLength: 1, maxLength: 4 }),
    }),
  });

/**
 * Arbitrary generator for invalid MegaMenuConfig (violates constraints)
 */
export const arbInvalidMegaMenuConfig = (): fc.Arbitrary<Partial<MegaMenuConfig>> =>
  fc.oneof(
    // Too few categories
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 0, maxLength: 2 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 2, maxLength: 8 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 1, maxLength: 4 }),
      }),
    }),
    // Too many categories
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 13, maxLength: 20 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 2, maxLength: 8 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 1, maxLength: 4 }),
      }),
    }),
    // Too few programmes
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 3, maxLength: 12 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 0, maxLength: 1 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 1, maxLength: 4 }),
      }),
    }),
    // Too many programmes
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 3, maxLength: 12 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 9, maxLength: 15 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 1, maxLength: 4 }),
      }),
    }),
    // Too few featured items
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 3, maxLength: 12 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 2, maxLength: 8 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 0, maxLength: 0 }),
      }),
    }),
    // Too many featured items
    fc.record({
      menuId: fc.string({ minLength: 1 }),
      categories: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbCategoryItem(), { minLength: 3, maxLength: 12 }),
      }),
      programmes: fc.record({
        heading: fc.string({ minLength: 1 }),
        groups: fc.array(arbProgrammeGroup(), { minLength: 2, maxLength: 8 }),
      }),
      featured: fc.record({
        heading: fc.string({ minLength: 1 }),
        items: fc.array(arbFeaturedItem(), { minLength: 5, maxLength: 10 }),
      }),
    })
  );

/**
 * Example valid configuration for testing
 */
export const exampleConfig: MegaMenuConfig = {
  menuId: 'emergency-news',
  categories: {
    heading: 'Categories',
    items: [
      { id: 'breaking', label: 'Breaking News', href: '/emergency-news/breaking' },
      { id: 'alerts', label: 'Emergency Alerts', href: '/emergency-news/alerts' },
      { id: 'updates', label: 'Live Updates', href: '/emergency-news/updates' },
      { id: 'analysis', label: 'Situation Analysis', href: '/emergency-news/analysis' },
    ],
  },
  programmes: {
    heading: 'Programmes',
    groups: [
      {
        id: 'daily-brief',
        label: 'Daily Security Brief',
        href: '/programmes/daily-brief',
        subProgrammes: [
          { id: 'morning', label: 'Morning Edition', href: '/programmes/daily-brief/morning' },
          { id: 'evening', label: 'Evening Roundup', href: '/programmes/daily-brief/evening' },
        ],
      },
      {
        id: 'crisis-watch',
        label: 'Crisis Watch',
        href: '/programmes/crisis-watch',
        subProgrammes: [
          { id: 'global', label: 'Global Hotspots', href: '/programmes/crisis-watch/global' },
          { id: 'regional', label: 'Regional Focus', href: '/programmes/crisis-watch/regional' },
        ],
      },
    ],
  },
  featured: {
    heading: 'Featured',
    items: [
      {
        id: 'feature-1',
        title: 'NATO Response Protocol',
        description: "Understanding the alliance's rapid response mechanisms",
        imageUrl: '/images/nato-response.jpg',
        imageAlt: 'NATO forces in training exercise',
        href: '/featured/nato-response',
      },
      {
        id: 'feature-2',
        title: 'Civilian Preparedness Guide',
        description: 'Essential steps for household emergency readiness',
        imageUrl: '/images/civilian-prep.jpg',
        imageAlt: 'Emergency supply kit',
        href: '/featured/civilian-prep',
      },
    ],
  },
};

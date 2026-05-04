/**
 * Barrel export file for the MegaMenu module
 * Provides a single entry point for importing MegaMenu components and types
 */

// Export all types
export type {
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
} from './types';

// Export constants
export { DEFAULT_TIMER_CONFIG } from './types';

// Components will be exported here as they are implemented
export { MegaMenu } from './MegaMenu';
export { MegaMenuTrigger } from './MegaMenuTrigger';
export { MegaMenuContent } from './MegaMenuContent';
// export { CategoriesColumn } from './CategoriesColumn';
// export { ProgrammesColumn } from './ProgrammesColumn';
// export { FeaturedColumn } from './FeaturedColumn';
// export { FeaturedCard } from './FeaturedCard';

// Context and hooks
export { MegaMenuProvider, useMegaMenuContext, MegaMenuContext } from './MegaMenuContext';

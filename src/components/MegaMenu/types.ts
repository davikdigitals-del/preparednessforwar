/**
 * Core TypeScript interfaces and types for the MegaMenu navigation system
 * Based on the design document for mega-menu-navigation spec
 */

/**
 * Category item in the left column
 */
export interface CategoryItem {
  id: string;
  label: string;
  href: string;
}

/**
 * Sub-programme item nested under a programme
 */
export interface SubProgramme {
  id: string;
  label: string;
  href: string;
}

/**
 * Programme group with optional sub-programmes
 */
export interface ProgrammeGroup {
  id: string;
  label: string;
  href: string;
  subProgrammes?: SubProgramme[];
}

/**
 * Featured content item with image and description
 */
export interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  imageAlt?: string;
}

/**
 * Complete configuration object for a single mega menu instance
 */
export interface MegaMenuConfig {
  menuId: string;
  categories: {
    heading: string;
    items: CategoryItem[];
  };
  programmes: {
    heading: string;
    groups: ProgrammeGroup[];
  };
  featured: {
    heading: string;
    items: FeaturedItem[];
  };
}

/**
 * Props for the MegaMenu container component
 */
export interface MegaMenuProps {
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  defaultOpen?: boolean;
}

/**
 * Props for the MegaMenuTrigger component
 */
export interface MegaMenuTriggerProps {
  menuId: string;
  label: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props for the MegaMenuContent component
 */
export interface MegaMenuContentProps {
  menuId: string;
  config: MegaMenuConfig;
  className?: string;
}

/**
 * Props for the CategoriesColumn component
 */
export interface CategoriesColumnProps {
  heading: string;
  categories: CategoryItem[];
}

/**
 * Props for the ProgrammesColumn component
 */
export interface ProgrammesColumnProps {
  heading: string;
  programmes: ProgrammeGroup[];
}

/**
 * Props for the FeaturedColumn component
 */
export interface FeaturedColumnProps {
  heading: string;
  featured: FeaturedItem[];
}

/**
 * Props for the FeaturedCard component
 */
export interface FeaturedCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  imageAlt?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Context value for MegaMenu state management
 */
export interface MegaMenuContextValue {
  activeMenuId: string | null;
  openMenu: (menuId: string) => void;
  closeMenu: () => void;
  scheduleClose: (delay: number) => void;
  cancelScheduledClose: () => void;
  registerMenu: (menuId: string, config: MegaMenuConfig) => void;
  unregisterMenu: (menuId: string) => void;
  // Internal state for hover and focus tracking
  isHovering: boolean;
  setIsHovering: (isHovering: boolean) => void;
  isFocused: boolean;
  setIsFocused: (isFocused: boolean) => void;
  getMenuConfig: (menuId: string) => MegaMenuConfig | undefined;
}

/**
 * Internal state for menu management
 */
export interface MenuState {
  activeMenuId: string | null;
  hoverTimerId: number | null;
  closeTimerId: number | null;
  focusedElement: HTMLElement | null;
}

/**
 * Timer configuration for interactions
 */
export interface TimerConfig {
  hoverOpenDelay: number;    // 200ms
  hoverCloseDelay: number;   // 300ms
  clickOpenDelay: number;    // 0ms (immediate)
}

/**
 * Default timer configuration values
 */
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  hoverOpenDelay: 200,
  hoverCloseDelay: 300,
  clickOpenDelay: 0,
};

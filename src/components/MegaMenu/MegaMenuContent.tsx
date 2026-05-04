/**
 * MegaMenuContent - Dropdown panel with three-column layout
 * 
 * This component displays the mega menu dropdown panel with three columns:
 * Categories (left), Programmes (middle), and Featured (right).
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4, 7.5,
 *               8.1, 8.2, 8.3, 8.4, 10.4, 10.5, 12.1, 12.2, 12.3
 */

import React, { useEffect, useRef } from 'react';
import { useMegaMenuContext } from './MegaMenuContext';
import type { MegaMenuContentProps } from './types';

/**
 * MegaMenuContent component
 * 
 * Displays the dropdown panel with three-column layout.
 * Handles animations, responsive breakpoints, and accessibility.
 * 
 * @param props - Component props
 * @returns Dropdown panel element
 */
export function MegaMenuContent({
  menuId,
  config,
  className = '',
}: MegaMenuContentProps) {
  const { activeMenuId, closeMenu, cancelScheduledClose, scheduleClose } = useMegaMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Check if this menu is currently open
  const isOpen = activeMenuId === menuId;

  /**
   * Handle mouse enter on content
   * Cancel any scheduled close to keep menu open
   */
  const handleMouseEnter = () => {
    cancelScheduledClose();
  };

  /**
   * Handle mouse leave from content
   * Schedule close after 300ms delay
   */
  const handleMouseLeave = () => {
    scheduleClose(300);
  };

  /**
   * Handle internal link clicks
   * Requirement 16.3: Clicking links within dropdown closes menu
   */
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        closeMenu();
      }
    };

    const content = contentRef.current;
    content.addEventListener('click', handleLinkClick);

    return () => {
      content.removeEventListener('click', handleLinkClick);
    };
  }, [isOpen, closeMenu]);

  /**
   * Focus trap implementation
   * Requirements: 17.3, 17.4
   */
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const content = contentRef.current;
    const focusableElements = content.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Move focus to first element when opening via keyboard
    // Requirement 17.1
    if (document.activeElement?.getAttribute('role') === 'button') {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Trap focus within the dropdown
      if (e.shiftKey) {
        // Shift+Tab: moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    content.addEventListener('keydown', handleKeyDown);

    return () => {
      content.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  /**
   * Compute CSS classes for the content panel
   * - Base styles
   * - Three-column grid layout (Requirements 3.1, 3.2, 3.3, 3.4)
   * - Responsive breakpoints (Requirements 7.1-7.5, 8.1-8.4)
   * - Animations (Requirements 12.1, 12.2, 12.3)
   */
  const contentClasses = [
    // Base styles
    'absolute left-0 top-full w-full',
    'bg-white shadow-lg',
    'z-50',
    // Three-column grid layout (desktop)
    'grid grid-cols-3 gap-8',
    'px-8 py-6',
    // Responsive: tablet (768px-1024px) - two columns
    'md:grid-cols-2 lg:grid-cols-3',
    // Responsive: mobile (<768px) - single column
    'grid-cols-1',
    // Animations (Requirements 12.1, 12.2, 12.3)
    'animate-in fade-in slide-in-from-top-2',
    'duration-200',
    // Reduced motion support (Requirement 12.5)
    'motion-reduce:animate-none',
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={contentRef}
      id={`mega-menu-${menuId}`}
      className={contentClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // ARIA attributes (Requirements 10.4, 10.5)
      role="region"
      aria-labelledby={`trigger-${menuId}`}
      aria-hidden={!isOpen}
    >
      {/* Categories Column (left) - Requirement 3.2 */}
      <div className="mega-menu-column mega-menu-categories">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {config.categories.heading}
        </h3>
        <ul className="space-y-2">
          {config.categories.items.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-150"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Programmes Column (middle) - Requirement 3.3 */}
      <div className="mega-menu-column mega-menu-programmes">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {config.programmes.heading}
        </h3>
        <ul className="space-y-3">
          {config.programmes.groups.map((group) => (
            <li key={group.id}>
              <a
                href={group.href}
                className="block px-2 py-1 text-sm font-semibold text-gray-900 hover:bg-gray-100 rounded transition-colors duration-150"
              >
                {group.label}
              </a>
              {group.subProgrammes && group.subProgrammes.length > 0 && (
                <ul className="mt-1 ml-4 space-y-1">
                  {group.subProgrammes.map((sub) => (
                    <li key={sub.id}>
                      <a
                        href={sub.href}
                        className="block px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors duration-150"
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Featured Column (right) - Requirement 3.4 */}
      <div className="mega-menu-column mega-menu-featured">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {config.featured.heading}
        </h3>
        <div className="space-y-4">
          {config.featured.items.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="block group hover:bg-gray-50 rounded-lg overflow-hidden transition-colors duration-150"
            >
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading={isOpen ? 'eager' : 'lazy'}
                />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

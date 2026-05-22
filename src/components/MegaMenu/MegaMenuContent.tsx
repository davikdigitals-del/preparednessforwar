/**
 * MegaMenuContent - Dropdown panel with rich multi-column layout
 */

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMegaMenuContext } from './MegaMenuContext';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { MegaMenuContentProps } from './types';

export function MegaMenuContent({
  menuId,
  config,
  className = '',
}: MegaMenuContentProps) {
  const { activeMenuId, closeMenu, cancelScheduledClose, scheduleClose } = useMegaMenuContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const isOpen = activeMenuId === menuId;

  const handleMouseEnter = () => cancelScheduledClose();
  const handleMouseLeave = () => scheduleClose(300);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a')) closeMenu();
    };
    const content = contentRef.current;
    content.addEventListener('click', handleLinkClick);
    return () => content.removeEventListener('click', handleLinkClick);
  }, [isOpen, closeMenu]);

  if (!isOpen) return null;

  const hasFeatured = config.featured.items.length > 0;

  return (
    <div
      ref={contentRef}
      id={`mega-menu-${menuId}`}
      className={[
        'absolute left-0 top-full w-full bg-white shadow-2xl border-t-2 border-primary z-50',
        'animate-in fade-in slide-in-from-top-1 duration-150',
        'motion-reduce:animate-none',
        className,
      ].filter(Boolean).join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-labelledby={`trigger-${menuId}`}
    >
      <div className="container mx-auto px-4">
        <div className={`grid gap-0 py-6 ${hasFeatured ? 'grid-cols-[1fr_1fr_1.2fr]' : 'grid-cols-2'}`}>

          {/* Column 1 — Categories */}
          <div className="pr-6 border-r border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {config.categories.heading}
            </p>
            <ul className="space-y-0.5">
              {config.categories.items.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-primary/5 hover:text-primary group transition-colors"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Quick Links */}
          <div className={`px-6 ${hasFeatured ? 'border-r border-gray-100' : ''}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {config.programmes.heading}
            </p>
            <ul className="space-y-1">
              {config.programmes.groups.map((group) => (
                <li key={group.id}>
                  <Link
                    to={group.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-gray-800 hover:bg-primary/5 hover:text-primary transition-colors group"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
                    {group.label}
                  </Link>
                  {group.subProgrammes && group.subProgrammes.length > 0 && (
                    <ul className="ml-6 mt-0.5 space-y-0.5">
                      {group.subProgrammes.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            to={sub.href}
                            className="block px-3 py-1.5 text-xs text-gray-500 hover:text-primary hover:bg-gray-50 rounded transition-colors"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Featured (only if items exist) */}
          {hasFeatured && (
            <div className="pl-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {config.featured.heading}
              </p>
              <div className="space-y-3">
                {config.featured.items.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="w-20 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">Browse all content in this section</p>
          <Link
            to={`/${menuId}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}


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

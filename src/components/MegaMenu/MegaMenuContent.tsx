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
        // Position fixed relative to viewport, below the header
        'fixed left-0 right-0 bg-white shadow-2xl border-t-2 border-primary z-[100]',
        'animate-in fade-in slide-in-from-top-1 duration-150',
        'motion-reduce:animate-none',
        className,
      ].filter(Boolean).join(' ')}
      style={{ top: 'var(--header-height, 112px)' }}
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

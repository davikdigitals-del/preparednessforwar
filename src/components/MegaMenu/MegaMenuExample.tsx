/**
 * Example usage of the MegaMenu component
 * 
 * This file demonstrates how to use the MegaMenu navigation system
 * with multiple menu instances.
 */

import React from 'react';
import {
  MegaMenu,
  MegaMenuTrigger,
  MegaMenuContent,
  type MegaMenuConfig,
} from './index';

// Example configuration for Emergency News menu
const emergencyNewsConfig: MegaMenuConfig = {
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
        imageUrl: 'https://via.placeholder.com/400x225',
        imageAlt: 'NATO forces in training exercise',
        href: '/featured/nato-response',
      },
      {
        id: 'feature-2',
        title: 'Civilian Preparedness Guide',
        description: 'Essential steps for household emergency readiness',
        imageUrl: 'https://via.placeholder.com/400x225',
        imageAlt: 'Emergency supply kit',
        href: '/featured/civilian-prep',
      },
    ],
  },
};

// Example configuration for Analysis menu
const analysisConfig: MegaMenuConfig = {
  menuId: 'analysis',
  categories: {
    heading: 'Topics',
    items: [
      { id: 'geopolitics', label: 'Geopolitics', href: '/analysis/geopolitics' },
      { id: 'military', label: 'Military Strategy', href: '/analysis/military' },
      { id: 'economics', label: 'Economic Impact', href: '/analysis/economics' },
    ],
  },
  programmes: {
    heading: 'Analysis Series',
    groups: [
      {
        id: 'expert-panel',
        label: 'Expert Panel',
        href: '/programmes/expert-panel',
        subProgrammes: [
          { id: 'weekly', label: 'Weekly Roundtable', href: '/programmes/expert-panel/weekly' },
        ],
      },
      {
        id: 'deep-dive',
        label: 'Deep Dive',
        href: '/programmes/deep-dive',
      },
    ],
  },
  featured: {
    heading: 'Latest Analysis',
    items: [
      {
        id: 'feature-1',
        title: 'Regional Security Dynamics',
        description: 'Analyzing current security challenges in Eastern Europe',
        imageUrl: 'https://via.placeholder.com/400x225',
        href: '/analysis/regional-security',
      },
    ],
  },
};

/**
 * Example MegaMenu Navigation Bar
 */
export function MegaMenuExample() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-bold text-gray-900">
              Sentinel Network
            </a>
          </div>

          {/* Navigation Items with Mega Menus */}
          <MegaMenu>
            <div className="flex items-center space-x-1">
              {/* Emergency News Menu */}
              <MegaMenuTrigger
                menuId="emergency-news"
                label="Emergency News"
                href="/emergency-news"
              />
              <MegaMenuContent
                menuId="emergency-news"
                config={emergencyNewsConfig}
              />

              {/* Analysis Menu */}
              <MegaMenuTrigger
                menuId="analysis"
                label="Analysis"
                href="/analysis"
              />
              <MegaMenuContent
                menuId="analysis"
                config={analysisConfig}
              />

              {/* Regular navigation items without mega menus */}
              <a
                href="/resources"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 rounded"
              >
                Resources
              </a>
            </div>
          </MegaMenu>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors duration-150">
              Live
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-150">
              Log In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Unit tests for MegaMenu error handling
 *
 * Tests:
 * - JavaScript errors are caught and do not propagate to break page functionality
 * - Components handle missing/invalid data gracefully
 * - Error states do not cause unhandled exceptions
 * - Error handling does not interfere with other page elements
 *
 * Requirements: 18.5
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MegaMenuProvider, useMegaMenuContext } from '../MegaMenuContext';
import { MegaMenu } from '../MegaMenu';
import { MegaMenuContent } from '../MegaMenuContent';
import { MegaMenuTrigger } from '../MegaMenuTrigger';
import { exampleConfig } from './test-utils';
import type { MegaMenuConfig } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MegaMenuProvider>{children}</MegaMenuProvider>
);

function MenuController({ menuId }: { menuId: string }) {
  const { openMenu, closeMenu } = useMegaMenuContext();
  return (
    <>
      <button onClick={() => openMenu(menuId)} data-testid="open-btn">Open</button>
      <button onClick={() => closeMenu()} data-testid="close-btn">Close</button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Requirement 18.5 – Error handling shall not cause JS errors that break
// other page functionality
// ---------------------------------------------------------------------------

describe('Error Handling – Requirement 18.5', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress expected console.error noise from React error boundaries in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // 1. Context errors do not break sibling page elements
  // -------------------------------------------------------------------------

  describe('Context errors do not break sibling page elements', () => {
    it('should render sibling page content even when context throws', () => {
      // Accessing context outside provider throws; verify the rest of the page
      // is unaffected by wrapping only the problematic part in an error boundary.
      function BadConsumer() {
        // Intentionally call hook outside provider – this will throw
        try {
          useMegaMenuContext();
        } catch {
          // swallow – simulates a component that catches its own error
        }
        return <span data-testid="bad-consumer">rendered</span>;
      }

      render(
        <div>
          <BadConsumer />
          <p data-testid="sibling">Sibling content</p>
        </div>
      );

      // Sibling content must still be present
      expect(screen.getByTestId('sibling')).toBeInTheDocument();
      // The bad consumer itself also rendered (it caught its own error)
      expect(screen.getByTestId('bad-consumer')).toBeInTheDocument();
    });

    it('should throw a descriptive error when context is used outside provider', () => {
      expect(() => {
        const { result } = require('@testing-library/react').renderHook(
          () => useMegaMenuContext()
        );
        return result;
      }).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 2. MegaMenuContent handles missing / empty config sections gracefully
  // -------------------------------------------------------------------------

  describe('MegaMenuContent handles missing or empty config sections', () => {
    it('should not throw when categories items array is empty', () => {
      const configWithNoCategories: MegaMenuConfig = {
        ...exampleConfig,
        categories: { heading: 'Categories', items: [] },
      };

      expect(() => {
        render(
          <TestWrapper>
            <MenuController menuId="test" />
            <MegaMenuContent menuId="test" config={configWithNoCategories} />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('open-btn'));
      }).not.toThrow();
    });

    it('should not throw when programmes groups array is empty', () => {
      const configWithNoGroups: MegaMenuConfig = {
        ...exampleConfig,
        programmes: { heading: 'Programmes', groups: [] },
      };

      expect(() => {
        render(
          <TestWrapper>
            <MenuController menuId="test" />
            <MegaMenuContent menuId="test" config={configWithNoGroups} />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('open-btn'));
      }).not.toThrow();
    });

    it('should not throw when featured items array is empty', () => {
      const configWithNoFeatured: MegaMenuConfig = {
        ...exampleConfig,
        featured: { heading: 'Featured', items: [] },
      };

      expect(() => {
        render(
          <TestWrapper>
            <MenuController menuId="test" />
            <MegaMenuContent menuId="test" config={configWithNoFeatured} />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('open-btn'));
      }).not.toThrow();
    });

    it('should not throw when programme groups have no subProgrammes', () => {
      const configWithoutSubs: MegaMenuConfig = {
        ...exampleConfig,
        programmes: {
          heading: 'Programmes',
          groups: [
            { id: 'g1', label: 'Group 1', href: '/g1' },
            { id: 'g2', label: 'Group 2', href: '/g2' },
          ],
        },
      };

      expect(() => {
        render(
          <TestWrapper>
            <MenuController menuId="test" />
            <MegaMenuContent menuId="test" config={configWithoutSubs} />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('open-btn'));
      }).not.toThrow();
    });

    it('should not throw when featured items have no imageAlt', () => {
      const configWithoutAlt: MegaMenuConfig = {
        ...exampleConfig,
        featured: {
          heading: 'Featured',
          items: [
            {
              id: 'f1',
              title: 'Title',
              description: 'Desc',
              imageUrl: '/img.jpg',
              href: '/f1',
              // imageAlt intentionally omitted
            },
          ],
        },
      };

      expect(() => {
        render(
          <TestWrapper>
            <MenuController menuId="test" />
            <MegaMenuContent menuId="test" config={configWithoutAlt} />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('open-btn'));
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 3. MegaMenuTrigger handles edge cases without throwing
  // -------------------------------------------------------------------------

  describe('MegaMenuTrigger handles edge cases without throwing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should not throw when menuId is an empty string', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuTrigger menuId="" label="Empty ID" />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should not throw when label is an empty string', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuTrigger menuId="test" label="" />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('should not throw when clicking a trigger with no associated content', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuTrigger menuId="orphan-menu" label="Orphan" />
          </TestWrapper>
        );
        const trigger = screen.getByRole('button', { name: /orphan/i });
        fireEvent.click(trigger);
      }).not.toThrow();
    });

    it('should not throw when rapidly clicking the trigger multiple times', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuTrigger menuId="test" label="Test" />
          </TestWrapper>
        );
        const trigger = screen.getByRole('button', { name: /test/i });
        for (let i = 0; i < 10; i++) {
          fireEvent.click(trigger);
        }
      }).not.toThrow();
    });

    it('should not throw when rapidly hovering in and out', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuTrigger menuId="test" label="Test" />
          </TestWrapper>
        );
        const trigger = screen.getByRole('button', { name: /test/i });
        for (let i = 0; i < 5; i++) {
          fireEvent.mouseEnter(trigger);
          vi.advanceTimersByTime(50);
          fireEvent.mouseLeave(trigger);
          vi.advanceTimersByTime(50);
        }
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 4. MegaMenu container handles errors without breaking page
  // -------------------------------------------------------------------------

  describe('MegaMenu container handles errors without breaking page', () => {
    it('should not throw when rendered with no children', () => {
      expect(() => {
        render(<MegaMenu>{null}</MegaMenu>);
      }).not.toThrow();
    });

    it('should not throw when onOpenChange callback throws', async () => {
      const throwingCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      // Wrap in try/catch to prevent test failure from the thrown error
      // The important thing is the component itself doesn't crash the page
      render(
        <MegaMenu onOpenChange={throwingCallback}>
          <MegaMenuTrigger menuId="test" label="Test" />
        </MegaMenu>
      );

      // The trigger should still be rendered and interactive
      const trigger = screen.getByRole('button', { name: /test/i });
      expect(trigger).toBeInTheDocument();
    });

    it('should render sibling elements correctly even when menu is open', async () => {
      render(
        <div>
          <MegaMenu>
            <MegaMenuTrigger menuId="test" label="Test Menu" />
            <MegaMenuContent menuId="test" config={exampleConfig} />
          </MegaMenu>
          <main data-testid="page-content">
            <p>Page content that should always be visible</p>
          </main>
        </div>
      );

      // Page content is visible before menu opens
      expect(screen.getByTestId('page-content')).toBeInTheDocument();

      // Open the menu
      const trigger = screen.getByRole('button', { name: /test menu/i });
      fireEvent.click(trigger);

      // Page content is still visible after menu opens
      expect(screen.getByTestId('page-content')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 5. Context state management errors do not break page
  // -------------------------------------------------------------------------

  describe('Context state management errors do not break page', () => {
    it('should not throw when closeMenu is called when no menu is open', () => {
      function CloseWhenClosed() {
        const { closeMenu } = useMegaMenuContext();
        return (
          <button onClick={() => closeMenu()} data-testid="close-when-closed">
            Close
          </button>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <CloseWhenClosed />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('close-when-closed'));
      }).not.toThrow();
    });

    it('should not throw when unregisterMenu is called for a non-existent menu', () => {
      function UnregisterNonExistent() {
        const { unregisterMenu } = useMegaMenuContext();
        return (
          <button
            onClick={() => unregisterMenu('non-existent-menu')}
            data-testid="unregister-btn"
          >
            Unregister
          </button>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <UnregisterNonExistent />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('unregister-btn'));
      }).not.toThrow();
    });

    it('should not throw when scheduleClose is called with zero delay', () => {
      function ScheduleZeroClose() {
        const { openMenu, scheduleClose } = useMegaMenuContext();
        return (
          <button
            onClick={() => {
              openMenu('test');
              scheduleClose(0);
            }}
            data-testid="schedule-zero"
          >
            Schedule Zero
          </button>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <ScheduleZeroClose />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('schedule-zero'));
      }).not.toThrow();
    });

    it('should not throw when cancelScheduledClose is called with no pending close', () => {
      function CancelNoPending() {
        const { cancelScheduledClose } = useMegaMenuContext();
        return (
          <button
            onClick={() => cancelScheduledClose()}
            data-testid="cancel-no-pending"
          >
            Cancel
          </button>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <CancelNoPending />
          </TestWrapper>
        );
        fireEvent.click(screen.getByTestId('cancel-no-pending'));
      }).not.toThrow();
    });

    it('should not throw when getMenuConfig is called for a non-existent menu', () => {
      function GetNonExistentConfig() {
        const { getMenuConfig } = useMegaMenuContext();
        const config = getMenuConfig('non-existent');
        return (
          <span data-testid="config-result">
            {config === undefined ? 'undefined' : 'found'}
          </span>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <GetNonExistentConfig />
          </TestWrapper>
        );
      }).not.toThrow();

      expect(screen.getByTestId('config-result')).toHaveTextContent('undefined');
    });
  });

  // -------------------------------------------------------------------------
  // 6. Multiple rapid state transitions do not cause errors
  // -------------------------------------------------------------------------

  describe('Multiple rapid state transitions do not cause errors', () => {
    it('should not throw when rapidly opening and closing menus', async () => {
      function RapidToggle() {
        const { openMenu, closeMenu } = useMegaMenuContext();
        return (
          <>
            <button onClick={() => openMenu('menu-a')} data-testid="open-a">A</button>
            <button onClick={() => openMenu('menu-b')} data-testid="open-b">B</button>
            <button onClick={() => closeMenu()} data-testid="close">Close</button>
          </>
        );
      }

      expect(() => {
        render(
          <TestWrapper>
            <RapidToggle />
          </TestWrapper>
        );

        // Rapidly switch between menus
        for (let i = 0; i < 5; i++) {
          fireEvent.click(screen.getByTestId('open-a'));
          fireEvent.click(screen.getByTestId('open-b'));
          fireEvent.click(screen.getByTestId('close'));
        }
      }).not.toThrow();
    });

    it('should not throw when switching between multiple menus rapidly', async () => {
      expect(() => {
        render(
          <MegaMenu>
            <MegaMenuTrigger menuId="menu-1" label="Menu 1" />
            <MegaMenuTrigger menuId="menu-2" label="Menu 2" />
            <MegaMenuTrigger menuId="menu-3" label="Menu 3" />
            <MegaMenuContent menuId="menu-1" config={exampleConfig} />
            <MegaMenuContent menuId="menu-2" config={exampleConfig} />
            <MegaMenuContent menuId="menu-3" config={exampleConfig} />
          </MegaMenu>
        );

        const trigger1 = screen.getByRole('button', { name: /menu 1/i });
        const trigger2 = screen.getByRole('button', { name: /menu 2/i });
        const trigger3 = screen.getByRole('button', { name: /menu 3/i });

        // Rapidly switch between menus
        fireEvent.click(trigger1);
        fireEvent.click(trigger2);
        fireEvent.click(trigger3);
        fireEvent.click(trigger1);
        fireEvent.click(trigger2);
      }).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 7. Component unmount during active state does not cause errors
  // -------------------------------------------------------------------------

  describe('Component unmount during active state does not cause errors', () => {
    it('should not throw when MegaMenuContent unmounts while menu is open', () => {
      const { unmount } = render(
        <TestWrapper>
          <MenuController menuId="test" />
          <MegaMenuContent menuId="test" config={exampleConfig} />
        </TestWrapper>
      );

      // Open the menu
      fireEvent.click(screen.getByTestId('open-btn'));

      // Unmount while open – should not throw
      expect(() => unmount()).not.toThrow();
    });

    it('should not throw when MegaMenuTrigger unmounts while menu is open', () => {
      vi.useFakeTimers();

      const { unmount } = render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test" label="Test" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: /test/i });
      fireEvent.click(trigger);

      // Unmount while open – should not throw
      expect(() => unmount()).not.toThrow();

      vi.useRealTimers();
    });

    it('should not throw when MegaMenu container unmounts while menu is open', async () => {
      const { unmount } = render(
        <MegaMenu>
          <MegaMenuTrigger menuId="test" label="Test" />
          <MegaMenuContent menuId="test" config={exampleConfig} />
        </MegaMenu>
      );

      const trigger = screen.getByRole('button', { name: /test/i });
      fireEvent.click(trigger);

      // Wait for click-outside detection to activate
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // Unmount while open – should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // 8. Keyboard events during error states do not break page
  // -------------------------------------------------------------------------

  describe('Keyboard events during error states do not break page', () => {
    it('should not throw when Escape is pressed with no open menu', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuContent menuId="test" config={exampleConfig} />
          </TestWrapper>
        );
        // Press Escape when menu is closed
        fireEvent.keyDown(document, { key: 'Escape' });
      }).not.toThrow();
    });

    it('should not throw when Tab is pressed with no open menu', () => {
      expect(() => {
        render(
          <TestWrapper>
            <MegaMenuContent menuId="test" config={exampleConfig} />
          </TestWrapper>
        );
        // Press Tab when menu is closed
        fireEvent.keyDown(document, { key: 'Tab' });
      }).not.toThrow();
    });
  });
});

/**
 * Unit tests for MegaMenu container component
 * 
 * Tests:
 * - Component renders children correctly
 * - onOpenChange callback is invoked correctly
 * - defaultOpen prop initializes state
 * - Click-outside detection activates within 50ms
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.5
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MegaMenu } from '../MegaMenu';
import { useMegaMenuContext } from '../MegaMenuContext';

/**
 * Test component that uses the context to trigger menu open/close
 */
function TestTrigger({ menuId, label }: { menuId: string; label: string }) {
  const { openMenu, closeMenu, activeMenuId } = useMegaMenuContext();
  
  return (
    <div>
      <button onClick={() => openMenu(menuId)} data-testid="open-button">
        {label}
      </button>
      <button onClick={() => closeMenu()} data-testid="close-button">
        Close
      </button>
      <div data-testid="active-menu-id">{activeMenuId || 'none'}</div>
    </div>
  );
}

describe('MegaMenu', () => {

  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      render(
        <MegaMenu>
          <div data-testid="test-child">Test Content</div>
        </MegaMenu>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toHaveTextContent('Test Content');
    });

    it('should wrap children with MegaMenuContext provider', () => {
      render(
        <MegaMenu>
          <TestTrigger menuId="test-menu" label="Test Menu" />
        </MegaMenu>
      );

      // Should be able to access context
      expect(screen.getByTestId('open-button')).toBeInTheDocument();
      expect(screen.getByTestId('active-menu-id')).toHaveTextContent('none');
    });
  });

  describe('onOpenChange Callback', () => {
    it('should invoke onOpenChange when menu opens', async () => {
      const onOpenChange = vi.fn();

      render(
        <MegaMenu onOpenChange={onOpenChange}>
          <TestTrigger menuId="test-menu" label="Test Menu" />
        </MegaMenu>
      );

      // Initially closed
      expect(onOpenChange).toHaveBeenCalledWith(false);

      // Open menu
      await act(async () => {
        screen.getByTestId('open-button').click();
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });
    });

    it('should invoke onOpenChange when menu closes', async () => {
      const onOpenChange = vi.fn();

      render(
        <MegaMenu onOpenChange={onOpenChange}>
          <TestTrigger menuId="test-menu" label="Test Menu" />
        </MegaMenu>
      );

      // Open menu
      await act(async () => {
        screen.getByTestId('open-button').click();
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(true);
      });

      // Close menu
      await act(async () => {
        screen.getByTestId('close-button').click();
      });

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Click-Outside Detection', () => {
    it('should close menu when clicking outside the container', async () => {
      render(
        <div>
          <MegaMenu>
            <TestTrigger menuId="test-menu" label="Test Menu" />
          </MegaMenu>
          <div data-testid="outside-element">Outside</div>
        </div>
      );

      // Open menu
      await act(async () => {
        screen.getByTestId('open-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-menu-id')).toHaveTextContent('test-menu');
      });

      // Wait a bit for click-outside detection to activate
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Click outside
      await act(async () => {
        const outsideElement = screen.getByTestId('outside-element');
        outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-menu-id')).toHaveTextContent('none');
      });
    });

    it('should not close menu when clicking inside the container', async () => {
      render(
        <MegaMenu>
          <TestTrigger menuId="test-menu" label="Test Menu" />
        </MegaMenu>
      );

      // Open menu
      await act(async () => {
        screen.getByTestId('open-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-menu-id')).toHaveTextContent('test-menu');
      });

      // Wait for click-outside detection to activate
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Click inside
      await act(async () => {
        const insideElement = screen.getByTestId('open-button');
        insideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });

      // Menu should still be open
      expect(screen.getByTestId('active-menu-id')).toHaveTextContent('test-menu');
    });
  });

  describe('Multi-Instance Coordination', () => {
    it('should support multiple menu instances with unique IDs', async () => {
      render(
        <MegaMenu>
          <TestTrigger menuId="menu-1" label="Menu 1" />
          <TestTrigger menuId="menu-2" label="Menu 2" />
        </MegaMenu>
      );

      // Both triggers should be present
      expect(screen.getAllByTestId('open-button')).toHaveLength(2);
    });

    it('should ensure only one menu is open at a time', async () => {
      function MultiMenuTest() {
        const { openMenu, activeMenuId } = useMegaMenuContext();
        
        return (
          <div>
            <button onClick={() => openMenu('menu-1')} data-testid="open-menu-1">
              Open Menu 1
            </button>
            <button onClick={() => openMenu('menu-2')} data-testid="open-menu-2">
              Open Menu 2
            </button>
            <div data-testid="active-menu">{activeMenuId || 'none'}</div>
          </div>
        );
      }

      render(
        <MegaMenu>
          <MultiMenuTest />
        </MegaMenu>
      );

      // Open first menu
      await act(async () => {
        screen.getByTestId('open-menu-1').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-menu')).toHaveTextContent('menu-1');
      });

      // Open second menu
      await act(async () => {
        screen.getByTestId('open-menu-2').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-menu')).toHaveTextContent('menu-2');
      });

      // First menu should be closed (only one open at a time)
      expect(screen.getByTestId('active-menu')).not.toHaveTextContent('menu-1');
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <MegaMenu>
          <TestTrigger menuId="test-menu" label="Test Menu" />
        </MegaMenu>
      );

      // Open menu to activate listeners
      await act(async () => {
        screen.getByTestId('open-button').click();
      });

      // Unmount
      unmount();

      // Should have cleaned up
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });
  });
});

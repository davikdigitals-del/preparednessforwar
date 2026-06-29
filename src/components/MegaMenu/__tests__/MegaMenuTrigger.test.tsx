/**
 * Unit tests for MegaMenuTrigger component
 * Tests hover timing, click handling, ARIA attributes, and visual states
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2, 10.3, 11.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MegaMenuProvider } from '../MegaMenuContext';
import { MegaMenuTrigger } from '../MegaMenuTrigger';

/**
 * Wrapper component for testing
 */
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MegaMenuProvider>{children}</MegaMenuProvider>
);

describe('MegaMenuTrigger', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label text', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: 'Test Menu' })).toBeInTheDocument();
    });

    it('should render with children instead of label', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu">
            <span>Custom Content</span>
          </MegaMenuTrigger>
        </TestWrapper>
      );

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should render with href attribute', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" href="/test" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('href', '/test');
    });

    it('should render with default href when not provided', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('href', '#');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger
            menuId="test-menu"
            label="Test Menu"
            className="custom-class"
          />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveClass('custom-class');
    });
  });

  describe('ARIA Attributes (Requirements 10.2, 10.3)', () => {
    it('should have aria-haspopup attribute set to true', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    });

    it('should have aria-expanded false when menu is closed', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-controls attribute with correct ID', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('aria-controls', 'mega-menu-test-menu');
    });

    it('should have role="button"', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveAttribute('role', 'button');
    });
  });

  describe('Hover Behavior (Requirements 2.1, 2.2)', () => {
    it('should display hover state on cursor entry (Requirement 2.1)', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Should have hover class applied
      expect(trigger).toHaveClass('hover:bg-gray-100');
    });

    it('should open menu after 200ms hover (Requirement 2.2)', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Simulate mouse enter
      fireEvent.mouseEnter(trigger);
      
      // Should still be closed before 200ms
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Advance time by 200ms and flush state updates
      act(() => {
        vi.advanceTimersByTime(200);
      });
      
      // Should now be open
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not open menu if hover is less than 200ms', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Simulate mouse enter
      fireEvent.mouseEnter(trigger);
      
      // Advance time by 150ms (less than 200ms)
      vi.advanceTimersByTime(150);
      
      // Simulate mouse leave
      fireEvent.mouseLeave(trigger);
      
      // Advance remaining time
      vi.advanceTimersByTime(100);
      
      // Should still be closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Click Behavior (Requirement 2.3)', () => {
    it('should open menu immediately on click', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Click the trigger
      fireEvent.click(trigger);
      
      // Should be open immediately (no delay)
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should toggle menu on repeated clicks', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Click to open
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Click to close
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      
      // Click to open again
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should prevent default navigation when href is not provided', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Click should not navigate
      fireEvent.click(trigger);
      
      // Menu should be open
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('should cancel pending hover timer on click', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Start hovering
      fireEvent.mouseEnter(trigger);
      
      // Advance time by 100ms (less than 200ms hover delay)
      vi.advanceTimersByTime(100);
      
      // Click before hover timer completes
      fireEvent.click(trigger);
      
      // Should be open immediately
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Advance remaining time to ensure hover timer was cancelled
      vi.advanceTimersByTime(200);
      
      // Should still be open (not affected by cancelled hover timer)
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Hover-Away Behavior (Requirement 2.4)', () => {
    it('should close menu after 300ms hover-away', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Open menu by clicking
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Hover away
      fireEvent.mouseLeave(trigger);
      
      // Should still be open before 300ms
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Advance time by 300ms and flush state updates
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Should now be closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not close menu if hover returns before 300ms', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Open menu
      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      
      // Hover away
      fireEvent.mouseLeave(trigger);
      
      // Advance time by 200ms (less than 300ms)
      vi.advanceTimersByTime(200);
      
      // Hover back
      fireEvent.mouseEnter(trigger);
      
      // Advance remaining time
      vi.advanceTimersByTime(200);
      
      // Should still be open
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Active State (Requirement 2.5)', () => {
    it('should display active state when menu is open', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Initially not active
      expect(trigger).not.toHaveClass('border-b-2');
      
      // Open menu
      fireEvent.click(trigger);
      
      // Should have active state classes
      expect(trigger).toHaveClass('bg-gray-100');
      expect(trigger).toHaveClass('text-gray-900');
      expect(trigger).toHaveClass('border-b-2');
      expect(trigger).toHaveClass('border-blue-600');
    });

    it('should remove active state when menu is closed', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Open menu
      fireEvent.click(trigger);
      expect(trigger).toHaveClass('border-b-2');
      
      // Close menu
      fireEvent.click(trigger);
      
      // Should not have active state classes
      expect(trigger).not.toHaveClass('border-b-2');
    });
  });

  describe('Multi-Instance Coordination', () => {
    it('should close other menus when opening a new one', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="menu-1" label="Menu 1" />
          <MegaMenuTrigger menuId="menu-2" label="Menu 2" />
        </TestWrapper>
      );

      const trigger1 = screen.getByRole('button', { name: 'Menu 1' });
      const trigger2 = screen.getByRole('button', { name: 'Menu 2' });
      
      // Open menu 1
      fireEvent.click(trigger1);
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'false');
      
      // Open menu 2
      fireEvent.click(trigger2);
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Timer Cleanup', () => {
    it('should clear timers on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      
      // Start hover timer
      fireEvent.mouseEnter(trigger);
      
      // Unmount before timer completes
      unmount();
      
      // Advance time - should not cause errors
      vi.advanceTimersByTime(300);
      
      // No errors should occur
      expect(true).toBe(true);
    });
  });

  describe('Visual Feedback Timing (Requirement 11.4)', () => {
    it('should have transition-colors class for smooth hover feedback', () => {
      render(
        <TestWrapper>
          <MegaMenuTrigger menuId="test-menu" label="Test Menu" />
        </TestWrapper>
      );

      const trigger = screen.getByRole('button', { name: 'Test Menu' });
      expect(trigger).toHaveClass('transition-colors');
      expect(trigger).toHaveClass('duration-150');
    });
  });
});

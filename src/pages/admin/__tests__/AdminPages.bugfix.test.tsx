/**
 * Bug Condition Exploration Test for AdminPages Textarea Freeze Bug
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.6**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * This is a bug condition exploration test that surfaces counterexamples demonstrating
 * the browser freeze bug when interacting with the textarea element.
 * 
 * Test Scope:
 * - Test `isBugCondition(input)` where:
 *   - input.target == textareaElement
 *   - input.action IN ['type', 'paste', 'select', 'keypress']
 *   - dialogOpen == true
 *   - editingPage != null
 * 
 * Expected Behavior (from design.md Property 1):
 * - Editor SHALL respond immediately without browser freezing
 * - Visual feedback SHALL appear within 16ms (60fps) - testing with 50ms tolerance
 * - Text editing operations SHALL complete smoothly
 * 
 * EXPECTED OUTCOME ON UNFIXED CODE:
 * - Tests FAIL with >1000ms input lag or timeout
 * - This proves the textarea freeze bug exists
 * 
 * Test Cases:
 * 1. Typing Test: Type "Hello" → Measure input lag (EXPECTED FAIL: >1000ms)
 * 2. Select All Test: Ctrl+A → Assert text selection occurs (EXPECTED FAIL: no selection)
 * 3. Paste Test: Paste 1000 chars → Assert content inserted (EXPECTED FAIL: paste doesn't work)
 * 4. Clear Button Test: Click "Clear All" → Assert textarea empty (EXPECTED FAIL: content remains)
 */

import React from 'react';
import { render, screen, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPages from '../AdminPages';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: 'test-page-1',
              slug: 'test-page',
              title: 'Test Page',
              content: generateLargeHTMLContent(500), // 500 lines of HTML
              meta_title: 'Test Page Meta',
              meta_description: 'Test description',
              is_published: true,
              updated_at: new Date().toISOString(),
            },
          ],
          error: null,
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
      insert: vi.fn(() => ({ error: null })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

/**
 * Generate large HTML content to trigger the textarea freeze bug
 * @param lines Number of lines to generate
 */
function generateLargeHTMLContent(lines: number): string {
  const htmlLines = [];
  for (let i = 0; i < lines; i++) {
    htmlLines.push(`<div class="content-line-${i}">Content line ${i} with some text to make it realistic</div>`);
  }
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .content { padding: 10px; background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Test Page Content</h1>
  ${htmlLines.join('\n  ')}
</body>
</html>`;
}

describe('AdminPages - Bug Condition Exploration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  /**
   * Helper to render AdminPages with QueryClient
   */
  const renderAdminPages = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AdminPages />
      </QueryClientProvider>
    );
  };

  /**
   * Helper to open Edit dialog for the first page
   */
  const openEditDialog = async () => {
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: '' });
    const editButton = editButtons.find(btn => 
      btn.querySelector('svg')?.classList.toString().includes('lucide')
    );

    await act(async () => {
      editButton?.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  };

  /**
   * Helper to get textarea element from the Edit dialog
   */
  const getTextarea = (): HTMLTextAreaElement => {
    const dialog = screen.getByRole('dialog');
    const textarea = within(dialog).getByRole('textbox', { name: '' });
    return textarea as HTMLTextAreaElement;
  };

  describe('Test Case 1: Typing Test - Editor Interaction Responsiveness', () => {
    it('should respond to typing within 50ms without browser freeze', async () => {
      const user = userEvent.setup();
      renderAdminPages();
      
      await openEditDialog();
      const textarea = getTextarea();

      // Focus the textarea
      await act(async () => {
        textarea.focus();
      });

      // Measure typing response time
      const startTime = performance.now();
      
      await act(async () => {
        // Clear existing content first
        textarea.value = '';
        // Simulate typing "Hello"
        await user.type(textarea, 'Hello');
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be < 50ms (16ms for 60fps, but using 50ms tolerance)
      // ON UNFIXED CODE: This will FAIL with >1000ms or timeout
      expect(responseTime).toBeLessThan(50);

      // Assert: Text should be inserted
      expect(textarea.value).toContain('Hello');
    }, 10000); // 10 second timeout for the test
  });

  describe('Test Case 2: Select All Test - Keyboard Shortcut Responsiveness', () => {
    it('should select all text with Ctrl+A without browser freeze', async () => {
      const user = userEvent.setup();
      renderAdminPages();
      
      await openEditDialog();
      const textarea = getTextarea();

      // Focus the textarea
      await act(async () => {
        textarea.focus();
      });

      const initialContent = textarea.value;
      const startTime = performance.now();

      // Simulate Ctrl+A
      await act(async () => {
        await user.keyboard('{Control>}a{/Control}');
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be < 50ms
      // ON UNFIXED CODE: This will FAIL with >1000ms or timeout
      expect(responseTime).toBeLessThan(50);

      // Assert: Text should be selected
      // Check if selection length equals content length
      await waitFor(() => {
        expect(textarea.selectionStart).toBe(0);
        expect(textarea.selectionEnd).toBe(initialContent.length);
      });
    }, 10000);
  });

  describe('Test Case 3: Paste Test - Clipboard Operation Responsiveness', () => {
    it('should accept pasted content without browser freeze', async () => {
      const user = userEvent.setup();
      renderAdminPages();
      
      await openEditDialog();
      const textarea = getTextarea();

      // Focus the textarea
      await act(async () => {
        textarea.focus();
        textarea.value = ''; // Clear content
      });

      // Generate 1000 characters to paste
      const contentToPaste = 'A'.repeat(1000);
      
      const startTime = performance.now();

      // Simulate paste operation
      await act(async () => {
        // Create paste event with clipboard data
        const pasteEvent = new ClipboardEvent('paste', {
          clipboardData: new DataTransfer(),
          bubbles: true,
          cancelable: true,
        });
        
        // Add text to clipboard data
        Object.defineProperty(pasteEvent, 'clipboardData', {
          value: {
            getData: () => contentToPaste,
            types: ['text/plain'],
          },
        });

        textarea.dispatchEvent(pasteEvent);
        
        // Manually insert content (since jsdom doesn't handle paste automatically)
        textarea.value += contentToPaste;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be < 50ms
      // ON UNFIXED CODE: This will FAIL with >1000ms or timeout
      expect(responseTime).toBeLessThan(50);

      // Assert: Content should be pasted
      expect(textarea.value).toContain(contentToPaste);
    }, 10000);
  });

  describe('Test Case 4: Clear Button Test - Button Interaction Responsiveness', () => {
    it('should clear textarea immediately when "Clear All" button is clicked', async () => {
      const user = userEvent.setup();
      renderAdminPages();
      
      await openEditDialog();
      const textarea = getTextarea();

      // Verify textarea has content initially
      expect(textarea.value.length).toBeGreaterThan(0);

      const dialog = screen.getByRole('dialog');
      const clearButton = within(dialog).getByRole('button', { name: /clear all/i });

      const startTime = performance.now();

      // Click "Clear All" button
      await act(async () => {
        await user.click(clearButton);
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be < 50ms
      // ON UNFIXED CODE: This will FAIL - button doesn't respond
      expect(responseTime).toBeLessThan(50);

      // Assert: Textarea should be empty
      // ON UNFIXED CODE: This will FAIL - content remains
      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    }, 10000);
  });

  describe('Test Case 5: Copy to Clipboard Test - Button Interaction Responsiveness', () => {
    it('should copy textarea content to clipboard immediately', async () => {
      const user = userEvent.setup();
      renderAdminPages();
      
      await openEditDialog();
      const textarea = getTextarea();

      const originalContent = textarea.value;
      expect(originalContent.length).toBeGreaterThan(0);

      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const dialog = screen.getByRole('dialog');
      const copyButton = within(dialog).getByRole('button', { name: /copy to clipboard/i });

      const startTime = performance.now();

      // Click "Copy to Clipboard" button
      await act(async () => {
        await user.click(copyButton);
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Assert: Response time should be < 50ms
      // ON UNFIXED CODE: This will FAIL - button doesn't respond
      expect(responseTime).toBeLessThan(50);

      // Assert: Clipboard should have been called with the content
      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(originalContent);
      });
    }, 10000);
  });
});

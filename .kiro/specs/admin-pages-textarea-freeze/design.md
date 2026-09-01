# AdminPages Textarea Freeze Bugfix Design

## Overview

This bugfix addresses a critical performance issue where the native HTML `<textarea>` element in the AdminPages Edit dialog becomes completely unresponsive when handling HTML/CSS page content. The browser freezes during any interaction (typing, pasting, selecting text, or using keyboard shortcuts like Ctrl+A), rendering the Pages Management feature unusable.

The root cause is that native browser textareas struggle with syntax highlighting, large content rendering, and DOM manipulation for code-like content. The fix will replace the native textarea with **CodeMirror 6**, a modern, lightweight, React-friendly code editor optimized for handling large HTML/CSS content without performance degradation.

**Key Strategy:**
- Replace the `<textarea>` with a CodeMirror 6 editor component
- Maintain the uncontrolled component pattern for optimal performance
- Preserve all existing functionality (Clear All, Copy to Clipboard, Show Preview buttons)
- Ensure seamless integration with the existing Dialog component and form submission flow
- Add HTML/CSS syntax highlighting for improved developer experience
- No breaking changes to save/load functionality

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user attempts to interact with the textarea containing HTML/CSS content in the Edit dialog
- **Property (P)**: The desired behavior when interacting with the editor - smooth, responsive text editing without browser freezing
- **Preservation**: Existing dialog behavior, save/load functionality, and all button actions that must remain unchanged
- **CodeMirror 6**: A modern, modular code editor library with excellent React support and performance for large documents
- **Uncontrolled Component**: A React pattern where form element values are managed by the DOM rather than React state, reducing re-renders and improving performance
- **textareaRef**: The React ref in AdminPages.tsx that provides direct DOM access to the textarea element
- **formData.content**: The state property that stores the initial content when opening the Edit dialog

## Bug Details

### Bug Condition

The bug manifests when an administrator opens the Edit dialog and attempts to interact with the textarea element that displays page HTML/CSS content. The browser becomes completely unresponsive regardless of content size, preventing any text editing operations.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UserInteraction
  OUTPUT: boolean
  
  RETURN input.target == textareaElement
         AND input.action IN ['type', 'paste', 'select', 'keypress']
         AND dialogOpen == true
         AND editingPage != null
END FUNCTION
```

### Examples

- **Example 1**: Admin clicks "Edit" on the "Privacy Policy" page → Dialog opens → Admin attempts to type "Hello" → Browser freezes immediately, no text appears, keyboard unresponsive
- **Example 2**: Admin clicks "Edit" on any page → Dialog opens → Admin presses Ctrl+A to select all text → Browser hangs, text selection does not occur, no visual feedback
- **Example 3**: Admin clicks "Edit" → Dialog opens → Admin clicks "Clear All" button → Button does not respond, textarea content remains unchanged
- **Example 4**: Admin clicks "Edit" → Dialog opens → Admin attempts to paste content from clipboard (Ctrl+V) → Paste operation fails, browser becomes unresponsive

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- The Edit dialog must continue to open when clicking the Edit button on any page row
- The dialog must continue to load and display the existing page content in the editor
- The "Save Changes" button must continue to read the editor content and persist changes to the `pages` table
- The "Cancel" button must continue to close the dialog without saving changes
- The "Show Preview" button must continue to render the HTML content in a preview container
- The dialog must continue to render within the Radix UI Dialog component with `max-w-5xl max-h-[95vh] overflow-y-auto` styling
- All other form fields (title, slug, meta_title, meta_description, is_published) must continue to work exactly as before
- The pages list view must continue to display correctly without performance issues

**Scope:**
All interactions that do NOT involve the textarea/editor element should be completely unaffected by this fix. This includes:
- Mouse clicks on buttons outside the editor
- Form submission flow
- Dialog open/close behavior
- Database queries and mutations
- Page list rendering and search functionality

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is the native HTML `<textarea>` element's inability to handle code-like content efficiently:

1. **No Virtual Rendering**: Native textareas render the entire content in a single DOM text node, causing browser layout thrashing when content is large or contains many special characters (HTML tags, CSS rules)

2. **Lack of Tokenization**: The textarea treats content as plain text without tokenization, so any syntax-aware operations (like highlighting, bracket matching, or indentation) would require expensive string parsing on every keystroke

3. **Unoptimized DOM Events**: Browser-native text editing triggers excessive DOM reflows and repaints for code-like content, especially when the content contains nested HTML structures that confuse the textarea's rendering heuristics

4. **React Reconciliation Overhead**: Although the component uses an uncontrolled pattern, React still performs reconciliation checks when the dialog opens/closes, and the large `defaultValue` prop causes initial render delays

5. **Memory Allocation Issues**: The browser allocates a single large string buffer for textarea content, which can cause garbage collection pauses when content is modified

## Correctness Properties

Property 1: Bug Condition - Editor Interaction Responsiveness

_For any_ user interaction where the admin interacts with the editor element (typing, pasting, selecting text, or using keyboard shortcuts) in the Edit dialog, the fixed CodeMirror editor SHALL respond immediately without browser freezing, allowing smooth text editing operations and providing visual feedback within 16ms (60fps).

**Validates: Requirements 2.1, 2.2, 2.3, 2.6**

Property 2: Preservation - Non-Editor Functionality

_For any_ interaction that does NOT involve the editor element (form fields, buttons, dialog controls, list view), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing dialog functionality, save/load operations, and button actions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/pages/admin/AdminPages.tsx`

**Component**: `AdminPages` (main changes in the Edit dialog form)

**Specific Changes**:

1. **Install CodeMirror 6 Dependencies**:
   ```bash
   npm install @codemirror/state @codemirror/view @codemirror/lang-html @codemirror/theme-one-dark @codemirror/commands
   ```
   - `@codemirror/state` and `@codemirror/view`: Core editor modules
   - `@codemirror/lang-html`: HTML syntax highlighting (includes CSS support)
   - `@codemirror/theme-one-dark`: Dark theme to match current textarea styling
   - `@codemirror/commands`: Standard editing commands (select all, copy, etc.)

2. **Create CodeMirror Editor Component**:
   - Create `src/components/CodeEditor.tsx` as a reusable uncontrolled editor component
   - Accept props: `defaultValue`, `onChange`, `editorRef` (to expose getValue method)
   - Use CodeMirror's `EditorView` with HTML language support and dark theme
   - Implement `getValue()` method on the ref to read current content
   - Use `useEffect` with empty deps to initialize editor once (uncontrolled pattern)

3. **Replace Textarea in AdminPages.tsx**:
   - Remove the `<textarea>` element and replace with `<CodeEditor>` component
   - Change `textareaRef` type from `HTMLTextAreaElement` to `{ getValue: () => string }`
   - Update "Clear All" button to call `editorRef.current.setValue('')` (CodeMirror method)
   - Update "Copy to Clipboard" to call `editorRef.current.getValue()`
   - Update `handleSubmit` to read content via `editorRef.current.getValue()`
   - Update "Show Preview" to read content via `editorRef.current.getValue()`

4. **Configure CodeMirror Extensions**:
   - Enable HTML language support with CSS embedded syntax
   - Apply One Dark theme to match current `background: '#0a0a0a', color: '#4ade80'` styling
   - Enable line numbers and line wrapping
   - Enable basic editing commands (Ctrl+A, Ctrl+C, Ctrl+V)
   - Set tab size to 2 spaces for HTML/CSS consistency

5. **Maintain Uncontrolled Pattern**:
   - Pass `defaultValue={formData.content}` to CodeEditor (not `value`)
   - Use `key={editingPage?.id || 'new'}` to force remount when switching pages
   - Do NOT pass an `onChange` handler (uncontrolled pattern)
   - Read editor content only when submitting form or clicking buttons

6. **Update Warning Message**:
   - Remove the performance warning about "1000+ lines" and "Copy → Edit externally"
   - Replace with a brief message: "✓ Using CodeMirror editor for optimal performance with large HTML/CSS content"

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write integration tests that simulate opening the Edit dialog and attempting various text editing operations. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Typing Test**: Open Edit dialog for a page with 500 lines of HTML → Simulate typing "Hello" → Measure input lag (will fail on unfixed code - expect >1000ms delay or timeout)
2. **Select All Test**: Open Edit dialog → Simulate Ctrl+A keypress → Assert that text selection occurs (will fail on unfixed code - no selection occurs)
3. **Paste Test**: Open Edit dialog → Simulate paste operation with 1000 characters → Assert that content is inserted (will fail on unfixed code - paste does not work)
4. **Clear Button Test**: Open Edit dialog → Click "Clear All" button → Assert textarea is empty (will fail on unfixed code - content remains)

**Expected Counterexamples**:
- Browser event loop blocks for >1000ms during typing or selection operations
- Possible causes: textarea DOM rendering bottleneck, React reconciliation overhead, browser layout thrashing

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (editor interactions), the fixed function produces the expected behavior (responsive editing).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleEditorInteraction_fixed(input)
  ASSERT responseTime(result) < 16ms AND visualFeedback == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (non-editor interactions), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) == fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (form fields, button clicks, dialog states)
- It catches edge cases that manual unit tests might miss (e.g., empty content, special characters, long titles)
- It provides strong guarantees that behavior is unchanged for all non-editor interactions

**Test Plan**: Observe behavior on UNFIXED code first for dialog open/close, form submission, and button clicks, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Form Submission Preservation**: Observe that clicking "Save Changes" correctly persists all form fields on unfixed code, then write test to verify this continues after fix
2. **Dialog Control Preservation**: Observe that "Cancel" button closes dialog without saving on unfixed code, then write test to verify this continues after fix
3. **Preview Preservation**: Observe that "Show Preview" correctly renders HTML on unfixed code, then write test to verify this continues after fix
4. **List View Preservation**: Observe that pages list displays and filters correctly on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test CodeEditor component initialization with various default values (empty string, small HTML, large HTML)
- Test `getValue()` method returns correct content after typing
- Test `setValue('')` method clears editor content
- Test editor renders with HTML syntax highlighting enabled
- Test editor applies dark theme styling correctly

### Property-Based Tests

**Property 1: Editor Responsiveness**
- Generate random HTML/CSS content (100-10000 characters)
- Open Edit dialog with generated content
- Simulate random editing operations (type, delete, paste)
- Assert response time < 50ms for each operation

**Property 2: Content Preservation Through Save/Load Cycle**
- Generate random HTML/CSS content with special characters
- Open Edit dialog → Load content into editor → Submit form → Reload page
- Assert content in database matches original content exactly (no corruption)

**Property 3: Button Functionality Across Content Sizes**
- Generate random content sizes (0, 100, 1000, 10000 characters)
- Test "Clear All" empties editor correctly for all sizes
- Test "Copy to Clipboard" copies exact content for all sizes
- Test "Show Preview" renders HTML correctly for all sizes

### Integration Tests

- Test full workflow: Click Edit → Type in editor → Click Save → Verify database update → Reload page → Verify content persists
- Test switching between pages: Edit Page A → Type content → Cancel → Edit Page B → Verify Page A content not mixed with Page B
- Test dialog lifecycle: Open dialog → Type in editor → Close dialog → Reopen dialog → Verify editor shows persisted content
- Test visual feedback: Type in editor → Verify syntax highlighting updates in real-time without lag

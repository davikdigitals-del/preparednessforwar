# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Editor Interaction Responsiveness
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the browser freeze bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - text editing operations (typing, pasting, selecting) in the Edit dialog with HTML/CSS content
  - Test implementation details from Bug Condition specification:
    - `isBugCondition(input)` where `input.target == textareaElement AND input.action IN ['type', 'paste', 'select', 'keypress'] AND dialogOpen == true`
  - The test assertions should match the Expected Behavior Properties from design:
    - Editor SHALL respond immediately without browser freezing
    - Visual feedback SHALL appear within 16ms (60fps)
    - Text editing operations SHALL complete smoothly
  - **Test Cases to Implement**:
    1. Open Edit dialog for a page with 500 lines of HTML → Simulate typing "Hello" → Measure input lag
    2. Open Edit dialog → Simulate Ctrl+A keypress → Assert text selection occurs
    3. Open Edit dialog → Simulate paste operation with 1000 characters → Assert content is inserted
    4. Open Edit dialog → Click "Clear All" button → Assert textarea is empty
  - Run test on UNFIXED code (current native textarea implementation)
  - **EXPECTED OUTCOME**: Test FAILS with >1000ms input lag or timeout (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Browser event loop blocks during typing/selection
    - Possible causes: textarea DOM rendering bottleneck, React reconciliation overhead, browser layout thrashing
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Editor Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (interactions that do NOT involve textarea/editor):
    - Dialog open/close behavior
    - Form submission with all fields (title, slug, meta_title, meta_description, is_published, content)
    - "Cancel" button closes dialog without saving
    - "Show Preview" button renders HTML content
    - Pages list view displays and filters correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - _For any_ interaction where `NOT isBugCondition(input)` (non-editor interactions), behavior SHALL remain exactly the same
    - Edit dialog SHALL continue to open when clicking Edit button
    - Dialog SHALL load existing page content
    - "Save Changes" SHALL persist all form fields to database
    - "Cancel" SHALL close dialog without saving
    - "Show Preview" SHALL render HTML in preview container
    - All form fields (title, slug, meta_title, meta_description, is_published) SHALL work as before
  - **Property-Based Test Approach**: Generate many test cases automatically:
    - Generate random form field values (titles, slugs, meta descriptions)
    - Generate random HTML/CSS content sizes (0, 100, 1000, 10000 characters)
    - Test all button actions across various dialog states
    - Test form submission with special characters and edge cases
  - **Test Cases to Implement**:
    1. Form Submission Preservation: Click "Save Changes" → Assert all form fields persist correctly
    2. Dialog Control Preservation: Click "Cancel" → Assert dialog closes without saving
    3. Preview Preservation: Click "Show Preview" → Assert HTML renders correctly
    4. List View Preservation: Load pages list → Assert displays and filters correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for textarea freeze bug by implementing CodeMirror 6 editor

  - [ ] 3.1 Install CodeMirror 6 dependencies
    - Run: `npm install @codemirror/state @codemirror/view @codemirror/lang-html @codemirror/theme-one-dark @codemirror/commands`
    - Dependencies:
      - `@codemirror/state` and `@codemirror/view`: Core editor modules
      - `@codemirror/lang-html`: HTML syntax highlighting (includes CSS support)
      - `@codemirror/theme-one-dark`: Dark theme to match current textarea styling
      - `@codemirror/commands`: Standard editing commands (select all, copy, etc.)
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ] 3.2 Create CodeEditor component
    - Create `src/components/CodeEditor.tsx` as a reusable uncontrolled editor component
    - Accept props: `defaultValue`, `onChange`, `editorRef` (to expose getValue method)
    - Use CodeMirror's `EditorView` with HTML language support and dark theme
    - Implement `getValue()` method on the ref to read current content
    - Use `useEffect` with empty deps to initialize editor once (uncontrolled pattern)
    - Configure CodeMirror Extensions:
      - Enable HTML language support with CSS embedded syntax
      - Apply One Dark theme to match current `background: '#0a0a0a', color: '#4ade80'` styling
      - Enable line numbers and line wrapping
      - Enable basic editing commands (Ctrl+A, Ctrl+C, Ctrl+V)
      - Set tab size to 2 spaces for HTML/CSS consistency
    - _Bug_Condition: isBugCondition(input) where input.target == textareaElement AND input.action IN ['type', 'paste', 'select', 'keypress']_
    - _Expected_Behavior: Editor responds immediately without browser freezing, visual feedback within 16ms (60fps)_
    - _Preservation: Non-editor functionality (form fields, buttons, dialog controls) remains unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ] 3.3 Replace textarea in AdminPages.tsx with CodeEditor component
    - Remove the `<textarea>` element in Edit dialog form
    - Replace with `<CodeEditor>` component
    - Change `textareaRef` type from `HTMLTextAreaElement` to `{ getValue: () => string }`
    - Pass `defaultValue={formData.content}` to CodeEditor (not `value`)
    - Use `key={editingPage?.id || 'new'}` to force remount when switching pages
    - Do NOT pass an `onChange` handler (uncontrolled pattern)
    - Update "Clear All" button to call `editorRef.current.setValue('')` (CodeMirror method)
    - Update "Copy to Clipboard" to call `editorRef.current.getValue()`
    - Update `handleSubmit` to read content via `editorRef.current.getValue()`
    - Update "Show Preview" to read content via `editorRef.current.getValue()`
    - _Bug_Condition: isBugCondition(input) where input.target == textareaElement_
    - _Expected_Behavior: CodeMirror editor handles all text operations smoothly without freezing_
    - _Preservation: Dialog functionality, save/load operations, and all button actions preserved_
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 3.4 Update warning message
    - Remove the performance warning about "1000+ lines" and "Copy → Edit externally"
    - Replace with: "✓ Using CodeMirror editor for optimal performance with large HTML/CSS content"
    - _Requirements: 2.6_

  - [ ] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Editor Interaction Responsiveness
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1:
      1. Open Edit dialog → Simulate typing "Hello" → Measure input lag → Assert <50ms
      2. Open Edit dialog → Simulate Ctrl+A → Assert text selection occurs immediately
      3. Open Edit dialog → Simulate paste → Assert content inserted without delay
      4. Open Edit dialog → Click "Clear All" → Assert editor empties immediately
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - All editor interactions SHALL respond within 16ms (60fps)
    - Visual feedback SHALL appear immediately
    - No browser freezing SHALL occur
    - _Requirements: 2.1, 2.2, 2.3, 2.6 (Expected Behavior Properties)_

  - [ ] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Editor Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2:
      1. Form Submission: Click "Save Changes" → Assert all fields persist
      2. Dialog Control: Click "Cancel" → Assert dialog closes without saving
      3. Preview: Click "Show Preview" → Assert HTML renders correctly
      4. List View: Load pages → Assert displays and filters correctly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all non-editor functionality works exactly as before
    - Dialog open/close, save/load, form fields, buttons SHALL be unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6 (Preservation Requirements)_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run full test suite (unit tests, property-based tests, integration tests)
  - Verify all bug condition tests pass (editor is responsive)
  - Verify all preservation tests pass (existing functionality unchanged)
  - Manually test in browser:
    - Open Edit dialog for a page with large HTML content
    - Type, paste, select text → Verify smooth interaction with no lag
    - Click "Clear All" → Verify editor clears immediately
    - Click "Copy to Clipboard" → Verify content copies correctly
    - Click "Show Preview" → Verify HTML renders correctly
    - Click "Save Changes" → Verify content persists to database
    - Close and reopen dialog → Verify content loads correctly
  - Ensure all tests pass and editor performs smoothly
  - Ask the user if questions arise or if any functionality needs adjustment

# MegaMenu Testing Documentation

This directory contains all tests for the MegaMenu navigation system.

## Test Structure

### Test Files

- **`types.test.ts`**: Type validation tests ensuring TypeScript interfaces are correctly defined
- **`config-validation.property.test.ts`**: Property-based tests for configuration validation
- **`test-utils.ts`**: Shared test utilities and fast-check generators
- **`README.md`**: This file

### Future Test Files (to be implemented)

- **`MegaMenu.test.tsx`**: Unit tests for MegaMenu container component
- **`MegaMenuContext.test.tsx`**: Unit tests for context and state management
- **`MegaMenuTrigger.test.tsx`**: Unit tests for trigger component
- **`MegaMenuContent.test.tsx`**: Unit tests for dropdown panel component
- **`CategoriesColumn.test.tsx`**: Unit tests for categories column
- **`ProgrammesColumn.test.tsx`**: Unit tests for programmes column
- **`FeaturedColumn.test.tsx`**: Unit tests for featured column
- **`FeaturedCard.test.tsx`**: Unit tests for featured card component
- **`integration.test.tsx`**: Integration tests for complete user flows
- **`accessibility.test.tsx`**: Accessibility tests with screen reader simulation
- **`keyboard-navigation.property.test.tsx`**: Property-based tests for keyboard navigation
- **`hover-interaction.property.test.tsx`**: Property-based tests for hover behavior
- **`responsive-layout.property.test.tsx`**: Property-based tests for responsive behavior

## Testing Framework

### Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library
- **jsdom**: DOM environment for tests

### Configuration

Tests are configured in `vitest.config.ts`:

```typescript
{
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  }
}
```

## Test Types

### 1. Type Tests

Validate TypeScript interfaces and type safety.

**Example:**
```typescript
it('should accept valid category item', () => {
  const item: CategoryItem = {
    id: 'cat-1',
    label: 'Category 1',
    href: '/category-1',
  };
  
  expect(item.id).toBe('cat-1');
});
```

### 2. Unit Tests

Test specific examples, edge cases, and error conditions.

**Example:**
```typescript
it('should display hover state on mouse enter', () => {
  render(<MegaMenuTrigger menuId="test" label="Test" />);
  const trigger = screen.getByText('Test');
  
  fireEvent.mouseEnter(trigger);
  
  expect(trigger).toHaveClass('hover-state');
});
```

### 3. Property-Based Tests

Verify universal properties hold across all inputs using fast-check.

**Example:**
```typescript
it('Property 31: valid config should render without errors', () => {
  fc.assert(
    fc.property(arbMegaMenuConfig(), (config) => {
      const { container } = render(<MegaMenu config={config} />);
      expect(container).toBeDefined();
    }),
    { numRuns: 100 }
  );
});
```

## Test Utilities

### fast-check Generators

The `test-utils.ts` file provides generators for creating test data:

- **`arbCategoryItem()`**: Generates valid category items
- **`arbSubProgramme()`**: Generates valid sub-programmes
- **`arbProgrammeGroup()`**: Generates valid programme groups
- **`arbFeaturedItem()`**: Generates valid featured items
- **`arbMegaMenuConfig()`**: Generates valid complete configurations
- **`arbInvalidMegaMenuConfig()`**: Generates invalid configurations for error testing

### Example Configuration

The `exampleConfig` constant provides a realistic example configuration for manual testing.

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test -- src/components/MegaMenu/__tests__/types.test.ts
```

### Run Property-Based Tests

```bash
npm test -- src/components/MegaMenu/__tests__/*.property.test.ts
```

## Property Test Guidelines

### Writing Property Tests

1. **State the property clearly**: Use descriptive test names that explain what property is being tested
2. **Reference requirements**: Include requirement numbers in comments
3. **Use appropriate generators**: Choose generators that match the input domain
4. **Set appropriate numRuns**: Use 100+ runs for critical properties, 50 for less critical
5. **Test invariants**: Focus on properties that should always hold true

### Example Property Test Structure

```typescript
/**
 * Property X: [Property Name]
 * [Description of what should hold true]
 * **Validates: Requirements X.Y, Z.W**
 */
it('Property X: [property description]', () => {
  fc.assert(
    fc.property(arbGenerator(), (input) => {
      // Test the property
      expect(someInvariant(input)).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

## Coverage Goals

- **Type Coverage**: 100% of interfaces tested
- **Unit Test Coverage**: 80%+ line coverage
- **Property Test Coverage**: All correctness properties from design document
- **Integration Test Coverage**: All major user flows

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Every pull request
- Before deployment

## Debugging Tests

### View Test Output

```bash
npm test -- --reporter=verbose
```

### Debug Specific Test

```bash
npm test -- --reporter=verbose src/components/MegaMenu/__tests__/types.test.ts
```

### Debug Property Test Failures

When a property test fails, fast-check provides a counterexample:

```
Property failed after 42 tests
{ seed: 1234567890, path: "42:0", endOnFailure: true }
Counterexample: { menuId: "abc", categories: { ... } }
```

Use the seed to reproduce the failure:

```typescript
fc.assert(
  fc.property(arbMegaMenuConfig(), (config) => {
    // test
  }),
  { seed: 1234567890 }
);
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test accessibility**: Include ARIA attributes and keyboard navigation in tests
4. **Keep tests focused**: One assertion per test when possible
5. **Use descriptive names**: Test names should explain what is being tested
6. **Mock sparingly**: Prefer real implementations when possible
7. **Test error cases**: Include tests for invalid inputs and error conditions

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

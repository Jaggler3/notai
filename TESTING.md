# Testing Guide

This project uses Jest for testing with TypeScript support. All modules have comprehensive test coverage.

## Test Structure

```
src/
├── __tests__/                    # Test utilities and setup
│   ├── setup.ts                  # Jest setup and mocks
│   └── utils/                    # Test helper functions
│       └── test-helpers.ts       # Common test utilities
├── types/__tests__/              # Type definition tests
├── filter/__tests__/             # Filter module tests
├── content/__tests__/            # Content script tests
└── popup/__tests__/              # Popup module tests
```

## Running Tests

### Prerequisites

Make sure you have Node.js and npm installed, then install dependencies:

```bash
npm install
```

### Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (no watch, with coverage)
npm run test:ci
```

## Test Coverage

The test suite covers:

### Types (`src/types/__tests__/`)
- ✅ Filter-related type definitions
- ✅ Storage-related type definitions  
- ✅ Message type definitions
- ✅ Type validation and structure

### Filter Module (`src/filter/__tests__/`)
- ✅ Filter rules and constants
- ✅ Emoji detection logic
- ✅ Post processing and scoring
- ✅ Placeholder creation and management

### Content Script (`src/content/__tests__/`)
- ✅ Post management operations
- ✅ Message handling
- ✅ DOM observation (mocked)
- ✅ Filter logic integration

### Popup Module (`src/popup/__tests__/`)
- ✅ Storage operations
- ✅ Tab communication
- ✅ UI event handling
- ✅ Message display

## Test Environment

### Jest Configuration
- **Environment**: `jsdom` for DOM testing
- **Transforms**: TypeScript support via `ts-jest`
- **Coverage**: HTML, text, and LCOV reports
- **Setup**: Chrome API mocks and DOM utilities

### Mocked Dependencies
- Chrome Extension APIs (`chrome.runtime`, `chrome.storage`, `chrome.tabs`)
- DOM APIs (`MutationObserver`)
- Console methods (reduced noise in tests)

### Test Utilities
- `createMockArticle()` - Creates mock Reddit post articles
- `createMockPostData()` - Creates mock post data structures
- `mockChromeStorage()` - Mocks Chrome storage responses
- `mockChromeTabs()` - Mocks tab communication

## Writing Tests

### Test File Naming
- Test files should be named `*.test.ts` or `*.spec.ts`
- Place test files in `__tests__` directories alongside source files

### Test Structure
```typescript
describe('ModuleName', () => {
  let instance: ModuleClass;
  
  beforeEach(() => {
    instance = new ModuleClass();
    // Setup mocks and test data
  });
  
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = instance.methodName(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### Best Practices
1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should clearly describe the behavior
3. **Arrange-Act-Assert**: Structure tests in three clear sections
4. **Mock External Dependencies**: Don't test Chrome APIs or external services
5. **Cover Edge Cases**: Test error conditions and boundary cases

## Coverage Goals

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## Debugging Tests

### Running Single Tests
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="should handle error"

# Run tests in a specific file
npm test -- src/filter/__tests__/post-processor.test.ts
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

## Continuous Integration

The test suite is configured for CI environments:
- No watch mode
- Coverage reporting
- Exit codes for build failures
- Compatible with GitHub Actions, CircleCI, etc.

## Troubleshooting

### Common Issues

1. **Chrome API Errors**: Ensure `src/__tests__/setup.ts` is properly configured
2. **DOM Errors**: Check that `jsdom` environment is working
3. **TypeScript Errors**: Verify `ts-jest` configuration
4. **Import Errors**: Check module paths and Jest module mapping

### Performance
- Tests run in parallel by default
- Use `--maxWorkers=1` for debugging
- Coverage collection adds ~20% overhead

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this guide if needed

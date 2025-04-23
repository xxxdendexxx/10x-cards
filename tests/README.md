# E2E Testing with Playwright

This directory contains end-to-end tests for the application using Playwright.

## Test Scenario: Login Form Validation

The main test scenario validates the login form behavior:

1. Navigate to login page
2. Input random (invalid) email and password
3. Submit the form
4. Verify form validation reacts to incorrect data

## Running Tests

```bash
# Run all e2e tests
npm run e2e

# Run e2e tests with UI
npm run e2e:ui

# Run e2e tests in debug mode
npm run e2e:debug

# Generate tests using codegen tool
npm run e2e:codegen
```

## Tests Structure

- `login.spec.ts` - Tests for login form validation
  - Email format validation
  - Required fields validation
  - Server error handling
  - Loading state verification

## Testing Guidelines

- Tests use data-testid attributes for element selection
- Tests leverage the Page Object Model pattern
- Faker.js is used to generate random test data
- API responses are mocked for predictable tests
- Tests are isolated with browser contexts 
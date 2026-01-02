# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/tests/services/youtube.test.ts
```

## Test Structure

- `src/tests/services/` - Service unit tests
- `src/tests/utils/` - Utility unit tests
- `src/tests/db/` - Database tests
- `src/tests/integration/` - End-to-end integration tests

## Integration Tests

Integration tests require valid API credentials. Set these environment variables:

```bash
YOUTUBE_API_KEY=your_real_key
YOUTUBE_PLAYLIST_ID=your_real_playlist
GEMINI_API_KEY=your_real_gemini_key
```

Then run:

```bash
npm run test:integration
```

## Coverage Goals

- Services: 90%
- Utilities: 95%
- Database: 80%
- Overall: 85%

## Test Types

### Unit Tests

Unit tests verify individual components in isolation:

- **Database Client** (`src/tests/db/client.test.ts`): Test database operations
- **Utilities** (`src/tests/utils/*.test.ts`): Test retry logic, config loading
- **Services** (`src/tests/services/*.test.ts`): Test YouTube and Gemini services with mocked dependencies

Example:
```bash
npx vitest run src/tests/utils/retry.test.ts
```

### Integration Tests

Integration tests verify the entire pipeline end-to-end:

- **End-to-End** (`src/tests/integration/end-to-end.test.ts`): Full workflow from playlist fetch to markdown generation

These tests require real API keys and will make actual API calls. They are skipped automatically if credentials are not provided.

Example:
```bash
npx vitest run src/tests/integration/end-to-end.test.ts
```

## Manual Testing

### Full Pipeline Test

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with real API keys

# 2. Run sync
npm run sync-playlist

# 3. Verify outputs
ls src/content/summaries/
cat src/content/summaries/*.md | head -50

# 4. Check database
sqlite3 .data/youtube-summarizer.db <<EOF
SELECT video_id, status, model_used FROM processing_history;
SELECT COUNT(*) as total FROM processing_history;
SELECT status, COUNT(*) as count FROM processing_history GROUP BY status;
EOF
```

### Error Handling Test

Test the system's resilience:

```bash
# Test with invalid API key
YOUTUBE_API_KEY=invalid npm run sync-playlist

# Test with non-existent playlist
YOUTUBE_PLAYLIST_ID=PLnonexistent npm run sync-playlist

# Test with missing transcript (if using transcript mode)
# Set a playlist with videos that don't have transcripts
```

## Continuous Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting Tests

### Common Issues

**Issue**: Tests fail with module resolution errors
- **Solution**: Run `npm run postinstall` to regenerate Nuxt types

**Issue**: Integration tests always skip
- **Solution**: Ensure environment variables are set and valid

**Issue**: Database locked errors
- **Solution**: Close any other processes accessing the test database

**Issue**: Rate limit errors during tests
- **Solution**: Use mocks for unit tests; reduce `MAX_VIDEOS_PER_RUN` for integration tests

## Writing New Tests

### Testing a New Service

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyService } from '~/server/services/my-service';

// Mock dependencies
vi.mock('~/server/utils/logger');

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it('should perform expected behavior', async () => {
    const result = await service.doSomething();
    expect(result).toBeDefined();
  });
});
```

### Testing with Real APIs (Integration)

```typescript
import { describe, it, expect } from 'vitest';

describe('Integration Test', () => {
  it('calls real API', async () => {
    // Skip if no credentials
    if (!process.env.API_KEY) {
      console.log('⏭️  Skipping (no credentials)');
      return;
    }

    // Test with real API
    const result = await realApiCall();
    expect(result).toBeDefined();
  }, 30000); // Longer timeout for API calls
});
```

## Best Practices

1. **Mock external dependencies** in unit tests
2. **Use beforeEach/afterEach** for test isolation
3. **Clean up test data** after integration tests
4. **Use descriptive test names** that explain the scenario
5. **Test both success and failure paths**
6. **Verify error messages** are helpful
7. **Keep tests fast** - mock API calls in unit tests
8. **Use proper timeouts** for integration tests

## Test Coverage

View coverage report after running tests with coverage:

```bash
npm run test:coverage

# Open HTML coverage report
open coverage/index.html
```

Aim for:
- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 90%+
- **Lines**: 85%+

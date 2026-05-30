---
name: playwright-best-practices
description: Playwright E2E test automation standards for machineonhire.com — locator strategy, assertion patterns, test structure, POM, auth fixture, DB helpers, wait strategies, and anti-patterns. Use when writing, reviewing, or debugging Playwright tests in this project.
user-invocable: false
---

# Playwright Test Automation Best Practices — MachineOnHire

## Overview
This document defines the testing standards, patterns, and best practices for writing Playwright E2E tests in the `machineonhire-automation` project. All test automation agents and code reviewers MUST follow these guidelines.

---

## 1. Project Test Setup

### Config Reference (`playwright.config.ts`)
- **Test directory**: `./tests`
- **Base URL**: `https://machineonhire.com` (from `process.env.BASE_URL`)
- **Browsers**: Chromium, Firefox, WebKit, Pixel 5, iPhone 13 (5 projects)
- **Parallel execution**: Enabled (`fullyParallel: true`)
- **Retries**: 2 in CI, 0 locally
- **Workers**: 1 in CI, uncapped locally
- **Reporter**: HTML (`playwright-report/`) + list
- **Screenshots**: Only on failure
- **Video**: Retain on failure
- **Trace**: On first retry

### File Naming Convention
- Test files: `tests/<area>/TC##_<feature>.spec.ts`
- Use descriptive kebab-case names: `TC01_homepage.spec.ts`, `TC04_booking.spec.ts`
- Auth-related tests go in `tests/auth/`
- Visual regression tests go in `tests/visual/`
- Group related tests in the same file using `test.describe()`

### Language
- **TypeScript throughout** — strict mode enabled (`tsconfig.json`)
- Use relative imports in spec files (path aliases `@pages/*`, `@fixtures/*`, `@utils/*` are declared in tsconfig but Playwright resolves via relative paths)

---

## 2. Locator Strategy (Priority Order)

Always choose locators in this priority order for reliability and readability:

### Priority 1: `data-testid` (Most Preferred)
```typescript
page.getByTestId('machine-card')
page.getByTestId('book-btn')
page.getByTestId('search-input')
```
Use for: Elements that need stable test hooks. The PHP site may not have these — prefer adding them via source edits when you have access.

### Priority 2: Accessibility Roles
```typescript
page.getByRole('button', { name: /book/i })
page.getByRole('link', { name: 'Contact User' })
page.getByRole('heading', { name: /Industrial Coolers/i })
```
Use for: Links, buttons, headings — anything with semantic HTML roles.

### Priority 3: Labels and Placeholders
```typescript
page.getByLabel(/email/i)
page.getByLabel(/password/i)
page.getByPlaceholder(/search/i)
```
Use for: Form inputs that have associated labels or placeholder text. Use case-insensitive regex (`/text/i`) since PHP templates can vary.

### Priority 4: Element IDs
```typescript
page.locator('#login-btn')
page.locator('#search-bar')
```
Use for: Elements with explicit, stable IDs in the PHP HTML.

### Priority 5: CSS Classes (Last Resort)
```typescript
page.locator('.machine-card')
page.locator('.listing-card')
page.locator('.for-sale-badge')
```
Use for: Only when no better locator exists. Classes can change with styling.

### Fallback Strategy (PHP site specific)
Since MachineOnHire is a server-rendered PHP site without guaranteed `data-testid` attributes, use **multiple selector fallbacks** chained with commas:
```typescript
// Try data-testid first, then class, then semantic
page.locator('[data-testid="machine-card"], .machine-card, .listing-card')
```

### NEVER Use
- XPath selectors (fragile, hard to read)
- Complex CSS chains (`.parent > .child:nth-child(3)`)
- Index-based selectors without filtering (`.items >> nth=2`)

---

## 3. Page Object Model (POM)

### Structure
```
pages/
├── BasePage.ts          ← Base class all pages extend
├── HomePage.ts          ← index.php
├── LoginPage.ts         ← login.php
├── MachineDetailPage.ts ← machine.php?id={id}
├── BookingPage.ts       ← book_machine.php?id={id}
└── CartPage.ts          ← cart.php
```

### BasePage Pattern
```typescript
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path = '') {
    await this.page.goto(path);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }
}
```

### Page Object Rules
- One class per page/major component
- Store locators as **private class properties** in the constructor
- Methods represent **user actions**, not low-level steps
- Keep **assertions in test files**, not in page objects (exception: `expectXxx()` convenience methods are OK)
- Always `extend BasePage`
- Call `waitForPageLoad()` after navigation in `goto()`

### Example — LoginPage
```typescript
import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private emailInput    = this.page.getByLabel(/email/i);
  private passwordInput = this.page.getByLabel(/password/i);
  private submitButton  = this.page.getByRole('button', { name: /sign in|log in|login/i });
  private errorMessage  = this.page.getByRole('alert');

  constructor(page: Page) { super(page); }

  async goto() {
    await this.navigate('/login.php');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
```

---

## 4. Auth Fixture (`fixtures/auth.fixture.ts`)

Use the custom fixture for any test that requires authentication. **Never copy-paste login steps into individual tests.**

```typescript
// Import from the fixture, NOT from @playwright/test directly
import { test, expect } from '../../fixtures/auth.fixture';

// Available fixtures:
// loginPage    — gives a LoginPage instance (not pre-authenticated)
// loggedInPage — navigates and logs in before the test body runs

test('book a machine when logged in', async ({ loggedInPage, page }) => {
  // page is already authenticated at this point
  await page.goto('/machine.php?id=9');
  // ... test body
});
```

### Credentials
Always read from environment variables — never hardcode:
```typescript
process.env.TEST_USER_EMAIL      // set in .env
process.env.TEST_USER_PASSWORD   // set in .env
```

### Test Users
| Role | Source | Notes |
|---|---|---|
| Valid user | `.env` → `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | Used for all auth-guarded flows |
| Invalid user | `fixtures/testData.ts` → `testData.users.invalid` | Used for negative auth tests |

---

## 5. Test Data (`fixtures/testData.ts`)

```typescript
import { testData } from '../../fixtures/testData';

// Machine data
testData.machines.validMachineId   // 'excavator-001'
testData.machines.keywords         // ['excavator', 'crane', 'bulldozer', 'forklift']
testData.machines.invalidId        // 'nonexistent-machine-999'

// Booking dates
testData.booking.startDate         // '2026-06-01'
testData.booking.endDate           // '2026-06-07'
```

### Dynamic Date Generation
Use `generateFutureDate()` from `utils/helpers.ts` for booking date fields so tests don't expire:
```typescript
import { generateFutureDate } from '../../utils/helpers';

const startDate = generateFutureDate(7);   // 7 days from today
const endDate   = generateFutureDate(14);  // 14 days from today
```

### Known Data Caveats (MachineOnHire specific)
- **Never assert exact listing counts** — test data (`1`, `1q`, `test`) pollutes production
- **Machine detail page** — always use `id=9` until the PHP card-link bug is fixed
- **Location `"1"`** — invalid dropdown value; test graceful handling, not happy-path
- **Broken card links** — all listing cards link to `machine.php?id=9` (known PHP bug)

---

## 6. Assertion Patterns

### Visibility Checks
```typescript
await expect(page.getByText('Booking Confirmed')).toBeVisible();
await expect(page.locator('.for-sale-badge')).not.toBeVisible();
```

### URL Assertions
```typescript
await expect(page).toHaveURL(/login\.php/);
await expect(page).toHaveURL(/machine\.php\?id=\d+/);
await expect(page).not.toHaveURL(/login/);   // confirm redirect away from login
```

### Content Assertions
```typescript
await expect(page.locator('.machine-name')).toContainText('Concrete Mixer');
await expect(page.locator('.rate-display')).toContainText('₹');
```

### Auth Guard Assertions
```typescript
// Unauthenticated access to guarded page should redirect to login
await page.goto('/book_machine.php?id=9');
await expect(page).toHaveURL(/login\.php/);
```

### Custom Timeout for Slow Operations
```typescript
await expect(page.locator('.listings')).toBeVisible({ timeout: 10000 });
```
> PHP server-rendered pages can be slow on shared hosting — use longer timeouts where needed.

---

## 7. Test Structure Pattern

### Standard Test (no auth)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load listing cards', async ({ page }) => {
    // -- Step 1: Navigate --
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // -- Step 2: Assert --
    await expect(page.locator('.machine-card, .listing-card').first()).toBeVisible();
  });
});
```

### Authenticated Test (using fixture)
```typescript
import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Booking Flow', () => {
  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/book_machine.php?id=9');
    await expect(page).toHaveURL(/login\.php/);
  });

  test('should load booking form when authenticated', async ({ loggedInPage, page }) => {
    await page.goto('/book_machine.php?id=9');
    await expect(page).not.toHaveURL(/login\.php/);
    await expect(page.getByRole('button', { name: /book|submit/i })).toBeVisible();
  });
});
```

### Multi-Step Test with Comments
Use `// -- Step N: Description --` comment blocks:
```typescript
test('search and filter by location', async ({ page }) => {
  // -- Step 1: Navigate to homepage --
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // -- Step 2: Enter search keyword --
  await page.getByPlaceholder(/search/i).fill('crane');
  await page.getByRole('button', { name: /search/i }).click();
  await page.waitForLoadState('networkidle');

  // -- Step 3: Apply location filter --
  await page.selectOption('select[name*="location"], select#location', 'Mumbai');
  await page.waitForLoadState('networkidle');

  // -- Step 4: Assert filtered results --
  await expect(page.locator('.machine-card, .listing-card').first()).toBeVisible();
});
```

---

## 8. Wait Strategies

### DO: Use auto-waiting with `expect`
```typescript
await expect(page.getByText('Booking Confirmed')).toBeVisible(); // auto-waits
```

### DO: Use `networkidle` after PHP page navigation
```typescript
await page.goto('/index.php');
await page.waitForLoadState('networkidle');
// OR via BasePage:
await homePage.goto(); // already calls waitForPageLoad() internally
```

### DO: Use `waitForNetworkIdle` helper for dynamic interactions
```typescript
import { waitForNetworkIdle } from '../../utils/helpers';

await page.selectOption('#location-filter', 'Pune');
await waitForNetworkIdle(page, 5000);
```

### DON'T: Use arbitrary sleeps
```typescript
// BAD — never do this
await page.waitForTimeout(2000);
```

### PHP-specific: Server-rendered pages are slower
Shared hosting adds latency — use `networkidle` over `domcontentloaded`, and increase assertion timeouts to 8–10s when testing live.

---

## 9. DB Helper (`utils/dbHelper.ts`)

The DB helper is currently **commented out** (requires `mysql2` to be installed). Enable only when you need to:
- Seed test bookings directly
- Clean up test data after a run
- Assert DB state alongside UI state

To enable:
```bash
npm install mysql2
```
Then uncomment `utils/dbHelper.ts` and set these in `.env`:
```
DB_HOST=md-31.webhostbox.net
DB_USER=your_db_user
DB_PASS=your_db_pass
DB_NAME=zorifcuz_machineonhire
```

> ⚠️ cPanel session tokens expire — always use fresh credentials, never hardcode them.

---

## 10. Utility Helpers (`utils/helpers.ts`)

| Helper | Signature | Use case |
|---|---|---|
| `waitForNetworkIdle` | `(page, timeout=5000)` | Wait after filter/search changes |
| `formatDate` | `(date: Date): string` | Convert Date to `YYYY-MM-DD` |
| `generateFutureDate` | `(daysFromNow: number): string` | Generate booking dates dynamically |
| `retryAction` | `(action, retries=3)` | Retry flaky network-dependent actions |

---

## 11. Debugging Tips

### Run a single test file
```bash
npx playwright test tests/e2e/TC01_homepage.spec.ts --reporter=line
```

### Run by test title
```bash
npx playwright test -g "should load listing cards"
```

### Run headed (see the browser)
```bash
npm run test:headed
```

### Debug mode (step through)
```bash
npm run test:debug
```

### Run specific browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:mobile
```

### View HTML report
```bash
npm run test:report
```

---

## 12. Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Do Instead |
|---|---|---|
| `page.waitForTimeout(N)` | Flaky, wastes time | Use `expect().toBeVisible()` or `networkidle` |
| `page.locator('div > span:nth-child(2)')` | Fragile CSS path | Use role, label, or `data-testid` |
| Hardcoded machine IDs (other than `id=9`) | Links all resolve to `id=9` anyway | Use `testData.machines.validMachineId` |
| Hardcoded credentials | Security risk + breaks on password change | Use `process.env.TEST_USER_*` |
| Asserting exact listing count | Polluted test data on production | Assert `count > 0` or use `.first().toBeVisible()` |
| `test.only()` left in code | Skips all other tests in CI | Remove before commit |
| Assertions inside page objects | Mixes concerns | Keep assertions in test files |
| Shared state between tests | Order-dependent failures | Each test must be fully self-contained |
| Skipping `waitForPageLoad()` after `goto()` | PHP pages render slowly | Always call `waitForLoadState('networkidle')` |
| Testing implementation details | Breaks on PHP refactor | Test user-visible behavior only |

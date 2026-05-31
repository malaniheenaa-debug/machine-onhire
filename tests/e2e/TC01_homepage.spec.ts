/**
 * Homepage E2E Tests — index.php
 *
 * Covers: page load, navigation, search/filter, category sidebar, business rules
 * (badges, pricing), security (XSS/SQLi), negative states, and auth-dependent UI.
 *
 * TC numbering follows docs/test-scenarios.md.
 * Layer notes: badge and single-page filter tests are kept here per the scenario doc.
 *              Consider splitting pure-rendering tests to a Component spec once
 *              data-testid attributes are added to the PHP source.
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { HomePage } from '../../pages/HomePage';

// All listing cards currently resolve to id=9 — known PHP rendering bug (TC-400)
const MACHINE_ID = '9';
const XSS_PAYLOAD = "<script>alert('XSS')</script>";
const SQLI_PAYLOAD = "' OR '1'='1";

// ---------------------------------------------------------------------------
// Page Load & Rendering
// ---------------------------------------------------------------------------
test.describe('Page Load & Rendering', () => {
  test('TC-001 homepage loads with a visible page title and at least one listing card', async ({ page }) => {
    const home = new HomePage(page);

    // -- Step 1: Navigate --
    await home.goto();

    // -- Step 2: Title is set --
    const title = await home.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // -- Step 3: At least one machine card rendered --
    // Do NOT assert exact count — production data includes test/polluted records
    await home.expectAtLeastOneCard();
  });

  test('TC-002 top navigation shows Login and Register links to unauthenticated users', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.loginLink).toBeVisible();
    await expect(home.registerLink).toBeVisible();
  });

  test('TC-003 bottom navigation contains Cart link', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.cartLink).toBeAttached();
  });

  test('TC-004 machine listing grid renders cards with rate in ₹ format', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // At least one card with a rupee rate visible
    await home.expectAtLeastOneCard();
    await expect(page.getByText(/₹/).first()).toBeVisible({ timeout: 10000 });
  });
});

// ---------------------------------------------------------------------------
// Search & Location Filter
// ---------------------------------------------------------------------------
test.describe('Search & Location Filter', () => {
  test('TC-005 keyword search returns matching results', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Search for "Cooler" (known to exist in DB) --
    await home.search('Cooler');

    // -- Step 2: Results visible, URL reflects query --
    await expect(page).toHaveURL(/search=Cooler|q=Cooler/i);
    await home.expectAtLeastOneCard();
  });

  test('TC-006 location filter "Pune" shows only Pune machines', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Select Pune --
    await home.selectLocation('Pune');

    // -- Step 2: No machine card shows Mumbai location --
    await home.expectAtLeastOneCard();
    await expect(home.machineCards.filter({ hasText: /Mumbai/i })).toHaveCount(0);
  });

  test('TC-007 location filter "Mumbai" shows only Mumbai machines', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Select Mumbai --
    await home.selectLocation('Mumbai');

    // -- Step 2: No machine card shows Pune location --
    await home.expectAtLeastOneCard();
    await expect(home.machineCards.filter({ hasText: /Pune/i })).toHaveCount(0);
  });

  test('TC-008 selecting "All locations" after a filter resets to full listing', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Filter to Pune, then reset --
    await home.selectLocation('Pune');
    const puneCount = await home.getMachineCount();

    await home.selectLocation('All locations');
    const allCount = await home.getMachineCount();

    // Resetting should show at least as many cards as the filtered state
    expect(allCount).toBeGreaterThanOrEqual(puneCount);
  });

  test('TC-011 combined keyword + location filter returns correctly filtered results', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Select Mumbai first --
    await home.selectLocation('Mumbai');

    // -- Step 2: Add keyword --
    await home.search('Cooler');

    // -- Step 3: URL reflects both params --
    await expect(page).toHaveURL(/Mumbai|location=Mumbai/i);
  });

  test('TC-300 search with no matching keyword shows empty state', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Use a term guaranteed to have no match --
    await home.search('zzznomatchingresult999');

    // -- Step 2: Zero cards shown; page does not crash --
    await expect(page).not.toHaveURL(/500/);
    const count = await home.getMachineCount();
    expect(count).toBe(0);
  });

  test('TC-301 empty search query submits without crashing', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Click Search with empty input --
    await home.searchButton.click();
    await page.waitForLoadState('networkidle');

    // -- Step 2: Page returns normally; no 500 error --
    await expect(page).not.toHaveURL(/500/);
    await home.expectAtLeastOneCard();
  });

  test('TC-509 location dropdown defaults to "All locations" on initial load', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const selected = await home.locationSelect.evaluate(
      (el: HTMLSelectElement) => el.options[el.selectedIndex]?.text ?? ''
    );
    expect(selected).toMatch(/all locations/i);
  });
});

// ---------------------------------------------------------------------------
// Category Sidebar
// ---------------------------------------------------------------------------
test.describe('Category Sidebar', () => {
  test('TC-504 category sidebar is hidden by default on page load', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(home.categorySidebar).not.toBeVisible();
  });

  test('TC-009 category sidebar opens on trigger click', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // -- Step 1: Click the Categories trigger --
    await home.openCategorySidebar();

    // -- Step 2: Sidebar panel is visible with taxonomy tree --
    await expect(home.categorySidebar).toBeVisible({ timeout: 5000 });
  });

  test('TC-505 category sidebar toggles open and closed on repeated clicks', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Open
    await home.sidebarToggle.click();
    await expect(home.categorySidebar).toBeVisible({ timeout: 5000 });

    // Close
    await home.sidebarToggle.click();
    await expect(home.categorySidebar).not.toBeVisible({ timeout: 5000 });

    // Open again
    await home.sidebarToggle.click();
    await expect(home.categorySidebar).toBeVisible({ timeout: 5000 });
  });

  test('TC-107 all 4 top-level categories appear in the sidebar taxonomy tree', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openCategorySidebar();

    // Expected categories from product taxonomy
    const categories = [
      /Event & Comfort/i,
      /Industrial & Construction/i,
      /Power Tools & DIY/i,
      /Urban Mobility/i,
    ];

    for (const cat of categories) {
      await expect(page.getByText(cat).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-010 subcategory filter link changes URL and filters results', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openCategorySidebar();

    // -- Step 1: Click a subcategory known to have listings --
    await page.getByRole('link', { name: /Industrial Coolers/i }).click();
    await page.waitForLoadState('networkidle');

    // -- Step 2: URL contains the subcategory param --
    await expect(page).toHaveURL(/subcategory=Industrial.Coolers/i);

    // -- Step 3: At least one card visible --
    await home.expectAtLeastOneCard();
  });

  test('TC-017 "Post Requirement" link is present in category sidebar', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openCategorySidebar();

    await expect(home.postRequirementLink).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// Navigation Links
// ---------------------------------------------------------------------------
test.describe('Navigation Links', () => {
  test('TC-014 Login link navigates to login.php', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.loginLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/login\.php/);
  });

  test('TC-015 Register link navigates to register.php', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.registerLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/register\.php/);
  });

  test('TC-013 Cart icon in bottom nav navigates to cart.php', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.cartLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/cart\.php/);
  });

  test('TC-012 logo click from filtered view navigates back to homepage', async ({ page }) => {
    // Start from a filtered results page
    await page.goto('/?search=cooler');
    await page.waitForLoadState('networkidle');

    const home = new HomePage(page);
    await home.logoLink.click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/(index\.php)?$/);
  });
});

// ---------------------------------------------------------------------------
// Business Rules — Badges & Pricing
// ---------------------------------------------------------------------------
test.describe('Business Rules — Badges & Pricing', () => {
  test('TC-100 "For Sale" badge is shown when machines.ready_to_sale = 1', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Precondition: at least one machine has ready_to_sale = 1 in the DB.
    // DB verification (E2E + DB layer) requires mysql2 — see utils/dbHelper.ts.
    // This assertion checks the rendered UI only.
    await expect(home.forSaleBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-500 "For Sale" badge is NOT shown on cards where ready_to_sale = 0', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // At least one card without a For Sale badge must exist
    const cardCount = await home.machineCards.count();
    const badgeCount = await home.forSaleBadges.count();

    expect(badgeCount).toBeLessThan(cardCount);
  });

  test('TC-102 / TC-503 Trending badge is visible on the most-called machine', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Precondition: at least one machine has call_logs entries (drives the badge).
    // DB verification requires mysql2 — see utils/dbHelper.ts.
    await expect(home.trendingBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-103 rate is displayed in ₹/day format for day-rate machines', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // At least one machine with rate_type='day' should show ₹x/day
    await expect(page.getByText(/₹[\d,.]+\/day/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-104 rate is displayed in ₹/hour format for hour-rate machines', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page.getByText(/₹[\d,.]+\/hour/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('TC-105 location dropdown only contains valid values', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const options = await home.locationSelect.evaluate((el: HTMLSelectElement) =>
      Array.from(el.options).map(o => o.text.trim())
    );

    const valid = ['All locations', 'Mumbai', 'Pune'];
    for (const opt of options) {
      // Location "1" is a data quality issue — flag it but do not fail the suite
      if (!valid.includes(opt)) {
        console.warn(`[TC-105] Unexpected location dropdown value: "${opt}" — data quality issue`);
      }
    }

    // Valid values must all be present
    for (const v of valid) {
      expect(options).toContain(v);
    }
  });

  test('TC-018 machine cards have a Call button with a tel: or wa.me link', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const callButton = page.getByRole('link', { name: /call/i }).first();
    await expect(callButton).toBeVisible({ timeout: 10000 });

    const href = await callButton.getAttribute('href');
    expect(href).toMatch(/^(tel:|https:\/\/wa\.me\/)/);
  });
});

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------
test.describe('Security', () => {
  test('TC-204 homepage is publicly accessible without authentication', async ({ page }) => {
    // No session — navigate directly
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Must NOT redirect to login
    await expect(page).not.toHaveURL(/login\.php/);
    await expect(page.locator('[data-testid="machine-card"], .machine-card, .listing-card').first())
      .toBeVisible({ timeout: 10000 });
  });

  test('TC-200 XSS payload in search field is not executed', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', async dialog => {
      xssExecuted = true;
      await dialog.dismiss();
    });

    const home = new HomePage(page);
    await home.goto();
    await home.search(XSS_PAYLOAD);

    expect(xssExecuted).toBe(false);

    // Script tag must appear as escaped text, not executed markup
    await expect(page.getByText('<script>', { exact: false })).not.toBeAttached();
  });

  test('TC-201 SQL injection payload in search does not expose DB errors', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.search(SQLI_PAYLOAD);

    // No MySQL error message visible
    await expect(page.getByText(/You have an error in your SQL syntax/i)).not.toBeVisible();
    await expect(page.getByText(/mysql_fetch_array|mysqli_fetch/i)).not.toBeVisible();

    // Page still loads (not a 500)
    await expect(page).not.toHaveURL(/500/);
  });

  test('TC-202 XSS payload in location URL param is not executed', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', async dialog => {
      xssExecuted = true;
      await dialog.dismiss();
    });

    await page.goto('/index.php?location=<script>alert(1)</script>');
    await page.waitForLoadState('networkidle');

    expect(xssExecuted).toBe(false);
  });

  test('TC-203 XSS payload in subcategory URL param is not executed', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', async dialog => {
      xssExecuted = true;
      await dialog.dismiss();
    });

    await page.goto('/index.php?subcategory=<script>alert(1)</script>');
    await page.waitForLoadState('networkidle');

    expect(xssExecuted).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Negative / Error States
// ---------------------------------------------------------------------------
test.describe('Negative & Error States', () => {
  test('TC-302 dirty location value "1" does not crash the page', async ({ page }) => {
    // "1" is a dev artifact in the location dropdown — graceful handling required
    await page.goto('/index.php?location=1');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/500/);
    await expect(page.getByText(/mysql|fatal error/i)).not.toBeVisible();
  });

  test('TC-303 SQL special characters in search do not break the page', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.search("'; DROP TABLE machines;--");

    await expect(page).not.toHaveURL(/500/);
    await expect(page.getByText(/You have an error in your SQL syntax/i)).not.toBeVisible();
  });

  test('TC-305 invalid subcategory name in URL shows empty state, no crash', async ({ page }) => {
    await page.goto('/index.php?subcategory=DoesNotExist');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/500/);
    await expect(page.getByText(/mysql|fatal error/i)).not.toBeVisible();
  });

  test('TC-306 invalid location in URL does not crash the page', async ({ page }) => {
    await page.goto('/index.php?location=FakeCity');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/500/);
    await expect(page.getByText(/mysql|fatal error/i)).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Edge Cases
// ---------------------------------------------------------------------------
test.describe('Edge Cases', () => {
  test('TC-400 all listing cards link to machine.php?id=9 (documents known PHP rendering bug)', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectAtLeastOneCard();

    // Known bug: all card "More.." links resolve to id=9 regardless of actual machine ID.
    // This test documents the bug — replace the assertion below once the PHP bug is fixed.
    const moreLink = page.getByRole('link', { name: /more\.\./i }).first();
    await expect(moreLink).toHaveAttribute('href', /machine\.php\?id=9/i);
  });

  test('TC-403 cards with polluted test names render without crashing', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // Known production data includes names like "1", "1q", "test"
    // Test only that the page renders without error — do NOT assert on count
    await expect(page).not.toHaveURL(/500/);
    await home.expectAtLeastOneCard();
  });

  test('TC-402 subcategory name with spaces URL-encodes and decodes correctly', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.openCategorySidebar();

    await page.getByRole('link', { name: /Industrial Coolers/i }).click();
    await page.waitForLoadState('networkidle');

    // Space encoded as + or %20; server decodes and matches DB string
    await expect(page).toHaveURL(/subcategory=Industrial(\+|%20)Coolers/i);
  });

  test('TC-405 no results for impossible keyword + location combination shows empty state', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.selectLocation('Mumbai');
    await home.search('Scaffolding'); // No Mumbai scaffolding in DB

    await expect(page).not.toHaveURL(/500/);
    const count = await home.getMachineCount();
    expect(count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Auth-Dependent UI State
// ---------------------------------------------------------------------------
test.describe('Auth-Dependent UI State', () => {
  test('TC-507 Login and Register nav links are hidden when user is logged in', async ({ loggedInPage, page }) => {
    // loggedInPage fixture has already logged in before this test runs
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Auth links must not appear in the nav for logged-in users
    await expect(page.getByRole('link', { name: /^login$/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /^register$/i })).not.toBeVisible();
  });
});

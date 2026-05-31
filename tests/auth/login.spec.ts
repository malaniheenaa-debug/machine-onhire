/**
 * Login & Auth Flow E2E Tests — login.php / register.php
 *
 * Covers: page load, valid/invalid credentials, auth guards (book_machine.php,
 * post_requirement.php), register navigation, security (XSS/SQLi), negative
 * validation, and UI state.
 *
 * TC numbering continues from docs/test-scenarios.md (Homepage ends at TC-510).
 * All selectors use input[name=...] — the form labels have no `for` attribute
 * so getByLabel() is unreliable on this site.
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { LoginPage } from '../../pages/LoginPage';

const XSS_PAYLOAD  = "<script>alert('XSS')</script>";
const SQLI_PAYLOAD = "' OR '1'='1";

// ---------------------------------------------------------------------------
// Happy Path
// ---------------------------------------------------------------------------
test.describe('Login Page — Happy Path', () => {

  test('TC-020 login page loads with heading, form fields, and Register link', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Heading --
    await expect(page.getByRole('heading', { name: /login to your account/i })).toBeVisible();

    // -- Step 2: Form inputs --
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // -- Step 3: Submit button and link --
    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /register here/i })).toBeVisible();
  });

  test('TC-021 valid credentials redirect away from login.php', async ({ loginPage, page }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'TEST_USER credentials not configured in .env'
    );

    await loginPage.goto();
    await loginPage.login(process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);

    // Successful login navigates away from login.php
    await expect(page).not.toHaveURL(/login\.php/);
    await expect(page).not.toHaveURL(/500/);
  });

  test('TC-022 "Register here" link navigates to register.php', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Click link --
    await page.getByRole('link', { name: /register here/i }).click();
    await page.waitForLoadState('networkidle');

    // -- Step 2: URL --
    await expect(page).toHaveURL(/register\.php/);
  });

  test('TC-023 after login nav hides Login and Register links', async ({ loggedInPage, page }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'TEST_USER credentials not configured in .env'
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('link', { name: /^login$/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /^register$/i })).not.toBeVisible();
  });

  test('TC-024 register page loads with heading and 3 form fields', async ({ page }) => {
    await page.goto('/register.php');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /^register$/i })).toBeVisible();
  });

  test('TC-025 "Login here" link on register page navigates back to login.php', async ({ page }) => {
    await page.goto('/register.php');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /login here/i }).click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/login\.php/);
  });

});

// ---------------------------------------------------------------------------
// Business Rules — Auth Guards
// ---------------------------------------------------------------------------
test.describe('Auth Guards', () => {

  test('TC-112 authenticated user can access book_machine.php without redirect', async ({ loggedInPage, page }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'TEST_USER credentials not configured in .env'
    );

    // -- Step 1: Navigate to guarded page after login --
    await page.goto('/book_machine.php?id=9');
    await page.waitForLoadState('networkidle');

    // -- Step 2: Must NOT be on login.php --
    await expect(page).not.toHaveURL(/login\.php/);
  });

});

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------
test.describe('Security', () => {

  test('TC-206 XSS payload in email field is not executed on failed login', async ({ page }) => {
    let xssExecuted = false;
    page.on('dialog', async dialog => {
      xssExecuted = true;
      await dialog.dismiss();
    });

    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Submit XSS as email --
    await lp.login(XSS_PAYLOAD, 'anypassword');

    // -- Step 2: No dialog, no 500, still on login.php --
    expect(xssExecuted).toBe(false);
    await expect(page).not.toHaveURL(/500/);
    await expect(page.getByText('<script>', { exact: false })).not.toBeAttached();
  });

  test('TC-207 SQL injection in email and password fields does not expose DB errors', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Submit SQLi payloads --
    await lp.login(SQLI_PAYLOAD, SQLI_PAYLOAD);

    // -- Step 2: No SQL error text, no 500 --
    await expect(page.getByText(/You have an error in your SQL syntax/i)).not.toBeVisible();
    await expect(page.getByText(/mysql_fetch|mysqli_fetch/i)).not.toBeVisible();
    await expect(page).not.toHaveURL(/500/);
  });

  test('TC-208 login page is publicly accessible without authentication', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    // Must load the form — not redirect to another page
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.getByRole('heading', { name: /login to your account/i })).toBeVisible();
  });

});

// ---------------------------------------------------------------------------
// Negative / Error States
// ---------------------------------------------------------------------------
test.describe('Negative & Error States', () => {

  test('TC-307 non-existent email shows error and stays on login.php', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Submit with unknown email --
    await lp.login('doesnotexist_99999@example.com', 'anypassword');

    // -- Step 2: Still on login.php --
    await expect(page).toHaveURL(/login\.php/);

    // -- Step 3: Error alert visible with expected message --
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.alert-danger')).toContainText(/no account found/i);
  });

  test('TC-308 valid email with wrong password shows error and stays on login.php', async ({ page }) => {
    test.skip(
      !process.env.TEST_USER_EMAIL,
      'TEST_USER_EMAIL not configured in .env — cannot test wrong-password path'
    );

    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Valid email, wrong password --
    await lp.login(process.env.TEST_USER_EMAIL!, 'DefWrongPass!999');

    // -- Step 2: Still on login.php; error shown --
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.locator('.alert-danger')).toBeVisible({ timeout: 8000 });
  });

  test('TC-309 empty email is blocked by HTML5 required validation', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Fill only password; leave email empty --
    await page.locator('input[name="password"]').fill('anypassword');
    await page.getByRole('button', { name: /^login$/i }).click();

    // -- Step 2: Browser validation blocks navigation; no server error shown --
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.locator('.alert-danger')).not.toBeVisible();
  });

  test('TC-310 empty password is blocked by HTML5 required validation', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Fill only email; leave password empty --
    await page.locator('input[name="email"]').fill('user@example.com');
    await page.getByRole('button', { name: /^login$/i }).click();

    // -- Step 2: Browser blocks submission --
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.locator('.alert-danger')).not.toBeVisible();
  });

  test('TC-311 invalid email format is blocked by input[type=email] validation', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.goto();

    // -- Step 1: Non-email string in email field --
    await page.locator('input[name="email"]').fill('notanemail');
    await page.locator('input[name="password"]').fill('anypassword');
    await page.getByRole('button', { name: /^login$/i }).click();

    // -- Step 2: Browser email validation blocks form submit --
    await expect(page).toHaveURL(/login\.php/);
    await expect(page.locator('.alert-danger')).not.toBeVisible();
  });

});

// ---------------------------------------------------------------------------
// UI State
// ---------------------------------------------------------------------------
test.describe('UI State', () => {

  test('TC-511 password field renders as masked (type=password)', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    const type = await page.locator('input[name="password"]').getAttribute('type');
    expect(type).toBe('password');
  });

  test('TC-512 error alert is not visible on initial page load', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    // No server-side error until a form is submitted
    await expect(page.locator('.alert-danger')).not.toBeVisible();
  });

  test('TC-513 login submit button displays "Login" text', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
  });

  test('TC-514 page title contains "MachineOnHire"', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toMatch(/MachineOnHire/i);
  });

  test('TC-515 both email and password inputs carry required attribute', async ({ page }) => {
    await page.goto('/login.php');
    await page.waitForLoadState('networkidle');

    // Validates client-side guard behaviour (TC-309 / TC-310 rely on required=true)
    await expect(page.locator('input[name="email"]')).toHaveAttribute('required', '');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required', '');
  });

});

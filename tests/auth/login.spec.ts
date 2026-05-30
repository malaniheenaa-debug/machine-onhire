import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Login', () => {
  test('should display login page', async ({ loginPage, page }) => {
    await loginPage.goto();
    expect(await loginPage.getTitle()).toBeTruthy();
  });

  test('should show error on invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@email.com', 'wrongpassword');
    await loginPage.expectLoginError();
  });

  test('should login with valid credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );
    await expect(page).not.toHaveURL(/login/);
  });
});

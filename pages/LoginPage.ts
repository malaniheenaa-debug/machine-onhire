import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // The login form uses <label class="form-label"> without a `for` attribute,
  // so getByLabel() is unreliable. Selectors use name/type attributes instead.
  private emailInput    = this.page.locator('input[name="email"]');
  private passwordInput = this.page.locator('input[name="password"]');
  private submitButton  = this.page.getByRole('button', { name: /^login$/i });
  readonly errorMessage = this.page.locator('.alert-danger');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/login.php');
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 8000 });
  }
}

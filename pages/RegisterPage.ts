import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly nameInput     = this.page.locator('input[name="name"]');
  readonly emailInput    = this.page.locator('input[name="email"]');
  readonly passwordInput = this.page.locator('input[name="password"]');
  readonly submitButton  = this.page.getByRole('button', { name: /^register$/i });
  readonly loginLink     = this.page.getByRole('link', { name: /login here/i });
  readonly errorMessage  = this.page.locator('.alert-danger');
  readonly successMessage = this.page.locator('.alert-success');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/register.php');
    await this.waitForPageLoad();
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async expectRegisterError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 8000 });
  }
}

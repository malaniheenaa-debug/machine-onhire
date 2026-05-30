import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private emailInput = this.page.getByLabel(/email/i);
  private passwordInput = this.page.getByLabel(/password/i);
  private submitButton = this.page.getByRole('button', { name: /sign in|log in|login/i });
  private errorMessage = this.page.getByRole('alert');

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
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}

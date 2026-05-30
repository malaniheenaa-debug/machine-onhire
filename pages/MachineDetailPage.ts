import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MachineDetailPage extends BasePage {
  private machineName = this.page.locator('[data-testid="machine-name"], .machine-title, h1').first();
  private bookNowButton = this.page.getByRole('button', { name: /book now|rent now|enquire/i });
  private addToCartButton = this.page.getByRole('button', { name: /add to cart/i });
  private machineImage = this.page.locator('[data-testid="machine-image"], .machine-image img').first();

  constructor(page: Page) {
    super(page);
  }

  async goto(machineId: string) {
    await this.navigate(`/machines/${machineId}`);
    await this.waitForPageLoad();
  }

  async expectMachineVisible() {
    await expect(this.machineName).toBeVisible();
  }

  async clickBookNow() {
    await this.bookNowButton.click();
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async expectMachineImageVisible() {
    await expect(this.machineImage).toBeVisible();
  }
}

import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private cartItems = this.page.locator('[data-testid="cart-item"], .cart-item');
  private checkoutButton = this.page.getByRole('button', { name: /checkout|proceed/i });
  private emptyCartMessage = this.page.getByText(/cart is empty|no items/i);

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/cart');
    await this.waitForPageLoad();
  }

  async getCartItemCount() {
    return this.cartItems.count();
  }

  async expectCartEmpty() {
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}

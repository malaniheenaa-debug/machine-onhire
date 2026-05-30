import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class BookingPage extends BasePage {
  private startDateInput = this.page.getByLabel(/start date|from/i);
  private endDateInput = this.page.getByLabel(/end date|to/i);
  private confirmButton = this.page.getByRole('button', { name: /confirm|submit booking/i });
  private bookingConfirmation = this.page.locator('[data-testid="booking-confirmation"], .booking-success');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/booking');
    await this.waitForPageLoad();
  }

  async fillBookingDates(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
  }

  async confirmBooking() {
    await this.confirmButton.click();
    await this.waitForPageLoad();
  }

  async expectBookingConfirmed() {
    await expect(this.bookingConfirmation).toBeVisible();
  }
}

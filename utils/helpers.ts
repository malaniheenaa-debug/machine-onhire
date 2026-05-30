import { Page } from '@playwright/test';

export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDate(date);
}

export async function retryAction(action: () => Promise<void>, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await action();
      return;
    } catch (err) {
      if (attempt === retries) throw err;
    }
  }
}

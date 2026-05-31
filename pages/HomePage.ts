import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // -- Search --
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // -- Location filter (desktop inline panel, JS-driven, no form submission) --
  readonly locationSelect: Locator;

  // -- Top navigation --
  readonly logoLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;

  // -- Bottom navigation (mobile-only, d-md-none — not visible on desktop) --
  readonly cartLink: Locator;
  // Category sidebar toggle: only actionable on mobile viewport
  readonly sidebarToggle: Locator;

  // -- Machine listing cards --
  // Each card has class "card h-100 shadow-sm border rounded" and contains a "More.." link
  readonly machineCards: Locator;
  readonly forSaleBadges: Locator;
  readonly trendingBadges: Locator;
  readonly emptyState: Locator;

  // -- Category sidebar (offcanvas on mobile: #sidebarMenuMain d-md-none) --
  // On desktop the category list is always visible as a static inline column — no toggle needed
  readonly categorySidebar: Locator;
  readonly postRequirementLink: Locator;
  readonly contactUserLinks: Locator;

  constructor(page: Page) {
    super(page);

    this.searchInput = page.locator('input[name="search"]');
    this.searchButton = page.getByRole('button', { name: /search/i });

    // JS-driven location filter — select by its actual id
    this.locationSelect = page.locator('#locationSelectDesktop');

    // Top-nav links resolve via href since the link text includes a Bootstrap icon prefix
    this.logoLink = page.locator('a.navbar-brand');
    this.loginLink = page.locator('a[href="login.php"]').first();
    this.registerLink = page.locator('a[href="register.php"]').first();

    // Bottom nav is d-md-none — these links are in the DOM but hidden on desktop
    this.cartLink = page.locator('a[href="cart.php"]');
    this.sidebarToggle = page.locator('[data-bs-target="#sidebarMenuMain"]');

    // Filter .card elements to only machine listing cards (they all contain a "More.." link)
    this.machineCards = page.locator('.card').filter({
      has: page.locator('a', { hasText: 'More..' }),
    });
    this.forSaleBadges = page.locator('.badge-for-sale');
    this.trendingBadges = page.locator('.badge-trending');
    this.emptyState = page.locator('[data-testid="no-results"], .no-results, .empty-state');

    // Mobile offcanvas sidebar; desktop equivalent is the always-visible inline panel
    this.categorySidebar = page.locator('#sidebarMenuMain');
    // Two copies exist — one in the visible desktop panel, one in the hidden offcanvas
    this.postRequirementLink = page.locator('a[href="post_requirement.php"]').first();
    this.contactUserLinks = page.getByRole('link', { name: /contact user/i });
  }

  async goto() {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async search(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  async selectLocation(location: string) {
    await this.locationSelect.selectOption(location);
    await this.waitForPageLoad();
  }

  async getMachineCount() {
    return this.machineCards.count();
  }

  async expectAtLeastOneCard() {
    await expect(this.machineCards.first()).toBeVisible({ timeout: 10000 });
  }

  async openCategorySidebar() {
    await this.sidebarToggle.click();
    await this.categorySidebar.waitFor({ state: 'visible', timeout: 5000 });
  }
}

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests (headless)
npm test

# Run with browser visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug a specific test
npm run test:debug

# Run a single test file
npx playwright test tests/e2e/TC01_homepage.spec.ts

# Run a single test by title
npx playwright test -g "should load homepage successfully"

# Run by browser
npm run test:chrome
npm run test:firefox
npm run test:mobile

# View HTML report after a run
npm run test:report
```

## Architecture

**Language**: TypeScript throughout. The sample structure uses `.js` — this project uses `.ts` with strict mode enabled (`tsconfig.json`).

machineonhire-automation/
│
├── .env                        ← base URL, credentials, DB config
├── .env.example                ← safe to commit (no secrets)
├── .gitignore
├── package.json
├── playwright.config.js        ← global config (base URL, timeouts, reporters)
│
├── pages/                      ← Page Object Model (POM) classes
│   ├── BasePage.js
│   ├── HomePage.js
│   ├── MachineDetailPage.js
│   ├── CartPage.js
│   └── BookingPage.js
│
├── tests/
│   ├── e2e/
│   │   ├── TC01_homepage.spec.js
│   │   ├── TC02_search.spec.js
│   │   ├── TC03_machine_detail.spec.js
│   │   ├── TC04_booking.spec.js
│   │   └── TC05_cart.spec.js
│   └── visual/
│       └── TC06_visual_regression.spec.js
│
├── fixtures/
│   └── testData.js             ← static test data (machine IDs, keywords, etc.)
│
├── utils/
│   ├── helpers.js              ← reusable utility functions
│   └── dbHelper.js             ← MySQL query helpers (optional)
│
└── reports/                    ← auto-generated, gitignored
    └── .gitkeep

## Environment

BASE_URL=https://machineonhire.com
DB_HOST=md-31.webhostbox.net
DB_USER=your_db_user
DB_PASS=your_db_pass
DB_NAME=your_db_name
## Config notes

`playwright.config.ts` runs 5 browser projects by default (Chromium, Firefox, WebKit, Pixel 5, iPhone 13). CI sets `workers: 1` and `retries: 2`. Locally, workers are uncapped. Reports go to `playwright-report/` (HTML) and `reports/` — both are gitignored.

Path aliases (`@pages/*`, `@fixtures/*`, `@utils/*`) are declared in `tsconfig.json` but Playwright resolves imports directly, so use relative paths in spec files.

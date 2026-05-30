---
name: machineonhire-domain
description: Domain knowledge for machineonhire.com — covers business model, sitemap, page flows, DB schema (zorifcuz_machineonhire), entity relationships, taxonomy, pricing, known bugs, and test environment details. Load this skill when writing or reviewing tests for any page or feature on the site.
user-invocable: false
---

# MachineOnHire — Product Domain Skill Document

## Overview

MachineOnHire is a **PHP-based machinery and equipment rental marketplace** serving Pune and Mumbai, India. Users browse machine listings, filter by location/category, book rentals, post requirements, and contact machine owners. All data is server-rendered — no SPA framework.
## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | PHP server-rendered HTML, vanilla JS, Tailwind/Bootstrap-style CSS |
| **Backend** | PHP (shared hosting, cPanel) |
| **Database** | MySQL 8 — schema: `zorifcuz_machineonhire` (8 tables) |
| **Auth** | PHP session-based (no JWT) |
| **Cart** | PHP session only — no DB table |
| **Hosting** | cPanel — `md-31.webhostbox.net:2083` → `public_html/` |
| **Testing** | Playwright E2E, Chromium only |

## Architecture

```
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

## Data Models

### machines — Core listing entity

| Field | Type | Notes |
|---|---|---|
| id | int PK | Auto-increment |
| owner_id | int FK | → users.id |
| name | varchar(100) | Display name |
| description | text | Optional |
| category | varchar(100) | Denormalized string (not FK) |
| sub_category | varchar(100) | Denormalized string (not FK) |
| rate_type | enum | `hour` / `day` / `month` |
| rate | decimal(10,2) | Rental price |
| location | varchar(100) | Pune / Mumbai |
| availability_status | enum | `available` / `unavailable` |
| whatsapp_contact | varchar(20) | Powers the "Call" button |
| ready_to_sale | tinyint(1) | 1 = show "For Sale" badge |
| sale_cost | decimal(12,2) | Sale price (if ready_to_sale=1) |
| image | varchar(255) | Image filename/path |

### users — Registered accounts

| Field | Type | Notes |
|---|---|---|
| id | int PK | Auto-increment |
| name | varchar(100) | Full name |
| email | varchar(100) | Unique login identifier |
| password | varchar(255) | Likely bcrypt hashed |

### bookings — Rental & purchase transactions

| Field | Type | Notes |
|---|---|---|
| id | int PK | Auto-increment |
| user_id | int FK | → users.id |
| machine_id | int FK | → machines.id |
| start_date / end_date | date | Rental period (both required) |
| duration_type | enum | `hour` / `day` |
| status | enum | `pending` / `confirmed` / `cancelled` (default: pending) |
| sale | tinyint(1) | 0 = rental · 1 = purchase |

### Other tables

| Table | Purpose |
|---|---|
| `categories` | Top-level taxonomy (4 categories) |
| `subcategories` | Second-level taxonomy, FK → categories |
| `requirements` | User-posted equipment demand (auth-guarded post) |
| `call_logs` | Tracks every "Call" button click — drives Trending badge |
| `machine_seo` | Per-machine SEO overrides (meta_title / meta_description) |

## Key Business Rules

- **Trending badge** — computed from `call_logs` count per machine; no DB flag
- **For Sale badge** — shown only when `machines.ready_to_sale = 1`
- **SEO precedence** — `machine_seo` overrides `machines.meta_title / meta_description`
- **Cart** — PHP session only; cleared on session expiry
- **Auth guards** — `book_machine.php` and `post_requirement.php` redirect to `login.php` if unauthenticated
- **Known bug** — all listing cards link to `machine.php?id=9` regardless of actual machine ID

## Test Environment

| Environment | URL |
|---|---|
| Production | `https://machineonhire.com` |
| cPanel / File Manager | `https://md-31.webhostbox.net:2083` (fresh login required every session) |
| phpMyAdmin | `https://md-31.webhostbox.net:2083` → phpMyAdmin → `zorifcuz_machineonhire` |

## Detailed Knowledge (Sub-Files)

Load these based on what the current task needs:

- **Product overview, pricing, search/filter logic, data quality issues, open questions & glossary** → read `./business-rules.md`
- **Sitemap & page URL matrix, entity relationships, ERD & full DB schema (all 8 tables)** → read `./api-reference.md`
- **Top/bottom nav, machine listing card anatomy, detail page layout & auth form fields** → read `./ui-selectors.md`
- **Product taxonomy tree, all 6 user journeys, auth guards, test environment URLs & test data notes** → read `./user-flows.md`

# Session Handoff — MachineOnHire Automation Framework
**Date:** 2026-05-30  
**Carry this into the next session as starting context.**

---

## What Was Built So Far

### Project Location
`C:/Projects/machineonhire-automation/`

### Target Site
- **URL:** https://machineonhire.com
- **Type:** PHP + MySQL machinery rental marketplace (Pune & Mumbai)
- **Hosting:** cPanel — md-31.webhostbox.net:2083
- **Database:** `zorifcuz_machineonhire` (phpMyAdmin)

---

## Files Created

```
C:/Projects/machineonhire-automation/
├── .claude/
│   └── skills/
│       ├── machineonhire-domain/
│       │   └── SKILL.md       ← Full domain knowledge (DB schema, flows, rules, taxonomy)
│       └── create_scenarios/
│           └── SKILL.md       ← Scenario generator skill (6 lenses, TC template, numbering)
├── docs/
│   └── (empty — PRODUCT_DOMAIN_SKILL content migrated into machineonhire-domain skill)
├── playwright.config.js       ← (to be created)
├── .env                       ← (to be created)
└── package.json               ← (npm init done, Playwright installed)
```

---

## Key Domain Facts (from live site + phpMyAdmin)

### 8 Pages Discovered
| Page | Auth Required |
|------|:---:|
| `index.php` | No |
| `machine.php?id={id}` | No |
| `login.php` | No |
| `register.php` | No |
| `book_machine.php?id={id}` | Yes |
| `post_requirement.php` | Yes |
| `contact_user.php?id={id}` | No |
| `cart.php` | No |

### 8 DB Tables (zorifcuz_machineonhire)
`machines` · `users` · `bookings` · `categories` · `subcategories` · `requirements` · `call_logs` · `machine_seo`

### Critical Business Rules
- `ready_to_sale = 1` → "For Sale" badge + sale_cost shown
- Trending badge = computed from `call_logs` count (no DB flag)
- Cart = PHP session only (no DB table)
- `book_machine.php` + `post_requirement.php` redirect to login if unauthenticated
- `bookings.sale = 1` = purchase; `sale = 0` = rental with start/end dates
- Default booking status = `pending` (owner must confirm)
- Known bug: all listing cards link to `machine.php?id=9` regardless of actual machine

---

## What Needs to Be Done Next

### Immediate Next Steps
1. **Create `playwright.config.js`** with baseURL, timeouts, reporters, multi-browser projects
2. **Create `.env`** with BASE_URL and DB credentials
3. **Build Page Object Model classes:**
   - `pages/BasePage.js`
   - `pages/HomePage.js`
   - `pages/MachineDetailPage.js`
   - `pages/LoginPage.js`
   - `pages/RegisterPage.js`
   - `pages/BookingPage.js`
   - `pages/CartPage.js`
4. **Generate test scenarios** using `/create_scenarios` skill
5. **Write first test specs** starting with homepage (TC-001 to TC-009)

### Still Open (Needs cPanel Source Code Access)
| Item | Why Needed |
|------|-----------|
| Search GET param name | `?search=` vs `?q=` vs `?keyword=` |
| Admin panel path | Is there an `admin/` directory? |
| AJAX endpoints | Call button, cart add — are they fetch/XHR calls? |
| Email notifications | Does booking submission send an email? |
| PHP session timeout | For session expiry test scenarios |

---

## How to Resume
1. Open VS Code at `C:/Projects/machineonhire-automation/`
2. Start new Claude Code session
3. Reference this file: `SESSION_HANDOFF.md`
4. Say: **"Continue the MachineOnHire automation framework. Read SESSION_HANDOFF.md for context."**

# MachineOnHire — Homepage Test Strategy

Generated: 2026-05-30
Input: `docs/test-scenarios.md` (61 scenarios, TC-001 to TC-510)
Scope: `index.php` — Homepage (search, filter, listing grid, sidebar, navigation)

---

## Architecture Note

MachineOnHire is a **PHP server-rendered monolith** — not a REST API + SPA. This changes the test pyramid:

- **No Unit layer** — PHP service functions are not accessible without PHPUnit (out of scope)
- **No API layer** — there are no JSON endpoints; all responses are full HTML page reloads
- **DB layer replaces API layer** — the only way to verify business-rule writes (call_logs, bookings, requirements) is directly querying MySQL via `utils/dbHelper.ts`

```
         ▲  E2E (Playwright)
        ▲▲▲  Multi-page journeys · auth flows · redirect chains · session state
       ▲▲▲▲▲  DB Validation (dbHelper.ts + MySQL)
      ▲▲▲▲▲▲▲  Verify writes to call_logs · requirements · bookings
     ▲▲▲▲▲▲▲▲▲  Component (Playwright single-page)
    ▲▲▲▲▲▲▲▲▲▲▲  Rendering · badge logic · form validation · UI state on index.php
         ▼  Manual / Exploratory
             Known bugs · live data pollution · session edge cases
```

---

## 1. Layer Distribution Summary

| Layer | TC Count | Focus | Est. Run Time |
|---|---|---|---|
| **E2E** | 21 | Multi-page navigation, session-based auth, redirect chains, security | ~3–5 min |
| **Component** | 28 | Single-page rendering, badge logic, filter results, form validation, UI states | ~1–2 min |
| **DB** | 10 | Write verification for `call_logs`; read verification for badges, requirements, SEO | ~5–10 sec |
| **Manual** | 2 | Known bugs (id=9 card link) and polluted test data — document, don't automate | Manual |
| **TOTAL** | **61** | | |

> **Note on multi-layer coverage**: TC-100, TC-101, TC-102, TC-109, TC-500, TC-501, TC-502, TC-503 are tagged **E2E + DB** — the E2E confirms UI rendering and the DB check confirms the underlying data state. These are counted once in the E2E total.

**Pyramid shape**: Component (28) → E2E (21) → DB (10) → Manual (2) ✓

---

## 2. Layer Assignments

### Component Tests
_Criteria: Single page (`index.php`) renders correctly for a given data state or user interaction. No navigation to a different `.php` page. PHP page reloads (search submit, filter change) still count as Component since the user stays on `index.php`._

#### Happy Path — Page Structure
| TC | Title | Element / Behaviour | Rationale |
|---|---|---|---|
| TC-002 | Top nav bar renders all expected elements | Logo, Login, Register links | Single-page structure check — no navigation needed |
| TC-003 | Bottom nav bar renders all expected links | Home, Category, Search, Cart | Single-page structure check |
| TC-004 | Machine listing grid renders at least one card | `.machine-card` count > 0 | Rendering check on index.php — no navigation |
| TC-009 | Category sidebar opens on trigger click | Panel visibility toggle | Single-page JS/CSS interaction |

#### Happy Path — Search & Filter (stays on `index.php`)
| TC | Title | Interaction | Rationale |
|---|---|---|---|
| TC-005 | Keyword search returns relevant results | Fill search, submit → page reload | PHP GET to same page — Component |
| TC-006 | Location filter "Pune" shows only Pune machines | Select dropdown → submit | PHP GET to same page |
| TC-007 | Location filter "Mumbai" shows only Mumbai machines | Select dropdown → submit | PHP GET to same page |
| TC-008 | Location filter "All locations" resets results | Select → submit | PHP GET to same page |
| TC-010 | Subcategory filter link returns filtered list | Click → `index.php?subcategory=X` | URL changes but stays on `index.php` |
| TC-011 | Combined keyword + location filter returns correct results | Both inputs → submit | PHP GET to same page |

#### Business Rules — Rendering
| TC | Title | Condition | Rationale |
|---|---|---|---|
| TC-103 | Rate displayed in correct format — per day | `rate_type=day` → `₹X.00/day` | Visual format check on card — single page |
| TC-104 | Rate displayed in correct format — per hour | `rate_type=hour` → `₹X.00/hour` | Visual format check on card |
| TC-105 | Location dropdown exposes only valid values | Check `<option>` elements | DOM inspection on same page |
| TC-107 | All 4 top-level categories appear in sidebar | Count category headings | Single-page DOM assertion after sidebar open |

#### Negative / Error — Stay on `index.php`
| TC | Title | Input | Rationale |
|---|---|---|---|
| TC-300 | No-match keyword search shows empty state | `zzznomatch999` → submit | PHP GET to same page, no navigation |
| TC-301 | Empty search query — graceful handling | Empty field → submit | PHP GET to same page |
| TC-302 | Location `"1"` dirty data — graceful handling | Select "1" if present → submit | PHP GET to same page |
| TC-303 | SQL characters in search don't break page | `'; DROP TABLE` → submit | PHP GET to same page |
| TC-304 | 500-char input doesn't crash page | Long string → submit | PHP GET to same page |
| TC-305 | Invalid subcategory name in URL — graceful | `?subcategory=DoesNotExist` | PHP GET to same page |
| TC-306 | URL-manipulated location value — graceful | `?location=FakeCity` | PHP GET to same page |

#### Edge Cases — Rendering
| TC | Title | Condition | Rationale |
|---|---|---|---|
| TC-402 | Subcategory name with spaces URL-encodes correctly | URL param space handling | Single-page URL assertion |
| TC-405 | No-match combined filter shows empty state | Keyword + location → zero results | PHP GET to same page |
| TC-407 | Urban Mobility subcategory filter returns correct machines | Click subcategory → filter | URL changes but stays on `index.php` |

#### UI State — Conditional Rendering
| TC | Title | Condition | Rationale |
|---|---|---|---|
| TC-504 | Category sidebar hidden by default on load | No interaction | DOM state check on load |
| TC-505 | Sidebar opens and closes on repeated toggle | Click pattern | Single-page JS toggle |
| TC-506 | Machine card image alt text follows SEO pattern | `alt` attribute format | Single-page DOM assertion |
| TC-508 | Long description is truncated with "More.." link | `description` length | Card layout assertion |
| TC-509 | Location dropdown defaults to "All locations" | Fresh load | Default `<select>` state |
| TC-510 | All cards show consistent anatomy | 3–5 cards inspected | Layout consistency — same page |

---

### E2E Tests
_Criteria: Navigation to a different `.php` page, PHP session/auth state required, redirect chain, or external action (call/cart). Minimum: Chromium._

#### Happy Path — Navigation to Other Pages
| TC | Title | Journey | Why Must Be E2E |
|---|---|---|---|
| TC-001 | Homepage loads successfully | `→ index.php` | Full-page load + HTTP 200 + no console errors — needs real navigation |
| TC-012 | Logo click navigates back to homepage | Filtered page `→ index.php` | Navigation from one URL to another |
| TC-013 | Bottom nav Cart link navigates to cart.php | `index.php → cart.php` | Cross-page navigation |
| TC-014 | "Login" nav link navigates to login.php | `index.php → login.php` | Cross-page navigation |
| TC-015 | "Register" nav link navigates to register.php | `index.php → register.php` | Cross-page navigation |
| TC-016 | "Contact User" link navigates to contact_user.php | `index.php → contact_user.php?id=X` | Cross-page navigation with dynamic ID |
| TC-017 | "Post Requirement" link present and navigates | `index.php → post_requirement.php` | Cross-page + auth-guard in next journey |
| TC-018 | Machine card "Call" button has phone/WhatsApp action | Click Call → external action | Requires real DOM interaction + verifying `tel:`/`wa.me/` href |
| TC-019 | Machine card Cart icon adds to PHP session cart | Click cart icon | PHP session state change |

#### Business Rules — DB Write Verification
| TC | Title | E2E Action | DB Verification |
|---|---|---|---|
| TC-100 | "For Sale" badge shown when `ready_to_sale = 1` | Load page → assert badge visible | Confirm `ready_to_sale = 1` in `machines` table before assertion |
| TC-101 | Sale Price visible when `ready_to_sale = 1` | Load page → assert `₹{sale_cost}` | Confirm `sale_cost > 0` in `machines` table |
| TC-102 | Trending badge shown for high `call_logs` count | Load page → assert Trending visible | `SELECT COUNT(*) FROM call_logs WHERE machine_id = X` — highest count |
| TC-106 | Subcategory URL exact-matches DB string | Click subcategory → assert URL | Query `subcategories.subcategory_name` to get exact string |
| TC-108 | Latest Requirements section in sidebar | Open sidebar → assert requirement text | Query `requirements` table for latest row |
| TC-109 | "Call" button click writes to `call_logs` | Click Call button | Before/after `COUNT(*)` from `call_logs WHERE machine_id = X` |

#### Security — PHP Server Input Handling
| TC | Title | Attack Vector | Why Must Be E2E |
|---|---|---|---|
| TC-200 | XSS in search field not executed | `<script>alert('XSS')</script>` | Requires real browser + alert dialog detection |
| TC-201 | SQL injection in search does not expose DB errors | `' OR '1'='1` | PHP server response must be checked for MySQL error trace |
| TC-202 | XSS in location URL param not executed | `?location=<script>...` | Real browser alert detection |
| TC-203 | XSS in subcategory URL param not executed | `?subcategory=<script>...` | Real browser alert detection |
| TC-204 | Homepage accessible without auth (no auth wall) | Clear session → navigate | Confirms no redirect to `login.php` |
| TC-205 | Reflected search input is HTML-escaped | `"test" & <b>bold</b>` | Inspect rendered source for escaped chars |

#### UI State — Session-Dependent
| TC | Title | Precondition | Why Must Be E2E |
|---|---|---|---|
| TC-507 | Login/Register nav links hidden when authenticated | User logged in via `login.php` | Requires full login flow before asserting nav state |

#### E2E + DB — Badge Negative States
| TC | Title | E2E Action | DB Verification |
|---|---|---|---|
| TC-500 | "For Sale" badge NOT shown when `ready_to_sale = 0` | Assert badge absent | Confirm `ready_to_sale = 0` in `machines` table |
| TC-501 | Sale Price NOT shown when `ready_to_sale = 0` | Assert Sale Price absent | Confirm `ready_to_sale = 0` |
| TC-502 | Trending badge NOT shown for zero `call_logs` | Assert Trending absent | `SELECT COUNT(*) FROM call_logs WHERE machine_id = X` = 0 |
| TC-503 | Trending badge IS shown for high `call_logs` | Assert Trending visible | Query machine with max `call_logs` count |

---

### DB Tests
_Criteria: Verify data state in `zorifcuz_machineonhire` before or after an E2E action. Use `utils/dbHelper.ts` (enable by installing `mysql2`). DB tests always accompany an E2E flow — they are not standalone._

| TC | Table | Query Type | Paired With |
|---|---|---|---|
| TC-100 | `machines` | `SELECT ready_to_sale WHERE id = X` | TC-100 E2E |
| TC-101 | `machines` | `SELECT sale_cost, ready_to_sale WHERE id = X` | TC-101 E2E |
| TC-102 | `call_logs` | `SELECT COUNT(*) WHERE machine_id = X` (highest) | TC-102 E2E |
| TC-106 | `subcategories` | `SELECT subcategory_name WHERE id = X` | TC-106 E2E |
| TC-108 | `requirements` | `SELECT * ORDER BY created_at DESC LIMIT 1` | TC-108 E2E |
| TC-109 | `call_logs` | `COUNT(*)` before and after Call click | TC-109 E2E |
| TC-401 | `machines` | `SELECT description WHERE id = X` — null check | TC-401 E2E |
| TC-500 / TC-501 | `machines` | `SELECT ready_to_sale WHERE id = X` = 0 | TC-500/501 E2E |
| TC-502 / TC-503 | `call_logs` | `COUNT(*) GROUP BY machine_id` — zero vs max | TC-502/503 E2E |

---

### Manual / Exploratory Tests
_Criteria: Automation would assert on broken behavior, OR live data pollution makes assertion unreliable. Document the bug, observe manually, do not automate a passing assertion._

| TC | Title | Reason for Manual | Action |
|---|---|---|---|
| TC-400 | All listing cards link to `machine.php?id=9` (known bug) | Automating this would assert the **bug** as correct behavior | Document the href values across all visible cards; create a bug report; re-automate as a regression test once fixed |
| TC-403 | Machine with polluted test name renders harmlessly | Exact card count and order are unpredictable in production | Visual inspection only; note test names observed (`1`, `1q`, `test`); do NOT assert count |

---

## 3. Decision Rationale — Contested Assignments

### TC-005 / TC-006 / TC-007 / TC-008 / TC-011 — Search & Filter → Component (not E2E)
**Original label in scenarios**: E2E
**Decision**: Component

**Rationale**: Submitting the search form or selecting a location option triggers a `GET` request that reloads `index.php` with different query parameters. The user never leaves `index.php` — the URL may change to `index.php?search=cooler&location=Pune` but the page rendered is the same template. This is equivalent to a component rendering test with different input props. Running these as E2E adds full browser session overhead for what is simply a server-side filter result rendered on the same page. Push to Component — saves ~40% of E2E run time.

---

### TC-200 / TC-201 / TC-202 / TC-203 / TC-205 — XSS & SQL Injection → E2E (not Component)
**Original label in scenarios**: E2E
**Decision**: E2E confirmed — do NOT downgrade to Component

**Rationale**: XSS tests (TC-200, TC-202, TC-203) require a **real browser** to detect whether a JavaScript alert fires. Playwright's `page.on('dialog')` event handler is the only reliable way to catch an executed `alert()`. A headless page evaluation alone cannot replicate the browser's script execution sandbox. SQL injection tests (TC-201, TC-303) must verify that the **full PHP server response** contains no MySQL error trace — this requires the real HTTP round-trip, not a mocked component render.

---

### TC-103 / TC-104 — Pricing Format → Component (not E2E)
**Original label in scenarios**: E2E
**Decision**: Component

**Rationale**: Asserting `₹{amount}.00/day` or `₹{amount}.00/hour` on a listing card is a pure DOM rendering check. The data comes from `machines.rate` and `machines.rate_type` which are already in the DB — no user action triggers a page change. This is analogous to asserting a prop renders correctly in a React component. Isolate it as a Component test scoped to a specific known machine card, paired with a DB pre-check to confirm `rate_type`.

---

### TC-109 — Call Button Click writes to `call_logs` → E2E + DB (not Component)
**Original label in scenarios**: E2E + DB
**Decision**: E2E + DB confirmed

**Rationale**: The Call button click is an action that has a **side effect** (PHP writes a row to `call_logs`). A Component test cannot verify a DB write — it only confirms the button is clickable. The DB layer is mandatory here: query `COUNT(*) FROM call_logs WHERE machine_id = X` before clicking, click, re-query, assert count increased by 1. This is defense-in-depth — the E2E layer confirms the UI action succeeds; the DB layer confirms the business rule (call logging) was executed.

---

### TC-300 to TC-306 — Negative / Error → Component (not E2E)
**Original label in scenarios**: E2E
**Decision**: Component

**Rationale**: All negative scenarios remain on `index.php` — they submit a search or navigate to a URL variant and verify the same-page response. There is no redirect to another PHP page, no session state required, no auth. Submitting `zzznomatch999` and asserting an empty-state message is a Component-level check. The PHP server returns a filtered HTML response — same page, different content. Downgrading these saves ~30% of E2E run time with zero loss of test value.

---

### TC-507 — Login/Register Nav Hidden When Authenticated → E2E (not Component)
**Original label in scenarios**: E2E
**Decision**: E2E confirmed

**Rationale**: This test requires a real PHP session established by logging in at `login.php`. The session cookie is then carried to `index.php` where the nav adapts. A Component test with a mocked session would require understanding and replicating PHP session structure — not feasible here. Use the `loggedInPage` fixture from `fixtures/auth.fixture.ts` which handles the full login journey before the assertion.

---

### TC-400 / TC-403 — Known Bug & Polluted Data → Manual (not E2E)
**Original label in scenarios**: E2E
**Decision**: Manual only

**Rationale for TC-400**: Automating an assertion that all cards link to `machine.php?id=9` would make a **test that passes by asserting a bug**. When the bug is fixed (each card links to its correct ID), the automated test would break — causing confusion about what "passing" means. Instead: manually document the href values, file a bug report, and write the regression test only after the fix is in place.

**Rationale for TC-403**: Test data pollution (`1`, `1q`, `test`) on production means listing counts and card order are unpredictable across runs. No assertion can be written reliably. Note it as a known data quality issue and exclude it from the automated suite entirely.

---

## 4. Anti-Patterns to Avoid

These anti-patterns were identified from the original `E2E` labels in `docs/test-scenarios.md`:

| Anti-Pattern | Affected TCs | Correct Approach |
|---|---|---|
| Search/filter results tested at full E2E (cross-page overhead) | TC-005, TC-006, TC-007, TC-008, TC-011 | Component — PHP reloads same page; assert result set at Component level |
| Rate format asserted at E2E | TC-103, TC-104 | Component — pure DOM render check; no navigation needed |
| Error state (negative tests) run at E2E | TC-300–TC-306 | Component — all responses stay on `index.php` |
| No DB write verification after Call click | TC-109 | Add DB layer: `COUNT(*)` in `call_logs` before and after |
| Badge logic tested without DB confirmation | TC-100, TC-101, TC-102, TC-500–TC-503 | Always pair badge assertions with a DB query to confirm the underlying data state |
| Automating the id=9 card link bug | TC-400 | Manual only — do not assert broken behavior as correct |
| Asserting exact listing count | Any TC | Use `.first().toBeVisible()` or `count > 0` — live data is polluted |
| `page.waitForTimeout(N)` anywhere | All | Use `waitForPageLoad()` (`networkidle`) from `BasePage` |
| All 61 scenarios in one spec file | All | Split by category: `TC01_homepage_structure.spec.ts`, `TC02_search_filter.spec.ts`, `TC03_badges.spec.ts`, `TC04_security.spec.ts` |
| Hardcoded machine IDs (other than `id=9`) | Any | Use `testData.machines.validMachineId` — all links resolve to `id=9` anyway |

---

## 5. Defence-in-Depth Coverage Map

Critical business rules covered at multiple layers:

| Rule | Component | E2E | DB |
|---|---|---|---|
| For Sale badge: shown when `ready_to_sale = 1` | — | TC-100 | TC-100 (confirm DB value) |
| For Sale badge: hidden when `ready_to_sale = 0` | — | TC-500 | TC-500 (confirm DB value) |
| Sale Price: shown only when `ready_to_sale = 1` | — | TC-101 | TC-101 (confirm `sale_cost`) |
| Trending badge: present for max `call_logs` count | — | TC-102, TC-503 | TC-102, TC-503 (count query) |
| Trending badge: absent for zero `call_logs` | — | TC-502 | TC-502 (count = 0 query) |
| Call button click writes to `call_logs` | — | TC-109 | TC-109 (before/after count) |
| Requirements sidebar reads `requirements` table | — | TC-108 | TC-108 (latest row check) |
| Subcategory URL exact-matches DB string | TC-010 | TC-106 | TC-106 (query exact name) |
| XSS reflected input is escaped | — | TC-200, TC-202, TC-203, TC-205 | — |
| Location "1" dirty data handled gracefully | TC-302 | — | — |

---

## 6. Implementation Priority Order

Ship in this order — each tier unblocks the next.

### Tier 1 — P0, must pass before any release
```
TC-001  Homepage loads (E2E)
TC-200  XSS in search not executed (E2E)
TC-201  SQL injection in search (E2E)
TC-202  XSS in location param (E2E)
TC-203  XSS in subcategory param (E2E)
TC-204  Homepage public with no auth (E2E)
TC-004  Listing grid renders cards (Component)
TC-300  No-match search — empty state (Component)
```

### Tier 2 — P1, run in CI on every PR
```
TC-005, TC-006, TC-007, TC-008  Search & filter (Component)
TC-100, TC-101, TC-102          For Sale & Trending badges (E2E + DB)
TC-103, TC-104                  Rate format ₹ display (Component)
TC-109                          Call click → call_logs write (E2E + DB)
TC-205                          Reflected input HTML-escaped (E2E)
TC-302                          Dirty location "1" graceful (Component)
TC-303, TC-301                  SQL chars & empty search (Component)
TC-500, TC-501, TC-502, TC-503  Badge negative states (E2E + DB)
TC-504, TC-507                  Sidebar default state; Auth nav (E2E/Component)
```

### Tier 3 — P2, run nightly or pre-release
```
TC-009, TC-010, TC-011          Sidebar open; subcategory; combined filter (Component/E2E)
TC-012–TC-019                   Navigation links & Call/Cart (E2E)
TC-105, TC-106, TC-107, TC-108  Dropdown values; taxonomy; requirements (Component + DB)
TC-304–TC-306                   Input length & URL manipulation (Component)
TC-402, TC-405, TC-407          Edge case filters (Component)
TC-505, TC-506, TC-508, TC-509, TC-510  Sidebar toggle; alt text; truncation; defaults (Component)
```

### Tier 4 — P3, pre-release only
```
TC-401, TC-404, TC-406          Null description/image; month rate_type (E2E + DB)
TC-403                          Polluted test names (Manual)
TC-400                          id=9 card link bug (Manual — file bug report)
```

---

## 7. Source File Map for Test Generation

| Layer | Test File | Key Source |
|---|---|---|
| Component — Structure | `tests/e2e/TC01_homepage_structure.spec.ts` | `pages/HomePage.ts` |
| Component — Search/Filter | `tests/e2e/TC02_search_filter.spec.ts` | `pages/HomePage.ts` |
| Component — Badges & Pricing | `tests/e2e/TC03_badges_pricing.spec.ts` | `pages/HomePage.ts` + `utils/dbHelper.ts` |
| Component — Negative/Edge | `tests/e2e/TC04_negative_edge.spec.ts` | `pages/HomePage.ts` |
| Component — UI States | `tests/e2e/TC05_ui_states.spec.ts` | `pages/HomePage.ts` |
| E2E — Navigation | `tests/e2e/TC06_navigation.spec.ts` | `pages/HomePage.ts`, `pages/LoginPage.ts` |
| E2E — Security | `tests/e2e/TC07_security.spec.ts` | `pages/HomePage.ts` |
| E2E — Auth State | `tests/auth/TC08_auth_nav_state.spec.ts` | `fixtures/auth.fixture.ts` |
| DB — Write Verification | Inline in badge + call-log spec files | `utils/dbHelper.ts` |
| Manual | `docs/known-bugs.md` | Bug report for TC-400 |

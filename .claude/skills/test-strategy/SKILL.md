---
name: test-strategy
description: Analyze MachineOnHire test scenarios and assign optimal test layers (E2E / DB / API / Component) with pyramid distribution, rationale, and anti-pattern detection
disable-model-invocation: true
argument-hint: "[feature-name or blank for full application analysis]"
---

# Test Strategist & Architect Agent — MachineOnHire

You are a **Test Strategist** — part tester, part architect. You decide the optimal test layer for every scenario and ensure the test suite forms a healthy pyramid, not an ice cream cone.

---

## Knowledge Sources
Read these BEFORE making any decisions:

1. **`docs/test-scenarios.md`** — Scenarios from `/create-scenarios` skill (your primary input)
2. **`machineonhire-domain` skill** — Overview, tech stack, architecture, data models, known bugs
3. **`machineonhire-domain` sub-files**:
   - `./business-rules.md` — Pricing, search/filter logic, known data quality issues → drives Unit/DB layer decisions
   - `./api-reference.md` — Page URL matrix, DB schema → drives DB layer decisions
   - `./user-flows.md` — 6 user journeys, auth guards → drives E2E layer decisions
   - `./ui-selectors.md` — Page structure, card anatomy → drives Component layer decisions
4. **`playwright-best-practices` skill** — E2E coding standards
5. **`tests/`** — Existing test files to identify what is already covered vs. gaps
6. **`pages/`** — Existing POM classes to understand what UI interactions are already modelled

---

## Task
Analyze and assign test layers for: `$ARGUMENTS`

If none specified, analyze the **entire application** across all 8 pages:
`index.php` · `machine.php` · `login.php` · `register.php` · `book_machine.php` · `post_requirement.php` · `contact_user.php` · `cart.php`

---

## MachineOnHire Architecture Context

This is **not** a REST API app — it is a **PHP server-rendered monolith**. The test pyramid looks different here:

```
         ▲  E2E (Playwright)
        ▲▲▲  Full user journeys, auth flows, multi-page navigation
       ▲▲▲▲▲  DB Validation (MySQL direct via dbHelper)
      ▲▲▲▲▲▲▲  DB writes verified: bookings, call_logs, requirements
     ▲▲▲▲▲▲▲▲▲  Component / Page Unit (Playwright isolated page tests)
    ▲▲▲▲▲▲▲▲▲▲▲  Single-page rendering, badge logic, form validation
```

> There is **no backend API layer to test independently** (no REST endpoints, no JSON responses).
> Unit tests of PHP functions require PHPUnit — out of scope for this project.
> The lowest testable layer here is **DB state + single-page rendering**.

---

## Layer Definitions for This Project

| Layer | Tool | What it covers |
|---|---|---|
| **E2E** | Playwright | Multi-page user journeys, session-based auth flows, redirect chains, cross-page state |
| **DB** | `utils/dbHelper.ts` + MySQL | Verify DB writes (bookings, call_logs, requirements rows), DB state before/after actions |
| **Component** | Playwright (isolated) | Single-page rendering: badges, conditional elements, form validation messages, listing card anatomy |
| **Manual / Exploratory** | Browser | Known bugs, live data quality issues, session expiry edge cases |

---

## Decision Rules

Apply in order — stop at the first rule that fits:

1. **Multi-page flow or full-stack journey** (login → navigate → act → verify redirect) → **E2E**
2. **Auth guard or session behaviour** (redirect to login, session expiry) → **E2E**
3. **DB write verification** (new row in `bookings`, `call_logs`, `requirements`) → **DB**
4. **Conditional UI element on a single page** (For Sale badge, Trending badge, Sale Price, availability status) → **Component**
5. **Form input validation on a single page** (required field, email format, date logic) → **Component**
6. **Known live data quality issue** (listing count, location "1", id=9 bug) → **Manual / flag in test comment**
7. **Could work at a lower layer?** → Push it DOWN
8. **In doubt?** → Lowest layer that tests it adequately

---

## MachineOnHire-Specific Layer Assignments

Use these as baseline decisions. Override only with clear rationale.

| Scenario Type | Default Layer | Reason |
|---|---|---|
| Homepage loads with listings | Component | Single page, no navigation chain |
| Search by keyword | Component | Single page state change |
| Location filter dropdown | Component | Single page, server-rendered response |
| Category sidebar navigation | E2E | Involves panel open → click → URL change → new page |
| Machine detail page loads | Component | Single page rendering |
| For Sale badge visibility | Component | Conditional render from DB column |
| Trending badge visibility | Component | Computed from call_logs count |
| Login with valid credentials | E2E | Auth flow + redirect |
| Login with invalid credentials | Component | Error message on same page |
| Register new user | E2E | Form submit + DB write + redirect |
| Auth guard redirect (book_machine.php) | E2E | Redirect chain across pages |
| Auth guard redirect (post_requirement.php) | E2E | Redirect chain across pages |
| Book a machine (full flow) | E2E | Login → detail → booking form → submit |
| Booking written to DB | DB | Verify `bookings` table row after E2E flow |
| Post a requirement | E2E | Login → form → submit → sidebar update |
| Requirement written to DB | DB | Verify `requirements` table row |
| Call button click | E2E | WhatsApp link or phone dial initiated |
| Call log written to DB | DB | Verify `call_logs` table row after click |
| Cart add/remove | Component | PHP session — no DB, single page state |
| Cart empty state | Component | Single page conditional render |
| Contact user form | Component | Single page form |
| SEO meta title/description | Component | `<head>` tag assertion on single page |

---

## Anti-Patterns to Flag

Scan `tests/` and `docs/test-scenarios.md` for these and call them out explicitly:

| Anti-Pattern | Why It's Bad | Correct Layer |
|---|---|---|
| Login form validation tested via full E2E flow | Slow, fragile, overkill for a single-page error | Component |
| Listing count asserted in E2E | Breaks with live data pollution (`1`, `1q`, `test`) | Remove or use `> 0` guard |
| Booking DB write not verified | E2E passes but DB row never confirmed | Add DB layer check |
| All badge tests in E2E | Badge logic is single-page rendering | Component |
| `page.waitForTimeout()` anywhere | Flaky arbitrary sleep | `networkidle` / `expect().toBeVisible()` |
| All 6 journeys in a single spec file | Hard to maintain, slow, no isolation | One spec per journey |
| No auth-guard tests | Critical security gap — guarded pages untested | E2E (mandatory) |
| Everything at E2E | Ice cream cone — slow CI, brittle suite | Push badge/form tests to Component |

---

## Output

Write to **`docs/test-strategy.md`** (consumed by `/generate-tests` skill).

Structure it as:

### 1. Distribution Table
```
| Layer      | Count | Focus                              | Est. Run Time |
|------------|-------|------------------------------------|---------------|
| E2E        |  XX   | Multi-page journeys, auth flows    | ~X min        |
| DB         |  XX   | Write verification (bookings etc.) | ~X sec        |
| Component  |  XX   | Single-page rendering & forms      | ~X min        |
| Manual     |  XX   | Known bugs, live data edge cases   | Manual        |
| TOTAL      |  XX   |                                    |               |
```

### 2. Layer Assignments
For every TC-NNN from `docs/test-scenarios.md`:
- Assigned layer
- Source page / POM file reference
- One-line rationale (mandatory for any E2E assignment that could be Component)

### 3. Defence-in-Depth Coverage
List scenarios that should be covered at **multiple layers** for critical business rules:
- Booking flow: E2E (journey) + DB (row written) + Component (form validation)
- Auth guard: E2E (redirect) + Component (login error message)
- For Sale badge: Component (render) + DB (confirm `ready_to_sale=1`)

### 4. Anti-Patterns Found
List any violations found in existing `tests/` files with file name + line reference.

### 5. Gaps & Recommendations
- Scenarios in `docs/test-scenarios.md` with no existing test file
- Missing DB verification steps after E2E flows
- Pages with no Component-level coverage
- `data-testid` attributes that are absent in the PHP source (flag for dev team)

---
## Output
Write to **`docs/test-strategy.md`** (consumed by `/generate-tests` skill).
Include: distribution table (layer/count/focus/time), layer assignments with IDs and source file references, decision rationale for contested assignments, and anti-patterns found in existing tests.

## Rules

- **Wide at bottom, narrow at top** — many Component tests, fewer E2E tests
- **Every E2E assignment must be justified** — if it can be Component, it should be
- **DB verification is non-optional** for any scenario that writes to `bookings`, `call_logs`, or `requirements`
- **Known bugs** (id=9 card link, location "1") must be flagged as Manual — do not write automated tests that depend on broken behaviour
- **Auth guards are always E2E** — never downgrade them to Component
- **Reference specific TC-NNN IDs** from `docs/test-scenarios.md` in every assignment

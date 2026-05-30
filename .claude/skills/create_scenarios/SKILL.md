---
name: create-scenarios
description: Generate functional test scenarios for MachineOnHire from domain knowledge using 6 thinking lenses
disable-model-invocation: true
argument-hint: "[feature-name or blank for full suite]"
---

# Functional Tester Agent

You are a **Senior Functional Test Designer** — you think like a real user, a rental customer, AND a malicious user.

## Knowledge Sources

Read these BEFORE creating scenarios:
1. `machineonhire-domain` skill — Start here for full domain overview, entity model, DB schema, user journeys, and known data quality issues
2. `machineonhire-domain` skill Section 6 — User journeys (Browse, Book, Search, Post Requirement, Contact, Buy)
3. `machineonhire-domain` skill Section 17 — Verified DB schema for all 8 tables (machines, users, bookings, call_logs, requirements, categories, subcategories, machine_seo)
4. `machineonhire-domain` skill Section 9 — Authentication flows (login.php, register.php, auth guards)
5. `machineonhire-domain` skill Section 11 — Known data quality issues on the live site

## Task

Create test scenarios for: `$ARGUMENTS`

If none specified, generate a **COMPLETE suite** covering all 8 pages:
`index.php` · `machine.php` · `login.php` · `register.php` · `book_machine.php` · `post_requirement.php` · `contact_user.php` · `cart.php`

## Thinking Framework

For every feature/flow in the domain skill, apply ALL 6 lenses:

| Lens | Question |
|------|----------|
| Happy Path | What is the expected successful journey for a guest or logged-in user? |
| Business Rules | What domain rules must be validated? (pricing, rate_type, ready_to_sale, booking status, auth guards) |
| Security | Can unauthenticated users access guarded pages? Can users tamper with IDs in URLs? |
| Negative / Error | What happens with invalid inputs, wrong credentials, missing required fields, or expired sessions? |
| Edge Cases | What are boundary values? (empty search, invalid machine ID, location = "1", month rate_type in UI) |
| UI State | Are conditional elements shown correctly? (For Sale badge, Trending badge, Sale Price, empty cart, availability_status) |

## MachineOnHire-Specific Business Rules

Apply these domain rules in every relevant scenario:

| Rule | Detail |
|------|--------|
| Auth Guard | `book_machine.php` and `post_requirement.php` redirect to `login.php` when unauthenticated |
| For Sale badge | Only shown when `machines.ready_to_sale = 1`; Sale Price field must also be visible |
| Trending badge | Computed from `call_logs` count — no DB flag; appears/disappears based on call activity |
| Cart | PHP session-based — no DB table; cart state is lost on session expiry |
| Booking default status | New bookings default to `pending`; requires owner confirmation to become `confirmed` |
| Sale vs Rental | `booking.sale = 1` = purchase transaction; `booking.sale = 0` + start_date/end_date = rental |
| Location filter | Valid values: Mumbai, Pune, All locations; value `"1"` is dirty test data — must handle gracefully |
| Subcategory URL | `index.php?subcategory={name}` — name must match exact string in DB |
| Machine ID bug | All listing cards currently link to `machine.php?id=9` — known potential bug; test each card individually |
| SEO override | `machine_seo` table overrides `machines.meta_title` and `machines.meta_description` |

## Output Format

Write to **`docs/test-scenarios.md`**. Use this template for every scenario:

```
### TC-<NNN>: <Title>
**Module**:          <Homepage | Machine Detail | Login | Register | Booking | Cart | Post Requirement | Contact User>
**Category**:        <Happy Path | Business Rule | Security | Negative | Edge Case | UI State>
**Priority**:        <P0 | P1 | P2 | P3>
**Preconditions**:   <what must be true before starting — user state, data state>
**Steps**:
  1. <action>
  2. <action>
  3. ...
**Expected Result**: <what to assert — element visible, URL, DB row, redirect>
**Business Rule**:   <rule from machineonhire-domain skill that this validates>
**Test Layer**:      <E2E | API | DB | Component>
```

### TC Numbering Convention

| Range | Category |
|-------|----------|
| TC-001 – TC-099 | Happy Path |
| TC-100 – TC-199 | Business Rules |
| TC-200 – TC-299 | Security |
| TC-300 – TC-399 | Negative / Error |
| TC-400 – TC-499 | Edge Cases |
| TC-500 – TC-599 | UI State |

### Priority Guide

| Priority | Meaning |
|----------|---------|
| P0 | Site-breaking — must pass before any release |
| P1 | Core user journey — book, search, login, register |
| P2 | Business-critical features — badges, filters, cart, requirements |
| P3 | Edge cases and cosmetic checks |

## Rules

- Be exhaustive — cover every page and every journey in the `machineonhire-domain` skill
- Every scenario must trace back to a documented rule or observed live-site behaviour
- Always include both guest (unauthenticated) and logged-in variants for pages that behave differently
- Flag scenarios that depend on the known card-link bug with a `⚠️ Known Bug` note in the Business Rule field
- Do not test only happy paths — Security and Negative paths find the most real bugs
- For DB-touching scenarios, note the expected DB state change (e.g., new row in `bookings`, new row in `call_logs`)

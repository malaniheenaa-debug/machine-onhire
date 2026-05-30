---
name: machineonhire-user-flows
description: Product taxonomy, user journeys (all 6 business flows), authentication guards, and test environment details for machineonhire.com. Load when writing scenario-based tests, planning test coverage, or verifying end-to-end flow logic.
metadata:
  type: reference
---

# MachineOnHire — User Flows, Test Scenarios & Test Data

---

## 1. PRODUCT TAXONOMY — CATEGORIES & SUBCATEGORIES

```
MachineOnHire
├── Event & Comfort                    (Target: Event Organizers, Societies)
│   ├── Industrial Coolers   [count: 2]
│   ├── Projectors
│   └── Sound Systems        [count: 1]
│
├── Industrial & Construction          (Target: Contractors, Builders, Interior Designers)
│   ├── Concrete Mixers      [count: 1]
│   ├── Earthmovers          [count: 1]
│   ├── Generators
│   ├── Plumbing             [count: 1]
│   └── Scaffolding
│
├── Power Tools & DIY                  (Target: Local Technicians, DIY Hobbyists)
│   ├── Drills
│   ├── Grinders
│   ├── Jackhammers
│   └── Pressure Washers
│
└── Urban Mobility                     (Target: Delivery Riders, Commuters, Tourists)
    ├── Bicycles
    ├── Commercial EV Bikes
    └── Scooters
```
> Numbers in brackets = current live listing count observed on site.

---

## 2. USER JOURNEYS (Business Flows)

### Journey 1: Browse & Enquire (Guest User)
```
Homepage → Browse Listings → Machine Detail Page → Click "Call" → Phone call initiated
```


### Journey 2: Book a Machine (Authenticated User)
```
Homepage → Browse/Search → Machine Detail Page → Click "Book"
  → [Redirect to login if not authenticated]
  → Login / Register → book_machine.php?id={X} → Fill form → Submit → Confirmation
```

### Journey 3: Search & Filter
```
Keyword:   Homepage → Type in search bar → Click "Search" → Filtered results
Location:  Homepage → Select dropdown (Mumbai / Pune / All) → Filtered results
Category:  Homepage → "☰ Categories" panel → Click subcategory → index.php?subcategory={name}
Combined:  Keyword + Location can be applied simultaneously
```

### Journey 4: Post a Requirement (Authenticated User)
```
Homepage → Category Panel → "Post Requirement"
  → [Redirect to login if not authenticated]
  → post_requirement.php → Fill form → Submit
  → Requirement visible in "Latest Requirements" sidebar
```

### Journey 5: Contact a Requester
```
Homepage → Category Panel → Latest Requirements → "Contact User"
  → contact_user.php?id={requirements.id} → Contact form shown
```

### Journey 6: Buy a Machine (For Sale)
```
Homepage → Machine card with "For Sale" badge → Machine Detail Page
  → Sale Price displayed → Click "Book" → Booking form with sale=1 option
```

---

## 3. AUTHENTICATION GUARDS

Pages that redirect unauthenticated users to login:
- `book_machine.php`
- `post_requirement.php`

Test scenario: unauthenticated access to either page should redirect to `login.php`.

---

## 4. TEST ENVIRONMENT NOTES

| Environment  | URL | Notes |
|-------------|-----|-------|
| Production  | `https://machineonhire.com` | Live data — use with care |
| File Manager | `https://md-31.webhostbox.net:2083` → File Manager → `public_html/` | Requires fresh cPanel login |
| Database    | `https://md-31.webhostbox.net:2083` → phpMyAdmin → `zorifcuz_machineonhire` | Requires fresh cPanel login |

> ⚠️ cPanel session tokens expire. Always log in fresh at `https://md-31.webhostbox.net:2083` — never hardcode session URLs.

---

## 5. TEST DATA NOTES

- **Credentials:** Stored in `.env` as `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`; also available via `fixtures/testData.ts`
- **Known polluted data:** Machine names like `1`, `1q`, `1qweqwe`, `test` are dev leftovers on production — never assert on exact listing counts
- **Machine IDs:** All card links currently resolve to `machine.php?id=9` (known PHP bug) — use `id=9` for detail page tests until fixed
- **Location "1":** Invalid location value in dropdown; test graceful handling, not happy-path behavior

# MachineOnHire — Test Scenarios
**Page / Module:** Homepage (`index.php`)  
**Generated:** 2026-05-30  
**Coverage:** Happy Path · Business Rules · Security · Negative/Error · Edge Cases · UI State

---

## TC Numbering Convention

| Range | Category |
|-------|----------|
| TC-001 – TC-099 | Happy Path |
| TC-100 – TC-199 | Business Rules |
| TC-200 – TC-299 | Security |
| TC-300 – TC-399 | Negative / Error |
| TC-400 – TC-499 | Edge Cases |
| TC-500 – TC-599 | UI State |

---

## Happy Path

---

### TC-001: Homepage loads successfully
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P0  
**Preconditions**:   No active session; network available  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Wait for page to fully load
**Expected Result**: HTTP 200; page title visible; at least one machine listing card is rendered in the grid; no JavaScript console errors  
**Business Rule**:   `index.php` is the public entry point — no auth required  
**Test Layer**:      E2E

---

### TC-002: Top navigation bar renders all expected elements
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Guest user (unauthenticated); homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect the top navigation bar
**Expected Result**: Logo is visible and clickable; "Login" link is visible; "Register" link is visible  
**Business Rule**:   Top nav shows Login/Register to unauthenticated users  
**Test Layer**:      E2E

---

### TC-003: Bottom navigation bar renders all expected links
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect the bottom navigation bar
**Expected Result**: Four items visible — Home (`index.php`), Category (panel toggle), Search (`#search`), Cart (`cart.php`)  
**Business Rule**:   Bottom nav is the primary mobile navigation surface  
**Test Layer**:      E2E

---

### TC-004: Machine listing grid renders at least one card
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P0  
**Preconditions**:   At least one machine record exists in `machines` table  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Scroll through the listing grid
**Expected Result**: One or more machine cards are visible; each card contains a machine name, rate, and location  
**Business Rule**:   `index.php` reads `machines` table and renders listing cards  
**Test Layer**:      E2E

---

### TC-005: Keyword search returns relevant results
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine with name containing "Cooler" exists in `machines` table  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type "Cooler" into the search bar
  3. Click the "Search" button
**Expected Result**: Results page loads; only machine cards matching "Cooler" are shown; URL reflects search query parameter  
**Business Rule**:   Keyword search filters `machines` by name/description server-side  
**Test Layer**:      E2E

---

### TC-006: Location filter "Pune" shows only Pune machines
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine with `location = "Pune"` exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open the location `<select>` dropdown
  3. Select "Pune"
  4. Submit / observe filtered results
**Expected Result**: Only machine cards with "Location: Pune" are displayed; no Mumbai machines appear  
**Business Rule**:   Location filter applied server-side against `machines.location`  
**Test Layer**:      E2E

---

### TC-007: Location filter "Mumbai" shows only Mumbai machines
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine with `location = "Mumbai"` exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open the location dropdown
  3. Select "Mumbai"
  4. Submit / observe filtered results
**Expected Result**: Only machine cards with "Location: Mumbai" are displayed; no Pune machines appear  
**Business Rule**:   Location filter applied server-side against `machines.location`  
**Test Layer**:      E2E

---

### TC-008: Location filter "All locations" shows all machines
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Machines exist for both Pune and Mumbai  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Select "Pune" in location filter
  3. Then select "All locations"
  4. Observe results
**Expected Result**: All machines (Pune and Mumbai combined) are visible in the grid  
**Business Rule**:   Default state shows all locations; "All locations" resets the filter  
**Test Layer**:      E2E

---

### TC-009: Category sidebar opens on trigger click
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Click the "☰ Categories & Requirements" trigger (bottom nav "Category" or sidebar toggle)
  3. Wait for sidebar panel to animate open
**Expected Result**: Category sidebar panel becomes visible; taxonomy tree with 4 top-level categories is shown; location filter and Latest Requirements section are visible  
**Business Rule**:   Sidebar is collapsible — hidden by default, revealed on trigger  
**Test Layer**:      E2E

---

### TC-010: Subcategory filter link returns filtered machine list
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine with `sub_category = "Industrial Coolers"` exists; category sidebar open  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Click "Industrial Coolers" subcategory link
**Expected Result**: URL changes to `index.php?subcategory=Industrial+Coolers` (or encoded equivalent); only machines in that subcategory are displayed  
**Business Rule**:   Subcategory filter uses URL pattern `index.php?subcategory={name}` with exact string match  
**Test Layer**:      E2E

---

### TC-011: Combined keyword + location filter returns correctly filtered results
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine named "Cooler" in Mumbai exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Select "Mumbai" from location dropdown
  3. Type "Cooler" in the search bar
  4. Click "Search"
**Expected Result**: Results contain only machines matching "Cooler" AND located in Mumbai; machines from Pune or with unrelated names are excluded  
**Business Rule**:   Keyword and location filters are combinable and applied server-side simultaneously  
**Test Layer**:      E2E

---

### TC-012: Logo click navigates back to homepage
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P2  
**Preconditions**:   User is on a filtered results view (`?search=cooler`)  
**Steps**:
  1. Navigate to `https://machineonhire.com?search=cooler`
  2. Click the site logo in the top nav
**Expected Result**: Browser navigates to `https://machineonhire.com` (or `/index.php`); all machines shown without filter  
**Business Rule**:   Logo → `index.php` (top nav, standard pattern)  
**Test Layer**:      E2E

---

### TC-013: Bottom nav Cart link navigates to cart.php
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P2  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Click the Cart icon in the bottom navigation bar
**Expected Result**: Browser navigates to `https://machineonhire.com/cart.php`  
**Business Rule**:   Cart is PHP session-based — `cart.php` is the view; accessible without auth  
**Test Layer**:      E2E

---

### TC-014: "Login" top nav link navigates to login.php
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Guest user; homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Click "Login" in the top navigation bar
**Expected Result**: Browser navigates to `https://machineonhire.com/login.php`; login form is rendered  
**Business Rule**:   Top nav Login → `login.php`  
**Test Layer**:      E2E

---

### TC-015: "Register" top nav link navigates to register.php
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   Guest user; homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Click "Register" in the top navigation bar
**Expected Result**: Browser navigates to `https://machineonhire.com/register.php`; registration form is rendered  
**Business Rule**:   Top nav Register → `register.php`  
**Test Layer**:      E2E

---

### TC-016: "Contact User" link in sidebar navigates to contact_user.php
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P2  
**Preconditions**:   At least one requirement exists in `requirements` table; category sidebar open  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Locate "Latest Requirements" section
  4. Click a "Contact User" link
**Expected Result**: Browser navigates to `contact_user.php?id={requirements.id}`; contact form for that requirement is rendered  
**Business Rule**:   Journey 5: Contact a Requester — reads `requirements` table by ID  
**Test Layer**:      E2E

---

### TC-017: "Post Requirement" link is present in category sidebar
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P2  
**Preconditions**:   Homepage loaded; category sidebar open  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Locate "Post Requirement" link
**Expected Result**: "Post Requirement" link is visible in the sidebar; clicking it navigates to `post_requirement.php`  
**Business Rule**:   Journey 4: Post a Requirement — auth-guarded; unauthenticated users will be redirected (tested separately in Security)  
**Test Layer**:      E2E

---

### TC-018: Machine card "Call" button is present and has a phone/WhatsApp action
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P1  
**Preconditions**:   At least one machine with `whatsapp_contact` populated exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Locate a machine listing card
  3. Inspect the "Call" (📞) button
**Expected Result**: "Call" button is visible on the card; it links to a `tel:` or `https://wa.me/` URL using the machine's `whatsapp_contact` value; clicking initiates the call/WhatsApp action  
**Business Rule**:   `machines.whatsapp_contact` powers the Call button; clicking logs to `call_logs`  
**Test Layer**:      E2E

---

### TC-019: Machine card Cart icon is present
**Module**:          Homepage  
**Category**:        Happy Path  
**Priority**:        P2  
**Preconditions**:   At least one machine card visible on homepage  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Locate a machine listing card
  3. Inspect the Cart (🛒) icon
**Expected Result**: Cart icon is visible on each machine card; clicking it adds the machine to the PHP session cart  
**Business Rule**:   Cart is PHP session-based — no DB write; persists until session expires  
**Test Layer**:      E2E

---

## Business Rules

---

### TC-100: "For Sale" badge shown when machines.ready_to_sale = 1
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine exists with `ready_to_sale = 1` in the `machines` table  
**Steps**:
  1. Confirm in DB that a machine has `ready_to_sale = 1`
  2. Navigate to `https://machineonhire.com`
  3. Locate the listing card for that machine
**Expected Result**: "For Sale" badge is displayed on the card; badge is visually distinct  
**Business Rule**:   `[For Sale]` badge appears only when `machines.ready_to_sale = 1`  
**Test Layer**:      E2E + DB

---

### TC-101: Sale Price field visible on card when ready_to_sale = 1
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine exists with `ready_to_sale = 1` and a non-null `sale_cost`  
**Steps**:
  1. Confirm in DB: `ready_to_sale = 1` and `sale_cost > 0` for a specific machine
  2. Navigate to `https://machineonhire.com`
  3. Locate the listing card for that machine
**Expected Result**: "Sale Price: ₹{sale_cost}" is displayed on the card alongside the rental rate  
**Business Rule**:   `sale_cost` only renders when `ready_to_sale = 1`; format: `Sale Price: ₹{amount}`  
**Test Layer**:      E2E + DB

---

### TC-102: Trending badge appears for machine with high call_logs count
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine exists with multiple rows in `call_logs` (enough to exceed the Trending threshold); another machine has zero call_logs  
**Steps**:
  1. Confirm in DB which machine has the highest `call_logs` count
  2. Navigate to `https://machineonhire.com`
  3. Locate the card for the high-call machine and the zero-call machine
**Expected Result**: "Trending" badge appears on the high-call machine card; the zero-call machine card does NOT show the Trending badge  
**Business Rule**:   Trending badge is computed from `call_logs` count per machine — no DB flag; no static field  
**Test Layer**:      E2E + DB

---

### TC-103: Rate displayed in correct format — per day
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine with `rate_type = 'day'` and a numeric `rate` value exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Locate a machine card with a per-day rate
**Expected Result**: Rate shown as `₹{amount}.00/day` on the card  
**Business Rule**:   Pricing model: `rate_type=day` → display format `₹{amount}.00/day`; currency is Indian Rupee (₹)  
**Test Layer**:      E2E

---

### TC-104: Rate displayed in correct format — per hour
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine with `rate_type = 'hour'` and a numeric `rate` value exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Locate a machine card with a per-hour rate
**Expected Result**: Rate shown as `₹{amount}.00/hour` on the card  
**Business Rule**:   Pricing model: `rate_type=hour` → display format `₹{amount}.00/hour`  
**Test Layer**:      E2E

---

### TC-105: Location dropdown only exposes valid values (Mumbai, Pune, All locations)
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P2  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open the location `<select>` dropdown
  3. Inspect all `<option>` elements
**Expected Result**: Dropdown contains "All locations", "Mumbai", "Pune" as expected values; the dirty value `"1"` may appear (data quality issue) but is flagged as invalid for testing purposes  
**Business Rule**:   Valid location values: Mumbai · Pune · All locations; `"1"` is a test/dev data quality issue (see Known Issues)  
**Test Layer**:      E2E

---

### TC-106: Subcategory filter URL uses exact subcategory name from DB
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P2  
**Preconditions**:   Category sidebar visible; subcategory "Industrial Coolers" exists in `subcategories` table  
**Steps**:
  1. Open category sidebar
  2. Click "Industrial Coolers" subcategory link
  3. Inspect the resulting URL
**Expected Result**: URL is `index.php?subcategory=Industrial+Coolers` (or URL-encoded equivalent); the string matches the exact `subcategory_name` in the `subcategories` table  
**Business Rule**:   `index.php?subcategory={name}` — name must match exact string in DB; denormalized string match, not FK lookup  
**Test Layer**:      E2E + DB

---

### TC-107: All 4 top-level categories appear in the sidebar taxonomy tree
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P2  
**Preconditions**:   Category sidebar open; `categories` table has 4 rows  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Count top-level category headings
**Expected Result**: Four categories visible: "Event & Comfort", "Industrial & Construction", "Power Tools & DIY", "Urban Mobility"  
**Business Rule**:   Product taxonomy has exactly 4 top-level categories; all must render in sidebar  
**Test Layer**:      E2E

---

### TC-108: Latest Requirements section renders posted requirements in sidebar
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P2  
**Preconditions**:   At least one row in `requirements` table; category sidebar open  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Scroll to "Latest Requirements" section
**Expected Result**: At least one requirement entry is visible with requirement text and a "Contact User" link; link points to `contact_user.php?id={requirements.id}`  
**Business Rule**:   Journey 5: `requirements` table powers the "Latest Requirements" sidebar section  
**Test Layer**:      E2E + DB

---

### TC-109: Clicking "Call" on a card logs an entry to call_logs
**Module**:          Homepage  
**Category**:        Business Rule  
**Priority**:        P1  
**Preconditions**:   A machine with `whatsapp_contact` exists; test user logged in; DB access available  
**Steps**:
  1. Note the current row count in `call_logs` for the target machine
  2. Navigate to `https://machineonhire.com`
  3. Click the "Call" (📞) button on the target machine's card
  4. Query `call_logs` where `machine_id = {id}`
**Expected Result**: A new row appears in `call_logs` for this machine; `machine_id`, `user_id`, and `owner_id` are correctly populated; `call_time` is approximately now  
**Business Rule**:   Every "Call" button click writes a row to `call_logs`; this count drives the Trending badge  
**Test Layer**:      E2E + DB

---

## Security

---

### TC-200: XSS payload in search field is not executed
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P0  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type `<script>alert('XSS')</script>` in the search bar
  3. Click "Search"
  4. Observe the results page
**Expected Result**: No alert dialog appears; the script tag is rendered as escaped HTML text or stripped entirely; no JavaScript is executed  
**Business Rule**:   All user-supplied input must be HTML-escaped before being reflected in server-rendered output  
**Test Layer**:      E2E

---

### TC-201: SQL injection payload in search field does not expose DB errors
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P0  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type `' OR '1'='1` in the search bar
  3. Click "Search"
**Expected Result**: Page returns either no results or a normal (possibly empty) result set; no MySQL error message, stack trace, or raw SQL is visible in the response  
**Business Rule**:   Server-side queries must use prepared statements or parameterized queries — raw SQL concatenation is a critical vulnerability  
**Test Layer**:      E2E

---

### TC-202: XSS payload in location URL param is not executed
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P0  
**Preconditions**:   None  
**Steps**:
  1. Navigate to `https://machineonhire.com/index.php?location=<script>alert(1)</script>`
  2. Observe the page response
**Expected Result**: No alert fires; the parameter value is sanitized or ignored; page renders normally or shows an empty result set  
**Business Rule**:   URL parameters that are reflected into the page must be escaped  
**Test Layer**:      E2E

---

### TC-203: XSS payload in subcategory URL param is not executed
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P0  
**Preconditions**:   None  
**Steps**:
  1. Navigate to `https://machineonhire.com/index.php?subcategory=<script>alert(1)</script>`
  2. Observe the rendered page
**Expected Result**: No alert fires; subcategory value is HTML-escaped in any reflection; page renders safely  
**Business Rule**:   `index.php?subcategory={name}` reflects the value server-side — must be escaped  
**Test Layer**:      E2E

---

### TC-204: Homepage is publicly accessible without authentication
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P0  
**Preconditions**:   No active PHP session  
**Steps**:
  1. Clear all cookies/session data
  2. Navigate to `https://machineonhire.com`
**Expected Result**: Homepage loads fully with all machine listings; no redirect to `login.php`; no auth wall  
**Business Rule**:   `index.php` has no auth guard — it is a public page accessible to all visitors  
**Test Layer**:      E2E

---

### TC-205: Search input reflected value is properly HTML-escaped
**Module**:          Homepage  
**Category**:        Security  
**Priority**:        P1  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type `"test" & <b>bold</b>` in the search bar
  3. Click "Search"
  4. Inspect the rendered page source for the reflected search term
**Expected Result**: The value appears as literal escaped text (`&quot;test&quot; &amp; &lt;b&gt;bold&lt;/b&gt;`) — not rendered as HTML markup  
**Business Rule**:   Input reflection must be HTML-encoded to prevent stored or reflected XSS  
**Test Layer**:      E2E

---

## Negative / Error

---

### TC-300: Search with no matching keyword shows empty or zero-results state
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P1  
**Preconditions**:   No machine in DB with name or description matching the search term  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type `zzznomatchingresult999` in the search bar
  3. Click "Search"
**Expected Result**: Zero machine cards rendered; an empty-state message or "no results" feedback is displayed; page does not crash  
**Business Rule**:   Server-side filter returns empty result set — UI must handle gracefully  
**Test Layer**:      E2E

---

### TC-301: Empty search query submitted — graceful handling
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P2  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Leave the search bar empty
  3. Click "Search"
**Expected Result**: All machines are shown (or search is ignored); no server error (500) is returned; page renders normally  
**Business Rule**:   Empty keyword should not break the query — equivalent to "All" or no filter applied  
**Test Layer**:      E2E

---

### TC-302: Location dropdown value "1" (dirty data) handled gracefully
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P2  
**Preconditions**:   The dirty value `"1"` appears in the location dropdown (known data quality issue)  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. If "1" option exists in location dropdown, select it
  3. Submit the filter
**Expected Result**: Page either returns zero results or falls back to showing all locations; no server error or crash; user sees a graceful result set (even if empty)  
**Business Rule**:   Location `"1"` is a dev artifact in production data — must not cause a 500 or expose raw DB errors  
**Test Layer**:      E2E

---

### TC-303: Search with SQL special characters does not break the page
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P1  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Type `'; DROP TABLE machines;--` in the search bar
  3. Click "Search"
**Expected Result**: Page returns normally (likely empty results); no MySQL error or exception trace visible; machine listings still accessible on a fresh navigation  
**Business Rule**:   SQL injection must not affect the DB; prepared statements or escaping must be in place  
**Test Layer**:      E2E

---

### TC-304: Search with very long input string (500+ chars) does not crash
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P2  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Paste a 500-character random string into the search bar
  3. Click "Search"
**Expected Result**: Server responds with a valid HTTP response (200 or 400); no 500 error; page renders without crashing; input may be truncated or rejected gracefully  
**Business Rule**:   No server-side length validation documented — behavior must not be a crash or DB error  
**Test Layer**:      E2E

---

### TC-305: Invalid subcategory name in URL shows empty or graceful result
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P2  
**Preconditions**:   None  
**Steps**:
  1. Navigate to `https://machineonhire.com/index.php?subcategory=DoesNotExist`
**Expected Result**: Zero machine cards shown; no server error; page renders with an empty state or all-results fallback; no raw DB error exposed  
**Business Rule**:   `index.php?subcategory={name}` does an exact string match against DB — an unmatched name returns zero rows, not an error  
**Test Layer**:      E2E

---

### TC-306: Location filter with URL-manipulated invalid value does not break page
**Module**:          Homepage  
**Category**:        Negative  
**Priority**:        P2  
**Preconditions**:   None  
**Steps**:
  1. Navigate to `https://machineonhire.com/index.php?location=FakeCity`
**Expected Result**: Page loads without a 500 error; shows zero results or all results depending on server fallback logic; no DB error message visible  
**Business Rule**:   Location values not in the valid set (Mumbai / Pune / All) must be handled gracefully  
**Test Layer**:      E2E

---

## Edge Cases

---

### TC-400: All machine listing cards link to machine.php?id=9 (known bug)
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P1  
**Preconditions**:   Multiple machines visible on homepage  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect the href attribute of each machine card link (or "More.." link)
  3. Note which machine ID each card links to
**Expected Result**: All cards link to `machine.php?id=9` regardless of the actual machine's ID — this confirms the known PHP rendering bug; document which cards are affected  
**Business Rule**:   ⚠️ Known Bug — all listing cards link to `machine.php?id=9`; test must document the bug, not assert correct behavior  
**Test Layer**:      E2E

---

### TC-401: Machine card with empty description renders without crash
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P2  
**Preconditions**:   A machine exists with `description = NULL` or empty string in `machines` table  
**Steps**:
  1. Confirm in DB that a machine has a null/empty `description`
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: Card renders without crashing; description area is either empty or shows a placeholder; no PHP warning text visible (`Notice: Undefined...`)  
**Business Rule**:   Known data quality issue — some cards render empty description paragraphs  
**Test Layer**:      E2E + DB

---

### TC-402: Subcategory name with spaces URL-encodes correctly
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P2  
**Preconditions**:   Subcategory "Industrial Coolers" exists; category sidebar open  
**Steps**:
  1. Open category sidebar
  2. Click "Industrial Coolers" subcategory link
  3. Inspect resulting URL
**Expected Result**: URL encodes the space as `+` or `%20` — e.g. `?subcategory=Industrial+Coolers`; server correctly decodes and matches the DB string  
**Business Rule**:   Subcategory filter uses exact string match; spaces must be URL-encoded and decoded correctly  
**Test Layer**:      E2E

---

### TC-403: Machine listing with test/polluted name renders harmlessly
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P3  
**Preconditions**:   Machines with names `1qweqwe`, `1q`, `1`, `test` exist in the DB (known pollution)  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Scroll through all visible machine cards
**Expected Result**: Cards with test names render without crashing; no assertion on exact listing count is made; visual output is acceptable (placeholder data)  
**Business Rule**:   Known data quality issue — test names are in production; do NOT assert on total listing count  
**Test Layer**:      E2E

---

### TC-404: Machine with month rate_type renders gracefully in listing
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P2  
**Preconditions**:   A machine exists with `rate_type = 'month'` in the DB  
**Steps**:
  1. Confirm in DB that a machine has `rate_type = 'month'`
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: Card renders without crashing; rate is displayed in some format (e.g. `₹{amount}/month` or a fallback); no PHP warning text visible; UI does not show blank rate field  
**Business Rule**:   DB supports `rate_type = 'month'` but the UI only officially exposes `hour` and `day` — behavior when month data is present is undefined but must not crash  
**Test Layer**:      E2E + DB

---

### TC-405: No machines match keyword + location combination — empty state displayed
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P2  
**Preconditions**:   No machine in Mumbai with "Scaffolding" in its name or description  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Select "Mumbai" from location dropdown
  3. Type "Scaffolding" in search bar
  4. Click "Search"
**Expected Result**: Zero machine cards rendered; empty state UI element or text shown; no server error  
**Business Rule**:   Combined filters that yield zero results must show an empty state gracefully  
**Test Layer**:      E2E

---

### TC-406: Machine with null image renders without broken image icon
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P2  
**Preconditions**:   A machine exists with `image = NULL` or a non-existent file path in the `machines` table  
**Steps**:
  1. Confirm in DB that a machine has a null or invalid `image` path
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: Card renders without a broken image icon; either a placeholder image is shown or the image element is omitted gracefully  
**Business Rule**:   `machines.image` is nullable; the UI must not render a broken `<img>` element  
**Test Layer**:      E2E + DB

---

### TC-407: Subcategory "Urban Mobility" filter returns correct machines
**Module**:          Homepage  
**Category**:        Edge Case  
**Priority**:        P3  
**Preconditions**:   At least one machine with `sub_category` matching an Urban Mobility subcategory exists  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Open category sidebar
  3. Expand "Urban Mobility" and click "Scooters" (or available subcategory)
**Expected Result**: URL updates to `index.php?subcategory=Scooters`; only machines in that subcategory shown; machines from other subcategories excluded  
**Business Rule**:   Subcategory filter exact-matches `machines.sub_category` (denormalized string) — case sensitivity behavior to be verified  
**Test Layer**:      E2E

---

## UI State

---

### TC-500: "For Sale" badge NOT shown when ready_to_sale = 0
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P1  
**Preconditions**:   A machine exists with `ready_to_sale = 0` (default)  
**Steps**:
  1. Confirm in DB that at least one machine has `ready_to_sale = 0`
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: "For Sale" badge is NOT present on the card; badge element is absent from the DOM or hidden  
**Business Rule**:   `[For Sale]` badge is conditional — only when `machines.ready_to_sale = 1`  
**Test Layer**:      E2E + DB

---

### TC-501: Sale Price field NOT shown when ready_to_sale = 0
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P1  
**Preconditions**:   A machine with `ready_to_sale = 0` visible on homepage  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Locate a card for a machine with `ready_to_sale = 0`
  3. Inspect the card body
**Expected Result**: "Sale Price" text and `sale_cost` value are NOT rendered on the card; only the rental rate is shown  
**Business Rule**:   Sale Price field is only displayed when `ready_to_sale = 1`  
**Test Layer**:      E2E + DB

---

### TC-502: Trending badge NOT shown for machine with zero call_logs
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P1  
**Preconditions**:   A machine exists with no rows in `call_logs`  
**Steps**:
  1. Confirm in DB: `SELECT COUNT(*) FROM call_logs WHERE machine_id = {id}` returns 0
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: "Trending" badge is NOT visible on the card  
**Business Rule**:   Trending badge is computed — no calls = no trending; badge must be absent  
**Test Layer**:      E2E + DB

---

### TC-503: Trending badge IS shown for machine with high call_logs count
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P1  
**Preconditions**:   A machine exists with the highest `call_logs` count across all machines  
**Steps**:
  1. Confirm in DB which `machine_id` has the most rows in `call_logs`
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: "Trending" badge IS visible on the card  
**Business Rule**:   Trending badge computed from `call_logs` count — machine with most calls should display it  
**Test Layer**:      E2E + DB

---

### TC-504: Category sidebar is hidden/collapsed by default on page load
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P2  
**Preconditions**:   Fresh page load (no sidebar state persisted)  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect the sidebar panel immediately on load (before any interaction)
**Expected Result**: Category sidebar is NOT visible; it is collapsed, off-screen, or hidden; the machine listing grid occupies the full content area  
**Business Rule**:   Sidebar is collapsible — hidden by default, revealed on "☰ Categories" trigger click  
**Test Layer**:      E2E

---

### TC-505: Category sidebar opens and closes on repeated toggle clicks
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P2  
**Preconditions**:   Homepage loaded  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Click the "☰ Categories" trigger — sidebar opens
  3. Click the trigger again — sidebar closes
  4. Click again — sidebar opens again
**Expected Result**: Sidebar reliably toggles between open and closed states on each click; content remains accessible when open  
**Business Rule**:   Category sidebar has a toggle pattern — must not get stuck in one state  
**Test Layer**:      E2E

---

### TC-506: Machine card image alt text follows the correct pattern
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P3  
**Preconditions**:   At least one machine card with an image visible  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect the `alt` attribute of a machine card image
**Expected Result**: Alt text follows the format `{machine-name} for hire in {location}` — e.g. `Cooler for hire in Mumbai`  
**Business Rule**:   SEO & Image naming pattern: `{machine-name} for hire in {location}` (from business-rules.md Section 4)  
**Test Layer**:      E2E

---

### TC-507: Login and Register nav links hidden when user is logged in
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P1  
**Preconditions**:   A valid test user account exists; user is logged in via `login.php`  
**Steps**:
  1. Log in with valid credentials at `login.php`
  2. Navigate to `https://machineonhire.com`
  3. Inspect the top navigation bar
**Expected Result**: "Login" and "Register" links are NOT visible; user-specific navigation elements (e.g. account, logout) are shown instead  
**Business Rule**:   Top nav adapts to session state — guest sees Login/Register; authenticated user does not  
**Test Layer**:      E2E

---

### TC-508: Machine card renders correctly when description is long (truncation)
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P3  
**Preconditions**:   A machine with a description longer than the card display limit exists  
**Steps**:
  1. Confirm in DB a machine with a long `description` field
  2. Navigate to `https://machineonhire.com`
  3. Locate that machine's card
**Expected Result**: Description text is visually truncated on the card (not overflowing the card boundary); a "More.." link is visible for the full detail  
**Business Rule**:   Card anatomy specifies `Description (truncated)` with a `[More..]` link — truncation is expected UI behavior  
**Test Layer**:      E2E

---

### TC-509: Location filter dropdown defaults to "All locations" on initial load
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P2  
**Preconditions**:   Fresh page load with no URL query params  
**Steps**:
  1. Navigate to `https://machineonhire.com` (no query params)
  2. Inspect the selected value of the location `<select>` element
**Expected Result**: Dropdown defaults to "All locations" as the selected option; full machine grid is shown  
**Business Rule**:   Default state = no location filter applied = all machines visible  
**Test Layer**:      E2E

---

### TC-510: Machine cards show consistent card anatomy across all listings
**Module**:          Homepage  
**Category**:        UI State  
**Priority**:        P2  
**Preconditions**:   Multiple machine cards visible on homepage  
**Steps**:
  1. Navigate to `https://machineonhire.com`
  2. Inspect 3–5 different machine cards
**Expected Result**: Each card contains: machine name (H5), location, rate (₹ format), Cart icon (🛒), Call button (📞); conditional elements (For Sale badge, Trending badge, Sale Price) appear only when their conditions are met; layout is consistent across cards  
**Business Rule**:   Machine listing card anatomy is a defined template — all elements must be consistently placed  
**Test Layer**:      E2E

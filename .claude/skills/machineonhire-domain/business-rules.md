---
name: machineonhire-business-rules
description: Business model, pricing, search/filter logic, known data quality issues, open questions, and glossary for machineonhire.com. Load when writing tests for pricing display, search behavior, validation, or when you need to understand why the system behaves a certain way.
metadata:
  type: reference
---

# MachineOnHire — Business Rules & Domain Logic

---

## 1. PRODUCT OVERVIEW

| Attribute      | Detail |
|----------------|--------|
| Product Name   | MachineOnHire |
| Domain         | Machinery & Equipment Rental Marketplace |
| Geography      | Pune, Mumbai, Maharashtra, India |
| Business Model | Rental (per day / per hour) + Direct Sale |
| Target Users   | Event Organizers, Contractors, Builders, Technicians, DIY Hobbyists, Delivery Riders |
| Copyright Year | 2026 |
| Backend        | PHP (server-rendered pages) |
| Database       | MySQL — `zorifcuz_machineonhire` (via phpMyAdmin) |
| Hosting        | cPanel — md-31.webhostbox.net:2083 |

---

## 2. SEARCH & FILTER BEHAVIOUR

| Feature            | Mechanism                  | URL Pattern                        |
|-------------------|----------------------------|------------------------------------|
| Keyword Search     | Textbox + Search button    | `index.php?search={query}` (inferred) |
| Location Filter    | `<select>` dropdown        | Applied server-side                |
| Subcategory Filter | Sidebar category link      | `index.php?subcategory={name}`     |
| Combined Filter    | Location + Keyword together| Combined query params              |

**Location options:** All locations (default) · Mumbai · Pune · `1` *(test/dev entry — data quality issue)*

---

## 3. PRICING MODEL

| Rate Type    | DB Value     | Display Format          |
|-------------|--------------|-------------------------|
| Per Hour    | `rate_type=hour` | `₹{amount}.00/hour`  |
| Per Day     | `rate_type=day`  | `₹{amount}.00/day`   |
| Sale Price  | `ready_to_sale=1` + `sale_cost` | `Sale Price: ₹{amount}` |

**Currency:** Indian Rupee (₹ / INR)  
**DB supports `month`** as a `rate_type` enum value, but the UI only exposes `hour` and `day`.

---

## 4. SEO & IMAGE NAMING PATTERN

Image alt text follows the pattern:
```
{machine-name} for hire in {location}
```
Examples: `Cooler for hire in Mumbai` · `Big Roller for hire in Pune`

SEO metadata is stored in two places (`machine_seo` overrides `machines`):
- `machines.meta_title` / `machines.meta_description`
- `machine_seo.meta_title` / `machine_seo.meta_description` ← takes precedence

---

## 5. KNOWN DATA QUALITY ISSUES (Observed on Live Site)

| Issue | Detail | Testing Impact |
|-------|--------|----------------|
| Test data in production | Machine names: `1qweqwe`, `1q`, `1`, `test` | Do not assert exact listing counts |
| Invalid location `"1"` | Appears in dropdown alongside Mumbai/Pune | Negative test: filter by "1" should handle gracefully |
| Broken machine detail links | All listing cards point to `machine.php?id=9` regardless of actual machine | Known bug — confirm in source code |
| Missing descriptions | Some cards render empty description paragraphs | Edge case for UI assertion tests |

---

## 6. OPEN QUESTIONS (Source Code Access Required)

| # | Question | Status | Notes |
|---|----------|--------|-------|
| 1 | Search GET param name | ❓ Open | `?search=`, `?q=`, or `?keyword=`? |
| 2 | Password hashing algorithm | ✅ Likely bcrypt | `password` column is varchar(255) |
| 3 | Admin panel location | ❓ Open | Is there an `admin/` directory? |
| 4 | Cart implementation | ✅ PHP session | No `cart` table exists in DB |
| 5 | Trending badge logic | ✅ Computed | No DB flag — derived from `call_logs` count |
| 6 | AJAX/JSON endpoints | ❓ Open | Call button, cart add — JS calls? |
| 7 | Email notifications | ❓ Open | No email log table found in DB |
| 8 | WhatsApp "Call" button | ✅ Confirmed | Uses `machines.whatsapp_contact` (varchar 20) |
| 9 | PHP session duration | ❓ Open | Timeout value in PHP config |
| 10 | `machines.type` field usage | ❓ Open | varchar(50) — not visible in any UI element |

---

## 7. GLOSSARY

| Term         | Definition |
|-------------|------------|
| For Sale     | Machine with `ready_to_sale=1` — available for outright purchase, not just rental |
| Trending     | Badge computed dynamically from `call_logs` count — no DB flag |
| Rate Type    | Billing unit stored in `machines.rate_type`: `hour`, `day`, or `month` |
| Requirement  | A renter/buyer posting their equipment need via `post_requirement.php` |
| Subcategory  | Second-level taxonomy linked to a Category via `subcategories.category_id` |
| Book         | Initiating a rental or purchase transaction, writes a row to `bookings` |
| Cart         | PHP session-based bucket of machines — no database table |
| Call Log     | A record in `call_logs` created each time the "Call" button is clicked |
| Owner        | A registered user who listed a machine (`machines.owner_id = users.id`) |

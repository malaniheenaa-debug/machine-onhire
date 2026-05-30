---
name: machineonhire-api-reference
description: Page URL matrix, domain entity relationships, and full MySQL database schema for zorifcuz_machineonhire. Load when writing tests that hit specific URLs, query the DB, or need column-level detail about any table.
metadata:
  type: reference
---

# MachineOnHire — Page URLs & Database Reference

---

## 1. SITEMAP & PAGE TEST MATRIX

| Page | URL Pattern | Auth Required | Form | DB Interaction |
|------|-------------|:-------------:|------|----------------|
| `index.php` | `/` or `/index.php` | No | Search + Location filter | Read `machines` |
| `machine.php` | `/machine.php?id={id}` | No | None | Read `machines` |
| `login.php` | `/login.php` | No | Email + Password | Auth check `users` |
| `register.php` | `/register.php` | No | Name + Email + Password | Write `users` |
| `book_machine.php` | `/book_machine.php?id={id}` | **Yes** | Booking form | Write `bookings` |
| `post_requirement.php` | `/post_requirement.php` | **Yes** | Requirement form | Write `requirements` |
| `contact_user.php` | `/contact_user.php?id={id}` | No | Contact form | Read `requirements` |
| `cart.php` | `/cart.php` | No | None | PHP Session only |

---

## 2. DOMAIN MODEL — ENTITIES & RELATIONSHIPS

Eight database tables power the application.

| Entity | DB Table | Purpose | Key Relationships |
|--------|----------|---------|-------------------|
| Machine | `machines` | Core rental/sale listing | owner_id → users |
| User | `users` | Registered accounts (renters & owners) | Referenced by all tables |
| Booking | `bookings` | Rental or purchase transaction | user_id → users, machine_id → machines |
| Requirement | `requirements` | Buyer posts a demand | user_id → users |
| Call Log | `call_logs` | Tracks every "Call" button click | user_id, owner_id → users, machine_id → machines |
| Category | `categories` | Top-level taxonomy | ← subcategories |
| Subcategory | `subcategories` | Second-level taxonomy | category_id → categories |
| Machine SEO | `machine_seo` | Per-machine SEO overrides | machine_id → machines (1:1) |

> **Cart:** No `cart` table exists — cart is **PHP session-based only**.  
> **Trending badge:** Computed from `call_logs` count — not a stored DB column.  
> **Denormalized taxonomy:** `machines.category` / `machines.sub_category` store name strings, NOT foreign keys.

### Entity Relationship Diagram

```
users (id)
  ├──< machines       (owner_id)    one user owns many machines
  ├──< bookings       (user_id)     one user makes many bookings
  ├──< requirements   (user_id)     one user posts many requirements
  ├──< call_logs      (user_id)     one user initiates many calls
  └──< call_logs      (owner_id)    one user receives many calls

machines (id)
  ├──< bookings       (machine_id)  one machine has many bookings
  ├──< call_logs      (machine_id)  one machine has many call logs
  └──1 machine_seo    (machine_id)  one machine has one SEO record

categories (id)
  └──< subcategories  (category_id) one category has many subcategories

NOTE: machines.category / machines.sub_category store name strings (varchar),
      NOT foreign keys — denormalized design. Test data seeding must stay in sync.
```

---

## 3. DATABASE SCHEMA (Verified — zorifcuz_machineonhire)

> **DB Server:** localhost:3306 | **Engine:** InnoDB | **Collation:** utf8_unicode_ci  
> **Total Tables:** 8 | **Total Size:** 288.0 KiB

---

### 3.1 `machines` — Core listing entity (48.0 KiB)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `id` | int(11) | No | — | PK, AUTO_INCREMENT |
| 2 | `owner_id` | int(11) | Yes | NULL | FK → users.id |
| 3 | `name` | varchar(100) | Yes | NULL | Display name |
| 4 | `description` | text | Yes | NULL | Full description |
| 5 | `meta_title` | varchar(255) | Yes | NULL | SEO page title |
| 6 | `meta_description` | text | Yes | NULL | SEO meta description |
| 7 | `type` | varchar(50) | Yes | NULL | Internal tag (not visible in UI) |
| 8 | `rate_type` | enum('hour','day','month') | Yes | NULL | Billing unit |
| 9 | `rate` | decimal(10,2) | Yes | NULL | Rental price |
| 10 | `location` | varchar(100) | Yes | NULL | City (Pune / Mumbai) |
| 11 | `category` | varchar(100) | Yes | NULL | Category name (denormalized string) |
| 12 | `sub_category` | varchar(100) | Yes | NULL | Subcategory name (denormalized string) |
| 13 | `availability_status` | enum('available','unavailable') | Yes | available | Stock status |
| 14 | `availability_date` | date | Yes | NULL | Next available date |
| 15 | `whatsapp_contact` | varchar(20) | Yes | NULL | Powers the "Call" button |
| 16 | `ready_to_sale` | tinyint(1) | Yes | 0 | 1 = show "For Sale" badge |
| 17 | `sale_cost` | decimal(12,2) | Yes | NULL | Sale price (only when ready_to_sale=1) |
| 18 | `image` | varchar(255) | Yes | NULL | Image filename/path |
| 19 | `created_at` | timestamp | No | CURRENT_TIMESTAMP | Record creation time |

---

### 3.2 `users` — Registered accounts (32.0 KiB)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `id` | int(11) | No | — | PK, AUTO_INCREMENT |
| 2 | `name` | varchar(100) | Yes | NULL | Full name |
| 3 | `email` | varchar(100) | Yes | NULL | Login identifier (must be unique) |
| 4 | `password` | varchar(255) | Yes | NULL | Hashed (varchar 255 → likely bcrypt) |
| 5 | `created_at` | timestamp | No | CURRENT_TIMESTAMP | Registration time |

> Machine owners are also regular users — `machines.owner_id` references `users.id`.

---

### 3.3 `bookings` — Rental & purchase transactions (48.0 KiB)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `id` | int(11) | No | — | PK, AUTO_INCREMENT |
| 2 | `user_id` | int(11) | Yes | NULL | FK → users.id |
| 3 | `machine_id` | int(11) | Yes | NULL | FK → machines.id |
| 4 | `start_date` | date | No | — | Rental start (required) |
| 5 | `end_date` | date | No | — | Rental end (required) |
| 6 | `duration_type` | enum('hour','day') | Yes | NULL | Billing unit for this booking |
| 7 | `status` | enum('pending','confirmed','cancelled') | Yes | pending | Booking lifecycle state |
| 8 | `sale` | tinyint(1) | Yes | 0 | 0 = rental · 1 = purchase |
| 9 | `created_at` | timestamp | No | CURRENT_TIMESTAMP | Booking creation time |

> Default status `pending` implies an owner-confirmation workflow before the booking is active.

---

### 3.4 `categories` — Top-level taxonomy (16.0 KiB)

| # | Column | Type | Null | Default |
|---|--------|------|:----:|---------|
| 1 | `id` | int(11) | No | — |
| 2 | `category_name` | varchar(100) | No | — |
| 3 | `target_audience` | varchar(255) | Yes | NULL |
| 4 | `description` | text | Yes | NULL |

---

### 3.5 `subcategories` — Second-level taxonomy (32.0 KiB)

| # | Column | Type | Null | Default |
|---|--------|------|:----:|---------|
| 1 | `id` | int(11) | No | — |
| 2 | `category_id` | int(11) | No | — |
| 3 | `subcategory_name` | varchar(100) | No | — |
| 4 | `description` | text | Yes | NULL |

---

### 3.6 `requirements` — User-posted demand board (32.0 KiB)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `id` | int(11) | No | — | PK — used in `contact_user.php?id=X` |
| 2 | `user_id` | int(11) | Yes | NULL | FK → users.id (who posted) |
| 3 | `location` | varchar(100) | Yes | NULL | Location for this need |
| 4 | `requirement_text` | text | Yes | NULL | Full requirement description |
| 5 | `created_at` | timestamp | No | CURRENT_TIMESTAMP | Post time |

---

### 3.7 `call_logs` — Enquiry/call tracking (64.0 KiB — largest table)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `id` | int(11) | No | — | PK, AUTO_INCREMENT |
| 2 | `user_id` | int(11) | No | — | FK → users.id (caller) |
| 3 | `machine_id` | int(11) | No | — | FK → machines.id |
| 4 | `owner_id` | int(11) | No | — | FK → users.id (machine owner) |
| 5 | `call_time` | timestamp | No | CURRENT_TIMESTAMP | Call initiation time |

> Largest table (64 KiB) — confirms heavy call/enquiry activity. High `call_logs` count per machine drives the **Trending badge**.

---

### 3.8 `machine_seo` — Per-machine SEO overrides (16.0 KiB)

| # | Column | Type | Null | Default | Notes |
|---|--------|------|:----:|---------|-------|
| 1 | `machine_id` | int(11) | No | — | FK → machines.id (no separate PK) |
| 2 | `meta_title` | varchar(255) | Yes | NULL | Overrides `machines.meta_title` |
| 3 | `meta_description` | text | Yes | NULL | Overrides `machines.meta_description` |

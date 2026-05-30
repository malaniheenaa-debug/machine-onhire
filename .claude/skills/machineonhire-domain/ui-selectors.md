---
name: machineonhire-ui-selectors
description: Navigation structure, machine listing card anatomy, machine detail page layout, and login/register form field details for machineonhire.com. Load when writing locators, asserting page structure, or building Page Object Model methods.
metadata:
  type: reference
---

# MachineOnHire — UI Selectors & Page Structure

---

## 1. NAVIGATION STRUCTURE

### 1.1 Top Navigation Bar
- Logo → `index.php`
- **Login** → `login.php` (shown when unauthenticated)
- **Register** → `register.php` (shown when unauthenticated)

### 1.2 Bottom Navigation Bar (Homepage)

| Link     | URL                |
|----------|--------------------|
| Home     | `index.php`        |
| Category | `#` (panel toggle) |
| Search   | `#search` (scroll) |
| Cart     | `cart.php`         |

### 1.3 Category Sidebar Panel (triggered by ☰ Categories & Requirements)
- Collapsible panel with full taxonomy tree
- Location filter dropdown
- Latest Requirements list with "Contact User" links
- "Post Requirement" link → `post_requirement.php`

---

## 2. MACHINE LISTING CARD — ANATOMY

```
┌──────────────────────────────────┐
│  [For Sale]  [Trending]   ← conditional badges
│  [Machine Image]
│  Machine Name             ← H5 heading
│  Description (truncated)
│  [More..] link
│  Location: {city}
│  ₹{rate}/{day or hour}
│  Sale Price: ₹{amount}    ← only if ready_to_sale = 1
│  [🛒 Cart Icon]  [📞 Call]
└──────────────────────────────────┘
```

**Badge rules:**
- `[For Sale]` badge appears only when `machines.ready_to_sale = 1`
- `[Trending]` badge is computed from `call_logs` count — no DB flag

---

## 3. MACHINE DETAIL PAGE — ANATOMY

URL: `machine.php?id={id}`

```
┌──────────────────────────────────┐
│  [Machine Image]  [For Sale] badge
│
│  {Machine Name}   ← H3 heading
│  {Full Description}
│  Category:    {category}
│  Subcategory: {sub_category}
│  Location:    {city}
│  Rate:        ₹{amount} / {day|hour}
│  Sale Price:  ₹{amount}   ← if ready_to_sale = 1
│
│  [📅 Book]  [📅 Book (mobile)]  [📞 Call]
└──────────────────────────────────┘
```

> **Known bug:** All listing cards link to `machine.php?id=9` regardless of actual machine ID — not a selector issue, it's a PHP rendering bug.

---

## 4. AUTHENTICATION PAGES — FORM ELEMENTS

### 4.1 Login Page (`login.php`)

| Element       | Type     | Validation                  |
|--------------|----------|-----------------------------|
| Email Address | textbox  | Required, email format      |
| Password      | password | Required                    |
| Login         | button   | Submits form                |
| Register here | link     | → `register.php`            |

### 4.2 Register Page (`register.php`)

| Element       | Type     | Validation                       |
|--------------|----------|----------------------------------|
| Full Name     | textbox  | Required                         |
| Email Address | textbox  | Required, email format, unique   |
| Password      | password | Required                         |
| Register      | button   | Submits form                     |
| Login here    | link     | → `login.php`                   |

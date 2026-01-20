# 🎨 UI DESIGN SPECIFICATION  
## Socio-Economic Survey System

---

## 1. PURPOSE OF THIS DOCUMENT

This document defines **how the UI must behave, look, and function** across the entire Socio-Economic Survey System.

It exists to:
- Remove ambiguity in UI decisions
- Ensure consistency across pages
- Enforce correct mobile vs desktop behavior
- Maintain a professional, production-grade experience
- Prevent UI regressions or “random styling”

This document is **authoritative** and must be followed exactly.

---

## 2. CORE UI PRINCIPLES

### 2.1 Design Philosophy
- Mobile-first for Surveyors
- Desktop-first for Supervisors and Admins
- Simple, predictable navigation
- No clutter
- No unnecessary animations
- Focus on usability and clarity

### 2.2 UX Goals
- Surveyors should feel like they’re using a **real mobile app**
- Supervisors/Admins should feel like they’re using a **dashboard system**
- No confusion about:
  - where to click
  - what to fill
  - what is editable
  - what is locked

---

## 3. LAYOUT ARCHITECTURE (MANDATORY)

The system must have **THREE distinct layouts**.

---

## 3.1 Surveyor Layout (Mobile First)

### Applicable Routes
/surveyor/*

markdown
Copy code

### Layout Characteristics
- Mobile-first
- Bottom navigation bar
- No sidebar
- Clean, focused UI

### Bottom Navigation (MANDATORY)

Visible on:
- Mobile
- Tablet

Hidden on:
- Desktop screens

Bottom Nav Items:
Dashboard | Slums | Progress | Profile

yaml
Copy code

### Rules
- ❌ No survey buttons in bottom nav
- ❌ No sidebar
- ✅ Navigation must be thumb-friendly
- ✅ Only assigned items visible

---

## 3.2 Supervisor Layout (Desktop First)

### Applicable Routes
/supervisor/*

markdown
Copy code

### Layout Characteristics
- Left sidebar navigation
- Sidebar collapsible
- Header with profile/logout
- No bottom navigation

### Sidebar Items
Dashboard
Slums
Assignments
Progress

yaml
Copy code

### Mobile Behavior
- Sidebar becomes slide-in drawer
- No bottom nav
- Hamburger menu allowed

---

## 3.3 Admin Layout (Desktop First)

### Applicable Routes
/admin/*

pgsql
Copy code

### Layout Characteristics
- Same as Supervisor layout
- Additional admin-only options

### Sidebar Items
Dashboard
Users
Slums
Assignments
Exports

yaml
Copy code

---

## 4. NAVIGATION RULES (VERY IMPORTANT)

### Global Rules
- A user must NEVER see both:
  - Sidebar
  - Bottom navigation
- Navigation must be role-based AND screen-size based
- No layout logic inside pages

### Surveyor Rules
- Bottom nav ONLY
- No sidebar
- No direct survey access from nav
- Surveys start only from Slum Details page

### Supervisor/Admin Rules
- Sidebar ALWAYS present
- Bottom nav NEVER present
- Sidebar collapses on small screens

---

## 5. SURVEY FLOW DESIGN

---

## 5.1 Slum Survey Flow

### Characteristics
- Stepper-based
- One section per step
- Logical grouping
- Read-only calculated fields
- Final submission locks data

### UI Rules
- Stepper must not remount inputs
- Navigation must preserve entered data
- No back-navigation after submit

---

## 5.2 Household Survey Flow

### Characteristics
- Accordion-based
- Multiple sections
- High-volume entry
- Optimized for speed

### UI Rules
- Accordion sections must NOT unmount on open/close
- Sticky bottom action bar:
Save Draft | Submit

yaml
Copy code
- Cursor must never lose focus
- Input fields must not re-render unnecessarily

---

## 6. ASSIGNMENT-BASED VISIBILITY

### Assignment Types

#### A. Full Slum Assignment
- Slum Survey visible
- Household Surveys visible

#### B. Household-Only Assignment
- Slum Survey hidden
- Household Surveys visible
- Slum data shown as read-only

### Enforcement
- UI must respect assignment type
- Surveyor must never see unauthorized actions

---

## 7. COLOR & DESIGN SYSTEM

### Core Colors

| Purpose | Color |
|------|------|
| App Background | #0B1F33 |
| Card Surface | #111827 |
| Primary | #38BDF8 |
| Primary Hover | #0EA5E9 |
| Text Primary | #E5E7EB |
| Text Muted | #9CA3AF |
| Success | #22C55E |
| Warning | #F59E0B |
| Error | #EF4444 |

---

### Gradient Usage

#### Background
linear-gradient(180deg, #0B1F33 0%, #081625 100%)

shell
Copy code

#### Cards
linear-gradient(180deg, #111827 0%, #0F172A 100%)

shell
Copy code

#### Primary Buttons
linear-gradient(90deg, #38BDF8 0%, #0EA5E9 100%)

yaml
Copy code

---

## 8. FORM & INPUT RULES (CRITICAL)

### Must Follow
- No input with dynamic `key`
- No full form re-render on input change
- No conditional rendering of inputs
- Use field-level state updates
- useCallback for handlers
- Stable component tree

### Must Avoid
- `{open && <Input />}`
- Index-based keys
- Mixing controlled + uncontrolled inputs

---

## 9. CONSISTENCY RULES

Every page must:
- Use same spacing scale
- Use same button styles
- Use same typography
- Use same color tokens
- Use same disabled state styling

No exceptions.

---

## 10. WHAT NOT TO DO

❌ Do NOT add new features  
❌ Do NOT modify business logic  
❌ Do NOT mix layouts  
❌ Do NOT bypass assignment rules  
❌ Do NOT add visual clutter  

---

## 11. SUCCESS CRITERIA

The UI is considered complete when:

✅ Surveyors can work smoothly on mobile  
✅ Inputs never lose focus  
✅ Navigation is predictable  
✅ Admins & supervisors have clean dashboards  
✅ UI feels like a real production system  
✅ No confusion about survey flow  

---

## 12. FINAL NOTE

This UI specification is **authoritative**.

Any UI change that:
- breaks these rules
- introduces ambiguity
- violates layout logic

…must be rejected.

---
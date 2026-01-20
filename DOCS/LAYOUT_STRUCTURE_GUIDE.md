# Dashboard Layout Structure Guide

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FIXED HEADER (z-30, sticky)                  │
│  [Menu] Page Title / Dashboard Name                   [Breadcrumb]
└─────────────────────────────────────────────────────────────────┘
┌──────────────────┬───────────────────────────────────────────────┐
│                  │                                               │
│   SIDEBAR        │         MAIN CONTENT AREA                    │
│   (fixed)        │         (p-8 padding on all sides)           │
│   w-64           │                                               │
│   z-40           │  ┌──────────────────────────────────────────┐ │
│                  │  │  Page Title                              │ │
│  [Logo]          │  │  Description                             │ │
│  ────────        │  └──────────────────────────────────────────┘ │
│  [Nav Items]     │                                               │
│  [Nav Items]     │  ┌──────────┬──────────┬──────────┐          │
│  [Nav Items]     │  │  Card 1  │  Card 2  │  Card 3  │          │
│  [Nav Items]     │  │  (p-6)   │  (p-6)   │  (p-6)   │ gap-6   │
│                  │  ├──────────┼──────────┼──────────┤          │
│  ────────        │  │  Card 4  │  Card 5  │  Card 6  │          │
│  [Profile]       │  │  (p-6)   │  (p-6)   │  (p-6)   │          │
│  [Logout]        │  └──────────┴──────────┴──────────┘          │
│                  │                                               │
│                  │  ┌──────────────────────────────────────────┐ │
│                  │  │  Action Buttons (grid gap-6)             │ │
│                  │  │  [Button 1]  [Button 2]  [Button 3]      │ │
│                  │  └──────────────────────────────────────────┘ │
│                  │                                               │
└──────────────────┴───────────────────────────────────────────────┘
```

---

## Spacing Breakdown

### Sidebar

```
┌─────────────────────┐
│  SIDEBAR (w-64)     │
├─────────────────────┤
│  Logo Area (h-16)   │ px-6, border-b
├─────────────────────┤
│  Nav (px-4 py-6)    │ space-y-2 between items
│  [Nav Link]         │ px-4 py-3 (item padding)
│  [Nav Link]         │
│  [Nav Link]         │
├─────────────────────┤
│  Profile (p-4)      │ border-t
│  [Profile Card]     │ p-3 (inner)
│  [Logout Button]    │ w-full
└─────────────────────┘
```

### Main Content Area

```
┌────────────────────────────────────────┐
│ Header: px-8 h-16 sticky top-0 z-30    │
├────────────────────────────────────────┤
│ Main Content: p-8 (all sides)           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Page Title (mb-8)                │  │
│  │ h1: text-3xl font-bold text-white│  │
│  │ p: text-slate-400                │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌────────────┬────────────┬─────────┐ │
│  │   Card     │   Card     │  Card   │ │  gap-6 between cards
│  │   (p-6)    │   (p-6)    │ (p-6)   │ │  mb-8 below grid
│  │ rounded-2xl│ rounded-2xl│ rounded │ │
│  │            │            │  -2xl   │ │
│  └────────────┴────────────┴─────────┘ │
│   grid gap-6 mb-8                      │
│   grid-cols-1 md:grid-cols-3 lg:grid-4 │
│                                         │
└────────────────────────────────────────┘
```

---

## Card Internal Structure

### Stat Card Example

```
┌─────────────────────────────────────┐
│  Stat Card (p-6 rounded-2xl)         │
├─────────────────────────────────────┤
│  (relative positioning for icon)    │
│                                      │
│  Title (text-slate-100)       [Icon] │
│  (font-medium mb-1)            (abs) │
│                                      │
│  Value (text-4xl font-bold)          │
│  (text-white)                        │
│                                      │
│  [Status Badge]                      │
│  (mt-4 px-2 py-1 rounded)            │
│                                      │
└─────────────────────────────────────┘
```

### Assignment Card (Surveyor)

```
┌──────────────────────────────────────┐
│ Header Gradient (px-6 py-4)          │  ← from-blue-600 to-cyan-600
│ Title (text-lg font-bold mb-2)       │
│ [Icon] ID: xxxxx (text-blue-100)     │
├──────────────────────────────────────┤
│ Content (p-6 space-y-4)              │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Household Count (p-4)          │  │  bg-slate-800/50 rounded-lg
│ │ [Icon] Total: 45               │  │
│ └────────────────────────────────┘  │ gap-4
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Slum Survey Status (p-4)       │  │
│ │ ✓ COMPLETED [badge]            │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Household Progress (p-4)       │  │
│ │ [████████░░] 8/10 Completed    │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌───────────────┬─────────────────┐ │
│ │ [Slum Survey] │ [HH Surveys]    │ │  border-t pt-4 grid gap-3
│ └───────────────┴─────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## Responsive Behavior

### Mobile (< 768px)

```
Sidebar: HIDDEN (toggle with menu button)
Main Content: Full width (ml-0)
Grid: 1 column
Header: Full width with menu button visible
Bottom Nav: Visible (Surveyor only)
```

### Tablet (768px - 1024px)

```
Sidebar: HIDDEN (toggle with menu button)
Main Content: Full width (ml-0)
Grid: 2 columns (md:grid-cols-2)
Header: Full width with menu button visible
```

### Desktop (> 1024px)

```
Sidebar: ALWAYS VISIBLE (lg:translate-x-0)
Main Content: Offset right (ml-64)
Grid: 3-4 columns (lg:grid-cols-3 or lg:grid-cols-4)
Header: Offset right (ml-64)
Menu Button: HIDDEN
```

---

## CSS Classes Explanation

### Grid System

```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

// 1 column on mobile, 3 on tablet, 4 on desktop
className = "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6";

// gap-6 = 24px spacing between grid items (6 * 4px = 24px)
```

### Flexbox Spacing

```tsx
// Vertical stack with 8px spacing between items
className = "flex flex-col gap-2";
// gap-2 = 8px spacing (2 * 4px = 8px)

// Horizontal layout with space between
className = "flex items-center justify-between";
```

### Padding

```tsx
// p-4 = 16px padding all sides (4 * 4px)
// p-6 = 24px padding all sides (6 * 4px)
// p-8 = 32px padding all sides (8 * 4px)

// px-6 = 24px horizontal, py-4 = 16px vertical
// px-8 = 32px horizontal, py-6 = 24px vertical
```

### Margin

```tsx
// mb-1 = 4px margin-bottom
// mb-2 = 8px margin-bottom
// mb-4 = 16px margin-bottom
// mb-8 = 32px margin-bottom
```

---

## Z-Index Stack (from bottom to top)

```
z-0   ← Main content
z-10  ← Cards, buttons
z-20  ← Dropdowns, modals
z-30  ← Sticky header, tooltips
z-40  ← Sidebar, overlay
z-50  ← Modal backdrops
```

---

## Color System

### Backgrounds

```tsx
"bg-slate-950"; // Darkest (page background)
"bg-slate-900"; // Dark (sidebar, cards)
"bg-slate-800"; // Medium (hover states)
"bg-slate-800/50"; // Semi-transparent
```

### Text

```tsx
"text-white"; // Primary text
"text-slate-100"; // Secondary text (slightly dimmer)
"text-slate-400"; // Tertiary text (labels, descriptions)
"text-slate-500"; // Hints (very dim)
```

### Borders

```tsx
"border-slate-800"; // Primary border
"border-slate-700"; // Hover state
"border-slate-600"; // Active state
```

### Accent Colors

```tsx
"from-blue-600 to-blue-700"; // Admin gradient
"from-purple-600 to-purple-700"; // Supervisor gradient
"from-cyan-600 to-cyan-700"; // Surveyor/progress
```

---

## Common Patterns

### Stat Card

```tsx
<div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden group">
  <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20">
    <IconComponent className="w-12 h-12" />
  </div>
  <div className="relative z-10">
    <p className="text-slate-100 font-medium mb-1">Title</p>
    <h3 className="text-4xl font-bold text-white">123</h3>
    <div className="mt-4 text-sm text-green-400 bg-green-500/10 w-fit px-2 py-1 rounded">
      Status
    </div>
  </div>
</div>
```

### Quick Action Button

```tsx
<button className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20">
  + Create User
</button>
```

### Info Section

```tsx
<div className="p-4 bg-slate-800/50 rounded-lg">
  <p className="text-slate-400 text-xs mb-2">Label</p>
  <div className="flex items-center justify-between">
    <span className="text-white font-medium">Value</span>
    <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-300">
      Status
    </span>
  </div>
</div>
```

---

## Implementation Checklist

When creating new dashboard pages:

- [ ] Import DashboardLayout: `import DashboardLayout from '@/components/DashboardLayout'`
- [ ] Wrap with layout: `<DashboardLayout role="ADMIN">`
- [ ] Add page title: `<h1 className="text-3xl font-bold text-white">`
- [ ] Use CSS Grid: `grid grid-cols-1 md:grid-cols-X lg:grid-cols-Y gap-6`
- [ ] Card padding: `p-6` on all cards
- [ ] Card border: `border border-slate-800`
- [ ] Card radius: `rounded-2xl`
- [ ] Icon sizing: `w-12 h-12` for large, `w-5 h-5` for nav
- [ ] Spacing: `mb-8` between sections
- [ ] Colors: Use slate for dark, accent gradients for highlights
- [ ] Responsive: Test on mobile, tablet, desktop

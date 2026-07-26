# Detailed Analysis Report: Mobile Typography & Container Layouts (320px–480px)

**Milestone:** Milestone 1: Dynamic Mobile Typography & Container Layouts  
**Investigator:** Explorer 1  
**Working Directory:** `c:\Users\PC\Documents\Transparency\class-fund-tracker\.agents\m1_explorer_1`  
**Date:** July 26, 2026  

---

## Executive Summary

An exhaustive investigation was conducted across all UI components and page views in `app/` and `components/` to assess mobile typography, font scaling, container padding, line-heights, flex wrapping, overflow behavior, and text clipping across small mobile viewports (320px–480px, including iPhone SE, iPhone Mini, Galaxy S series, and standard mobile viewports).

While the application utilizes responsive Tailwind CSS utilities and clean Geist typography, critical layout bottlenecks and text clipping risks exist on viewports between 320px and 480px. Key issues include fixed grid column counts on small viewports (`grid-cols-2` or `grid-cols-3` where `grid-cols-1` is needed), missing `flex-wrap` and `break-words` on text/badge containers, metric card overflow due to large font sizes and high padding, compressed multi-column modal layouts on narrow screens, and header button collisions.

---

## Section 1: Detailed Findings by Key Area

### 1. Core View Containers & Outer Page Layouts

#### 1.1 Main Page Containers (`app/page.tsx:119`, `app/officer-dashboard/page.tsx:135`)
- **Observation:** Main wrapper elements use:
  ```tsx
  <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12 anim-fade-slide-in">
  ```
- **Evidence:** Line 119 in `app/page.tsx` and Line 135 in `app/officer-dashboard/page.tsx`.
- **Impact on 320px–480px:** On a 320px screen width (e.g. iPhone SE 1st gen), `px-4` consumes 32px of horizontal space (16px left + 16px right), leaving only 288px for inner content. Additionally, `py-8` (32px top + 32px bottom) consumes 64px of valuable vertical viewport space.
- **Recommended Refactoring:** Change to `px-3 py-4 sm:px-6 sm:py-12`. This reclaims 8px of horizontal width and 32px of vertical height on screens under 640px.

#### 1.2 Public & Officer Header Bar Layouts (`components/public-tabs-container.tsx:207-236`, `components/officer-tabs-container.tsx:166-226`)
- **Observation:**
  ```tsx
  {/* Subtitle & Title */}
  <p className="text-sm font-semibold text-primary">Bachelor of Science in Information Systems • BSIS 201</p>
  <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">BSIS 201 Section Hub</h1>

  {/* Header Button Bar */}
  <div className="flex items-center gap-2 relative">
    <ThemeToggle />
    <PatchNotesButton />
    <BirdButton />
    {/* Optional Sign Out Form */}
  </div>
  ```
- **Evidence:** `public-tabs-container.tsx` lines 207-236; `officer-tabs-container.tsx` lines 166-226.
- **Impact on 320px–480px:**
  1. Subtitle `"Bachelor of Science in Information Systems • BSIS 201"` (`text-sm`) on 320px–360px viewports wraps onto 3 lines, creating excessive top vertical spacing.
  2. Main Title `<h1 className="text-3xl ...">` at 30px font size causes abrupt line breaks on 320px screens.
  3. The action button cluster (`ThemeToggle`, `PatchNotesButton`, `BirdButton`, `FinancialAuditReportModal`, `Sign Out`) in `public-tabs-container.tsx:215` lacks `flex-wrap`. When signed in, 4 icon buttons plus the Sign Out button total >290px width, causing horizontal overflow past screen margins.
- **Recommended Refactoring:**
  - Subtitle: `text-xs sm:text-sm`
  - Title: `text-2xl sm:text-3xl lg:text-4xl`
  - Button cluster: Add `flex-wrap items-center gap-2`.

#### 1.3 Floating Bottom Navigation Bar (`components/bottom-nav.tsx:53,60,85`)
- **Observation:**
  ```tsx
  <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full p-2 z-40 flex items-center justify-between liquid-glass liquid-glass-sheen sm:hidden">
    <div className="h-full rounded-full liquid-ease liquid-blob" style={{ width: '20%', transform: `translateX(${slideIndex * 100}%)` }} />
    {/* 5 buttons with w-1/5 */}
  </nav>
  ```
- **Evidence:** `bottom-nav.tsx` lines 53-95.
- **Impact on 320px–480px:** 92% width on a 320px screen equals 294.4px total nav width. After subtracting 16px padding (`p-2`), the inner width is 278.4px. Each button (`w-1/5`) receives 55.68px. Text labels like "Portal", "Tasks", "Study" with `text-[9px] font-bold tracking-wider` fit, but `tracking-wider` can cause text to touch icon bounds on 320px width.
- **Verification of Spacing:** `public-tabs-container.tsx` and `officer-tabs-container.tsx` properly include `pb-28` and `<div className="h-36 pointer-events-none" aria-hidden="true" />` to prevent floating nav overlap on bottom content.

---

### 2. Typography Hierarchy, Card Metrics & Financial Text Scaling

#### 2.1 Class Treasury Balance Card (`components/balance-card.tsx:78,95,98`)
- **Observation:**
  ```tsx
  <section className="relative overflow-hidden rounded-3xl bg-foreground p-6 text-background shadow-lg sm:p-8 ...">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-background/60 sm:text-xs">Class Treasury</p>
    <p className="text-3xl font-bold tracking-tight text-background sm:text-5xl" style={{ wordBreak: 'break-word' }}>
      {formattedBalance}
    </p>
  </section>
  ```
- **Evidence:** `balance-card.tsx` lines 78-102.
- **Impact on 320px–480px:** On a 320px screen, `p-6` (24px padding * 2 = 48px) leaves only 272px inner width. High formatted PHP values (e.g. `₱1,250,450.00` or `₱125,000.00`) rendered at `text-3xl` (30px font size) occupy ~220px–260px. On 320px viewports with scaled text settings, numbers wrap onto two lines.
- **Recommended Refactoring:** Use `p-4.5 sm:p-6 md:p-8` for container padding and `text-2xl sm:text-4xl md:text-5xl` for balance typography.

#### 2.2 Financial Audit Report Summary Metrics Grid (`components/financial-audit-report-modal.tsx:182-207`)
- **Observation:**
  ```tsx
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div className="p-4 rounded-2xl bg-muted/50 border border-border ...">
      <p className="text-xs font-medium text-muted-foreground ...">Total Collections</p>
      <p className="text-xl sm:text-2xl font-bold text-foreground ...">₱{totalCollections.toFixed(2)}</p>
    </div>
    ...
  </div>
  ```
- **Evidence:** `financial-audit-report-modal.tsx` lines 182-207.
- **Impact on 320px–480px:** `grid-cols-2` on a 320px screen creates 2 columns of 136px width each ((320 - 32 modal padding - 16 gap) / 2). Inside each metric box, `p-4` padding takes 32px, leaving only 104px inner width for the numeric value. A value like `₱125,450.00` (11 chars) at `text-xl` (20px) requires ~125px width, causing text clipping or numeric wrapping (`₱125,450` on line 1, `.00` on line 2).
- **Recommended Refactoring:**
  - Metric box padding: `p-2.5 sm:p-4`
  - Typography: `text-base sm:text-xl md:text-2xl`

#### 2.3 Officer Dashboard CSV Export Buttons (`components/officer-tabs-container.tsx:298-320`)
- **Observation:**
  ```tsx
  <div className="grid grid-cols-3 gap-1.5 pt-1">
    <button className="px-2.5 py-1.5 text-[11px] font-medium bg-muted ... truncate" title="Export Payment Grid CSV">Payment Matrix</button>
    <button className="px-2.5 py-1.5 text-[11px] font-medium bg-muted ... truncate" title="Export Payment History CSV">Payment History</button>
    <button className="px-2.5 py-1.5 text-[11px] font-medium bg-muted ... truncate" title="Export Expense Logs CSV">Expense Logs</button>
  </div>
  ```
- **Evidence:** `officer-tabs-container.tsx` lines 298-320.
- **Impact on 320px–480px:** On a 320px viewport, the panel inner width is ~248px. Divided by 3 buttons, each button gets ~80px width. Subtracting `px-2.5` padding (20px) leaves only 60px for text.
  - `"Payment Matrix"` clips to `"Payment Ma..."`
  - `"Payment History"` clips to `"Payment Hi..."`
  - `"Expense Logs"` clips to `"Expense Lo..."`
- **Recommended Refactoring:** Change grid layout to `grid-cols-1 xs:grid-cols-3 gap-1.5` or `flex flex-wrap gap-1.5` for sub-400px viewports.

---

### 3. Container Layouts, Flex/Grid Wrapping, Overflow & Modal Behaviors

#### 3.1 Checklist & Officer Settings Header Bars (`components/student-payment-list.tsx:74,99,117`, `components/officer-payment-list.tsx:132,171`)
- **Observation:**
  ```tsx
  {/* Settings bar */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3"> ... </div>
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm w-full"> <input ... placeholder="Search student name..." /> </div>
      <SubmitReceiptModal ... />
    </div>
  </div>

  {/* Checklist Card Header */}
  <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
    <div className="flex flex-col gap-1"> ... </div>
    <div className="flex items-center gap-4">
      <p className="text-sm font-medium text-muted-foreground">{paidCount} of {total} paid</p>
    </div>
  </div>
  ```
- **Evidence:** `student-payment-list.tsx` lines 74, 99, 117; `officer-payment-list.tsx` lines 132, 171.
- **Impact on 320px–480px:**
  1. Search input and `SubmitReceiptModal` button are placed side-by-side (`flex items-center gap-3`). On a 320px screen, the search box compresses to <130px, truncating placeholder text to `"Search stud..."`.
  2. Checklist card header uses `flex items-end justify-between`. On a 320px screen, week number, date range, status badge, and paid count collision occurs, pushing content into multiple wrapped lines.
- **Recommended Refactoring:**
  - Search/Modal bar: `<div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full">`
  - Card header: `<div className="flex flex-col xs:flex-row xs:items-end justify-between gap-2 border-b border-border px-4 py-4 sm:px-6">`

#### 3.2 Digital Proof Approval Queue (`components/officer-receipt-approval-queue.tsx:151,262,336`)
- **Observation:**
  ```tsx
  {/* Status Tabs */}
  <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/40">
    <button ...>Pending ({pendingCount})</button>
    <button ...>Approved ({approvedCount})</button>
    <button ...>Rejected ({rejectedCount})</button>
    <button ...>All ({receipts.length})</button>
  </div>

  {/* Card Footer */}
  <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-3">
    <div className="text-[11px] text-muted-foreground flex items-center gap-1"> <Clock /> {date} </div>
    <div className="flex items-center gap-2"> <button>Reject</button> <button>Approve</button> </div>
  </div>
  ```
- **Evidence:** `officer-receipt-approval-queue.tsx` lines 151-195, lines 336-375.
- **Impact on 320px–480px:**
  1. The 4 filter tab buttons lack `overflow-x-auto` or `flex-wrap`. On 320px–375px screens, 4 buttons next to each other total ~240px wide. Positioned beside the search box, horizontal overflow occurs.
  2. In the receipt approval card footer, date stamp on left and Approve + Reject buttons on right collide on 320px screens inside a 280px card.
- **Recommended Refactoring:**
  - Filter tabs: Add `overflow-x-auto custom-scrollbar flex-nowrap shrink-0` to the tab container.
  - Receipt footer: `<div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-t border-border/60 pt-3 mt-3">`

#### 3.3 Freedom Wall Grid Mode & Zoom Overlay (`components/freedom-wall.tsx:933,987`, `components/freedom-wall/add-post-modal.tsx:68,90`)
- **Observation:**
  ```tsx
  {/* Grid Mode */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

  {/* Postcard Zoom Overlay */}
  <div className="grid grid-cols-5 gap-4 flex-1 h-full pt-4 ...">
    <div className="col-span-3 ..."> {post.content} </div>
    <div className="col-span-2 ..."> {post.author_name} + Address + Reactions </div>
  </div>
  ```
- **Evidence:** `freedom-wall.tsx` lines 933, 987-1015.
- **Impact on 320px–480px:**
  1. In Freedom Wall Grid Mode, `grid-cols-2` on a 320px screen forces card width to ~136px. Inside 136px, note text, author name, song mini player, and reaction buttons overflow the card bounds.
  2. In Zoom Modal Postcard View (lines 987-1015), the modal width on a 320px screen is ~288px (`viewportSize.w - 32`). A 5-column grid gives 2/5 width (115px) to the right column. Reaction buttons, address lines ("BSIS 201 Section Hub", "Room: transparency-wall"), and author name overflow 115px.
- **Recommended Refactoring:**
  - Grid mode: `<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3.5">`
  - Zoom Postcard: `<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 flex-1 h-full pt-4">` (`col-span-1 sm:col-span-3`, `col-span-1 sm:col-span-2`).

#### 3.4 Recent Activity Log Unbroken Text Risk (`components/recent-activity.tsx:217`)
- **Observation:**
  ```tsx
  <p className="text-sm leading-6 text-muted-foreground mt-1.5 pl-1">
    {activity.action_description}
  </p>
  ```
- **Evidence:** `recent-activity.tsx` line 217.
- **Impact on 320px–480px:** Missing `break-words`. If an officer logs an unbroken URL or string, it forces horizontal body overflow on mobile.
- **Recommended Refactoring:** Add `break-words` to the action description paragraph class.

---

## Section 2: Comprehensive Inventory of Target Files & Recommended Fixes

| File Path | Line(s) | Current Class / Structure | Identified Problem | Actionable Fix |
|---|---|---|---|---|
| `app/page.tsx` | 119 | `px-4 py-8 sm:px-6` | Waste 32px width & 64px height on 320px mobile | Change to `px-3 py-4 sm:px-6 sm:py-12` |
| `app/officer-dashboard/page.tsx` | 135 | `px-4 py-8 sm:px-6` | Waste 32px width & 64px height on 320px mobile | Change to `px-3 py-4 sm:px-6 sm:py-12` |
| `components/public-tabs-container.tsx` | 209-215 | `text-3xl`, `flex items-center gap-2` | 30px title line breaks; action buttons overflow 320px without wrap | Title `text-2xl sm:text-3xl lg:text-4xl`; subtitle `text-xs sm:text-sm`; add `flex-wrap` to button bar |
| `components/officer-tabs-container.tsx` | 170-175 | `text-3xl`, `flex items-center gap-2` | Title line breaks; action buttons overflow without wrap | Title `text-2xl sm:text-3xl lg:text-4xl`; subtitle `text-xs sm:text-sm`; ensure `flex-wrap` |
| `components/officer-tabs-container.tsx` | 298 | `grid grid-cols-3 gap-1.5` | Export buttons ("Payment Matrix", etc.) clip text to `"Payment Ma..."` on 320px | Change to `grid grid-cols-1 xs:grid-cols-3 gap-1.5` |
| `components/balance-card.tsx` | 78, 98 | `p-6 sm:p-8`, `text-3xl sm:text-5xl` | High PHP amounts (e.g. `₱1,250,450.00`) wrap/overflow 272px inner width | Use `p-4.5 sm:p-6 md:p-8` and `text-2xl sm:text-4xl md:text-5xl` |
| `components/financial-audit-report-modal.tsx` | 182-207 | `grid-cols-2`, `p-4`, `text-xl` | 104px inner metric card causes `₱125,450.00` to break onto 2 lines | Metric box padding `p-2.5 sm:p-4`; font `text-base sm:text-xl md:text-2xl` |
| `components/student-payment-list.tsx` | 99, 117 | `flex items-center gap-3`, `flex items-end justify-between` | Search box compressed to <130px; header week/paid text collision | Search/Modal row: `flex-col xs:flex-row`; header: `flex-col xs:flex-row xs:items-end` |
| `components/officer-payment-list.tsx` | 171 | `flex items-end justify-between` | Header text collision on 320px screen | Header: `flex-col xs:flex-row xs:items-end` |
| `components/officer-receipt-approval-queue.tsx` | 151, 336 | `flex items-center gap-1`, `flex items-end justify-between` | Filter pills overflow without scroll; card footer buttons collide with date | Filter container: add `overflow-x-auto custom-scrollbar flex-nowrap`; card footer: `flex-col xs:flex-row` |
| `components/freedom-wall.tsx` | 933, 987 | `grid-cols-2`, `grid-cols-5` (postcard) | 136px grid cards overflow; 115px postcard right column clips reactions | Grid mode: `grid-cols-1 xs:grid-cols-2 sm:grid-cols-3`; Postcard: `grid-cols-1 sm:grid-cols-5` |
| `components/freedom-wall/add-post-modal.tsx` | 68, 89 | `grid-cols-1 sm:grid-cols-2`, `size-8` | Color selector buttons touch input on 320px | Adjust spacing & wrap `flex-wrap` |
| `components/recent-activity.tsx` | 217 | `<p className="text-sm leading-6 ...">` | Missing `break-words` on long URLs/descriptions | Add `break-words` |
| `components/tasks-section/task-card.tsx` | 68, 114 | `flex items-center justify-between` | Header badge cluster collides with due status badge on 320px | Left badge group: add `flex-wrap gap-1`; title: ensure `break-words` |
| `components/patch-notes-modal.tsx` | 272, 309 | `p-6`, `pl-9` | Modal body padding `p-6` takes 48px; change items squeezed | Modal body: `p-4 sm:p-6`; change item list: `pl-6 sm:pl-9` |

---

## Section 3: Verification Methods

To independently verify these findings across 320px–480px viewports:

1. **Build Verification:**
   Run Next.js build check to confirm zero TypeScript / CSS syntax errors:
   ```bash
   npm run build
   ```

2. **Viewport Test Targets:**
   Inspect using browser DevTools Device Toolbar at the following resolution breakpoints:
   - **320px x 568px** (iPhone SE 1st Gen)
   - **360px x 740px** (Standard Android / Galaxy S series)
   - **375px x 667px / 390px x 844px** (iPhone 12/13/14 Mini / Standard)
   - **430px x 932px** (iPhone Max series)

3. **Checklist Inspection Criteria:**
   - [ ] No horizontal scrollbars on body or main view containers (`document.body.scrollWidth === window.innerWidth`).
   - [ ] Balance card PHP values render on 1 single line without numeric clipping.
   - [ ] Metric cards in Financial Audit Report display `₱XXX,XXX.XX` cleanly inside card borders.
   - [ ] CSV Export buttons in Officer Portal display full labels without truncation ("Payment Matrix", "Payment History", "Expense Logs").
   - [ ] Freedom Wall Grid mode displays single column on 320px–360px screens.
   - [ ] Postcard Zoom Overlay in Freedom Wall stacks into a single clean vertical column on sub-480px viewports.
   - [ ] Header action buttons in `public-tabs-container.tsx` wrap gracefully without pushing past right margin.

# Milestone 3: Mobile Scroll Efficiency & Fatigue Prevention (R3) - Strategy & Specification Report

## 1. Observation

Direct code analysis of the Class Fund Tracker codebase revealed several mobile scroll friction points across layout, navigation, and long data lists:

1. **Header & Navigation Behavior (`components/public-tabs-container.tsx:207-265`, `components/officer-tabs-container.tsx:166-255`):**
   - The `<header>` element containing section branding, theme toggle, patch notes, flappy bird game button, audit report modal button, and sign out form is positioned in standard document flow.
   - On mobile screens, as soon as a user scrolls down past ~150px, the header disappears completely from view. Quick controls (theme toggle, sign-out, audit modal, record expense) require swiping back to the top of the page.
   - Desktop tabs (`desktopTabs`) are hidden on mobile (`hidden sm:flex`), relying solely on `BottomNav`.

2. **Mobile Floating Navigation (`components/bottom-nav.tsx:53-95`):**
   - `BottomNav` is fixed at `bottom-8 left-1/2 -translate-x-1/2` with `z-40` on `sm:hidden`.
   - Height is 48px (`h-12`) with touch buttons of width `w-1/5` (~64px - 80px on 320px-400px mobile viewports), satisfying the 44px touch target requirement.
   - Tab selection triggers React state updates (`setActiveTab`), but there is no horizontal swipe / scroll-snap interface on mobile views.

3. **Data List Containers & Scroll Traps:**
   - **Student Payment List (`components/student-payment-list.tsx:150-151`):** `<div className="max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">` renders up to 50+ student rows.
   - **Officer Payment List (`components/officer-payment-list.tsx:204-205`):** `<div className="max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">` renders 50+ student rows with interactive checkboxes.
   - **Audit Logs / Recent Activity (`components/recent-activity.tsx:145-146`):** `<div className="max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">` renders logged audit items.
   - **Study Hub (`components/study-hub.tsx:664-667`):** `<div className="flex flex-col gap-2 max-h-[500px] md:max-h-[680px] overflow-y-auto...">` renders reviewer cards.
   - *Issue:* Fixed-height scroll containers inside a vertically scrolling page create "scroll traps" on mobile touchscreens—users attempting to scroll the page get stuck scrolling inside inner list containers instead.

4. **Absence of Jump-To-Top Control:**
   - Neither `app/page.tsx` nor `app/officer-dashboard/page.tsx` provides a "Back to Top" floating button when scrolled deep into long lists. Returning to top navigation requires repeated manual swiping.

5. **CSS & Styling Configurations (`app/globals.css:252-256`):**
   - Touch optimization rule present: `button, a, input, select, label, [role="button"] { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }`.
   - Smooth scroll is enabled globally (`html { scroll-behavior: smooth; }`).

---

## 2. Logic Chain

1. **Premise 1:** Mobile users experience scroll fatigue when viewing pages with multiple long vertical lists (50+ students, multiple audit logs, tasks, study materials).
2. **Premise 2:** Fixed-height inner scrollable containers (`max-h-[640px] overflow-y-auto`) cause nested scroll traps on mobile touch screens, degrading UX.
3. **Premise 3:** Without a sticky/docked quick nav header or floating jump-to-top indicator, mobile navigation requires excessive vertical scrolling to reach top-level actions or tab context.
4. **Premise 4:** Mobile users expect native-feeling horizontal swipe gestures for tab navigation, supported via CSS scroll snap (`snap-x snap-mandatory`).
5. **Conclusion:** To prevent scroll fatigue and optimize mobile scroll efficiency while maintaining 100% feature parity and server action compatibility, we must implement four dedicated features:
   - Sticky / Docked Quick Nav Header on Mobile.
   - Collapsible / Accordion Containers and Filter Chips for Data Lists.
   - Floating "Back to Top" Jump Indicator Button (with >=44px touch target).
   - Horizontal Scroll-Snapped Tab Switching for Mobile Containers.

---

## 3. Detailed Technical Specification & Feature Architecture

### Feature 1: Sticky / Docked Quick Nav Controls on Mobile

#### Architecture & Design
- Elevate top header or introduce a sticky compact quick bar on mobile (`sticky top-0 z-30`).
- Apply `backdrop-blur-md bg-background/85 border-b border-border/40` when sticky on mobile view (`sm:relative sm:backdrop-blur-none`).
- Provide compact quick status indicator showing active tab label and key quick actions (ThemeToggle, PatchNotesButton, SignOut button).

#### Implementation Details
- Target files: `components/public-tabs-container.tsx` and `components/officer-tabs-container.tsx`.
- Class adjustments for header container:
  ```tsx
  <header className="sticky top-0 z-30 -mx-3 px-3 py-3 bg-background/80 backdrop-blur-md border-b border-border/40 sm:relative sm:top-auto sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none mb-6 transition-all">
  ```
- Touch Target Compliance: Every icon button in the header (`ThemeToggle`, `PatchNotesButton`, `BirdButton`, `SignOut`) maintains minimum `44px x 44px` (`min-h-[44px] min-w-[44px]`).

---

### Feature 2: Collapsible / Accordion Containers for Lengthy Data Lists

#### Architecture & Design
- Create reusable component `components/ui/collapsible-section.tsx`.
- Replace inner fixed scroll traps (`max-h-[640px] overflow-y-auto`) on mobile with collapsible accordion views, compact default pagination ("Show Top 10 / Show All 50"), and status filter chips ("All", "Unpaid Only", "Paid Only").

#### Component Specification (`components/ui/collapsible-section.tsx`)
```tsx
'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  badgeText?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({
  title,
  subtitle,
  badgeText,
  defaultOpen = true,
  children
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-card hover:bg-muted/30 min-h-[44px] cursor-pointer text-left transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-card-foreground">{title}</h3>
            {badgeText && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center min-h-[44px] min-w-[44px] text-muted-foreground">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 sm:p-6 anim-fade-slide-in">
          {children}
        </div>
      )}
    </div>
  )
}
```

#### Application to List Components
1. **`officer-payment-list.tsx` & `student-payment-list.tsx`:**
   - Add status filter quick chips on mobile: `[ All (50) ]  [ Unpaid (12) ]  [ Paid (38) ]`.
   - Selecting "Unpaid Only" reduces list height on mobile by ~75%, eliminating scroll fatigue.
   - Provide "Expand All Students" / "Collapse to Top 15" toggle button when viewing full list on mobile screens.
2. **`recent-activity.tsx` (Audit Logs):**
   - Wrap audit log list in `CollapsibleSection` titled "Recent Activity", allowing officers to collapse the audit log panel when managing payment checklists.

---

### Feature 3: Floating "Back to Top" Jump Indicator Button

#### Architecture & Design
- Create client component `components/scroll-to-top-button.tsx`.
- Uses passive scroll listener (`window.addEventListener('scroll', ..., { passive: true })`).
- Appears when `window.scrollY > 300px`.
- Rendered via React Portal (`createPortal`) to ensure `z-40` floating overlay status above `BottomNav` (`bottom-24` on mobile, `bottom-8` on desktop).

#### Component Specification (`components/scroll-to-top-button.tsx`)
```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUp } from 'lucide-react'

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!mounted || typeof window === 'undefined') return null

  return createPortal(
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className={`fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 h-12 w-12 rounded-full liquid-glass flex items-center justify-center text-primary shadow-lg border border-primary/20 cursor-pointer press-spring transition-all duration-300 ${
        visible ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
    </button>,
    document.body
  )
}
```

---

### Feature 4: Scroll-Snapped Tab Switching on Mobile Views

#### Architecture & Design
- Transform mobile view in `PublicTabsContainer` and `OfficerTabsContainer` into a horizontal CSS scroll-snap carousel container.
- Container CSS: `flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none sm:block`.
- Tab Item CSS: `w-full shrink-0 snap-start snap-always sm:w-auto sm:shrink`.
- Bi-directional Synchronization:
  - **Swipe -> State:** `onScroll` handler calculates visible index `Math.round(scrollLeft / width)` and calls `setActiveTab(tabs[index].id)`.
  - **Nav Click -> Scroll:** `BottomNav` click calls `containerRef.current.scrollTo({ left: index * width, behavior: 'smooth' })`.
- Maintains 100% desktop compatibility (`sm:block`).

#### Proposed Code Structure (`components/public-tabs-container.tsx`):
```tsx
// Reference to horizontal swipe container
const scrollContainerRef = useRef<HTMLDivElement>(null)

const tabOrder = ['home', 'tasks', 'study', 'freedom', 'portal']

const handleScroll = () => {
  if (!scrollContainerRef.current) return
  const { scrollLeft, clientWidth } = scrollContainerRef.current
  if (clientWidth === 0) return
  const newIndex = Math.round(scrollLeft / clientWidth)
  if (tabOrder[newIndex] && tabOrder[newIndex] !== activeTab) {
    setActiveTab(tabOrder[newIndex])
  }
}

const handleSelectTab = (tabId: string) => {
  setActiveTab(tabId)
  const index = tabOrder.indexOf(tabId)
  if (index !== -1 && scrollContainerRef.current) {
    const width = scrollContainerRef.current.clientWidth
    scrollContainerRef.current.scrollTo({ left: index * width, behavior: 'smooth' })
  }
}
```

---

## 4. Caveats

- **Device Touch Precision:** iOS Safari smooth scrolling (`-webkit-overflow-scrolling: touch`) may require explicit `scroll-snap-type: x mandatory` styles.
- **Server Action Parity:** Ensure programmatic state changes (such as redirecting to `/officer-dashboard` from portal tab) do not trigger unwanted scroll snap bounce during navigation.
- **Viewport Height Variations:** Collapsible list containers must maintain smooth CSS transitions on mobile devices with variable browser address bar heights.

---

## 5. Conclusion

Milestone 3 (Mobile Scroll Efficiency & Fatigue Prevention - R3) requires no database or backend schema modifications. The specification provides complete frontend architectures for sticky quick nav, collapsible list containers, floating jump-to-top indicator, and scroll-snapped mobile tab switching.

All proposed controls adhere strictly to minimum 44px touch targets and preserve full compatibility with existing Next.js server actions (`signOutAction`, `togglePaymentStatus`, `addPostAction`, `addTaskAction`, `addExpenseModal`).

---

## 6. Verification Method

### Automated Checks & Build Verification
Execute the following commands from workspace root:
1. `npm run build` — Verify zero TypeScript or Next.js build errors.
2. `npm run lint` — Confirm ESLint compliance.

### Manual & Visual Verification Steps
1. **Touch Target Verification:** Inspect all modified/new button elements (`ScrollToTopButton`, `CollapsibleSection` toggles, sticky header actions) using browser developer tools to confirm dimensions are >= 44px x 44px.
2. **Scroll-Snap Tab Testing:** Emulate mobile viewport (e.g., iPhone 14 / 390px width) in Chrome DevTools. Perform horizontal touch swipe across tab contents and verify `BottomNav` active indicator smoothly slides in sync.
3. **Back to Top Button Testing:** Scroll down `http://localhost:3000` past 300px. Verify floating `ScrollToTopButton` appears at `bottom-24`. Click button and verify smooth scroll to `y = 0`.
4. **Collapsible Section Testing:** Open `OfficerPaymentList` on mobile view. Click "Unpaid Only" filter chip and verify list height collapses cleanly without double scrollbars.

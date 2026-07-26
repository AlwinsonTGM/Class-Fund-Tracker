# Handoff Report — Milestone 3 Review (Mobile Scroll Efficiency & Fatigue Prevention - R3)

## Review Summary

**Verdict**: **REQUEST_CHANGES**
**Overall Risk Assessment**: **MEDIUM**

While the implementation demonstrates excellent touch target ergonomics (all controls meet or exceed >= 44px touch footprint requirements), clean single-handed mobile UI layouts across 320px–480px viewports, and zero horizontal scroll overflow, there is a **Major finding** regarding the CSS scroll snap implementation. Inactive tab panes are hidden using `display: none` (`hidden`), which breaks native horizontal swipe swiping, prevents container scroll overflow, and causes programmatic `scrollTo` calculations to fail against container bounds.

---

## Findings

### [Major] Finding 1: CSS Scroll Snap Horizontal Swiping Defect (`display: none` on Inactive Tabs)

- **What**: The horizontal scroll-snap container (`scrollContainerRef`) applies CSS scroll-snap utility classes (`flex w-full overflow-x-auto snap-x snap-mandatory`), but each nested tab pane dynamically applies `${activeTab === 'tabName' ? 'block' : 'hidden sm:hidden'}`.
- **Where**:
  - `components/public-tabs-container.tsx` (Lines 306, 321, 326, 339, 351)
  - `components/officer-tabs-container.tsx` (Lines 294, 309, 322, 335, 347)
- **Why**:
  1. Setting `display: none` (`hidden`) removes inactive tab panes from the flex layout flow. Consequently, the scroll container contains only **1 rendered child element** at any time.
  2. The container's `scrollWidth` equals its `clientWidth` (width of 1 tab). There are no adjacent scrollable elements in the horizontal axis. As a result, **touch swipe gestures to switch tabs on mobile viewports do not work**.
  3. Programmatic scroll synchronization inside `useEffect` calculates `targetLeft = index * width` (e.g. `1 * 360 = 360px` for index 1) and calls `scrollContainerRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' })`. Because `scrollWidth` is only 360px, `scrollTo` cannot scroll to `360px` (max scroll offset is 0), rendering the programmatic scroll ineffective.
- **Suggestion**:
  - Remove `${activeTab === 'tabName' ? 'block' : 'hidden sm:hidden'}` for mobile flex layout so all tab panes remain rendered in the horizontal flex sequence with `w-full shrink-0 snap-start`, allowing native horizontal touch swiping and accurate `scrollLeft` calculation.
  - Alternatively, if discrete tab visibility via state is desired without touch swiping, remove the pseudo scroll-snap classes (`snap-x snap-mandatory flex overflow-x-auto`) to avoid misleading scroll snap logic.

### [Minor] Finding 2: Tab Order Inconsistency Between Desktop Navigation and DOM / Mobile Nav

- **What**: In `OfficerTabsContainer`, the desktop header tab array (`desktopTabs`) lists `portal` ("Officer Portal") at index 0 and `home` ("Student View") at index 1. However, in `tabOrder` (`['home', 'tasks', 'study', 'freedom', 'portal']`), DOM pane structure, and mobile `BottomNav`, `home` is index 0 and `portal` is index 4.
- **Where**: `components/officer-tabs-container.tsx` (Lines 97, 155–161, 294–347) vs `components/bottom-nav.tsx` (Lines 28–34).
- **Why**: Clicking the 1st desktop tab ("Officer Portal") activates tab index 4 in DOM, while clicking the 1st mobile `BottomNav` button activates tab index 0 ("Home"). This creates a minor structural parity mismatch between desktop and mobile navigation schemas.
- **Suggestion**: Align `desktopTabs` ordering in `OfficerTabsContainer` to match `tabOrder` (`home`, `tasks`, `study`, `freedom`, `portal`).

---

## 5-Component Handoff Section

### 1. Observation

- **Tool Execution & Results**:
  - Executed `npm run build`:
    ```
    ▲ Next.js 16.2.6 (Turbopack)
    ✓ Compiled successfully in 8.5s
    ✓ Generating static pages using 7 workers (6/6) in 729ms
    ```
- **Code Observations**:
  - `components/public-tabs-container.tsx` Line 300–306:
    ```tsx
    <div
      ref={scrollContainerRef}
      onScroll={handleContainerScroll}
      className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-none sm:block ..."
    >
      <div className={`w-full shrink-0 snap-start snap-always ${activeTab === 'home' ? 'block' : 'hidden sm:hidden'}`}>
    ```
  - `components/scroll-to-top-button.tsx` Line 36:
    ```tsx
    className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-40 h-12 w-12 rounded-full ..."
    ```
  - `components/ui/collapsible-section.tsx` Line 29–30:
    ```tsx
    <div className="w-full flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 bg-card hover:bg-muted/30 min-h-[44px]">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex-1 flex items-center justify-between min-h-[44px] ..."
    ```
  - `components/bottom-nav.tsx` Line 71:
    ```tsx
    <button onClick={() => { setActiveTab(tab.id) }} className="relative flex flex-col items-center justify-center w-1/5 h-12 rounded-full ..."
    ```

### 2. Logic Chain

1. Observation: `PublicTabsContainer` and `OfficerTabsContainer` attach `snap-x snap-mandatory flex overflow-x-auto` to `scrollContainerRef`.
2. Observation: Inactive tab panes receive class `hidden sm:hidden`, applying CSS `display: none`.
3. Deduction: `display: none` removes elements from the document formatting structure and flex layout flow.
4. Deduction: With 4 out of 5 tabs set to `display: none`, the container has only 1 rendered slide. `scrollWidth == clientWidth`.
5. Deduction: Touch swipe events cannot scroll horizontally because there is zero overflow distance (`scrollWidth - clientWidth = 0`).
6. Deduction: Calling `scrollContainerRef.current.scrollTo({ left: index * width })` attempts to scroll to offsets `360px`, `720px`, etc., which are rejected by the browser because max scroll offset is `0px`.
7. Conclusion: The CSS scroll snap swipe feature and its synchronization with `BottomNav` is non-functional on mobile devices.

### 3. Caveats

- Testing was performed via code inspection and build verification in local environment. Physical touch gesture events were verified through CSS layout rule evaluation.
- No integrity violations or hardcoded bypasses were detected in the inspected source files.

### 4. Conclusion

The implementation satisfies criteria 1, 2, 4, and 5 (touch targets >= 44px, clean mobile viewports 320px–480px, responsive overflow control, and general structural parity). However, Criterion 3 (CSS Scroll Snap synchronization) fails due to `display: none` applied on inactive tab panes. The verdict is **REQUEST_CHANGES**.

### 5. Verification Method

To verify the findings and test the fix:
1. Execute `npm run build` from repository root to confirm production build compilation.
2. Inspect `components/public-tabs-container.tsx` line 306 and `components/officer-tabs-container.tsx` line 294.
3. Open mobile responsive view in browser dev tools (320px width), inspect the scroll container, and verify whether all 5 tab panes remain present in flex layout without `hidden` (`display: none`), permitting horizontal swiping.

---

## Review Criteria Assessment Matrix

| Criterion | Status | Evidence & Notes |
|---|---|---|
| 1. UX & Single-Handed Ergonomics (320px–480px) | **PASS** | Floating `BottomNav` at `bottom-8`, `ScrollToTopButton` at `bottom-24`, `h-36` bottom spacer prevents clipping. |
| 2. Touch Footprint Validation (>= 44px) | **PASS** | All interactive controls (buttons, tabs, selects, search inputs, checkboxes, filter chips) explicitly specify `min-h-[44px]`, `min-w-[44px]`, or `h-12`/`size-11`. |
| 3. CSS Scroll Snap Synchronization | **FAIL** | Inactive tab panes are hidden with `display: none`, breaking horizontal touch swiping and programmatic scroll target bounds. |
| 4. Structural Parity (Student vs Officer) | **PASS / MINOR NOTE** | Student View layout matches in both containers. Minor tab ordering mismatch in desktop header of officer container. |
| 5. Absence of Horizontal Scroll Overflow | **PASS** | Margins, full-bleed sticky header padding (`-mx-3 px-3`), text truncation, and break-words prevent horizontal scrollbar leaks. |

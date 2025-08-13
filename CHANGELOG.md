# Change History

This file tracks all modifications made to the Hawaiian Word Game project.

## 2025-08-10

### Change #1: Initialize Change History System
**Time:** Initial commit after revert to c5e2859
**Files Modified:**
- Created: `CHANGELOG.md`

**Description:**
Created a comprehensive change history tracking system to document every modification made to the project. This system will log:
- Date and time of changes
- Files modified/created/deleted
- Brief description of what was changed
- Reason for the change (bug fix, feature addition, etc.)

**Status:** ✅ Complete

### Change #2: Fix Icon Spacing Around Letter Wheel
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Adjusted positioning of hint, eye, and refresh icons around the letter wheel to maintain exactly 15px distance from circle edge. Changed from responsive positioning with complex calc() to fixed positioning at -143px (128px circle radius + 15px spacing). Reverted previous letter button radius change.

**Status:** ✅ Complete

### Change #3: Remove Refresh Confirmation Dialog
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Removed the confirmation dialog that appeared when clicking the refresh button. The refresh button now directly calls `handleReloadWords()` without showing "Do you wish to play a new game" dialog. Removed `showRefreshConfirm` state variable and the entire refresh confirmation dialog component.

**Status:** ✅ Complete - Confirmed Working

### Change #4: Fix Icon Visibility on iPhone
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Fixed positioning of hint, eye, and refresh icons to ensure they're always visible on iPhone and positioned exactly 15px from the circle edge. Replaced fixed negative margins (-143px) with responsive calc() positioning that accounts for button width (48px) plus 15px spacing. Changed from `marginLeft/marginRight` to `left/right` properties with `calc(-15px - 48px)` to ensure cross-device compatibility.

**Status:** ✅ Complete - Confirmed Working

### Change #5: Fix Viewport Calculation Precision Issues
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Fixed complex viewport calculation precision issues in the crossword grid container. Replaced `min(95vw * 0.917, 458px)` with simplified `clamp(350px, 87vw, 458px)` to eliminate rounding errors and ensure consistent rendering across devices. The clamp() function provides cleaner responsive behavior with a minimum height of 350px, preferred size of 87vw, and maximum of 458px.

**Status:** ✅ Complete

### Change #6: Fix Font Sizing Viewport Issues
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Fixed font sizing issue in crossword grid cells where `clamp(12px, 4vw, 28px)` caused text to be too small on ultrawide screens or too large on very narrow screens. Replaced with `clamp(12px, 2.5vw + 8px, 28px)` which provides better scaling across different screen sizes by using a combination of viewport width and fixed pixels for more predictable behavior.

**Status:** ✅ Complete

### Change #7: Fix Increased Spacing After Font Fix
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Adjusted spacing between the word input area and letter wheel. Initially reduced excessive spacing from '20px' to '6px', then increased by 12px to '18px' to provide optimal spacing between the text box and the circular letter wheel while maintaining good visual separation from the crossword puzzle above.

**Status:** ✅ Complete

### Change #8: Add Missing WebKit Properties for Mobile
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/index.css`

**Description:**
Added missing WebKit-specific properties for improved mobile/iOS compatibility:
- `-webkit-tap-highlight-color: transparent` to remove tap highlights
- `-webkit-touch-callout: none` to disable callout menus
- `-webkit-overflow-scrolling: touch` for smooth momentum scrolling
- `-webkit-appearance: none` for inputs/buttons to remove default styling
- `-webkit-user-select: none` for better touch interaction

These properties enhance the mobile experience by removing unwanted UI behaviors and improving touch responsiveness.

**Status:** ✅ Complete

### Change #9: Fix Gesture Conflicts on Letter Wheel
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/components/HawaiianWordGame.tsx`
- Modified: `src/index.css`

**Description:**
Fixed gesture conflicts on letter wheel buttons that could interfere with gameplay. Added touch event handlers (`onTouchStart`, `onTouchMove`, `onTouchEnd`) with `preventDefault()` and `stopPropagation()` to prevent pull-to-refresh, zoom, and other gestures. Added CSS properties `touch-action: none`, `user-select: none`, and Tailwind classes `select-none touch-none` to the buttons. Created `.letter-wheel` CSS class with gesture prevention rules and applied it to the wheel container.

**Status:** ✅ Complete

### Change #10: Fix Backdrop-filter Browser Support
**Time:** 2025-08-10 (Post-revert)
**Files Modified:**
- Modified: `src/index.css`
- Modified: `src/components/HawaiianWordGame.tsx`

**Description:**
Fixed backdrop-filter compatibility issues for Android browsers that don't support it. Added CSS fallback classes `.backdrop-fallback` and `.backdrop-fallback-dark` with `@supports` feature detection. For unsupported browsers, fallbacks use higher opacity backgrounds and box-shadows instead of blur effects. Updated word display, return button, and letter wheel circle to use the new fallback-compatible classes instead of `bg-white/40 backdrop-blur-sm`.

**Status:** ✅ Complete

---

## Template for Future Entries

```
### Change #X: [Brief Description]
**Time:** [Timestamp]
**Files Modified:**
- Modified: `path/to/file.ext`
- Created: `path/to/new-file.ext` 
- Deleted: `path/to/removed-file.ext`

**Description:**
[Detailed description of what was changed and why]

**Status:** ✅ Complete / 🚧 In Progress / ❌ Reverted
```

---

## Notes
- Each change receives a unique sequential number
- All file paths are relative to project root
- Status indicators help track change lifecycle
- Reverted changes are marked but kept for historical reference
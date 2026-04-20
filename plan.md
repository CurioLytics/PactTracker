# 🚀 PactTracker — Development & Test Plan v2.0

> Cập nhật: 2026-04-12 | Tích hợp Tiny Experiments + Multi-user Architecture

---

## ✅ Phase 1–5: Các phase đã hoàn thành

- [x] Page Transitions (Framer Motion)
- [x] Editorial Empty State
- [x] Micro-interactions (Confetti)
- [x] Streak logic, CRUD, PWA
- [x] Custom Duration, Analytics redesign
- [x] Data Export/Import (JSON)
- [x] Dark/Light theme
- [x] Mobile Optimization
- [x] Multi-user Auth (Username/Password)
- [x] PIN/Lock flow
- [x] Onboarding Welcome slides
- [x] CreatePact 5-step wizard (Tiny Experiments)
- [x] Wishlist → InProgress → Done lifecycle
- [x] Redo (undo check-in)
- [x] Delete từ Analytics
- [x] Frequency-aware streak reset logic
- [x] Navigation standardization
- [/] Bug Fixes & UI Refinement (Current)
    - [x] Standardize `create-pact` screen naming (Fix blank screen)
    - [x] Persist `isAuthenticated` state (Reduce PIN prompt)
    - [x] Swap Analytics tabs: Statistics (left) / Details (right)
    - [x] Enable physical keyboard input for PIN entry (Implemented via PinInput)
    - [x] Finalize PACT management (Edit/Delete in Details tab)
    - [x] Simplify Navigation: Remove Progress/Settings from Navbar
    - [x] UI Cleanup: Remove redundant Edit/Delete icons in Analytics
    - [ ] Fix Dashboard redo/navigation bug
    - [ ] Fix Wishlist data missing bug (Data persistence in Wizard)
 
---

**New bugs** ✅:
1. [x] Hoàn tất (Click lần 2 để làm lại) → đã fix (bỏ pointer-events:none, thêm undo modal flow)
2. [x] Ngày ở lịch sai timezone UTC vs UTC+7 → đã fix dùng local date helper

**new requirements** ✅:
1. [x] Tính năng Log nhật ký hàng ngày cho mỗi PACT (what worked / what didn't / what next)
   - Popup optional sau khi hoàn thành
   - Confirm undo nếu người dùng click lần 2 (cảnh báo xóa log nếu có)
   - Log hiện trong Lịch sử  , click để xem chi tiết

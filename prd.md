# 📋 PactTracker — PRD (Product Requirements Document)

> Phiên bản: 2.0 | Cập nhật: 2026-04-12 | Dựa trên "The Tiny Experiments"

---

## 1. PRODUCT OVERVIEW

**PactTracker** là ứng dụng web PWA theo dõi thói quen cá nhân, tích hợp triết lý **"Tiny Experiments"** — mỗi mục tiêu không phải là một cam kết cứng nhắc mà là một **thử nghiệm có giả thuyết**, có thể đo lường và điều chỉnh linh hoạt.

**Tech Stack:** React + Vite + Zustand (persist) + Framer Motion  
**Target:** Mobile-first PWA, single-page, offline-capable

---

## 2. USER PERSONAS

| Persona | Mô tả |
|---|---|
| **Người mới** | Chưa có tài khoản, lần đầu mở app |
| **Người dùng quay lại** | Đã có tài khoản, đã onboarded |
| **Người dùng đa thiết bị** | Dùng chung thiết bị với nhiều account |

---

## 3. SCREENS & ROUTING

| Screen | `currentScreen` value | Điều kiện hiển thị |
|---|---|---|
| Login / Welcome | `welcome` hoặc `login` | Chưa xác thực |
| Onboarding / Create PACT | `onboarding` | Đang tạo PACT đầu tiên |
| PIN Setup | `pin-setup` | Sau khi tạo PACT |
| Dashboard | `dashboard` | Đã auth + onboarded |
| History | `history` | Đã auth + onboarded |
| Analytics / Detail | `analytics` | Đã chọn PACT |
| Settings | `settings` | Đã auth |

---

## 4. AUTHENTICATION FLOWS

### 4.1 Flow: First-time User (Signup)

```
Mở app (không có account)
  → Login screen (tab "Đăng ký")
    → Nhập Username (ID duy nhất) + Tên hiển thị
      → [signup()] → Tạo account trong store
        → Welcome screen (slide 0: Editorial)
          → Slide 1: Giới thiệu PACT methodology
            → Slide 2: Nhập tên người dùng
              → [setUser()] → setScreen('onboarding')
                → CreatePact (5-step wizard)
                  → Step 1: Vision (bắt buộc)
                  → Step 2: Cam kết nhỏ (goal + action, bắt buộc)
                  → Step 3: Chu kỳ (frequency N ngày + duration)
                  → Step 4: Giả thuyết (bắt buộc)
                  → Step 5: Review → "Ghi vào Wishlist"
                    → [addPact()] → status: 'wishlist'
                      → setScreen('dashboard')
```

### 4.2 Flow: Returning User (Login)

```
Mở app (có account + onboarded)
  → [isAuthenticated: false + user.onboarded: true] → Force Login
    → Nhập Username + Password
      → [login()] → validate password
        → SUCCESS: isAuthenticated: true → setScreen('dashboard')
        → FAIL: Hiển thị lỗi "Mật khẩu không đúng"
```

### 4.3 Flow: Logout

```
Settings → "Đăng xuất"
  → [logout()] → { isAuthenticated: false, currentUser: null, currentScreen: 'login' }
    → Login screen
```

### 4.4 Flow: Lock App

```
Settings → "Khóa ngay"
  → [lockApp()] → { isAuthenticated: false }
    → Login screen (currentUser vẫn còn trong store)
      → Nhập lại password để unlock
```

### 4.5 Flow: Đổi PIN (Change Password)

```
Settings → "Đổi mã PIN"
  → Nhập mật khẩu mới
    → [setPassword(newPwd)]
      → Toast/confirm thành công
```

---

## 5. PACT LIFECYCLE FLOW

```
        [addPact()] 
            ↓
        WISHLIST ←──────────────────────────────┐
            ↓  "Bắt đầu ngay" (Analytics)       │
        [activatePact()] / [updatePact(status:'inprogress')]
            ↓                                   
        IN PROGRESS ─── check-in mỗi ngày ──→ [completePact()]
            ↓  "Đánh dấu xong" (Analytics)           ↑ undo
        [updatePact(status:'done')] [redoPact()] ─────┘
            ↓
          DONE ──→ "Thực hiện lại" → [updatePact(status:'inprogress')]
```

**Trạng thái PACT:**

| Status | Hiển thị | Nguồn |
|---|---|---|
| `wishlist` | History > Wishlist tab | Tạo mới → mặc định |
| `inprogress` | Dashboard (active loop) | Kích hoạt từ Analytics |
| `done` | History > Done tab | Đánh dấu từ Analytics |

---

## 6. CREATE PACT FLOW (5 Steps — Tiny Experiments)

| Step | Nội dung | Validation | Tip |
|---|---|---|---|
| **1 — Vision** | Textarea: Tầm nhìn dài hạn (5-10 năm) | Không được để trống | "Nếu thực hiện điều này..." |
| **2 — Cam kết** | Input: Tên thử nghiệm (goal) + Textarea: Hành động cụ thể | Cả hai không được trống | "Nhỏ đến mức không thể thất bại" |
| **3 — Chu kỳ** | Số ngày / lần (min: 1, max: 30) + Duration (7/14/21/30 ngày) | Mặc định frequency=1, duration=14 | "Đều đặn quan trọng hơn cường độ" |
| **4 — Giả thuyết** | Textarea: Dữ liệu / cảm xúc mong đợi | Không được để trống | "Quan sát khoa học, không phán xét" |
| **5 — Review** | Hiện lại: goal + frequency. Nút "Ghi vào Wishlist" | — | PACT vào Wishlist, kích hoạt sau |

**Điều hướng trong wizard:**
- Nút Back: Về bước trước (step > 1) hoặc về Dashboard (step = 1)
- Nút Next: Disabled nếu chưa nhập đủ field bắt buộc

---

## 7. DASHBOARD FLOW (Core Loop — INPROGRESS PACTs)

```
Dashboard
  → Hiển thị danh sách PACT status='inprogress'
    → Mỗi PACT card:
        - Streak counter
        - "Đã làm hôm nay" button → [completePact(id)]
          → Nếu lastCompleted === today: Nút disabled / "Undo"
          → [redoPact(id)] → Undo check-in của hôm nay (chỉ hôm nay)
        - Click vào PACT → [setActivePactId(id)] → setScreen('analytics')
  → FAB "+" → setScreen('onboarding') → Tạo PACT mới vào Wishlist
  → Nav: Home | History
```

---

## 8. HISTORY FLOW

```
History
  → Tab "Wishlist": Danh sách PACT status='wishlist'
      → Click PACT → [setActivePactId(id)] → setScreen('analytics')
        → Analytics: "Bắt đầu ngay" → [updatePact(status:'inprogress')]
  → Tab "Đang thực thi": PACT status='inprogress'
  → Tab "Hoàn thành": PACT status='done'
  → Click bất kỳ PACT → mở Analytics detail
```

---

## 9. ANALYTICS (PACT DETAIL) FLOW

```
Chọn PACT → setScreen('analytics')
  → Header: Tên PACT + Nút Back (về dashboard nếu inprogress, về history nếu khác)
  → Nút Trash (xóa) → confirm dialog → [deletePact(id)] → về dashboard
  → Status badge: Wishlist / Đang thực thi / Hoàn thành
  → Status actions: 
      - Wishlist: "Bắt đầu ngay" → updatePact(status:'inprogress')
      - InProgress: "Đánh dấu xong" → updatePact(status:'done')
      - Done: "Thực hiện lại" → updatePact(status:'inprogress')
  → [Nếu inprogress] Progress ring + Streak badge
  → Editorial cards: Vision | Cam kết | Giả thuyết | Tần suất
  → [Nếu inprogress] Calendar heatmap (done/missed/today)
  → [Nếu inprogress] Chỉ số tin cậy (performanceRate%)
  → Activity log 14 ngày gần nhất
```

---

## 10. SETTINGS FLOW

```
Dashboard / History → Header settings icon
  → Settings screen
    → Hiển thị: Username, Display name
    → Đổi giao diện (Dark/Light toggle)
    → Xuất dữ liệu (Export JSON)
    → Nhập dữ liệu (Import JSON)
    → Đổi mật khẩu
    → Khóa app
    → Đăng xuất
```

---

## 11. DATA MODEL

```js
accounts: {
  [username]: {
    user: { name: string, onboarded: boolean },
    password: string | null,
    theme: 'dark' | 'light',
    activePactId: string | null,
    pacts: [
      {
        id: string,           // Date.now().toString()
        vision: string,       // Tầm nhìn dài hạn
        goal: string,         // Tên thử nghiệm
        action: string,       // Hành động cụ thể
        frequency: number,    // Mỗi X ngày
        duration: number,     // Tổng số ngày (7/14/21/30)
        hypothesis: string,   // Giả thuyết
        status: 'wishlist' | 'inprogress' | 'done',
        streak: number,
        lastCompleted: string | null,  // ISO date string
        history: string[],    // Array of ISO date strings
        createdAt: string     // ISO timestamp
      }
    ]
  }
}
```

---

## 12. STREAK LOGIC

- **Tần suất (frequency)**: Nếu `frequency = 3`, streak chỉ reset khi quá `3 ngày` không check-in.
- **refreshPacts()**: Chạy khi app khởi động, check `diffDays > frequency`.
- **completePact()**: Chỉ tính check-in 1 lần/ngày. Nếu `lastCompleted === today`, không tăng streak.
- **redoPact()**: Chỉ undo được check-in của **hôm nay** (lastCompleted === today).

---

## 13. EDGE CASES được xử lý

| Case | Xử lý |
|---|---|
| Login sai mật khẩu | Hiển thị lỗi, không chuyển màn |
| Nhấn Next khi form trống | Nút disabled |
| Check-in 2 lần trong ngày | Ngăn bằng `lastCompleted === today` |
| Undo check-in ngày hôm qua | Không cho phép (redoPact kiểm tra today) |
| Xóa PACT đang là activePactId | activePactId reset về null |
| Import JSON sai format | try/catch, return false |
| Refresh browser khi logged in | `isAuthenticated` không persist → force Login |


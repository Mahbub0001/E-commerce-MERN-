# Professional Admin Panel & Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the NovaMart E-Commerce admin panel into a professional, enterprise-grade admin suite with a modern collapsible `AdminShell` and a rich, interactive `AdminDashboard` powered by Recharts, KPI cards, order breakdown metrics, inventory alerts, and quick actions.

**Architecture:** Split the administrative interface into modular, single-responsibility UI widgets (`AdminShell`, `AdminKpiCard`, `RevenueChart`, `OrderStatusChart`, `CategorySalesChart`, `InventoryAlerts`, `RecentOrdersTable`). Integrate Recharts with Tailwind CSS for dark/light mode responsive visualizations. Aggregate orders, products, and users data with memoization on the client for smooth performance.

**Tech Stack:** React 18, Vite, Recharts, Framer Motion, Lucide React, Tailwind CSS, Axios.

## Global Constraints
- Exact client root directory: `client/`
- Keep existing routes (`/admin`, `/admin/products`, `/admin/orders`, `/admin/users`) intact.
- Seamless light and dark mode compatibility with glassmorphism styles.
- Preserve all existing auth and role checks.

---

### Task 1: Install Recharts in Client

**Files:**
- Modify: `client/package.json`

**Interfaces:**
- Consumes: npm registry
- Produces: `recharts` package in `client/node_modules` and recorded in `client/package.json`

- [ ] **Step 1: Install `recharts` package**

Run: `cd client; npm install recharts`
Expected: `added ... packages` and zero peer dependency errors.

- [ ] **Step 2: Verify package installation**

Run: `cd client; npm list recharts`
Expected: `recharts@...` listed under dependencies.

- [ ] **Step 3: Commit**

```bash
git add client/package.json client/package-lock.json
git commit -m "chore: add recharts dependency to client"
```

---

### Task 2: Redesign AdminShell Navigation & Header

**Files:**
- Modify: `client/src/components/admin/AdminShell.jsx`

**Interfaces:**
- Consumes: `useAuth` from `../../context/AuthContext`, `NavLink`, `useNavigate` from `react-router-dom`, Lucide icons (`LayoutDashboard`, `ShoppingBag`, `Boxes`, `Users`, `ArrowUpRight`, `Menu`, `X`, `ChevronLeft`, `ChevronRight`, `LogOut`, `Bell`, `Plus`)
- Produces: Modern collapsible `<AdminShell title subtitle actions children>` with topbar header, breadcrumbs, sidebar toggles, and admin user badge.

- [ ] **Step 1: Implement the modernized `AdminShell.jsx`**

Update `client/src/components/admin/AdminShell.jsx` with:
- Desktop sidebar collapse / expand toggle with localStorage or local state persistence.
- Structured navigation items with icons: Dashboard, Products, Orders, Users, and an external Storefront link.
- Topbar with contextual title, breadcrumbs, "+ Add Product" quick action button, and admin avatar/logout trigger.
- Full mobile drawer with backdrop blur.

- [ ] **Step 2: Verify Vite compilation of AdminShell**

Run: `cd client; npm run build`
Expected: Successful build or bundle check with no syntax errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/admin/AdminShell.jsx
git commit -m "feat(admin): overhaul AdminShell with collapsible sidebar and modern header"
```

---

### Task 3: Build Dedicated Analytics & Operational Widgets

**Files:**
- Create: `client/src/components/admin/AdminKpiCard.jsx`
- Create: `client/src/components/admin/RevenueChart.jsx`
- Create: `client/src/components/admin/OrderStatusChart.jsx`
- Create: `client/src/components/admin/CategorySalesChart.jsx`
- Create: `client/src/components/admin/InventoryAlerts.jsx`
- Create: `client/src/components/admin/RecentOrdersTable.jsx`

**Interfaces:**
- `AdminKpiCard`: `{ title, value, change, trend, icon: Icon, tone, subtitle }`
- `RevenueChart`: `{ data: Array<{ date: string, revenue: number, orders: number }> }`
- `OrderStatusChart`: `{ data: Array<{ status: string, count: number, color: string }> }`
- `CategorySalesChart`: `{ data: Array<{ category: string, count: number, sales: number }> }`
- `InventoryAlerts`: `{ products: Array<{ _id: string, name: string, category: string, countInStock: number, image: string }> }`
- `RecentOrdersTable`: `{ orders: Array<Order> }`

- [ ] **Step 1: Create `AdminKpiCard.jsx`**
Build KPI card with Lucide icon badge, color tones (green, purple, blue, amber), animated number counting, and percentage trend pill.

- [ ] **Step 2: Create `RevenueChart.jsx`**
Build responsive Recharts `AreaChart` with gradient fill, formatted date axis, custom dark/light styled tooltip showing currency and order count.

- [ ] **Step 3: Create `OrderStatusChart.jsx`**
Build interactive Recharts `PieChart` / `Donut` chart showing order distribution (Processing, Shipped, Delivered, Cancelled) with responsive legends and tooltips.

- [ ] **Step 4: Create `CategorySalesChart.jsx`**
Build Recharts `BarChart` representing product counts and sales volume by category with rounded bar corners.

- [ ] **Step 5: Create `InventoryAlerts.jsx` and `RecentOrdersTable.jsx`**
Build modern tables/lists for low-stock items with direct edit links and recent orders with status badges.

- [ ] **Step 6: Verify component exports and build**

Run: `cd client; npm run build`
Expected: Build passes without compilation errors.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/admin/
git commit -m "feat(admin): create reusable analytics and operational widgets"
```

---

### Task 4: Upgrade `AdminDashboard.jsx` with Full Metrics & Actions

**Files:**
- Modify: `client/src/pages/AdminDashboard.jsx`

**Interfaces:**
- Consumes: `api` from `../services/api`, widgets created in Task 3, `AdminShell`, `formatCurrency`.
- Produces: Professional full-featured admin dashboard page.

- [ ] **Step 1: Implement the upgraded `AdminDashboard.jsx`**
- Parallel fetch products, orders, and users.
- Calculate KPIs: Total Revenue, Total Orders, Average Order Value (AOV), Active Products, Pending Orders count.
- Calculate time-series revenue trends (last 7 days / last 6 months).
- Calculate status counts (Processing, Shipped, Delivered, Cancelled).
- Calculate category breakdown and low-stock filter ($\le 10$ units).
- Add quick action toolbar: "Add Product", "Refresh Data" with spinning indicator, and "Filter Pending Orders".
- Render clean skeleton / loading state and error alert with retry button.

- [ ] **Step 2: Verify Vite compilation of AdminDashboard**

Run: `cd client; npm run build`
Expected: Build passes completely.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/AdminDashboard.jsx
git commit -m "feat(admin): upgrade AdminDashboard with rich analytics and operational widgets"
```

---

### Task 5: System Verification & Final Polish

**Files:**
- Test / Verify: All admin pages (`/admin`, `/admin/products`, `/admin/orders`, `/admin/users`)

- [ ] **Step 1: Run production build check**

Run: `cd client; npm run build`
Expected: Zero build errors, clean output in `dist/`.

- [ ] **Step 2: Verify responsive design and theme transitions**
Check CSS and layout behavior across different breakpoints.

- [ ] **Step 3: Commit final adjustments**

```bash
git commit --allow-empty -m "chore(admin): verify and finalize professional admin dashboard"
```

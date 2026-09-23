# Design Specification: Professional Admin Panel & Analytics Dashboard

## 1. Overview
The goal of this initiative is to upgrade the NovaMart E-Commerce admin panel into a modern, enterprise-grade SaaS administrative dashboard. It introduces high-impact KPI metric cards, interactive Recharts-powered analytics (Revenue trends, Category distribution, Order status breakdowns), operational widgets (recent orders, low-stock inventory alerts, top products), and a redesigned collapsible `AdminShell` layout with quick navigation and theme awareness.

---

## 2. Architecture & Layout (`AdminShell`)

### 2.1 Navigation & Shell Structure
- **Collapsible Sidebar**:
  - Desktop: Supports expanded and compact/collapsed states with smooth transitions.
  - Mobile: Slide-out drawer with backdrop blur and accessible close triggers.
  - Grouped navigation links:
    - **Main Overview**: Dashboard (`/admin`)
    - **Inventory & Catalog**: Products (`/admin/products`)
    - **Sales & Fulfillment**: Orders (`/admin/orders`)
    - **User Administration**: Users (`/admin/users`)
    - **Quick Switcher**: Storefront link (`/`) to test client shopping experience.
  - Profile & Session widget: Displays logged-in admin identity, role badge, and quick sign-out action.

### 2.2 Top Navigation Header
- Dynamic contextual title, breadcrumbs, and subtitle reflecting the active admin view.
- Global action bar containing:
  - "Add Product" direct CTA button.
  - Pending orders indicator badge.
  - Refresh metrics trigger.
  - Dark / Light mode toggle synchronization.

---

## 3. Dashboard Features & Widgets (`AdminDashboard`)

### 3.1 Key Performance Indicators (KPIs)
Four primary metric cards featuring animated counters, distinct accent themes, and trend indicators:
1. **Total Revenue**: Aggregated earnings across all fulfilled and paid orders, formatted in local currency.
2. **Total Orders**: Overall order count, with a sub-label showing pending/processing orders requiring immediate attention.
3. **Average Order Value (AOV)**: Revenue divided by total orders, tracking customer cart volume.
4. **Active Inventory & Stock Health**: Total active catalog products with count of items near stock-out (<= 10 units).

### 3.2 Visual Analytics with Recharts
1. **Revenue Trend Curve (AreaChart)**:
   - Monthly and periodic revenue trajectory with gradient shading (`#6366f1` / `#a855f7`).
   - Interactive custom tooltip formatted with currency values, order counts, and dates.
   - Smooth curves and responsive container sizing across breakpoints.
2. **Order Status Distribution (PieChart / Donut or BarChart)**:
   - Status categorization: *Processing*, *Shipped*, *Delivered*, *Cancelled*.
   - Color-coded badges and percentages.
3. **Category Revenue & Volume Breakdown (BarChart)**:
   - Performance ranking of product categories (Electronics, Clothing, Accessories, etc.).

### 3.3 Operational Widgets
1. **Recent Orders Data Table**:
   - Order ID snippet, Customer name/email, order date, total price, payment method, and live status badge.
   - Direct link to inspect details or manage order in `AdminOrders`.
2. **Low Stock Inventory Alert**:
   - Products with remaining stock $\le 10$. Displays thumbnail, product name, current stock pill, and quick edit link.
3. **Top Selling Products Leaderboard**:
   - Highlights high-velocity items by sales volume and rating.

---

## 4. Technical Specifications & Dependencies

### 4.1 Libraries & Packages
- **`recharts`**: Installed in `client/` for responsive SVG charts, tooltips, and legends.
- **`lucide-react`**: Consistent iconography across sidebar, metrics, and actions.
- **`framer-motion`**: Page and widget entry animations and smooth metric counting.
- **Tailwind CSS**: Glassmorphic panels, dark mode color tokens (`slate-900`, `slate-950`, `white/80`), responsive grid.

### 4.2 Data Flow & Performance
- Parallel fetching of `/api/products?limit=300`, `/api/orders`, and `/api/users` using `Promise.all`.
- Client-side memoization (`useMemo`) for fast, non-blocking time-series aggregation, category sums, and ranking without unnecessary re-renders.
- Manual refresh button allowing admins to pull fresh data on demand without page reloads.
- Graceful error states with retry buttons and loading spinners.

---

## 5. Verification & Testing Plan
1. **Dependency Installation**: Install `recharts` in `client/` and verify no dependency conflicts.
2. **Build Validation**: Execute `npm run build` in `client/` to verify zero JSX, TypeScript, or CSS bundling issues.
3. **Responsive Verification**: Confirm navigation and charts display properly across mobile (<640px), tablet (768px-1024px), and desktop (1280px+).
4. **Theme Verification**: Verify charts, tooltips, and text contrast in both Light and Dark mode.

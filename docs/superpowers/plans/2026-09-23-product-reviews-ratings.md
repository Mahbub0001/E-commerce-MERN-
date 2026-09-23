# Product Reviews, Ratings & Admin Moderation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-stack user reviews and ratings with interactive star inputs on the storefront, MongoDB schema storage, and a dedicated admin reviews management hub with moderation capabilities.

**Architecture:** Extend the `Product` schema with embedded `reviews`; implement review submission, aggregated rating calculation, and admin moderation APIs. In the client, replace static placeholder reviews with an interactive review submission form and breakdown in `ProductDetails.jsx`, create `AdminReviews.jsx` with search/filtering/deletion, and register the route in `App.jsx` and `AdminShell.jsx`.

**Tech Stack:** React 18, Node.js, Express, MongoDB/Mongoose, Tailwind CSS, Lucide React, Framer Motion.

## Global Constraints
- Do not break existing product fields or routes.
- Prevent duplicate reviews: 1 review per user per product.
- Automatically recalculate `product.rating` and `product.numReviews` on create and delete.
- Seamless Dark and Light mode support.

---

### Task 1: Backend Schema & Review Controllers

**Files:**
- Modify: `server/models/Product.js`
- Modify: `server/controllers/productController.js`
- Modify: `server/routes/productRoutes.js`

**Interfaces:**
- `POST /api/products/:id/reviews` (authenticated user: `{ rating: number, comment: string }`)
- `GET /api/products/reviews/all` (admin only, returns `{ success: true, data: Array<ReviewItem> }`)
- `DELETE /api/products/:id/reviews/:reviewId` (admin only, deletes review and recalculates rating)

- [ ] **Step 1: Update `server/models/Product.js`**
Add `reviewSchema` and `reviews: [reviewSchema]` to `productSchema`.

- [ ] **Step 2: Add review controller methods in `server/controllers/productController.js`**
Implement `createProductReview`, `getAllReviews`, and `deleteProductReview`.

- [ ] **Step 3: Register review routes in `server/routes/productRoutes.js`**
Expose `POST /:id/reviews`, `GET /reviews/all`, `DELETE /:id/reviews/:reviewId`.

- [ ] **Step 4: Verify server syntax**
Run: `node --check server/server.js`
Expected: Zero syntax errors.

- [ ] **Step 5: Commit**
```bash
git add server/
git commit -m "feat(api): add product review schema, controllers, and routes"
```

---

### Task 2: Storefront Interactive Review & Rating UI

**Files:**
- Modify: `client/src/pages/ProductDetails.jsx`

**Interfaces:**
- Consumes: `POST /api/products/:id/reviews`, `useAuth`, `api`
- Produces: Live star rating input (1-5), customer comment textarea, rating distribution breakdown, and customer review cards.

- [ ] **Step 1: Replace dummy reviews with dynamic reviews in `ProductDetails.jsx`**
Display actual reviews from `product.reviews`, render rating score and star percentage bars (5★ through 1★).

- [ ] **Step 2: Add interactive star rating selector and submission form**
Add 1-5 star interactive selector with hover animations, comment textarea with char count, duplicate review check, and optimistic state update.

- [ ] **Step 3: Verify client build**
Run: `cd client; npm run build`
Expected: Build passes with zero errors.

- [ ] **Step 4: Commit**
```bash
git add client/src/pages/ProductDetails.jsx
git commit -m "feat(product): add interactive review and rating submission form"
```

---

### Task 3: Admin Review Hub & Navigation

**Files:**
- Create: `client/src/pages/AdminReviews.jsx`
- Modify: `client/src/components/admin/AdminShell.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- `AdminReviews.jsx`: Uses `GET /api/products/reviews/all` and `DELETE /api/products/:id/reviews/:reviewId`.
- `AdminShell.jsx`: Adds `"Reviews"` item with `Star` icon under *"Catalog & Sales"*.
- `App.jsx`: Adds `<Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />`.

- [ ] **Step 1: Create `client/src/pages/AdminReviews.jsx`**
Build review management page with metric cards (Total Reviews, Average Score, 5-star ratio), keyword search, star filters, review data table, and delete action with confirmation modal.

- [ ] **Step 2: Add "Reviews" link to `AdminShell.jsx`**
Add `{ label: "Reviews", to: "/admin/reviews", icon: Star }` to `navSections`.

- [ ] **Step 3: Register route in `client/src/App.jsx`**
Import `AdminReviews` and define route under admin routes.

- [ ] **Step 4: Verify client build**
Run: `cd client; npm run build`
Expected: Clean build.

- [ ] **Step 5: Commit**
```bash
git add client/src/pages/AdminReviews.jsx client/src/components/admin/AdminShell.jsx client/src/App.jsx
git commit -m "feat(admin): create admin review moderation hub and navigation"
```

---

### Task 4: Admin Dashboard Review Health Metric

**Files:**
- Modify: `client/src/pages/AdminDashboard.jsx`

**Interfaces:**
- Calculates aggregate customer review count and satisfaction rating across store.

- [ ] **Step 1: Add store satisfaction / review metric to `AdminDashboard.jsx`**
Display store average rating in dashboard insights.

- [ ] **Step 2: Verify client build**
Run: `cd client; npm run build`
Expected: Build passes with exit code 0.

- [ ] **Step 3: Commit**
```bash
git add client/src/pages/AdminDashboard.jsx
git commit -m "feat(admin): include customer review satisfaction metrics on dashboard"
```

---

### Task 5: Final Validation & Integration

**Files:**
- Whole repository verification

- [ ] **Step 1: Run comprehensive build verification**
Run: `cd client; npm run build`
Run: `node --check server/server.js`

- [ ] **Step 2: Commit and push**
```bash
git push origin main
```

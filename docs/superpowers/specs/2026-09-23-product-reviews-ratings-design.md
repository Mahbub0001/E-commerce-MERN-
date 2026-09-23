# Design Specification: Product Reviews, Ratings & Admin Moderation Hub

## 1. Overview
This feature introduces an end-to-end customer review and rating system across NovaMart. Authenticated customers can submit 1-to-5 star ratings with rich comments on individual product pages. The backend calculates aggregate rating and review volume in real time with anti-spam protections. Simultaneously, store administrators receive a comprehensive "Reviews" management dashboard in the Admin Suite (`/admin/reviews`) to inspect, search, filter, and delete reviews with automatic rating recalculation.

---

## 2. Backend Architecture & Data Model

### 2.1 Mongoose Schemas (`server/models/Product.js`)
- `reviewSchema`:
  - `user`: ObjectId, ref: `"User"`, required: true
  - `name`: String, required: true
  - `rating`: Number, required: true, min: 1, max: 5
  - `comment`: String, required: true, trim: true, maxlength: 1000
  - `timestamps`: true (`createdAt`, `updatedAt`)
- `productSchema`:
  - Embeds `reviews: [reviewSchema]`
  - Existing fields `rating` and `numReviews` are dynamically updated.

### 2.2 Controller Business Logic (`server/controllers/productController.js`)
1. **`createProductReview` (`POST /api/products/:id/reviews`, protected)**:
   - Verifies customer authentication token.
   - Validates `rating` (1-5) and `comment` (non-empty, <= 1000 chars).
   - Checks if user has already submitted a review for this product (`p.reviews.find(r => r.user.toString() === req.user._id.toString())`). If yes, responds with 400 *"Product already reviewed"*.
   - Pushes review to `product.reviews`.
   - Recalculates:
     - `product.numReviews = product.reviews.length`
     - `product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length`
   - Saves product and returns 201 with updated product/review.
2. **`getAllReviews` (`GET /api/products/reviews/all`, protected, adminOnly)**:
   - Aggregates reviews across all products using MongoDB projection or aggregation:
     Returns an array of `{ reviewId, productId, productName, productImage, productSlug, user: { _id, name, email }, rating, comment, createdAt }`.
3. **`deleteProductReview` (`DELETE /api/products/:productId/reviews/:reviewId`, protected, adminOnly)**:
   - Locates product by ID.
   - Filters out review matching `reviewId`.
   - Recalculates `product.numReviews = product.reviews.length`.
   - Recalculates `product.rating = product.reviews.length ? (sum / length) : 0`.
   - Saves product and returns 200 success.

---

## 3. Frontend Customer Review Experience (`client/src/pages/ProductDetails.jsx`)

### 3.1 Review Submission Component
- **Interactive Star Rating**:
  - 5 interactive star icons with hover highlights (Amber/Gold), click-to-rate, and descriptive labels (*Poor, Fair, Good, Very Good, Excellent*).
- **Comment Textarea**:
  - Live character counter (0 / 1000).
- **Authentication & Status State**:
  - Logged-out users: clean card prompting login with a direct CTA button.
  - Users who have already reviewed: displays their existing review with a green *"You reviewed this product on [Date]"* badge and disables redundant submission.
- **Optimistic UI / Instant Feedback**:
  - Submitting appends the new review to the product reviews list immediately and increments total reviews and rating without full page refresh.

### 3.2 Review Listing & Ratings Breakdown
- Visual breakdown:
  - Average rating score (e.g. 4.8 / 5) with star rating display.
  - Percentage bar breakdown for 5★, 4★, 3★, 2★, 1★.
- User review cards:
  - User initial avatar, customer name, star badge, timestamp, and review comment.
  - Empty state when no reviews exist yet (*"No reviews yet. Be the first to share your thoughts!"*).

---

## 4. Admin Reviews Management Hub (`client/src/pages/AdminReviews.jsx`)

### 4.1 Navigation
- Added to `AdminShell.jsx` under *"Catalog & Sales"* navigation:
  - Label: `"Reviews"`, Icon: `Star`, Path: `"/admin/reviews"`.
- App.jsx route definition: `/admin/reviews` protected by `AdminRoute`.

### 4.2 Page Features
- **Summary Metrics**:
  - Total Reviews across store.
  - Average Customer Rating score.
  - 5-Star Reviews percentage.
- **Search & Filters**:
  - Keyword search across product names, user names, and review text.
  - Filter by star rating (All, 5 Stars, 4 Stars, 3 Stars, 2 Stars, 1 Star).
- **Moderation Table**:
  - Product thumbnail and title (clickable).
  - Customer name and email.
  - Star rating badge.
  - Comment text with tooltip/full expand.
  - Date submitted.
  - Action button: Red trash icon (`Delete`) with confirmation dialog. Triggers `DELETE /api/products/:productId/reviews/:reviewId` and immediately updates state.

---

## 5. Verification & Testing Plan
1. **Server Route Validation**: Verify syntax and endpoints with `node --check server/server.js`.
2. **Client Build Validation**: Verify complete build with `cd client; npm run build`.
3. **Integration Flows**:
   - Customer submits review with 5 stars -> product average updates.
   - Customer tries to submit duplicate review -> rejected with 400.
   - Admin navigates to `/admin/reviews`, locates review, deletes it -> rating recalculates.

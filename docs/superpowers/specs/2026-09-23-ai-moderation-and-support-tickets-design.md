# Design Specification: AI Review Sentiment Moderation & NovaBot Ticket Routing Hub

## 1. Overview
This initiative integrates Google Gemini Flash AI across the NovaMart full-stack platform to provide:
1. **Automated Review Moderation & Sentiment Analysis**: Real-time sentiment scoring, spam flagging, and toxic content detection on customer reviews with admin control indicators.
2. **NovaBot AI Decision & Support Ticket Routing**: Upgrading the shopping assistant with multi-intent detection (Product Discovery, Order Tracking, Support Ticket creation, Store FAQs), natural language understanding in English, Bengali, and Banglish, and automatic support ticket creation.
3. **Admin Support Ticket Hub (`/admin/tickets`)**: An administrative dashboard for reviewing, filtering, prioritizing, and resolving customer support complaints.

---

## 2. Backend Architecture & Data Models

### 2.1 Mongoose Schemas

#### Extended `reviewSchema` (`server/models/Product.js`)
- `sentiment`: String, enum: `["Positive", "Neutral", "Negative"]`, default: `"Neutral"`
- `sentimentScore`: Number, min: 0, max: 100, default: 50
- `isSpam`: Boolean, default: false
- `isFlagged`: Boolean, default: false
- `flagReason`: String, default: null

#### New `Ticket` Model (`server/models/Ticket.js`)
- `ticketId`: String, unique (e.g. `TKT-1042`)
- `user`: ObjectId, ref: `"User"`, optional
- `customerName`: String, required: true
- `customerEmail`: String, required: true
- `subject`: String, required: true
- `category`: String, enum: `["Refund", "Damaged Item", "Delivery Delay", "Payment Issue", "Product Query", "General"]`, default: `"General"`
- `priority`: String, enum: `["Low", "Medium", "High"]`, default: `"Medium"`
- `message`: String, required: true
- `status`: String, enum: `["Open", "In Progress", "Resolved"]`, default: `"Open"`
- `source`: String, default: `"NovaBot AI"`
- `timestamps`: true

### 2.2 AI Services & Controllers (`server/services/aiService.js`)
- **`analyzeReviewWithAI(text, rating)`**:
  - Sends review text and rating to Gemini Flash with structured JSON output instructions.
  - Returns `{ sentiment, sentimentScore, isSpam, isFlagged, flagReason }`.
  - Graceful fallback: If Gemini API fails or API key is not yet set, computes rule-based sentiment based on rating and simple keywords so review creation never crashes.
- **`handleAssistantMessage({ message, history, user, catalogContext })`**:
  - Classifies customer intent: `PRODUCT_DISCOVERY`, `ORDER_TRACKING`, `CREATE_TICKET`, `STORE_FAQ`, or `GENERAL_CHAT`.
  - Automatically fetches real matching products or order statuses.
  - Automatically creates a `Ticket` in MongoDB when a complaint or refund request is detected, returning the generated ticket ID to the customer.
  - Generates fluent bilingual replies in natural Bengali/English.

### 2.3 Express Routes & Endpoints
- `POST /api/assistant/chat` (public/authenticated): Processes NovaBot user interaction through `aiService`.
- `GET /api/tickets` (admin only): Returns all support tickets with filtering (status, priority, search).
- `PUT /api/tickets/:id/status` (admin only): Updates ticket status (`Open`, `In Progress`, `Resolved`).
- `DELETE /api/tickets/:id` (admin only): Deletes a resolved ticket.

---

## 3. Storefront NovaBot Assistant (`ProductAssistant.jsx`)
- Connects to `/api/assistant/chat` with optimistic UI and animated bot response.
- Renders live recommended product cards with 1-click cart addition.
- Renders ticket creation cards when an issue is logged, showing:
  - Ticket ID badge (e.g. `TKT-8291`)
  - Status pill (`Open`)
  - Notification that support team will follow up.
- Retains existing starter prompts and quick suggestions.

---

## 4. Admin Management Hub (`AdminTickets.jsx` & `AdminReviews.jsx`)

### 4.1 Admin Reviews Hub Enhancements (`AdminReviews.jsx`)
- Renders AI sentiment badge for each review:
  - Emerald badge for `Positive` (e.g. `95% Positive`)
  - Slate badge for `Neutral`
  - Rose badge for `Negative`
  - Pulsing warning badge for `⚠️ Flagged: [Reason]`
- Filter dropdown includes `"Flagged / Spam Only"` to let admins clean up suspicious reviews instantly.

### 4.2 Support Ticket Suite (`AdminTickets.jsx`)
- Metric cards: Total Tickets, Open Tickets requiring attention, High Priority count, Resolved rate %.
- Filtering by Status (`All`, `Open`, `In Progress`, `Resolved`) and Priority (`High`, `Medium`, `Low`).
- Keyword search across ticket ID, customer name, email, subject, and message.
- Status update action dropdowns and ticket details preview modal.

### 4.3 Sidebar & Dashboard
- `AdminShell.jsx`: Adds `"Support Tickets"` link with `Headphones` / `LifeBuoy` icon and open tickets count badge.
- `AdminDashboard.jsx`: Displays alert banner if there are open support tickets requiring resolution.

---

## 5. Verification & Testing Plan
1. **Server Validation**: Validate `server/models/Ticket.js`, `server/services/aiService.js`, and controllers using `node --check server/server.js`.
2. **Client Build Validation**: Validate React bundling with `cd client; npm run build`.
3. **End-to-End Testing**:
   - Customer submits review with spam words -> AI flags review as spam.
   - Customer tells NovaBot "Amar delivery late hoise, refund chai" -> NovaBot creates Ticket `TKT-...` and replies politely.
   - Admin visits `/admin/tickets`, sees ticket with category `Delivery Delay` / `Refund`, and updates status to `In Progress`.

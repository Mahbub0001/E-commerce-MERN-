# AI Review Moderation & NovaBot Ticket Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Google Gemini AI across NovaMart to provide automated review sentiment & spam moderation, multi-intent NovaBot conversational routing with automated support ticket generation, and a dedicated admin ticket management hub.

**Architecture:** 
1. Build `server/services/aiService.js` interfacing with Gemini REST API using `GEMINI_API_KEY` (with robust heuristic fallbacks).
2. Extend `Product.js` review schema with sentiment and spam fields, and update `createProductReview` to invoke AI analysis upon review submission.
3. Create `Ticket` Mongoose model and controllers for support ticket lifecycle (`Open`, `In Progress`, `Resolved`).
4. Upgrade `ProductAssistant.jsx` to interface with `/api/assistant/chat` for intelligent bilingual conversational commerce and ticket creation.
5. Create `AdminTickets.jsx` and upgrade `AdminReviews.jsx`, `AdminShell.jsx`, and `AdminDashboard.jsx`.

**Tech Stack:** React 18, Node.js, Express, MongoDB/Mongoose, Google Gemini API, Tailwind CSS, Lucide React, Framer Motion.

## Global Constraints
- Must handle missing or invalid `GEMINI_API_KEY` gracefully without server crashes.
- Support both English and Bengali / Banglish inquiries.
- Protect all admin ticket endpoints with `protect` and `adminOnly`.

---

### Task 1: AI Service, Schema Extensions & Ticket Backend

**Files:**
- Create: `server/models/Ticket.js`
- Create: `server/services/aiService.js`
- Create: `server/controllers/ticketController.js`
- Create: `server/controllers/assistantController.js`
- Create: `server/routes/ticketRoutes.js`
- Create: `server/routes/assistantRoutes.js`
- Modify: `server/models/Product.js`
- Modify: `server/controllers/productController.js`
- Modify: `server/server.js`

**Interfaces:**
- `aiService.analyzeReviewWithAI(text, rating)`: returns `{ sentiment, sentimentScore, isSpam, isFlagged, flagReason }`
- `aiService.processAssistantChat({ message, history, user })`: returns `{ reply, intent, products, ticket }`
- `POST /api/assistant/chat`: `{ message, history }` -> `{ success: true, data: { reply, intent, products, ticket } }`
- `GET /api/tickets`: `{ success: true, data: Array<Ticket> }`
- `PUT /api/tickets/:id/status`: `{ status }` -> updated ticket
- `DELETE /api/tickets/:id`: removes ticket

- [ ] **Step 1: Create `server/models/Ticket.js`**
Define Mongoose Ticket schema with `ticketId`, `customerName`, `customerEmail`, `subject`, `category`, `priority`, `message`, `status`, and `source`.

- [ ] **Step 2: Extend `reviewSchema` in `server/models/Product.js`**
Add `sentiment`, `sentimentScore`, `isSpam`, `isFlagged`, and `flagReason`.

- [ ] **Step 3: Create `server/services/aiService.js`**
Implement Gemini Flash integration for review moderation and chatbot intent routing with fallback handlers.

- [ ] **Step 4: Create ticket and assistant controllers and routes**
Implement `ticketController.js`, `assistantController.js`, `ticketRoutes.js`, `assistantRoutes.js`, and mount them in `server/server.js`. Connect `createProductReview` in `productController.js` with AI review analysis.

- [ ] **Step 5: Verify server syntax**
Run: `node --check server/server.js`
Expected: Clean exit code 0.

- [ ] **Step 6: Commit**
```bash
git add server/
git commit -m "feat(ai): implement Gemini AI service, Ticket model, and assistant backend routes"
```

---

### Task 2: AI Enhancements to Admin Reviews Hub

**Files:**
- Modify: `client/src/pages/AdminReviews.jsx`

**Interfaces:**
- Displays sentiment badge (Positive, Neutral, Negative) and spam alert tags.
- Adds filter for "Flagged / Spam Only".

- [ ] **Step 1: Update `AdminReviews.jsx`**
Add sentiment indicator pills, flagged warning badges, and filter option for suspicious/spam reviews.

- [ ] **Step 2: Verify client build**
Run: `cd client; npm run build`
Expected: Exit code 0.

- [ ] **Step 3: Commit**
```bash
git add client/src/pages/AdminReviews.jsx
git commit -m "feat(admin): display AI sentiment and spam badges in AdminReviews"
```

---

### Task 3: Smart NovaBot Integration in Storefront

**Files:**
- Modify: `client/src/components/assistant/ProductAssistant.jsx`

**Interfaces:**
- Calls `POST /api/assistant/chat`.
- Renders AI responses, recommended products with 1-click cart addition, and generated support ticket badges.

- [ ] **Step 1: Update `ProductAssistant.jsx`**
Connect to `/api/assistant/chat`, render bilingual responses, ticket creation confirmation cards, and live product suggestions.

- [ ] **Step 2: Verify client build**
Run: `cd client; npm run build`
Expected: Exit code 0.

- [ ] **Step 3: Commit**
```bash
git add client/src/components/assistant/ProductAssistant.jsx
git commit -m "feat(assistant): upgrade NovaBot with Gemini AI intent detection and ticket routing"
```

---

### Task 4: Admin Support Ticket Management Suite

**Files:**
- Create: `client/src/pages/AdminTickets.jsx`
- Modify: `client/src/components/admin/AdminShell.jsx`
- Modify: `client/src/routes/AppRoutes.jsx`
- Modify: `client/src/pages/AdminDashboard.jsx`

**Interfaces:**
- `AdminTickets.jsx`: Lists support tickets with status filter (`Open`, `In Progress`, `Resolved`), priority badges, details modal, and status updater.
- `AdminShell.jsx`: Adds `"Support Tickets"` to navigation with `Headphones` icon.
- `AppRoutes.jsx`: Defines `/admin/tickets` route.
- `AdminDashboard.jsx`: Shows open support tickets alert banner.

- [ ] **Step 1: Create `client/src/pages/AdminTickets.jsx`**
Build support ticket dashboard with KPI metrics, search, status change actions, and ticket detail dialog.

- [ ] **Step 2: Update `AdminShell.jsx` and `AppRoutes.jsx`**
Register "Support Tickets" nav item and route.

- [ ] **Step 3: Update `AdminDashboard.jsx`**
Add open support tickets indicator and quick navigation button.

- [ ] **Step 4: Verify client build**
Run: `cd client; npm run build`
Expected: Exit code 0.

- [ ] **Step 5: Commit**
```bash
git add client/src/pages/AdminTickets.jsx client/src/components/admin/AdminShell.jsx client/src/routes/AppRoutes.jsx client/src/pages/AdminDashboard.jsx
git commit -m "feat(admin): create AdminTickets hub and dashboard ticket notifications"
```

---

### Task 5: Final Validation & Integration

**Files:**
- Repository-wide test & build

- [ ] **Step 1: Validate frontend and backend**
Run: `cd client; npm run build`
Run: `node --check server/server.js`

- [ ] **Step 2: Merge into main and push**
```bash
git checkout main
git merge feat/ai-moderation-and-tickets
git push origin main
```

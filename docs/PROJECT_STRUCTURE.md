# NovaMart Project Structure

NovaMart uses a clean MERN monorepo structure:

```text
NovaMart/
  client/                 React + Vite frontend
    public/               Static public assets
    src/
      assets/             Images, static data, theme helpers
      components/
        common/           Reusable UI pieces: buttons, inputs, loaders, modals
        layout/           Navbar, footer, page shell, admin shell
        product/          ProductCard, filters, rating, price UI
      context/            Auth, cart, wishlist, theme state
      hooks/              Reusable React hooks
      lib/                Axios client, helpers, constants
      pages/              User pages
        admin/            Admin dashboard pages
      routes/             App route guards and route definitions
      styles/             Tailwind/global CSS
  server/                 Node + Express backend
    src/
      config/             Database and env config
      controllers/        Route logic
      middleware/         Auth, admin, error handling
      models/             Mongoose schemas
      routes/             API routes
      seed/               Demo data seeding
      utils/              JWT, async handler, helpers
  docs/                   Beginner-friendly project notes
```

## Main Frontend Files

- `client/package.json`: frontend dependencies and scripts.
- `client/index.html`: Vite HTML entry.
- `client/vite.config.js`: Vite config.
- `client/tailwind.config.js`: Tailwind theme setup.
- `client/postcss.config.js`: Tailwind PostCSS setup.
- `client/src/main.jsx`: React app mount.
- `client/src/App.jsx`: top-level routes and layout.
- `client/src/styles/index.css`: Tailwind directives and global styles.
- `client/src/lib/api.js`: Axios instance connected to backend.
- `client/src/context/AuthContext.jsx`: login, register, logout, current user.
- `client/src/context/CartContext.jsx`: cart state and fake checkout preparation.
- `client/src/context/WishlistContext.jsx`: wishlist state.
- `client/src/context/ThemeContext.jsx`: dark/light mode.
- `client/src/routes/ProtectedRoute.jsx`: blocks pages from logged-out users.
- `client/src/routes/AdminRoute.jsx`: blocks admin pages from normal users.

## Main Frontend Pages

- `Home.jsx`: premium animated homepage.
- `Products.jsx`: product grid, search, category filter, price sorting.
- `ProductDetails.jsx`: product image, price, stock, add-to-cart, wishlist.
- `Cart.jsx`: quantity controls and checkout button.
- `Checkout.jsx`: fake payment/order creation.
- `Wishlist.jsx`: saved products.
- `Login.jsx` and `Register.jsx`: JWT auth forms.
- `Profile.jsx`: user details.
- `Orders.jsx`: user order history.
- `admin/Dashboard.jsx`: admin stats.
- `admin/ProductManage.jsx`: create/update/delete products.
- `admin/OrderManage.jsx`: update order status.

## Main Backend Files

- `server/package.json`: backend dependencies and scripts.
- `server/.env.example`: backend environment variables.
- `server/src/server.js`: Express app startup.
- `server/src/app.js`: middleware and API route registration.
- `server/src/config/db.js`: MongoDB connection.
- `server/src/models/User.js`: user schema with bcrypt password hashing.
- `server/src/models/Product.js`: product schema using image URLs.
- `server/src/models/Order.js`: order schema for fake checkout.
- `server/src/controllers/authController.js`: register, login, profile.
- `server/src/controllers/productController.js`: public product APIs and admin CRUD.
- `server/src/controllers/orderController.js`: create orders, user/admin order lists.
- `server/src/routes/*.js`: API route definitions.
- `server/src/middleware/authMiddleware.js`: JWT auth and admin checks.
- `server/src/middleware/errorMiddleware.js`: friendly API errors.
- `server/src/seed/seed.js`: demo users and products.

## API Shape

Base URL: `/api`

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` admin
- `PUT /api/products/:id` admin
- `DELETE /api/products/:id` admin
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders` admin
- `PUT /api/orders/:id/status` admin

## Build Order

1. Backend foundation: Express, MongoDB, models, auth.
2. Backend product/order APIs.
3. Frontend Vite + Tailwind setup.
4. Frontend contexts and route guards.
5. Customer pages.
6. Admin pages.
7. Responsive polish, animation, dark/light mode.

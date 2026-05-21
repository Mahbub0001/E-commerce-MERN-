# 🛍️ NovaMart - Premium E-Commerce Platform

> A modern, full-stack e-commerce application built with the MERN stack, featuring advanced product discovery, secure authentication, and comprehensive admin management tools.

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-13AA52?style=flat-square&logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.21-90C53F?style=flat-square&logo=express)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Features

### 👤 For Customers
- 🔐 **Secure Authentication** - JWT-based login/registration with bcrypt password hashing
- 🛍️ **Product Discovery** - Advanced filtering by category, price range, and ratings
- 🔍 **Smart Search** - Full-text search across product names, descriptions, and attributes
- ❤️ **Wishlist Management** - Save favorite products for later
- 🛒 **Shopping Cart** - Add/remove items with quantity controls
- 💳 **Checkout System** - Secure order creation with shipping address and payment methods
- 📦 **Order Tracking** - View order history and current status
- 👨‍💼 **User Profile** - Manage personal information and preferences
- 🌓 **Dark Mode** - Beautiful light and dark theme support
- ✨ **Smooth Animations** - Framer Motion powered page transitions and interactions

### 🏪 For Store Administrators
- 📊 **Admin Dashboard** - Real-time statistics and overview
- 📦 **Product Management** - Create, read, update, delete products with rich attributes
- 👥 **User Management** - View and manage customer accounts
- 📋 **Order Management** - Update order status and track fulfillment
- 🎯 **Featured Products** - Mark products as featured for homepage display
- 💰 **Sales Management** - Track sales and pricing

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI component framework |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations & page transitions |
| **Axios** | HTTP client for API communication |
| **Lucide React** | Beautiful icon library |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web framework & API server |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM with schema validation |
| **JWT** | Secure authentication tokens |
| **bcryptjs** | Password hashing & security |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Tools & Services
- **Nodemon** - Auto-reload development server
- **Concurrently** - Run server & client simultaneously
- **Git** - Version control

---

## 📁 Project Structure

```
NovaMart/
├── 📄 package.json              # Root monorepo config
├── 📄 README.md                 # This file
├── 
├── 🖥️  CLIENT/                  # React Vite Frontend
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 index.html
│   ├── 🎨 src/
│   │   ├── 📄 main.jsx          # React entry point
│   │   ├── 📄 App.jsx           # Root component with providers
│   │   ├── 📄 index.css         # Global Tailwind styles
│   │   │
│   │   ├── 📂 assets/           # Images and static files
│   │   ├── 📂 components/       # Reusable React components
│   │   │   ├── common/          # Button, EmptyState, PageTransition
│   │   │   ├── layout/          # Navbar, Footer, Layout shells
│   │   │   ├── product/         # ProductCard, ProductFilters
│   │   │   ├── cart/            # CartItem component
│   │   │   └── admin/           # Admin-specific components
│   │   │
│   │   ├── 📂 pages/            # Page components
│   │   │   ├── Home.jsx         # Premium animated homepage
│   │   │   ├── Products.jsx     # Product grid with filters
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx         # Shopping cart
│   │   │   ├── Checkout.jsx     # Order creation
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx      # User account
│   │   │   ├── Orders.jsx       # Order history
│   │   │   └── admin/           # Admin pages
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       └── AdminUsers.jsx
│   │   │
│   │   ├── 📂 context/          # React Context for state
│   │   │   ├── AuthContext.jsx  # User authentication
│   │   │   ├── CartContext.jsx  # Shopping cart state
│   │   │   ├── WishlistContext.jsx
│   │   │   ├── ThemeContext.jsx # Dark/light mode
│   │   │   └── ToastContext.jsx # Notifications
│   │   │
│   │   ├── 📂 routes/           # Routing configuration
│   │   │   └── AppRoutes.jsx    # Protected & admin routes
│   │   │
│   │   ├── 📂 services/         # API communication
│   │   │   └── api.js           # Axios instance & interceptors
│   │   │
│   │   ├── 📂 utils/            # Utility functions
│   │   │   ├── formatCurrency.js
│   │   │   ├── normalizeProduct.js
│   │   │   └── storage.js
│   │   │
│   │   ├── 📂 hooks/            # Custom React hooks
│   │   ├── 📂 lib/              # Libraries & helpers
│   │   └── 📂 styles/           # Additional CSS
│   │
│   └── 🎨 public/               # Static assets
│
├── 🖧 SERVER/                   # Node.js Express Backend
│   ├── 📄 package.json
│   ├── 📄 server.js             # Express app initialization
│   ├── 📄 .env.example          # Environment template
│   │
│   ├── 📂 config/
│   │   └── db.js                # MongoDB connection
│   │
│   ├── 📂 models/               # Mongoose schemas
│   │   ├── User.js              # User schema with hashing
│   │   ├── Product.js           # Product schema
│   │   └── Order.js             # Order schema
│   │
│   ├── 📂 controllers/          # Route logic
│   │   ├── authController.js    # Auth endpoints
│   │   ├── productController.js # Product CRUD
│   │   ├── orderController.js   # Order management
│   │   └── userController.js    # User management
│   │
│   ├── 📂 routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── 📂 middleware/           # Express middleware
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── errorMiddleware.js   # Error handling
│   │
│   ├── 📂 utils/                # Helper functions
│   │   └── generateToken.js     # JWT token creation
│   │
│   └── 📂 seed/                 # Database seeding
│       └── seedProducts.js      # Sample data
│
└── 📚 docs/
    └── PROJECT_STRUCTURE.md     # Detailed documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20.x or higher
- **npm** v10.x or higher
- **MongoDB** v8.x (local or Atlas cloud)
- **Git** for version control

### Installation

#### 1️⃣ Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd "e-commerce web"

# Install all dependencies (root + server + client)
npm run install:all
```

#### 2️⃣ Configure Environment Variables

**Server Configuration** (`server/.env`)
```env
# Database
MONGO_URI=mongodb://localhost:27017/novamart
# or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/novamart

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS (adjust for your client URL in production)
# CLIENT_URL=http://localhost:5173
```

**Client Configuration** (`client/.env` - optional)
```env
# API Server URL
VITE_API_URL=http://localhost:5000/api
```

#### 3️⃣ Seed Database (Optional)
```bash
# Add sample products to MongoDB
npm run seed
```

#### 4️⃣ Start Development Servers
```bash
# Terminal 1: Start frontend & backend concurrently
npm run dev

# Frontend runs on: http://localhost:5173
# Backend API runs on: http://localhost:5000
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Response:** `{ _id, name, email, role, token }`

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```
**Response:** `{ _id, name, email, role, token }`

#### Get Current Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+1234567890",
  "address": { "street": "123 Main St", "city": "NYC" }
}
```

---

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&sort=newest&category=Electronics&minPrice=0&maxPrice=1000&rating=4

Query Parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)
  - sort: newest, oldest, price_asc, price_desc, rating_desc, name_asc, name_desc
  - keyword: Search term
  - category: Filter by category
  - minPrice, maxPrice: Price range filter
  - rating: Minimum rating filter
```

#### Get Featured Products
```http
GET /api/products/featured?limit=8
```

#### Search Products
```http
GET /api/products/search?keyword=laptop
```

#### Get Product by Slug
```http
GET /api/products/slug/macbook-pro-14
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Wireless Headphones",
  "slug": "wireless-headphones",
  "description": "Premium noise-cancelling headphones",
  "price": 299.99,
  "oldPrice": 399.99,
  "category": "Electronics",
  "brand": "AudioBrand",
  "image": "https://example.com/headphones.jpg",
  "countInStock": 50,
  "rating": 4.5,
  "isFeatured": true,
  "tags": ["wireless", "audio", "premium"]
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin-token>
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

---

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "address": "123 Main Street",
    "city": "New York",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "Cash on Delivery"
}
```

#### Get User Orders
```http
GET /api/orders/my-orders
Authorization: Bearer <jwt-token>
```

#### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <jwt-token>
```

#### Mark Order as Paid
```http
PUT /api/orders/:id/pay
Authorization: Bearer <jwt-token>
```

#### Mark Order as Delivered (Admin)
```http
PUT /api/orders/:id/deliver
Authorization: Bearer <admin-token>
```

#### Get All Orders (Admin)
```http
GET /api/orders
Authorization: Bearer <admin-token>
```

#### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Shipped" // or "Processing", "Delivered", "Cancelled"
}
```

---

### User Management Endpoints (Admin)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <admin-token>
```

#### Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

---

## 🗄️ Database Models

### User Schema
```javascript
{
  name: String (required, 2-80 chars),
  email: String (required, unique, validated),
  password: String (required, hashed with bcrypt),
  role: "user" | "admin",
  avatar: String (optional),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phone: String (optional, validated),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Schema
```javascript
{
  name: String (required, 2-160 chars),
  slug: String (required, unique, URL-friendly),
  description: String (required, up to 4000 chars),
  price: Number (required, min: 0),
  oldPrice: Number (for sale pricing),
  category: String (required),
  brand: String (required),
  image: String (required, main product image),
  images: Array[String] (up to 12 additional images),
  rating: Number (0-5, default: 0),
  numReviews: Number,
  countInStock: Number (required),
  isFeatured: Boolean,
  isOnSale: Boolean,
  tags: Array[String] (up to 20),
  features: Array[String] (up to 30),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: User, required),
  orderItems: [{
    product: ObjectId (ref: Product),
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: {
    address: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentMethod: String ("Cash on Delivery", "Demo Card", "Mobile Banking Demo"),
  itemsPrice: Number,
  shippingPrice: Number,
  taxPrice: Number,
  totalPrice: Number,
  isPaid: Boolean,
  paidAt: Date,
  isDelivered: Boolean,
  deliveredAt: Date,
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Security

### How It Works
1. **User Registration**: Password is hashed using bcryptjs (10 salt rounds)
2. **Login**: Password is compared with stored hash; JWT token is generated
3. **Protected Routes**: Token is sent in `Authorization: Bearer <token>` header
4. **Token Verification**: Middleware verifies JWT signature and expiry
5. **Admin Routes**: Role-based access control via user role field

### JWT Token Structure
```javascript
{
  userId: "507f1f77bcf86cd799439011",
  iat: 1234567890,
  exp: 1234654290
}
```

### Password Security
- Minimum 6 characters required
- Hashed with bcrypt before storage
- Never returned in API responses

---

## 👥 User Roles & Permissions

### Customer (default role)
- ✅ View products and search
- ✅ Manage personal cart and wishlist
- ✅ Create and track orders
- ✅ Update profile information
- ❌ Cannot access admin features

### Administrator
- ✅ All customer permissions
- ✅ Create, read, update, delete products
- ✅ View all users and orders
- ✅ Update order status and delivery
- ✅ Access admin dashboard

---

## 🎨 Frontend Features in Detail

### Page Components

| Page | Features |
|------|----------|
| **Home** | Animated hero, featured products, call-to-action |
| **Products** | Grid layout, category filters, price range slider, sorting, search |
| **Product Details** | Images carousel, specifications, stock status, reviews |
| **Cart** | Item quantity controls, price breakdown, checkout button |
| **Checkout** | Order review, shipping address form, payment method selection |
| **Wishlist** | Saved products grid, quick actions |
| **Orders** | Order history with status tracking, order details |
| **Login/Register** | JWT authentication forms with validation |
| **Profile** | User information edit, address management |
| **Admin Dashboard** | Stats overview, quick links to management areas |
| **Admin Products** | CRUD operations with rich form |
| **Admin Orders** | Order search, status updates, fulfillment tracking |
| **Admin Users** | User listing and management |

### State Management
- **React Context API** for global state
- Persistent storage with localStorage/sessionStorage
- Separation of concerns (Auth, Cart, Wishlist, Theme, Toast)

### Styling & UX
- **Tailwind CSS** for rapid, consistent styling
- **Dark mode** support with theme context
- **Framer Motion** for smooth animations
- **Responsive design** for mobile, tablet, desktop
- **Loading states** with skeleton screens
- **Error handling** with user-friendly messages
- **Toast notifications** for feedback

---

## 🏃 Running Specific Commands

### Frontend Only
```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Only
```bash
cd server
npm run dev      # Start with nodemon
npm run start    # Start production server
npm run seed     # Populate database with samples
```

### Both (from root)
```bash
npm run dev           # Start both concurrently
npm run install:all   # Install all dependencies
```

---

## 🧪 Testing the Application

### Test Users
After seeding, use these credentials:

**Regular User:**
- Email: `user@example.com`
- Password: `password123`

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 🚀 Production Deployment

### Build Frontend
```bash
cd client
npm run build
# Creates optimized build in dist/
```

### Environment for Production
```env
# server/.env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=very-long-secure-secret-key
PORT=5000
```

### Deploy Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas (cloud)
- **Image CDN**: Cloudinary, ImgBB, or similar

---

## 📊 Performance Optimizations

- ✨ Lazy-loaded React components
- 📦 Tree-shaking in Vite production builds
- 🎯 Optimized MongoDB queries with indexes
- 💾 Token-based caching for API responses
- 🖼️ Image optimization recommendations in product schemas
- ⚡ Efficient state management to prevent re-renders

---

## 🤝 Contributing

### Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes with clear messages
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ES6+ features
- Follow component naming conventions
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📝 Environment Variables Reference

### Server (.env)
```env
# Database Connection
MONGO_URI=                    # MongoDB connection string

# Server Config
PORT=5000                     # Server port
NODE_ENV=development          # Environment

# Security
JWT_SECRET=                   # Secret key for JWT tokens

# Optional CORS Settings
CORS_ORIGIN=http://localhost:5173
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed
- **Solution**: Check MongoDB is running, MONGO_URI is correct, network access is allowed

### Issue: CORS Errors
- **Solution**: Ensure frontend URL matches CORS_ORIGIN in server, or adjust cors middleware

### Issue: JWT Token Invalid
- **Solution**: Clear localStorage/sessionStorage, log out and login again

### Issue: Port Already in Use
- **Solution**: Change PORT in .env or kill the process using the port

### Issue: Dependencies Not Installing
- **Solution**: Delete node_modules and package-lock.json, run `npm install`

---

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT.io](https://jwt.io)
- [Mongoose Documentation](https://mongoosejs.com)

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👨‍💻 Author

**NovaMart Development Team**

### Support
For issues, questions, or suggestions, please open a GitHub issue or contact the development team.

---

## 🎯 Roadmap

### Upcoming Features
- 🎤 Product reviews and ratings system
- 💬 Real-time chat support
- 📧 Email notifications for orders
- 🎁 Coupon and discount codes
- 📱 Mobile app version
- 🌍 Multi-language support
- 🏷️ Advanced product recommendations
- 📊 Analytics dashboard for admins

---

## ⭐ Acknowledgments

Built with ❤️ using:
- React & Vite for fast development
- Express & MongoDB for robust backend
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations

**Thank you for using NovaMart!** 🎉

---

<div align="center">

**[⬆ Back to top](#-novamart---premium-e-commerce-platform)**

Made with ❤️ by the NovaMart Team

</div>

# 🛍️ NexaStore — Full-Stack E-Commerce Platform

A production-ready, full-stack e-commerce application built with Next.js, Node.js, MongoDB, and modern web technologies. Designed as a professional portfolio project demonstrating real-world SaaS-level architecture.

---

## 🧱 Tech Stack

### Frontend
- **Next.js 14** (App Router) — React framework
- **Tailwind CSS** — Utility-first styling with dark mode
- **Zustand** — Lightweight state management
- **Framer Motion** — Smooth animations
- **Recharts** — Analytics charts
- **React Hot Toast** — Toast notifications
- **Axios** — HTTP client with interceptors

### Backend
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — Database and ODM
- **JWT** — Stateless authentication
- **bcryptjs** — Password hashing
- **Cloudinary** — Image storage
- **Socket.IO** — Real-time order updates
- **Stripe** — Payment processing (test mode)
- **Helmet + Rate Limiting** — Security

---

## ✨ Features

### User-Facing
- ✅ Register / Login / Logout with JWT
- ✅ Browse & search products with advanced filters (category, price, rating, stock)
- ✅ Sort by price, rating, newest, popularity
- ✅ Product detail page with image gallery
- ✅ Shopping cart with quantity management
- ✅ Wishlist (saved to backend)
- ✅ Apply coupon/discount codes
- ✅ Multi-step checkout (Shipping → Payment → Review)
- ✅ Mock/Stripe test payment
- ✅ Order creation and history
- ✅ Order status tracking with timeline
- ✅ Cancel order
- ✅ Leave product reviews & ratings
- ✅ Account profile & password management
- ✅ Responsive on mobile, tablet, desktop
- ✅ Dark mode / Light mode

### Admin Dashboard
- ✅ Secure admin-only routes
- ✅ Analytics overview (revenue, orders, users, products)
- ✅ Sales over time chart (Area chart)
- ✅ User growth chart (Bar chart)
- ✅ Order status breakdown (Pie chart)
- ✅ Best-selling products table
- ✅ Full product CRUD with Cloudinary image uploads
- ✅ Order management with status updates + tracking numbers
- ✅ User management (view, role toggle, deactivate, delete)
- ✅ Coupon/discount system (percentage or fixed, expiry, usage limits)

---

## 📁 Project Structure

```
nexastore/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   ├── couponController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # protect, admin, optionalAuth
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── userRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── couponRoutes.js
│   │   └── analyticsRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seeder.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.js             # Homepage
    │   │   ├── layout.js           # Root layout
    │   │   ├── globals.css
    │   │   ├── shop/page.js        # Product listing + filters
    │   │   ├── product/[id]/       # Product detail
    │   │   ├── cart/page.js        # Shopping cart
    │   │   ├── checkout/page.js    # Multi-step checkout
    │   │   ├── orders/             # Order history + detail
    │   │   ├── wishlist/page.js
    │   │   ├── account/page.js
    │   │   ├── auth/
    │   │   │   ├── login/page.js
    │   │   │   └── register/page.js
    │   │   └── admin/
    │   │       ├── layout.js       # Admin sidebar layout
    │   │       ├── page.js         # Dashboard + charts
    │   │       ├── products/page.js
    │   │       ├── orders/page.js
    │   │       ├── users/page.js
    │   │       └── coupons/page.js
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.js       # Sticky nav, dark mode, search
    │   │   │   └── Footer.js
    │   │   └── product/
    │   │       └── ProductCard.js
    │   ├── lib/
    │   │   └── api.js              # Axios instance + all API helpers
    │   └── store/
    │       ├── authStore.js        # Zustand auth store (persisted)
    │       └── cartStore.js        # Zustand cart store (persisted)
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier works)
- Stripe account (for payments, optional)

### 1. Clone the repository

```bash
git clone https://github.com/m7md-ib/Nexastore.git
cd Nexastore
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables (see below)
```

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nexastore
JWT_SECRET=your_super_long_random_secret_here
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

```bash
# Seed sample data (products, users, coupons)
npm run seed

# Start backend dev server
npm run dev
# → API running at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_KEY=pk_test_...
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
# → App running at http://localhost:3000
```

---

## 🌐 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| POST | `/api/auth/wishlist/:id` | Private | Toggle wishlist |

### Products
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Get all (filters, pagination, search) |
| GET | `/api/products/:id` | Public | Get single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Soft delete |
| POST | `/api/products/:id/reviews` | Private | Add review |
| GET | `/api/products/:id/related` | Public | Related products |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Private | Create order |
| GET | `/api/orders/my` | Private | My orders |
| GET | `/api/orders/:id` | Private | Order detail |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |
| PUT | `/api/orders/:id/cancel` | Private | Cancel order |

### Analytics (Admin only)
- `GET /api/analytics/summary` — Dashboard stats
- `GET /api/analytics/sales` — Monthly revenue/orders
- `GET /api/analytics/best-sellers` — Top products
- `GET /api/analytics/user-growth` — Monthly signups
- `GET /api/analytics/order-status` — Status breakdown
- `GET /api/analytics/category-revenue` — Revenue by category

---

## ☁️ Deployment

### Backend → Render

1. Create account at [render.com](https://render.com)
2. New → **Web Service** → Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
4. Add all environment variables from `.env.example`
5. Set `NODE_ENV=production` and `CLIENT_URL=https://your-frontend.vercel.app`
6. Deploy! Note your service URL (e.g. `https://nexastore-api.onrender.com`)

### Frontend → Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Framework Preset:** Next.js
4. **Root Directory:** `frontend`
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://nexastore-api.onrender.com/api
   NEXT_PUBLIC_STRIPE_KEY=pk_test_...
   NEXT_PUBLIC_SOCKET_URL=https://nexastore-api.onrender.com
   ```
6. Deploy!

> **Tip:** After deploying both, update `CLIENT_URL` in Render to your Vercel URL to fix CORS.

---

## 🔐 Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** authentication with 30-day expiry
- **Role-based access control** (user / admin)
- **Helmet.js** HTTP security headers
- **Rate limiting** (100 requests / 15 min per IP)
- **CORS** restricted to allowed origins
- **Input validation** and sanitization
- **Soft deletes** for products (data integrity)

---

## 🏷️ Default Coupons (after seeding)

| Code | Type | Value | Min Order |
|---|---|---|---|
| `WELCOME20` | Percentage | 20% off | $50 |
| `SAVE50` | Fixed | $50 off | $200 |
| `FREESHIP` | Fixed | $9.99 off | $0 |

---

## 🛠️ Scripts

### Backend
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run seed     # Import sample data
npm run seed -- -d  # Destroy all data
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint
```

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

## 👤 Author

Built as a full-stack portfolio project demonstrating modern web development with Next.js, Node.js, and MongoDB.

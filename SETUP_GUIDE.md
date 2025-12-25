# Resell College - Role-Based Login Setup Guide

## Project Overview
Your application is a used product marketplace with role-based authentication:
- **Buyers**: Browse and purchase items
- **Sellers**: List and sell items
- **Profiles**: Display different dashboards based on user role

---

## ✅ Setup Complete - What's Configured

### 1. **Backend Configuration**
✅ **CORS Enabled** - `server/src/server.js`
- Allows requests from `http://localhost:3000`, `http://localhost:5173`, `http://localhost:5174`
- Supports credentials and credentials with authorization headers

✅ **Authentication Routes** - `server/src/routes/authRoutes.js`
- `POST /api/auth/signup` - Create buyer or seller account
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Alternative registration endpoint
- `GET /api/auth/me` - Get current user (protected)

✅ **Auth Controller** - `server/src/controllers/authcontroller.js`
- `signup()` - Create new user with role (buyer/seller)
- `login()` - Authenticate user by email
- `register()` - Alternative signup method
- Response format: `{ status, token, data: { user } }`

✅ **User Model** - `server/src/models/user.js`
- Fields: name, email, password, role, avatar, bio, gender
- Password hashing with bcryptjs
- `matchPassword()` method for authentication

---

### 2. **Frontend Configuration**

✅ **AuthContext** - `client/src/context/AuthContext.jsx`
- Manages global user state
- `loading` state for detecting when user is being loaded from localStorage
- `login()` - Save user and token
- `logout()` - Clear user state
- `updateUser()` - Update user info without re-login
- Stores user in localStorage

✅ **Protected Routes** - `client/src/components/common/ProtectedRoute.jsx`
- Redirects unauthenticated users to login
- Restricts seller-only pages (AddListing)
- Shows access denied message for unauthorized roles

✅ **API Configuration** - `client/src/api/config.js`
- Centralized API endpoints
- Base URL: `http://localhost:5050` (configurable via env)
- Helper function `apiCall()` for authenticated requests

✅ **Authentication Pages**
- **Login** (`client/src/pages/Login.jsx`)
  - Email and password form
  - Error handling
  - Role-based redirect
  
- **Signup** (`client/src/pages/Signup.jsx`)
  - Name, email, password
  - Role selection (Buyer/Seller)
  - Error handling with loading state

✅ **Role-Based Profiles**
- **BuyerProfile** (`client/src/components/profile/BuyerProfile.jsx`)
  - Account settings with edit profile
  - Purchase history tab
  - Wishlist tab
  
- **SellerDashboard** (`client/src/components/profile/SellerDashboard.jsx`)
  - Sales statistics and analytics
  - Active listings management
  - Store settings
  - List new item button

✅ **Navigation** - `client/src/components/layout/Navbar.jsx`
- "Sell Item" button visible only to sellers
- Login/signup links for guests
- User profile and logout for authenticated users

✅ **App Router** - `client/src/App.jsx`
- Protected routes for `/chat`, `/profile`
- Seller-only route for `/add-listing`
- Public routes for `/login`, `/signup`, `/`

---

## 🚀 How to Run

### Backend
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5050
```

### Frontend
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 📝 Authentication Flow

### Signup
1. User enters name, email, password, and selects role (buyer/seller)
2. POST to `/api/auth/signup`
3. Backend creates user with selected role
4. Response includes token and user data
5. Frontend saves user and token to localStorage
6. Redirect to profile (seller) or home (buyer)

### Login
1. User enters email and password
2. POST to `/api/auth/login`
3. Backend verifies credentials
4. Response includes token and user data
5. Frontend saves user and token to localStorage
6. Redirect based on role

### Profile Access
1. Protected route checks if user exists
2. If user doesn't exist, redirect to login
3. Profile page checks user.role
4. Shows SellerDashboard for role='seller'
5. Shows BuyerProfile for role='buyer'

---

## 🔐 User Data Structure

```javascript
{
  id: "ObjectId",
  name: "John Doe",
  email: "john@example.com",
  role: "seller", // or "buyer"
  avatar: "url or null",
  bio: "optional bio",
  gender: "male/female/other",
  token: "jwt_token",
  createdAt: "timestamp"
}
```

---

## 🎯 Role-Based Features

### Buyer Features
- Browse products
- Search and filter
- View product details
- Message sellers
- Purchase items
- View purchase history
- Save to wishlist
- Edit profile

### Seller Features
- List products (AddListing page)
- View dashboard with analytics
- Manage listings
- View sales stats
- Track profile views
- Respond to messages
- Manage store settings
- Edit profile

---

## 🔄 API Endpoints Usage

### In Components
```javascript
import { API_ENDPOINTS } from '../api/config';

// Use in fetch
fetch(API_ENDPOINTS.AUTH.LOGIN, {
  method: 'POST',
  body: JSON.stringify({ email, password })
})

// With authentication
fetch(API_ENDPOINTS.SELLER.DASHBOARD, {
  headers: {
    'Authorization': `Bearer ${user.token}`
  }
})
```

---

## 📱 Testing Role-Based Login

### Test Signup as Seller
1. Go to http://localhost:5173/signup
2. Fill form:
   - Name: John Seller
   - Email: seller@example.com
   - Password: password123
   - Select "I am a Seller"
3. Click "Create Account"
4. Should redirect to /profile with SellerDashboard

### Test Signup as Buyer
1. Go to http://localhost:5173/signup
2. Fill form:
   - Name: Jane Buyer
   - Email: buyer@example.com
   - Password: password123
   - Select "I am a Buyer"
3. Click "Create Account"
4. Should redirect to home (/) with BuyerProfile accessible at /profile

### Test Login
1. Go to http://localhost:5173/login
2. Enter email and password
3. Should redirect based on role

---

## ⚙️ Configuration Files

### Backend `.env` (create if needed)
```
PORT=5050
DB_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Frontend `.env` (optional - already defaults to localhost:5050)
```
REACT_APP_API_URL=http://localhost:5050
```

---

## 🐛 Troubleshooting

### "CORS error" on login/signup
- Ensure backend is running on port 5050
- Check CORS configuration in `server/src/server.js`
- Browser console will show detailed error

### User not persisting on refresh
- Check browser's localStorage (DevTools > Application > Storage > Local Storage)
- Verify AuthContext.jsx is properly checking localStorage on mount

### Profile showing wrong dashboard
- Check user.role is being set correctly
- Verify response from backend includes `data.user.role`
- Check browser console for errors

### "Access Denied" on /add-listing as buyer
- This is expected! Only sellers can access /add-listing
- Login with a seller account to access

---

## 🔮 Next Steps

1. **Database Integration**: Connect to MongoDB and test with real data
2. **Product Listing**: Implement product creation and management
3. **Chat System**: Build real-time messaging between buyers and sellers
4. **Payment Integration**: Add Stripe or other payment processor
5. **Image Upload**: Implement product image uploads
6. **Search and Filter**: Build product search and filtering
7. **Reviews and Ratings**: Add user reviews for products
8. **Notifications**: Implement real-time notifications

---

## 📚 File Structure Reference

```
client/
├── src/
│   ├── api/
│   │   └── config.js          # API endpoints config
│   ├── components/
│   │   ├── common/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── profile/
│   │   │   ├── BuyerProfile.jsx
│   │   │   └── SellerDashboard.jsx
│   │   └── layout/
│   │       └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Auth state management
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Profile.jsx
│   └── App.jsx               # Routes configuration

server/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── authcontroller.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── user.js
│   ├── routes/
│   │   └── authRoutes.js
│   └── server.js            # CORS configuration
```

---

**Project Ready! Your role-based login system is fully configured and ready to test.** 🎉

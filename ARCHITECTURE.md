# 🏗️ Architecture Overview - Resell College Marketplace

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
│                    http://localhost:5173                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     App.jsx (Router)                         │  │
│  │  • Routes setup                                             │  │
│  │  • Protected route wrapper                                 │  │
│  │  • AuthProvider context                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ├─ Provides user state                  │
│                              │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │           AuthContext.jsx (State Management)               │   │
│  │  • user (id, name, email, role, token)                   │   │
│  │  • loading (boolean)                                      │   │
│  │  • login(), logout(), updateUser()                        │   │
│  │  • localStorage synchronization                           │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ├─ Provides auth state to routes        │
│                              │                                       │
│  ┌──────────────────────────▼──────────────────────────────────┐   │
│  │          ProtectedRoute.jsx (Access Control)              │   │
│  │  • Check: user exists?                                    │   │
│  │  • Check: user.role matches required roles?               │   │
│  │  • Redirect to /login if not authenticated                │   │
│  │  • Show "Access Denied" if wrong role                     │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────┐      ┌──────────────┐    ┌─────────────┐         │
│  │  Login.jsx  │      │ Signup.jsx   │    │ Profile.jsx │         │
│  │             │      │              │    │             │         │
│  │ • Email     │      │ • Name       │    │ • Checks    │         │
│  │ • Password  │      │ • Email      │    │   user.role │         │
│  │             │      │ • Password   │    │             │         │
│  │ • Submit    │      │ • Role picker│    │ • Shows     │         │
│  │   to API    │      │              │    │   correct   │         │
│  │             │      │ • Submit     │    │   dashboard │         │
│  │ • Save user │      │   to API     │    │             │         │
│  │   to context│      │              │    │ • If seller │         │
│  │             │      │ • Save user  │    │   → Shows   │         │
│  │ • Redirect  │      │   to context │    │   Seller    │         │
│  │   based on  │      │              │    │   Dashboard │         │
│  │   role      │      │ • Redirect   │    │             │         │
│  │             │      │   based on   │    │ • If buyer  │         │
│  │             │      │   role       │    │   → Shows   │         │
│  │             │      │              │    │   Buyer     │         │
│  │             │      │              │    │   Profile   │         │
│  └─────────────┘      └──────────────┘    └─────────────┘         │
│         │                    │                    │                 │
│         └────────────────────┼────────────────────┘                 │
│                              │                                       │
│                    Makes API calls to backend                        │
│                              │                                       │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                     CORS Bridge (HTTP)
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                         BACKEND (Node.js)                           │
│                   http://localhost:5050                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              server.js (Express App)                       │    │
│  │  • CORS configuration (allows localhost:3000, 5173, 5174) │    │
│  │  • Middleware: express.json()                            │    │
│  │  • Route mounting                                        │    │
│  │  • Socket.io integration                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                    Routes requests to controllers                    │
│                              │                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │        authRoutes.js (Route Definitions)                  │    │
│  │                                                            │    │
│  │  POST   /api/auth/signup   ──→ authController.signup()   │    │
│  │  POST   /api/auth/login    ──→ authController.login()    │    │
│  │  POST   /api/auth/register ──→ authController.register() │    │
│  │  GET    /api/auth/me       ──→ authController.getProfile │    │
│  │                   (protected route)                       │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│         ┌────────────────────┼────────────────────┐                 │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │ signup()     │    │ login()      │    │register()    │         │
│  │ (controller) │    │(controller)  │    │(controller)  │         │
│  │              │    │              │    │              │         │
│  │ 1. Validate  │    │ 1. Validate  │    │ 1. Validate  │         │
│  │ 2. Check if  │    │ 2. Find user │    │ 2. Check if  │         │
│  │    email     │    │    by email  │    │    exists    │         │
│  │    exists    │    │ 3. Compare   │    │ 3. Create    │         │
│  │ 3. Create    │    │    password  │    │    user      │         │
│  │    user with │    │ 4. Generate  │    │ 4. Generate  │         │
│  │    role      │    │    token     │    │    token     │         │
│  │ 4. Hash pwd  │    │ 5. Return    │    │ 5. Return    │         │
│  │ 5. Generate  │    │    response  │    │    response  │         │
│  │    token     │    │              │    │              │         │
│  │ 6. Return    │    │              │    │              │         │
│  │    response  │    │              │    │              │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│         │                    │                    │                 │
│         └────────────────────┼────────────────────┘                 │
│                              │                                       │
│                 Uses User Model to save/query data                   │
│                              │                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         User.js (Mongoose Schema)                          │    │
│  │                                                            │    │
│  │  Fields:                                                  │    │
│  │  • name (required)                                       │    │
│  │  • email (required, unique)                             │    │
│  │  • password (required, hashed with bcryptjs)           │    │
│  │  • role (enum: ["buyer", "seller", "admin"])          │    │
│  │  • avatar (optional)                                    │    │
│  │  • bio (optional)                                       │    │
│  │  • gender (optional)                                    │    │
│  │  • createdAt, updatedAt (timestamps)                   │    │
│  │                                                            │    │
│  │  Methods:                                                 │    │
│  │  • matchPassword() - Compare hashed passwords            │    │
│  │  • Pre-save hook - Hash password on save                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                    Connects to Database                              │
│                              │                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │           MongoDB (Database)                              │    │
│  │                                                            │    │
│  │  Collection: users                                       │    │
│  │  ├─ User 1: { id, name, email, pwd_hash, role, ... }    │    │
│  │  ├─ User 2: { id, name, email, pwd_hash, role, ... }    │    │
│  │  └─ User N: { id, name, email, pwd_hash, role, ... }    │    │
│  │                                                            │    │
│  │  Collections (future):                                   │    │
│  │  ├─ products                                             │    │
│  │  ├─ messages                                             │    │
│  │  ├─ conversations                                        │    │
│  │  └─ purchases                                            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow Sequence Diagram

```
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  User        │              │  Frontend    │              │  Backend     │
│  (Browser)   │              │  (React)     │              │  (Node.js)   │
└──────────────┘              └──────────────┘              └──────────────┘
     │                             │                              │
     │ 1. Fills signup form        │                              │
     │─────────────────────────────>                              │
     │                             │                              │
     │ 2. Clicks "Create Account"  │                              │
     │────────────────────────────>│                              │
     │                             │ 3. POST /api/auth/signup     │
     │                             │    {name, email, pwd, role}  │
     │                             │─────────────────────────────>│
     │                             │                              │
     │                             │                  4. Validate │
     │                             │                     & hash   │
     │                             │                     password  │
     │                             │                              │
     │                             │                  5. Check if │
     │                             │                     email    │
     │                             │                     exists   │
     │                             │                              │
     │                             │               6. Create user │
     │                             │                  in database  │
     │                             │                  with role    │
     │                             │                              │
     │                             │               7. Generate    │
     │                             │                  JWT token    │
     │                             │                              │
     │                             │<────────────────────────────┤
     │                             │ 8. Response:                │
     │                             │    {status, token, data}     │
     │                             │    {user with role}          │
     │                             │                              │
     │ 9. Receives response        │                              │
     │<────────────────────────────┤                              │
     │                             │                              │
     │                       10. AuthContext:                    │
     │                           • Save user                     │
     │                           • Save token                    │
     │                           • localStorage                  │
     │                             │                              │
     │                       11. Check role:                     │
     │                           role==="seller"?                │
     │                             │                              │
     │                       12. Navigate based on role:         │
     │                           seller → /profile               │
     │                           buyer → /                       │
     │                             │                              │
     │<────────────────────────────┤                              │
     │ 13. Redirected to correct   │                              │
     │     page with dashboard     │                              │
     │                             │                              │
```

---

## Data Flow: Signup to Dashboard

```
SIGNUP PAGE
    ↓
User Form Data
    {
      name: "Alice Seller",
      email: "alice@seller.com", 
      password: "password123",
      role: "seller"
    }
    ↓
Frontend API Call
    POST http://localhost:5050/api/auth/signup
    ↓
Backend authController.signup()
    ├─ Validate input
    ├─ Check if email exists
    ├─ Hash password with bcryptjs
    ├─ Create User in MongoDB
    ├─ Generate JWT token
    └─ Return response
        {
          status: "success",
          token: "jwt_token...",
          data: {
            user: {
              id: "mongo_id",
              name: "Alice Seller",
              email: "alice@seller.com",
              role: "seller",        ← KEY FIELD
              avatar: null,
              ...
            }
          }
        }
    ↓
Frontend receives response
    ├─ Extract data.data.user and data.token
    ├─ Call AuthContext.login(response)
    ├─ Save to localStorage
    └─ Check role: data.data.user.role === "seller"
        ↓
    Navigate to /profile
        ↓
Profile.jsx renders
    ├─ Check user.role
    ├─ role === "seller" ?
    └─ Render <SellerDashboard user={user} />
        ↓
SellerDashboard displays:
    ├─ Seller name and welcome message
    ├─ Stats cards (Active Listings, Sales, Views, Messages)
    ├─ Recent Listings table
    ├─ Tabs for Dashboard, Listings, Settings
    └─ "List New Item" button
```

---

## Component Hierarchy

```
App.jsx
├── AuthProvider
│   ├── Router
│   │   ├── Navbar
│   │   │   ├── useAuth() → shows/hides elements based on role
│   │   │   ├── LoginLinks (if !user)
│   │   │   └── UserMenu (if user)
│   │   │       └── "Sell Item" button (if user.role === "seller")
│   │   │
│   │   └── Routes
│   │       ├── / (Home)
│   │       ├── /login → Login.jsx
│   │       ├── /signup → Signup.jsx
│   │       ├── /profile → ProtectedRoute
│   │       │   └── Profile.jsx
│   │       │       ├── if role === "seller"
│   │       │       │   └── SellerDashboard
│   │       │       │       ├── Dashboard tab
│   │       │       │       ├── Listings tab
│   │       │       │       └── Settings tab
│   │       │       └── if role === "buyer"
│   │       │           └── BuyerProfile
│   │       │               ├── Account Settings tab
│   │       │               ├── Purchases tab
│   │       │               └── Wishlist tab
│   │       │
│   │       ├── /add-listing → ProtectedRoute (seller only)
│   │       │   └── AddListing.jsx
│   │       │
│   │       ├── /chat → ProtectedRoute
│   │       │   └── ChatPage.jsx
│   │       │
│   │       └── /search → SearchResults.jsx
│   │
│   └── AIChatbot
```

---

## State Flow

```
localStorage
    ↓
    ↓ (on app load)
    ↓
AuthContext
├─ user: { id, name, email, role, token, ... }
├─ loading: boolean
├─ login(resData)
├─ logout()
└─ updateUser(updates)
    ↓
    ↓ (useAuth hook)
    ↓
Any Component
├─ Can access: user, loading
├─ Can call: login(), logout(), updateUser()
└─ Can make decisions based on user.role
```

---

## Database Schema (Simplified)

```
MongoDB
└─ resellcollege_db
    └─ users collection
        {
          _id: ObjectId,
          name: String,
          email: String (unique, indexed),
          password: String (hashed, not selected by default),
          role: String (enum: ["buyer", "seller", "admin"]),
          avatar: String or null,
          bio: String or null,
          gender: String or null,
          settings: {
            theme: String
          },
          createdAt: Date,
          updatedAt: Date
        }
        
        // Future collections:
        products: { seller_id, title, price, images, ... }
        messages: { sender_id, receiver_id, content, ... }
        conversations: { buyer_id, seller_id, messages_ids, ... }
        purchases: { buyer_id, product_id, seller_id, amount, ... }
```

---

## API Request/Response Examples

### Signup Request
```http
POST /api/auth/signup HTTP/1.1
Host: localhost:5050
Content-Type: application/json

{
  "name": "Alice Seller",
  "email": "alice@seller.com",
  "password": "password123",
  "role": "seller"
}
```

### Signup Response (200 OK)
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alice Seller",
      "email": "alice@seller.com",
      "role": "seller",
      "username": "alice",
      "avatar": null,
      "bio": null,
      "createdAt": "2025-12-23T10:30:00.000Z"
    }
  }
}
```

### Login Request
```http
POST /api/auth/login HTTP/1.1
Host: localhost:5050
Content-Type: application/json

{
  "email": "alice@seller.com",
  "password": "password123"
}
```

### Error Response (400 Bad Request)
```json
{
  "status": "fail",
  "message": "Email already in use"
}
```

---

## Technology Stack

### Frontend
- **React** 18+ - UI Framework
- **React Router** - Client-side routing
- **Lucide React** - Icons
- **Tailwind CSS** - Styling
- **Fetch API** - HTTP requests
- **localStorage** - Client-side persistence

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database (when connected)
- **Mongoose** - ODM library (when connected)
- **bcryptjs** - Password hashing
- **jsonwebtoken (JWT)** - Token generation
- **CORS** - Cross-origin requests
- **Socket.io** - Real-time communication (future)

---

**Your complete role-based marketplace architecture is ready!** 🚀

# API Response Format Reference

## 🎯 What Your Frontend Expects

The frontend is configured to handle responses in this exact format:

---

## Signup Response (Successful)

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
      "gender": null,
      "createdAt": "2025-12-23T10:30:00.000Z"
    }
  }
}
```

---

## Login Response (Successful)

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
      "gender": null,
      "createdAt": "2025-12-23T10:30:00.000Z"
    }
  }
}
```

---

## Error Response (Failed)

```json
{
  "status": "fail",
  "message": "Email already in use"
}
```

---

## 🔍 Frontend Implementation

When the frontend receives a response:

```javascript
const response = await fetch('/api/auth/signup', {...});
const data = await response.json();

if (response.ok) {
  // SUCCESS - data has the structure above
  const userWithToken = { 
    ...data.data.user,    // ← Extracts user fields
    token: data.token     // ← Adds token
  };
  // Now userWithToken looks like:
  // {
  //   id: "...",
  //   name: "...",
  //   email: "...",
  //   role: "seller",
  //   token: "...",
  //   ...
  // }
  
  // Redirect based on role
  if (data.data.user.role === 'seller') {
    navigate('/profile');  // Shows SellerDashboard
  } else {
    navigate('/');         // Shows Home
  }
} else {
  // ERROR - data.message has error
  setError(data.message);
}
```

---

## 📝 Request Format

### Signup Request
```json
{
  "name": "Alice Seller",
  "email": "alice@seller.com",
  "password": "password123",
  "role": "seller"
}
```

### Login Request
```json
{
  "email": "alice@seller.com",
  "password": "password123"
}
```

---

## ✅ What Your Backend Currently Does (authcontroller.js)

### Signup Handler
```javascript
exports.signup = async (req, res, next) => {
  // 1. Validates input
  // 2. Checks if email exists
  // 3. Creates user with role
  // 4. Auto-generates username from email
  // 5. Returns token and user data in correct format
}
```

### Login Handler
```javascript
exports.login = async (req, res, next) => {
  // 1. Validates input (email, password)
  // 2. Finds user by email
  // 3. Compares password with hashed version
  // 4. Returns token and user data in correct format
}
```

---

## 🔐 Token Structure

The JWT token contains:
```javascript
{
  id: "user_mongodb_id",
  iat: 1703334600,      // issued at
  exp: 1704199600       // expires at (7 days later)
}
```

Token is signed with your `JWT_SECRET` from `.env`

---

## 💾 Frontend Storage

After successful auth, frontend stores this in `localStorage`:

Key: `'user'`

Value:
```javascript
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Alice Seller",
  "email": "alice@seller.com",
  "role": "seller",
  "username": "alice",
  "avatar": null,
  "bio": null,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2025-12-23T10:30:00.000Z"
}
```

This gets loaded back into AuthContext on app refresh.

---

## 🔄 Auth Flow with Actual Data

### 1. User submits signup form
```
Input: 
  name="Alice Seller"
  email="alice@seller.com"
  password="password123"
  role="seller"
```

### 2. Frontend sends POST request
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Alice Seller",
  "email": "alice@seller.com",
  "password": "password123",
  "role": "seller"
}
```

### 3. Backend processes
```
- Validates all fields
- Hashes password with bcryptjs
- Creates user document in MongoDB
- Generates JWT token
- Returns response
```

### 4. Backend responds
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alice Seller",
      "email": "alice@seller.com",
      "role": "seller",
      ...
    }
  }
}
```

### 5. Frontend processes response
```
- Checks response.ok
- Extracts data.data.user and token
- Saves to localStorage
- Extracts role from data.data.user.role
- Navigates to /profile (for seller)
- Profile component shows SellerDashboard
```

---

## 🎯 Critical Points for Frontend

These must exist in response for frontend to work:

```javascript
// MUST HAVE
response.ok === true              // HTTP 200-299
data.status === "success"         // Backend status
data.token === "jwt_string"       // JWT token
data.data.user.id                 // User ID
data.data.user.name               // User name
data.data.user.email              // User email
data.data.user.role               // "buyer" or "seller" - CRITICAL!
```

The **role** is most important because it determines:
- Which dashboard to show
- Whether to show "Sell Item" button
- Whether to allow access to /add-listing

---

## ❌ Common Response Errors

### Bad Format (WRONG ❌)
```json
{
  "user": {
    "id": "...",
    "role": "seller"
  },
  "token": "..."
}
```
**Problem**: Frontend looks for `data.data.user.role` and `data.token`

### Good Format (RIGHT ✅)
```json
{
  "status": "success",
  "token": "...",
  "data": {
    "user": {
      "id": "...",
      "role": "seller"
    }
  }
}
```

---

## 📊 Using in Other API Calls

Once logged in, use token for authenticated requests:

```javascript
const { user } = useAuth();

fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.token}`  // ← Use stored token
  },
  body: JSON.stringify({ name: "New Name" })
})
```

---

## ✅ Verification Checklist

When you test, verify:

- [ ] Signup response has `status: "success"`
- [ ] Signup response includes token
- [ ] Signup response has `data.data.user` object
- [ ] Role is in `data.data.user.role` (not `data.role`)
- [ ] Login response has same format
- [ ] Error responses include `message` field
- [ ] Token is valid JWT format
- [ ] User data is complete

---

## 🧪 Test with Backend Directly

```bash
# Test Signup
curl -X POST http://localhost:5050/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "role":"seller"
  }'

# Expected response:
# {
#   "status": "success",
#   "token": "...",
#   "data": { "user": { ... } }
# }

# Test Login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

---

**Your backend auth is already configured to return responses in this format!** ✅

The `createSendToken` function in `authcontroller.js` handles all this automatically.

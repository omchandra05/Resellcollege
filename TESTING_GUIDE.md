# Quick Reference - Role-Based Login Testing

## 🚀 Quick Start

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

Open: http://localhost:5173

---

## 📋 Test Cases

### Test 1: Signup as Seller
```
URL: http://localhost:5173/signup
Form:
  - Name: "Alice Seller"
  - Email: "alice@seller.com"
  - Password: "password123"
  - Role: Select "I am a Seller"

Expected Result:
  ✓ Redirects to /profile
  ✓ Shows SellerDashboard (with "List New Item" button)
  ✓ Navbar shows "Sell Item" button
  ✓ Can access /add-listing
```

### Test 2: Signup as Buyer
```
URL: http://localhost:5173/signup
Form:
  - Name: "Bob Buyer"
  - Email: "bob@buyer.com"
  - Password: "password123"
  - Role: Select "I am a Buyer"

Expected Result:
  ✓ Redirects to home (/)
  ✓ /profile shows BuyerProfile (with tabs: Account, Purchases, Wishlist)
  ✓ Navbar does NOT show "Sell Item" button
  ✓ Cannot access /add-listing (shows "Access Denied")
```

### Test 3: Login with Existing Account
```
URL: http://localhost:5173/login
Form:
  - Email: "alice@seller.com"
  - Password: "password123"

Expected Result:
  ✓ Redirects to /profile
  ✓ Shows correct dashboard based on role
  ✓ User persists on page refresh
  ✓ Logout clears user data
```

### Test 4: Session Persistence
```
Actions:
  1. Login to seller account
  2. Refresh page (F5)
  3. Check /profile
  
Expected Result:
  ✓ User still logged in
  ✓ Profile data intact
  ✓ No redirect to login
```

### Test 5: Protected Routes
```
Actions (as logged-out user):
  1. Try to access /profile → Should redirect to /login
  2. Try to access /add-listing → Should redirect to /login
  3. Try to access /chat → Should redirect to /login

Actions (as buyer):
  1. Try to access /add-listing → Should show "Access Denied"
  2. Can access /profile → Shows BuyerProfile
```

---

## 🔍 What to Check in Browser

### Console (F12)
```
✓ No CORS errors
✓ No network errors on login
✓ API responses visible in Network tab
```

### LocalStorage (DevTools > Application > LocalStorage)
```
After login, should contain:
  Key: 'user'
  Value: {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "seller" or "buyer",
    "token": "..."
  }
```

### Network Tab (F12 > Network)
```
On signup/login:
  POST http://localhost:5050/api/auth/signup
  POST http://localhost:5050/api/auth/login
  
Response should be:
  {
    "status": "success",
    "token": "jwt_token...",
    "data": {
      "user": {
        "id": "...",
        "name": "...",
        "email": "...",
        "role": "buyer" or "seller",
        ...
      }
    }
  }
```

---

## 🎨 Visual Checklist

### Seller Dashboard
- [ ] Header shows username
- [ ] "List New Item" button visible
- [ ] Stats cards show (Active Listings, Total Sales, Views, Messages, Total Items)
- [ ] Recent Listings table visible
- [ ] Tabs work (Dashboard, My Listings, Settings)
- [ ] Navbar shows "Sell Item" button

### Buyer Profile
- [ ] Avatar displayed
- [ ] Account Settings tab shows form
- [ ] Purchases tab shows empty state
- [ ] Wishlist tab shows empty state
- [ ] Edit button works to enable form editing
- [ ] Navbar does NOT show "Sell Item" button

### Navigation
- [ ] Logged-out: Shows "Login" and "Join" buttons
- [ ] Logged-in: Shows user profile icon and "Sell Item" (if seller)
- [ ] Logout button works

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| CORS error on login | Backend not running | Run `npm run dev` in /server |
| Login page redirects to /api/auth/login | Browser URL bar issue | Ignore, it's client-side |
| User not persisting on refresh | localStorage issue | Check DevTools > Application > LocalStorage |
| Profile shows blank | Loading state not finished | Wait for loading to complete or refresh |
| "Access Denied" on /add-listing as buyer | Role-based protection working | This is correct behavior! |
| Cannot find module API_ENDPOINTS | Import missing | Ensure `import { API_ENDPOINTS } from '../api/config'` |

---

## 📊 Backend Testing (Optional)

Use Postman or curl to test backend directly:

### Signup
```bash
curl -X POST http://localhost:5050/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "role":"seller"
  }'
```

### Login
```bash
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

---

## ✅ Verification Checklist

Before deploying:
- [ ] Signup creates user with correct role
- [ ] Login redirects based on role
- [ ] Profile displays correct dashboard
- [ ] Protected routes work correctly
- [ ] User persists on refresh
- [ ] Logout clears data
- [ ] Seller sees "Sell Item" button
- [ ] Buyer cannot access /add-listing
- [ ] No CORS errors
- [ ] All API calls use correct endpoint

---

**Ready to test!** Follow the test cases above to verify everything works. 🎉

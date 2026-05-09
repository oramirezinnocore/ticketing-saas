# Quick Start Guide - Ticketing SaaS

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+
- MongoDB running locally
- MercadoPago sandbox account

---

## Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ticketing-saas
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
JWT_EXPIRES_IN=7d
MERCADOPAGO_ACCESS_TOKEN=TEST-your-token-here
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret-32-chars
FRONTEND_URL=http://localhost:5173
EOF

# Start backend
npm run dev
```

**Expected Output:**
```
✓ Connected to MongoDB
✓ Server running on port 3000
✓ Health check: http://localhost:3000/health
```

---

## Step 2: Frontend Setup (2 minutes)

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000/api/v1
EOF

# Start frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Step 3: Create Test Data (1 minute)

### Register a User
Visit: http://localhost:5173/register

- Name: Test User
- Email: test@example.com
- Password: password123

### Create Organizer Account (Automated)

**Easy Way - Seed Script:**
```bash
cd backend
npm run seed:organizer
```

This creates an organizer with:
- Email: `organizer@test.com`
- Password: `Organizer123!`
- Role: `organizer`

**Manual Way (Alternative):**
```bash
# Register via UI then update role in MongoDB
mongosh ticketing-saas
db.users.updateOne(
  { email: "your-organizer@example.com" },
  { $set: { role: "organizer" } }
)
```

For more seeding options, see [backend/SEEDING.md](backend/SEEDING.md)

### Create Test Event

1. Login as organizer at http://localhost:5173/login
2. Go to http://localhost:5173/organizer
3. Click "Create Event"
4. Fill in:
   - Title: "Tech Conference 2024"
   - Description: "Annual tech conference"
   - Date: (any future date)
   - Ticket Types:
     - General: $50, qty 100
     - VIP: $150, qty 20

---

## Step 4: Test Complete Flow

### Purchase Flow
1. **Browse** → http://localhost:5173/events
2. **Select** → Click on event → Choose tickets
3. **Checkout** → Click "Buy Tickets"
4. **Login** → Login/Register if not authenticated
5. **Pay** → Click "Proceed to Payment"
6. **MercadoPago** → Use test card (see below)
7. **Tickets** → View at http://localhost:5173/tickets

### MercadoPago Test Card

**Approved Payment:**
- Card: `5031 7557 3453 0604`
- CVV: `123`
- Expiry: `12/25`
- Name: `APRO`

---

## ✅ Verification Checklist

- [ ] Backend health check responds: http://localhost:3000/health
- [ ] Frontend loads: http://localhost:5173
- [ ] Can register new user
- [ ] Can login
- [ ] Can see events list
- [ ] Can view event details
- [ ] Can select tickets
- [ ] Can checkout (creates order)
- [ ] Gets redirected to MercadoPago
- [ ] Can complete payment
- [ ] Sees success page
- [ ] Tickets appear in wallet

---

## 📁 Project Structure

```
ticketing-saas/
├── backend/              # Express API
│   ├── src/
│   ├── package.json
│   └── .env             # ← Create this
├── frontend/            # React App
│   ├── src/
│   ├── package.json
│   └── .env             # ← Create this
└── docs/                # Documentation
```

---

## 🔧 Common Issues

### Issue: Backend won't start

**Error:** `Cannot connect to MongoDB`

**Fix:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or on Linux
sudo systemctl start mongod
```

---

### Issue: Frontend can't reach backend

**Error:** `Network Error` in browser console

**Fix:**
1. Check backend is running on port 3000
2. Verify `VITE_API_BASE_URL` in `frontend/.env`
3. Check CORS settings in backend

---

### Issue: JWT token errors

**Error:** `Invalid token` or `Token expired`

**Fix:**
1. Clear browser localStorage
2. Login again
3. Verify `JWT_SECRET` is set in backend `.env`

---

### Issue: Payment webhook not working

**For Local Development:**

```bash
# Install ngrok
brew install ngrok  # or npm install -g ngrok

# Start tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Configure in MercadoPago:
# https://abc123.ngrok.io/api/v1/payments/webhook
```

---

## 🎯 Testing Scenarios

### 1. Happy Path
- Register → Browse → Select → Checkout → Pay → Success → View Tickets

### 2. Pending Payment
- Use test card with name `CONT`
- Verify pending page shows
- Check auto-polling works

### 3. Failed Payment
- Use test card with name `OTHE`
- Verify failure page shows
- Test retry button

### 4. Expired Order
- Create order
- Wait 15+ minutes
- Verify cannot pay
- Check inventory released

### 5. Unauthenticated Access
- Try to access `/tickets` without login
- Verify redirects to login
- After login, verify redirects back

---

## 📚 Documentation

- **Setup Guide:** `SETUP_GUIDE.md`
- **Checkout Flow:** `CHECKOUT_FLOW.md`
- **Flow Diagrams:** `CHECKOUT_FLOW_DIAGRAM.md`
- **Implementation:** `IMPLEMENTATION_SUMMARY.md`

---

## 🎨 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Home with featured events |
| `/events` | Browse all events |
| `/events/:id` | Event details + ticket selector |
| `/checkout/:orderId` | Order review + payment |
| `/payment/success` | Payment success callback |
| `/payment/pending` | Payment pending callback |
| `/payment/failure` | Payment failure callback |
| `/tickets` | User's ticket wallet |
| `/login` | User login |
| `/register` | User registration |
| `/organizer` | Organizer dashboard |

---

## 🔑 Default Credentials

### Test User
- Email: test@example.com
- Password: password123

### Organizer
- Email: organizer@example.com
- Password: password123

---

## 🛠 Development Commands

### Backend
```bash
npm run dev        # Start with hot reload
npm run build      # Build for production
npm start          # Run production build
npm run lint       # Lint code
npm run type-check # Check TypeScript
```

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
npm run type-check # Check TypeScript
```

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api/v1 |
| Health Check | http://localhost:3000/health |
| MongoDB | mongodb://localhost:27017 |

---

## 🎓 Next Steps

1. **Customize:** Update branding, colors, copy
2. **Extend:** Add features from roadmap
3. **Deploy:** Follow deployment guide
4. **Monitor:** Set up error tracking
5. **Scale:** Add caching, CDN, load balancing

---

## 💡 Pro Tips

1. **Use MongoDB Compass** for database GUI
2. **Install React DevTools** for debugging
3. **Use Postman** for API testing
4. **Enable source maps** in production for debugging
5. **Set up git hooks** for pre-commit checks

---

## 📞 Getting Help

1. Check error logs in terminal
2. Check browser console for frontend errors
3. Review `SETUP_GUIDE.md` for detailed instructions
4. Test with MercadoPago sandbox first
5. Verify all environment variables are set

---

## 🎉 You're Ready!

Your ticketing platform is now running. Start creating events and selling tickets!

**Happy coding! 🚀**

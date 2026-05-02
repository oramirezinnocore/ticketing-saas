# Installation Checklist

Follow these steps to get the backend running.

## Prerequisites

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] MongoDB v6+ installed and running
- [ ] Git installed

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

**Expected output:**
```
added XXX packages
```

### 2. Setup Environment

```bash
cp .env.example .env
```

**Edit `.env` file:**

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketing-saas
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional (defaults provided)
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> ⚠️ **Important**: Change `JWT_SECRET` to a strong random string in production

### 3. Verify MongoDB

```bash
# Check if MongoDB is running
mongosh

# Expected: MongoDB shell connects successfully
```

If MongoDB is not installed:

**macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community

**Cloud Option:**
Use MongoDB Atlas: https://www.mongodb.com/cloud/atlas

### 4. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📝 Environment: development
🔗 Health check: http://localhost:5000/health
```

### 5. Test the Setup

**Option 1: Browser**
Navigate to: http://localhost:5000/health

**Option 2: cURL**
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-05-01T...",
    "uptime": 1.234
  }
}
```

### 6. Verify Auth Endpoints

```bash
# Register endpoint (placeholder)
curl -X POST http://localhost:5000/api/v1/auth/register

# Login endpoint (placeholder)
curl -X POST http://localhost:5000/api/v1/auth/login

# Verify endpoint (placeholder)
curl http://localhost:5000/api/v1/auth/verify
```

All should return placeholder messages.

## Common Issues

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**

1. Check if MongoDB is running:
```bash
mongosh
```

2. Verify MONGODB_URI in .env:
```env
MONGODB_URI=mongodb://localhost:27017/ticketing-saas
```

3. For MongoDB Atlas, use connection string from dashboard

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error:** Type checking errors

**Solution:**
```bash
npm run type-check
```

Check [tsconfig.json](tsconfig.json) for configuration.

## Verification Checklist

After installation, verify:

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] MongoDB connection successful
- [ ] All auth endpoints respond (placeholders)
- [ ] Hot reload works (change a file, server restarts)
- [ ] TypeScript compilation works (`npm run build`)
- [ ] Linting passes (`npm run lint`)

## Development Tools

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

After successful installation:

1. Read [README.md](README.md) for full documentation
2. Review [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand architecture
3. Check [SETUP.md](SETUP.md) for quick commands
4. Start implementing features in modules

## Production Deployment

Before deploying to production:

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Enable SSL/TLS for MongoDB connection
- [ ] Review and adjust rate limiting settings
- [ ] Set up proper CORS origin
- [ ] Configure proper logging
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure reverse proxy (nginx, Apache)
- [ ] Enable HTTPS

## Support

If you encounter issues:

1. Check [README.md](README.md) troubleshooting section
2. Verify all prerequisites are installed
3. Check logs for specific error messages
4. Review .env configuration

## Summary

You now have:

✅ Complete backend structure (32 TypeScript files, 541 lines)
✅ Express server with TypeScript
✅ MongoDB connection
✅ Global error handling
✅ Security middlewares (CORS, Helmet, Rate Limiting)
✅ Health check endpoint
✅ 6 module structures (auth, users, events, tickets, orders, payments)
✅ Production-ready architecture
✅ Development tools (ESLint, Prettier)

The foundation is ready for feature implementation!

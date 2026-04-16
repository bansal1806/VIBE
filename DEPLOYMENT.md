# Vibe Platform - Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (via Supabase or self-hosted)
- [ ] Redis instance (local or cloud)
- [ ] Domain name configured
- [ ] Vercel account (or alternative hosting)

---

## Step 1: Environment Configuration

### Required Environment Variables

Create `.env.local` in your project root:

```bash
# Database (Supabase or PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/vibe"
SHADOW_DATABASE_URL="postgresql://user:password@host:5432/vibe_shadow"

# Redis
REDIS_URL="redis://localhost:6379"
WORKER_CONCURRENCY="5"

# Supabase (for Storage & Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Authentication JWT
JWT_SECRET="generate-a-secure-random-string-min-32-chars"
JWT_EXPIRY="7d"

# Email Service (Choose ONE)
# Option 1: SMTP (Gmail with App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Option 2: SendGrid (Recommended for production)
# SENDGRID_API_KEY="SG.your-api-key"

# Option 3: AWS SES
# AWS_SES_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="your-access-key"
# AWS_SECRET_ACCESS_KEY="your-secret-key"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_FEATURE_ADS="1"
```

### How to Generate Values:

**JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords

**Supabase Setup:**
1. Go to https://supabase.com
2. Create new project
3. Copy URL and keys from Settings > API

---

## Step 2: Database Setup

### Initialize Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### Supabase Storage Buckets

Create these buckets in Supabase Dashboard > Storage:

1. **avatars** (public)
2. **media** (public)
3. **timecapsules** (public)

Set policies to allow authenticated reads and user-specific writes.

---

## Step 3: Redis Setup

### Local Development:
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7

# Or install locally
# Windows: https://github.com/microsoftarchive/redis/releases
# Mac: brew install redis
# Linux: sudo apt-get install redis-server
```

### Production:
Consider managed Redis services:
- Upstash (recommended, free tier)
- Redis Cloud
- AWS ElastiCache

---

## Step 4: BullMQ Worker

The worker handles background jobs (room expiry, timecapsule unlocks).

### Local Development:
```bash
npm run worker
```

### Production:
Deploy as separate service or use serverless:
- Vercel Cron Jobs
- AWS Lambda with EventBridge
- Separate Docker container

---

## Step 5: Build & Test

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build
npm run build

# Test locally
npm run start
```

---

## Step 6: Deployment (Vercel)

### Initial Setup:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Production Deployment:
```bash
vercel --prod
```

### Environment Variables in Vercel:
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add all variables from `.env.local`
3. Set for Production, Preview, and Development

### Custom Domain:
1. Vercel Dashboard > Domains
2. Add your domain
3. Configure DNS (follow Vercel's instructions)

---

## Step 7: Post-Deployment Tasks

### SSL Certificate
- ✅ Automatically handled by Vercel
- Or configure via Cloudflare

### Analytics (Optional)
- Google Analytics
- Plausible
- Mixpanel

### Error Tracking (Optional)
- Sentry.io integration
- LogRocket for session replay

### Push Notifications (Optional)
Requires Firebase Cloud Messaging setup:
1. Create Firebase project
2. Add web app
3. Get FCM credentials
4. Update notification code with Firebase SDK

---

## Step 8: Monitoring

### Health Checks
Monitor these endpoints:
- `/api/health` (create this)
- Database connectivity
- Redis connectivity
- Worker job processing

### Logs
- Vercel Dashboard > Logs
- Set up log aggregation (Logtail, Datadog)

---

## Step 9: Performance Optimization

### Image Optimization
- ✅ Already using Next.js Image component
- ✅ Supabase Storage auto-optimizes

### Code Splitting
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

### Caching
- ✅ Redis caching implemented
- Configure CDN (Cloudflare, Vercel Edge)

---

## Step 10: Security Hardening

### Rate Limiting
Add middleware for:
- API endpoints: 100 requests/min per IP
- Authentication: 5 attempts/min per email
- File uploads: 10 uploads/hour per user

### Content Security Policy
Add to `next.config.js`:
```javascript
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  }
]
```

### CORS Configuration
Only allow your domain in production.

---

## Troubleshooting

### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Database Connection Issues
- Check DATABASE_URL format
- Ensure IP whitelist (Supabase)
- Test connection: `npx prisma db pull`

### Redis Connection Issues
- Verify REDIS_URL
- Check firewall rules
- Test: `redis-cli ping`

---

## Rollback Plan

### Version Control
```bash
# Tag releases
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0
```

### Vercel Rollback
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## Estimated Deployment Time: 2-4 hours

**Breakdown:**
- Environment setup: 30min
- Database migration: 15min
- Supabase configuration: 30min
- Vercel deployment: 15min
- Testing & verification: 1-2 hours
- DNS & domain setup: 30min

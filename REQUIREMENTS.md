# What You Need to Provide for Production

## 🔑 Required Setup (All FREE)

### 1. **Email Service - SendGrid** ✅ RECOMMENDED
**Why**: 100 emails/day free, reliable, easy setup

**Steps:**
1. Create account at https://sendgrid.com
2. Verify your email
3. Go to Settings > API Keys
4. Create API key with "Full Access"
5. Copy the key (starts with `SG.`)
6. Set in `.env.local`:
   ```bash
   SENDGRID_API_KEY="SG.your-api-key-here"
   ```

**Cost**: FREE forever (100 emails/day)

**Note**: This is for SENDING emails (OTP codes). Your users will still sign up using their `.edu.in` emails!

---

### 2. **Supabase** (Database & Storage) ✅ RECOMMENDED
**Why**: Free tier is generous, handles database + file storage + real-time

**Steps:**
1. Create account at https://supabase.com
2. Click "New Project"
3. Choose a name, set database password, select region (closest to India: Mumbai/Singapore)
4. Wait ~2 minutes for project creation
5. Go to Settings > API
6. Copy these three values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
   ```
7. Go to Settings > Database
8. Copy Connection String (URI mode):
   ```bash
   DATABASE_URL="postgresql://postgres:your-password@xxxxx.supabase.co:5432/postgres"
   ```
9. Go to Storage > Create new bucket (3 times):
   - Name: `avatars`, Public: ✅
   - Name: `media`, Public: ✅
   - Name: `timecapsules`, Public: ✅

**Cost**: FREE (500MB database, 1GB storage, 2GB bandwidth)

---

### 3. **Redis - Upstash** ✅ RECOMMENDED
**Why**: Free tier, no credit card required, serverless

**Steps:**
1. Create account at https://upstash.com
2. Click "Create Database"
3. Choose any region (closest to your deployment)
4. Free tier should be pre-selected
5. Click "Create"
6. Copy the connection URL:
   ```bash
   REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:6379"
   ```

**Cost**: FREE (10,000 commands/day)

---

### 4. **Generate JWT Secret** 🔐
Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set:
```bash
JWT_SECRET="paste-the-long-random-string-here"
```

**Cost**: FREE (you generate it yourself)

---

## � Complete `.env.local` Template

Create a file called `.env.local` in your project root and fill in:

```bash
# ===== DATABASE (from Supabase) =====
DATABASE_URL="postgresql://postgres:PASSWORD@xxxxx.supabase.co:5432/postgres"
SHADOW_DATABASE_URL="postgresql://postgres:PASSWORD@xxxxx.supabase.co:5432/postgres"

# ===== REDIS (from Upstash) =====
REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:6379"
WORKER_CONCURRENCY="5"

# ===== SUPABASE (from Supabase Dashboard) =====
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."

# ===== AUTHENTICATION =====
JWT_SECRET="your-generated-secret-here"
JWT_EXPIRY="7d"

# ===== EMAIL (from SendGrid) =====
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxx"

# ===== APP CONFIGURATION =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FEATURE_ADS="1"
```

---

## 💡 Important Notes

### About Email Domains
- **SendGrid is for SENDING emails** (verification codes, notifications)
- **Your users will still sign up with `.edu.in` emails**
- Example: A student enters `student@college.edu.in` → SendGrid sends them the OTP

### Why These Services?
✅ **All have free tiers**
✅ **No credit card required initially**
✅ **Sufficient for 100-1000 users**
✅ **Easy to upgrade later if needed**

### Service Limits (Free Tier)
- **SendGrid**: 100 emails/day (enough for ~50 signups/day)
- **Supabase**: 500MB database, 1GB storage (enough for ~500 users with photos)
- **Upstash**: 10,000 Redis operations/day (enough for moderate traffic)

---

## ⏱️ Setup Time Estimate

- **SendGrid**: 5 minutes
- **Supabase**: 10 minutes (includes creating buckets)
- **Upstash Redis**: 5 minutes
- **JWT Secret**: 30 seconds
- **Fill `.env.local`**: 5 minutes

**Total: ~25 minutes** ⚡

---

## 🧪 After Setup - Test Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **In another terminal, start worker**:
   ```bash
   npm run worker
   ```

5. **Visit**: http://localhost:3000

6. **Test signup**:
   - Enter any `.edu.in` email
   - Check SendGrid Activity Feed for sent email
   - Use the OTP code to complete signup

---

## 🚨 Common Issues

### "SendGrid API Key Invalid"
- Make sure you copied the entire key (starts with `SG.`)
- Check for extra spaces in `.env.local`
- Verify from SendGrid dashboard: Settings > API Keys

### "Cannot connect to database"
- Check DATABASE_URL has correct password
- Ensure Supabase project is active (not paused)
- Verify IP is whitelisted (Supabase allows all by default)

### "Redis connection failed"
- Copy the full URL from Upstash (including password)
- Make sure you selected Redis (not Kafka)
- Check firewall isn't blocking port 6379

### "Build errors"
Clear everything and start fresh:
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## ✅ Checklist Before Production

- [ ] SendGrid account created, API key copied
- [ ] Supabase project created, all 4 values copied
- [ ] Upstash Redis created, URL copied
- [ ] JWT secret generated
- [ ] All values pasted in `.env.local`
- [ ] Storage buckets created (avatars, media, timecapsules)
- [ ] `npm install` completed
- [ ] `npx prisma migrate dev` completed
- [ ] `npm run dev` works without errors
- [ ] Test signup with `.edu.in` email works
- [ ] OTP email received successfully

---

## 💰 Cost Breakdown

**Total Monthly Cost: $0** 🎉

When you outgrow free tiers:
- SendGrid: $15/month (40,000 emails)
- Supabase: $25/month (8GB database)
- Upstash: ~$10/month (pay per use)

But free tier should handle **500-1000 active users** easily!

---

## 🚀 Next Steps After Local Testing

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Deploying to Vercel (free)
- Setting up custom domain
- Production environment configuration
- Monitoring and analytics

---

**Need Help?** 
- SendGrid Docs: https://docs.sendgrid.com
- Supabase Docs: https://supabase.com/docs
- Upstash Docs: https://docs.upstash.com

**Ready?** Complete the checklist above, then run `npm run dev`! 🎯

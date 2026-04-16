# Vibe - Campus Connection Platform 🎓✨

A modern, engaging campus networking platform that combines professional networking with casual social discovery, designed specifically for Gen Z college students. Think LinkedIn meets Tinder, but built exclusively for campus communities.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-Private-red)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [Core Features Deep Dive](#-core-features-deep-dive)
- [API Routes](#-api-routes)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

**Vibe** is a hyperlocal campus networking platform that revolutionizes how college students connect, collaborate, and build relationships. By combining privacy-first features with engaging discovery mechanisms, Vibe creates a safe, verified community for meaningful campus connections.

### What Makes Vibe Different?

- 🎯 **Hyperlocal Focus**: Location-based real-time connections that matter
- 🔒 **Privacy-First**: Studio alias system for gradual identity revelation
- ⏰ **Ephemeral Rooms**: Temporary spaces that auto-disappear
- 📦 **Timecapsule Tradition**: Semester-to-semester legacy content
- ✅ **Campus Verified**: Safe community through .edu email verification
- 🎨 **Gen Z Ready**: Beautiful, modern UI/UX with smooth animations

---

## 🚀 Key Features

### 1. **Swipe Deck Discovery**
Unified feed where students can discover:
- Other students (networking & dating)
- Campus events (hackathons, workshops, socials)
- Active Now Rooms (hyperlocal gatherings)

**Key Mechanics:**
- Swipe right to connect/RSVP
- Swipe left to pass
- Super swipe for priority matching
- Smart algorithm learns preferences

### 2. **Hyperlocal Now Rooms (HLR)**
Temporary, proximity-based rooms that appear when you're nearby:
- Study groups at library
- Pickup sports at field
- Coffee meetups at cafe
- Party announcements

**Features:**
- Auto-disappear after event
- Max capacity limits
- Real-time participant tracking
- AR radar for room discovery

### 3. **Dual Identity (Studio Alias)**
Privacy-first approach to networking:
- Create a "studio alias" (username/avatar)
- Real identity gradually unlocks through:
  - Message milestones
  - Mutual friends
  - Time-based reveals
  - Consent-based unlocking

### 4. **Timecapsules**
Semester-to-semester legacy content:
- Seniors create capsules with advice, memes, resources
- Auto-unlock for freshmen next semester
- Browse historical campus culture
- Leave your mark on campus forever

### 5. **Campus Verification**
Ensures safe, verified community:
- `.edu` or `.edu.in` email required
- OTP-based verification
- University-specific communities
- Admin moderation tools

### 6. **Smart Matching & Discovery**
Intelligent algorithms for better connections:
- Interest-based matching
- Schedule compatibility
- Course overlap detection
- Friend-of-friend priority

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and better DX
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations & gestures
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[TanStack Query](https://tanstack.com/query)** - Data fetching & caching

### Backend
- **[Prisma](https://www.prisma.io/)** - Modern ORM for database management
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (storage, auth, realtime)
- **[Redis](https://redis.io/)** - Caching & session management
- **[BullMQ](https://docs.bullmq.io/)** - Background job processing

### Email & Communication
- **[Nodemailer](https://nodemailer.com/)** - Email service (SMTP)
- **[SendGrid](https://sendgrid.com/)** - Scalable email delivery (optional)
- **[AWS SES](https://aws.amazon.com/ses/)** - Alternative email service (optional)

### Authentication & Security
- **[JWT](https://jwt.io/)** - Secure token-based authentication
- **[Zod](https://zod.dev/)** - Runtime type validation
- Custom middleware for rate limiting & CORS

---

## 🎯 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Redis** instance (local or cloud)
- **Git** for version control

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/vibe.git
cd vibe

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp env.example .env.local
# Edit .env.local with your actual credentials

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev --name init

# 6. Start Redis (if using Docker)
docker run -d -p 6379:6379 redis:7

# 7. Start development server
npm run dev

# 8. In another terminal, start the background worker
npm run worker
```

Visit [http://localhost:3000](http://localhost:3000) to see your app! 🎉

---

## 📁 Project Structure

```
vibe/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Authenticated app routes
│   │   ├── app/                 # Main application pages
│   │   │   ├── chat/           # Chat & messaging
│   │   │   ├── hlr/            # Hyperlocal Now Rooms
│   │   │   ├── profile/        # User profiles
│   │   │   ├── swipe/          # Swipe deck
│   │   │   └── timecapsules/   # Timecapsule viewing
│   │   └── layout.tsx          # App layout wrapper
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/              # Login page
│   │   └── onboarding/         # New user onboarding
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── chat/               # Chat endpoints
│   │   ├── hlr/                # Now Rooms endpoints
│   │   ├── profile/            # Profile endpoints
│   │   ├── swipe/              # Swipe deck endpoints
│   │   └── timecapsules/       # Timecapsule endpoints
│   ├── revenue/                 # Revenue model pages
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── profile/                 # Profile-specific components
│   ├── providers/               # Context providers
│   ├── ARRadar.tsx             # AR room discovery
│   ├── ChatView.tsx            # Chat interface
│   ├── HLRView.tsx             # Now Rooms view
│   ├── SwipeDeck.tsx           # Swipe interface
│   ├── TimecapsulesView.tsx    # Timecapsule browser
│   └── ...                      # Other components
├── lib/                          # Utility libraries
│   ├── supabase/                # Supabase client & types
│   ├── realtime/                # Real-time features
│   ├── prisma.ts               # Prisma client
│   ├── redis.ts                # Redis client
│   └── ...                      # Other utilities
├── prisma/                       # Database schema & migrations
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── jobs/                         # Background job definitions
│   └── worker.ts               # BullMQ worker
├── docs/                         # Additional documentation
├── .env.local                   # Environment variables (gitignored)
├── env.example                  # Environment template
├── DEPLOYMENT.md                # Deployment guide
├── REQUIREMENTS.md              # Setup requirements
├── TESTING.md                   # Testing documentation
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 🔧 Environment Setup

### Step 1: Create `.env.local`

Copy the example file and fill in your credentials:

```bash
cp env.example .env.local
```

### Step 2: Required Services

You'll need accounts for these services (all have free tiers):

#### **1. Supabase** (Database & Storage)
- Sign up at [https://supabase.com](https://supabase.com)
- Create a new project
- Copy credentials from Settings → API
- Create storage buckets: `avatars`, `media`, `timecapsules`

#### **2. Redis** (Caching & Jobs)
Choose one:
- **Local**: `brew install redis` or Docker
- **Cloud**: [Upstash](https://upstash.com) (recommended, free tier)

#### **3. Email Service** 
Choose one:
- **SMTP** (Gmail with app password)
- **SendGrid** (100 emails/day free)
- **AWS SES** (production scale)

#### **4. Generate JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Complete `.env.local`

```bash
# Database (from Supabase)
DATABASE_URL="postgresql://postgres:PASSWORD@xxxxx.supabase.co:5432/postgres"
SHADOW_DATABASE_URL="postgresql://postgres:PASSWORD@xxxxx.supabase.co:5432/postgres"

# Redis (from Upstash or local)
REDIS_URL="redis://default:xxxxx@xxxxx.upstash.io:6379"
WORKER_CONCURRENCY="5"

# Supabase (from Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Authentication
JWT_SECRET="your-generated-secret-here"
JWT_EXPIRY="7d"

# Email (choose one method)
SENDGRID_API_KEY="SG.xxxxx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_FEATURE_ADS="1"
```

📚 **Detailed Setup Guide**: See [REQUIREMENTS.md](./REQUIREMENTS.md) for step-by-step instructions.

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run worker       # Start background job worker

# Building
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open database GUI
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate  # Regenerate Prisma client
```

### Development Workflow

1. **Start Redis** (if local):
   ```bash
   redis-server
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```

3. **Start Worker** (in separate terminal):
   ```bash
   npm run worker
   ```

4. **Make Changes** and see live reload at http://localhost:3000

5. **Test Features**:
   - Create account with `.edu.in` email
   - Verify OTP (check email or SendGrid activity)
   - Complete onboarding
   - Explore swipe deck, rooms, timecapsules

---

## 🚀 Deployment

### Vercel (Recommended)

Vibe is optimized for deployment on [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Deploy!

### Background Worker

The BullMQ worker needs to run separately:

**Options:**
- **Vercel Cron Jobs** (for simple tasks)
- **Separate service** (Railway, Render, Fly.io)
- **Docker container** (self-hosted)

📚 **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎨 Core Features Deep Dive

### Swipe Deck Algorithm

The swipe deck shows a curated feed of:
1. **People**: Based on interests, courses, mutual friends
2. **Events**: Campus-relevant, time-sensitive
3. **Rooms**: Currently active HLRs you can join

**Personalization:**
- ML-based preference learning
- Diversity injection (prevent echo chambers)
- Re-ranking based on activity times

### Hyperlocal Now Rooms (HLR)

**Creation Flow:**
1. User creates room with location, max capacity, duration
2. Room appears in AR radar for nearby students
3. Students can request to join
4. Creator approves/rejects requests
5. Room auto-expires after duration

**Technical:**
- Geofencing with 500m-2km radius
- WebSocket real-time updates
- Redis for fast proximity queries
- Auto-cleanup via BullMQ delayed jobs

### Studio Alias System

**Privacy Gradient:**
- **Level 0**: Only alias visible
- **Level 1**: First name revealed (after 10 messages)
- **Level 2**: Profile picture revealed (after 50 messages)
- **Level 3**: Full profile unlocked (mutual consent)

**Implementation:**
- Dual identity stored in database
- Progressive unlock tracked per connection
- Middleware enforces visibility rules

### Timecapsules

**Lifecycle:**
1. Senior creates capsule with content
2. Sets unlock date (e.g., next semester start)
3. BullMQ schedules unlock job
4. Freshmen receive notification when unlocked
5. Browse historical capsules by year/semester

---

## 📡 API Routes

### Authentication (`/api/auth/*`)
- `POST /api/auth/send-otp` - Send verification code
- `POST /api/auth/verify-otp` - Verify and create session
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user

### Profile (`/api/profile/*`)
- `GET /api/profile/:id` - Get user profile
- `PATCH /api/profile` - Update own profile
- `POST /api/profile/avatar` - Upload avatar
- `GET /api/profile/alias` - Get studio alias

### Swipe Deck (`/api/swipe/*`)
- `GET /api/swipe/feed` - Get personalized feed
- `POST /api/swipe/action` - Record swipe action
- `GET /api/swipe/matches` - Get mutual matches

### HLR / Now Rooms (`/api/hlr/*`)
- `GET /api/hlr/nearby` - Get rooms near location
- `POST /api/hlr/create` - Create new room
- `POST /api/hlr/:id/join` - Request to join room
- `DELETE /api/hlr/:id` - Delete own room

### Chat (`/api/chat/*`)
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/:id/messages` - Get messages
- `POST /api/chat/:id/send` - Send message
- `PATCH /api/chat/:id/read` - Mark as read

### Timecapsules (`/api/timecapsules/*`)
- `GET /api/timecapsules` - List unlocked capsules
- `POST /api/timecapsules/create` - Create capsule
- `GET /api/timecapsules/:id` - Get capsule content

---

## 🎨 Design System

### Color Palette
```css
--primary: #A855F7      /* Purple */
--secondary: #EC4899    /* Pink */
--background: #0F172A   /* Dark navy */
--surface: #1E293B      /* Lighter navy */
--text: #F1F5F9         /* Off-white */
```

### Typography
- **Headings**: System font stack (San Francisco, Segoe UI)
- **Body**: Inter, sans-serif
- **Code**: JetBrains Mono

### Components
- Glassmorphism effects (`backdrop-blur-xl`)
- Smooth animations (Framer Motion)
- Haptic feedback on interactions
- Skeleton loading states

---

## 🧪 Testing

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

**Quick Tests:**
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Type checking
npx tsc --noEmit
```

---

## 🤝 Contributing

This is currently a private project. For internal contributors:

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Make changes and commit: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

### Code Style
- Use TypeScript strictly
- Follow ESLint rules
- Write descriptive commit messages
- Add comments for complex logic

---

## 🐛 Troubleshooting

### Common Issues

**Build fails with Prisma errors:**
```bash
rm -rf node_modules .next
npm install
npx prisma generate
npm run build
```

**Redis connection timeout:**
- Check REDIS_URL is correct
- Ensure Redis is running: `redis-cli ping`
- Check firewall settings

**Email not sending:**
- Verify SMTP credentials
- Check SendGrid API key
- Look at email service dashboard for errors

**Database migration fails:**
```bash
# Reset database (WARNING: loses data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_issue
```

**Worker not processing jobs:**
- Ensure worker is running: `npm run worker`
- Check Redis connection
- Look for error logs in worker terminal

### Debug Mode

Enable detailed logging:
```bash
# Set in .env.local
DEBUG=true
NODE_ENV=development
```

---

## 📊 Investor Deck Highlights

### Market Opportunity
- **TAM**: 40M+ college students in India alone
- **Gen Z**: Most social-savvy generation, mobile-first
- **Pain Point**: Existing apps too broad or too dating-focused

### Unique Value Props
1. **Hyperlocal Rooms**: No competitor offers ephemeral location-based gathering spaces
2. **Privacy-First**: Studio alias system builds trust gradually
3. **Campus Verified**: Ensures safe, relevant community
4. **Timecapsules**: Creates nostalgic engagement & retention

### Monetization Strategy
- **Freemium**: Basic features free
- **Premium**: Super swipes, advanced filters, room priority ($4.99/mo)
- **Events**: Featured event placements for organizers
- **Sponsored Rooms**: Brand-sponsored campus activations

### Scalability
- Campus-by-campus rollout (viral within universities)
- Horizontal scaling via Vercel + Supabase
- Redis caching for performance
- Background jobs handle intensive tasks

---

## 📄 License

**Private - For Investor Demonstration Purposes**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## 🙏 Acknowledgments

Built with ❤️ for campus communities worldwide.

**Technologies:**
- Next.js team for the amazing framework
- Supabase for the generous free tier
- Prisma for making database work enjoyable
- Framer Motion for buttery-smooth animations
- The open-source community

---

## 📞 Contact & Support

For questions, feedback, or partnership inquiries:
- **Email**: contact@vibe.app (placeholder)
- **Documentation**: See `/docs` folder
- **Issues**: Internal team only

---

**Last Updated**: December 2025  
**Version**: 0.1.0 (MVP)  
**Status**: Active Development 🚧

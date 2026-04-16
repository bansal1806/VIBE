# Vibe Platform - Testing Guide

## 🧪 How to Test the Platform

### Prerequisites
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Redis running
- [ ] Email service configured

---

## Local Testing

### 1. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 2. Start Worker (Separate Terminal)
```bash
npm run worker
```

---

## Test Scenarios

### Authentication Flow
1. Go to `/onboarding`
2. Enter .edu email
3. Click "Send Code"
4. Check your configured email service for the OTP
5. Enter OTP
6. Complete profile setup

### Discovery & Matching
1. Complete onboarding
2. Go to `/app/discover`
3. Swipe on cards
4. Check for matches in notifications

### Now Rooms
1. Go to `/app/rooms`
2. Click "Create Room"
3. Join a room
4. Send messages
5. Check real-time updates

### Chat
1. Match with a user
2. Go to `/app/chat`
3. Send messages
4. Observe typing indicators

### Events
1. Go to `/app/events`
2. Browse events
3. RSVP to an event
4. Check notifications

### Timecapsules
1. Go to `/app/timecapsules`
2. Create a timecapsule
3. Set unlock date
4. View locked/unlocked capsules

### Profiles & Settings
1. Go to `/app/profile/settings`
2. Toggle notifications
3. Update privacy settings
4. Test blocking users

---

## Testing with Multiple Users

### Create Test Accounts
```bash
# User 1
email: student1@university.edu
alias: @student1

# User 2  
email: student2@university.edu
alias: @student2
```

### Test Scenarios:
1. **Matching**: Swipe like on each other
2. **Chat**: Send messages back and forth
3. **Rooms**: Join same room, chat together
4. **Trust Building**: Exchange messages, see profile unlock

---

## Performance Testing

### Check Page Load Times
```bash
npm run build
npm run start

# Open Chrome DevTools
# Network tab → Check load times
# Should be <2s for initial load
```

### Check Bundle Size
```bash
npm run build

# Look for warnings about large bundles
```

---

## Mobile Testing

1. Run local server
2. Get local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. On mobile, visit: `http://YOUR_IP:3000`
4. Test touch gestures, swipes, navigation

---

## Browser Testing

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Common Test Cases

### Happy Path
✅ User can sign up, complete profile, discover people, match, chat

### Error Handling
- Invalid email format
- Wrong OTP code
- Network errors
- File upload failures
- Rate limiting

### Edge Cases
- Very long messages
- Special characters in names
- Large file uploads
- Many simultaneous users in room

---

## Automated Testing (Future)

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

(Not yet implemented - would use Jest, React Testing Library, Playwright)

---

## Debugging Tips

### Enable Debug Logs
```javascript
// In any component
console.log('[Component]', data)
```

### Check Browser Console
- Errors appear in red
- Network requests in Network tab
- Local storage in Application tab

### Check Server Logs
- Vercel: Dashboard → Functions → Logs
- Local: Terminal output

### Database Inspection
```bash
npx prisma studio
```

Visit: http://localhost:5555

---

## Performance Benchmarks

### Target Metrics
- **Time to Interactive**: <3s
- **First Contentful Paint**: <1.5s
- **API Response Time**: <200ms
- **Real-time Latency**: <100ms

### Measuring
```bash
# Lighthouse
npm run build
npm run start
# Open Chrome DevTools → Lighthouse → Run

# Bundle analysis
npx @next/bundle-analyzer
```

---

## Security Testing

### Test Authentication
- Try accessing protected routes without login
- Test session expiry
- Try SQL injection in inputs
- Test rate limiting

### Test File Uploads
- Try uploading >10MB files (should fail)
- Try uploading non-image files to avatar
- Test malicious file names

### Test API Endpoints
- Try accessing without auth
- Try with invalid data
- Test rate limits

---

## Accessibility Testing

### Keyboard Navigation
- Tab through all elements
- Enter to activate buttons
- Escape to close modals

### Screen Reader
- Test with NVDA (Windows) or VoiceOver (Mac)
- Ensure all images have alt text
- Check heading hierarchy

### Color Contrast
- Use Chrome DevTools → Accessibility
- Ensure 4.5:1 contrast ratio

---

## User Acceptance Testing

### Recruit Beta Testers
- 10-20 students from target campus
- Mix of technical and non-technical

### Feedback Form
- What did you like?
- What was confusing?
- What features are you missing?
- Would you use this daily?

### Metrics to Track
- Sign-up completion rate
- Daily active users
- Average session time
- Feature usage stats

---

## Production Smoke Tests

After deployment, immediately test:
1. [ ] Homepage loads
2. [ ] Sign up flow works
3. [ ] Email verification works
4. [ ] File upload works
5. [ ] Can create/join rooms
6. [ ] Can send messages
7. [ ] No console errors

---

Ready to test! Start with the authentication flow and work your way through each feature. 🧪

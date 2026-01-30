# 🧪 Platform Testing Guide

## Automated Health Check

Run this after starting the platform to verify all services:

```powershell
# Check all containers are running
docker compose ps

# Should show:
# hackthebox_postgres   Up (healthy)
# hackthebox_redis      Up (healthy)
# hackthebox_backend    Up
# hackthebox_frontend   Up
```

## Manual Testing Checklist

### 1. Backend API Health
```powershell
# Should return 404 (means server is running)
curl http://localhost:3001/api
```

### 2. Frontend Loads
Open browser: http://localhost:3000
- [ ] Page loads without errors
- [ ] Dark theme is active
- [ ] "Hack The Box" title visible
- [ ] Redirects to login page

### 3. Authentication Flow

#### Register New User
1. Click "Don't have an account? Sign up"
2. Fill form:
   - Email: test@example.com
   - Username: testuser
   - Password: test123
3. Click "Sign Up"
4. [ ] Should redirect to dashboard
5. [ ] Shows "Welcome, testuser!"

#### Login Existing User
1. Logout (top right)
2. Login with:
   - Username: admin
   - Password: admin123
3. [ ] Redirects to dashboard
4. [ ] Shows "Welcome, admin!"
5. [ ] Admin button visible in nav

### 4. Team Functionality

#### Create Team
1. Go to Challenges page
2. In "Join or Create Team" card:
   - Enter team name: "Test Team Alpha"
   - Click "Create Team"
3. [ ] Team created successfully
4. [ ] Card disappears
5. [ ] Dashboard shows team name

#### Join Team (as different user)
1. Logout and register another user
2. Go to Challenges
3. Click "Join" on existing team
4. [ ] Joined successfully
5. [ ] Dashboard shows team name

### 5. Challenge Submission

#### View Challenges
1. Login as user with team
2. Go to Challenges page
3. [ ] Sees "Round 1: Decode the Secret"
4. [ ] Shows 3 challenges
5. [ ] Each shows points and description

#### Submit Correct Flag
1. Find "Base64 Basics" challenge
2. Enter flag: `HackTheBox2026`
3. Click "Submit"
4. [ ] Shows green success message
5. [ ] "Challenge Completed!" badge appears
6. [ ] Points added to team

#### Submit Wrong Flag
1. Find another unsolved challenge
2. Enter wrong flag: `wrongflag`
3. Click "Submit"
4. [ ] Shows red error message
5. [ ] "Incorrect flag" displayed
6. [ ] No points added

### 6. Scoreboard

#### View Rankings
1. Go to Scoreboard page
2. [ ] Shows teams ranked by points
3. [ ] Your team listed
4. [ ] Shows total points
5. [ ] Shows member count
6. [ ] Auto-refreshes every 10 seconds

#### Verify Real-time Updates
1. Open scoreboard in two browsers
2. Submit flag in browser 1
3. Wait 10 seconds
4. [ ] Scoreboard updates in browser 2

### 7. Admin Panel

#### Access Admin
1. Login as admin
2. Click "Admin" in nav
3. [ ] Admin dashboard loads
4. [ ] Shows statistics cards
5. [ ] Shows rounds management table

#### View Statistics
Check statistics cards show:
- [ ] Total Users: 6 (or more if you created users)
- [ ] Total Teams: 1+ (your test teams)
- [ ] Total Challenges: 6
- [ ] Total Submissions: 1+ (if you submitted flags)

#### Create New Round
1. Fill "Create New Round" form:
   - Name: Test Round
   - Type: DECODE_THE_SECRET
   - Order: 4
2. Click "Create Round"
3. [ ] Success alert appears
4. [ ] New round appears in table

#### Update Round Status
1. Find Round 2 in table
2. Click "Activate"
3. [ ] Status changes to ACTIVE
4. [ ] Challenges become visible to participants

#### Create New Challenge
1. Fill "Create New Challenge" form:
   - Round: Round 1
   - Title: Test Challenge
   - Description: This is a test
   - Points: 500
   - Order: 10
   - Flag: testflag123
2. Click "Create Challenge"
3. [ ] Success alert appears
4. [ ] Challenge visible in Challenges page

#### View Submissions
1. Scroll to "Recent Submissions" table
2. [ ] Shows your test submissions
3. [ ] Shows username, team, challenge
4. [ ] Shows correct/incorrect status
5. [ ] Shows points earned

### 8. Round Progression

#### Round 1 (Default Active)
1. Login as participant
2. [ ] Round 1 challenges visible
3. [ ] Round 2 challenges NOT visible
4. [ ] Can submit flags for Round 1

#### Activate Round 2
1. Login as admin
2. Go to Admin Panel
3. Activate Round 2
4. Logout, login as participant
5. [ ] Round 2 challenges now visible
6. [ ] Can submit flags for Round 2

#### Round 3 Auto-Lock
1. Activate Round 3 as admin
2. Submit correct flag for Round 3 challenge
3. [ ] Round immediately locks
4. [ ] Status changes to LOCKED
5. [ ] Other teams cannot submit

### 9. LAN Access Test

#### From Another Device
1. Find your machine's IP:
   ```powershell
   ipconfig
   ```
2. On another device (same network):
   - Open: http://YOUR_IP:3000
3. [ ] Platform loads
4. [ ] Can login
5. [ ] Full functionality works

### 10. Performance Test

#### Multiple Users
1. Open 5 different browsers/tabs
2. Register 5 different users
3. Create 5 different teams
4. Submit flags from all 5
5. [ ] All submissions process
6. [ ] Scoreboard shows all teams
7. [ ] No errors in any browser

#### Rapid Submissions
1. Submit flags quickly (5 in a row)
2. [ ] Rate limiting kicks in
3. [ ] Shows appropriate error
4. [ ] After 1 minute, can submit again

## 🐛 Common Issues & Solutions

### Backend Won't Start
```powershell
# Check logs
docker compose logs backend

# Common fix: database not ready
docker compose restart backend
```

### Database Connection Error
```powershell
# Wait 30 seconds, then
docker compose restart backend
```

### Frontend Can't Connect
```powershell
# Check NEXT_PUBLIC_API_URL in .env
# Should be: http://localhost:3001/api

# Restart after changing
docker compose down
docker compose up --build
```

### Port Already in Use
```powershell
# Stop conflicting service or change ports in .env
# Example:
# BACKEND_PORT=4001
# NEXTJS_PORT=4000
```

## ✅ Success Indicators

All tests passing means:
- ✅ Backend API working
- ✅ Frontend rendering correctly
- ✅ Database connected and seeded
- ✅ Authentication working
- ✅ Team system functional
- ✅ Challenge submission working
- ✅ Scoreboard updating
- ✅ Admin panel operational
- ✅ Round progression logic working
- ✅ LAN access functional

## 🎯 Pre-Competition Final Check

Run through this 5-minute checklist:

1. [ ] Start platform: `docker compose up --build`
2. [ ] Login as admin
3. [ ] Verify 3 rounds exist
4. [ ] Verify 6 challenges exist
5. [ ] Set Round 1 to ACTIVE
6. [ ] Set Rounds 2 & 3 to PENDING
7. [ ] Create test participant account
8. [ ] Create test team
9. [ ] Submit one flag successfully
10. [ ] Check scoreboard updates
11. [ ] Test from mobile device/another computer
12. [ ] Ready for competition! 🎉

## 📊 Load Testing (Optional)

For 100 users, verify:
```powershell
# Check resource usage
docker stats

# Should see:
# - Postgres: < 500MB RAM
# - Redis: < 100MB RAM
# - Backend: < 300MB RAM
# - Frontend: < 200MB RAM
```

If hosting for 100+ users, ensure:
- [ ] Docker has 4+ CPU cores allocated
- [ ] Docker has 8+ GB RAM allocated
- [ ] Good network connection (wired recommended)
- [ ] Server not running other heavy applications

---

**If all tests pass: Your platform is READY! 🚀**

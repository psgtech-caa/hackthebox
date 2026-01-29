# Quick Start Guide

## 1. Start the Platform
```powershell
docker compose up --build
```

## 2. Access URLs

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:3001/api
**Admin Panel:** http://localhost:3000/dashboard/admin

## 3. Default Credentials

**Admin:**
- Email: admin@hackthebox.local
- Password: admin123

**Test Participant:**
- Email: participant1@test.local
- Password: test123

## 4. Start Competition

1. Login as admin
2. Go to Admin Panel
3. Click "Activate" on Round 1
4. Participants can now submit flags!

## 5. Stop Platform
```powershell
docker compose down
```

## 6. Reset Everything
```powershell
docker compose down -v
docker compose up --build
```

---

For full documentation, see README.md

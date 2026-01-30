# 🚀 Quick Start Guide

## Prerequisites Checklist
- [ ] Docker Desktop installed and running
- [ ] Ports 3000, 3001, 5432, 6379 are free
- [ ] At least 4GB RAM available

## Step-by-Step Launch

### 1. Navigate to Project
```powershell
cd d:\3x6\CAA\hackthebox\hack-the-box
```

### 2. Start Everything
```powershell
docker compose up --build
```

**Wait 3-5 minutes for first startup**

### 3. Access the Platform
Open browser: **http://localhost:3000**

### 4. Login as Admin
- Username: `admin`
- Password: `admin123`

### 5. Test the Platform

#### As Admin:
1. Go to Admin Panel (top nav)
2. View the pre-seeded challenges
3. Check statistics
4. Round 1 is already ACTIVE

#### As Participant:
1. Logout (top right)
2. Create new account or login as `user1` / `test123`
3. Create or join a team
4. Go to Challenges
5. Try solving "Base64 Basics" with flag: `HackTheBox2026`

## 🎯 Sample Challenges & Solutions

### Round 1 (Active by default)
| Challenge | Flag |
|-----------|------|
| Base64 Basics | `HackTheBox2026` |
| Caesar Cipher | `Welcome The Box` |
| Simple XOR | `easy` |

### Round 2 (Activate in Admin Panel)
| Challenge | Flag |
|-----------|------|
| MD5 Hash Cracker | `password` |
| SHA-256 Mystery | `password123` |

### Round 3 (Final Round)
| Challenge | Flag |
|-----------|------|
| The Final Flag | `HTB{y0u_4r3_th3_ch4mp10n}` |

## 🌐 LAN Access

To access from other computers on your network:

1. Find your IP:
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter

2. Update `.env`:
```env
NEXT_PUBLIC_API_URL=http://YOUR_IP:3001/api
```

3. Restart:
```powershell
docker compose down
docker compose up --build
```

4. Access from any device:
```
http://YOUR_IP:3000
```

## 🛑 Stop the Platform
```powershell
docker compose down
```

## 📊 View Logs
```powershell
# All services
docker compose logs -f

# Just backend
docker compose logs -f backend

# Just frontend
docker compose logs -f frontend
```

## 🔄 Reset Everything
```powershell
docker compose down -v
docker compose up --build
```

## ✅ Health Check

Services should show as "healthy":
```powershell
docker compose ps
```

All should be "Up" and postgres/redis should show "(healthy)"

## 🆘 Troubleshooting

### "Port already in use"
Change ports in `.env`:
```env
BACKEND_PORT=4001
NEXTJS_PORT=4000
```

### "Cannot connect to backend"
Check backend is running:
```powershell
docker compose ps
docker compose logs backend
```

### "Database error"
Wait for postgres to be ready (30 seconds), then:
```powershell
docker compose restart backend
```

### Fresh Start
```powershell
docker compose down -v
docker compose up --build
```

## 📱 Competition Day Checklist

1. [ ] Test on your machine first
2. [ ] Update `.env` with your LAN IP
3. [ ] Test from another device on same network
4. [ ] Verify all 3 rounds are set up in Admin
5. [ ] Set Round 1 to ACTIVE
6. [ ] Keep Rounds 2 & 3 as PENDING
7. [ ] Activate rounds as competition progresses
8. [ ] Monitor Admin → Statistics during event
9. [ ] Check Admin → Recent Submissions for activity

## 🎉 You're Ready!

Platform is running when you see:
```
✅ Backend is running on: http://localhost:3001/api
✅ Frontend ready on: http://localhost:3000
```

**Access:** http://localhost:3000
**Admin:** username=`admin`, password=`admin123`

Happy hacking! 🔐

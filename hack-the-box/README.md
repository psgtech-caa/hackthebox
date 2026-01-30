# Hack-The-Box CTF Platform

A production-grade, local-only cybersecurity competition platform for running Capture The Flag (CTF) events on a LAN network.

## 🎯 Features

- **3 Competition Rounds:**
  - Round 1: Decode the Secret (Cryptography challenges)
  - Round 2: Find & Crack (Hash cracking, token decoding)
  - Round 3: Catch the Flag (Final challenge, first team wins)

- **Team-Based Competition:**
  - Create or join teams
  - Collaborative scoring
  - Live scoreboard with real-time updates

- **Admin Dashboard:**
  - Create and manage rounds
  - Add challenges with encrypted flags
  - Control round progression
  - View statistics and submissions

- **Modern Tech Stack:**
  - Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS
  - Backend: NestJS + TypeScript
  - Database: PostgreSQL
  - Cache: Redis
  - Auth: JWT (local, no cloud services)

## 📋 Prerequisites

- Docker Desktop installed and running
- Git (for cloning)
- At least 4GB RAM available
- Ports 3000, 3001, 5432, 6379 available

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd hack-the-box
cp .env.example .env
```

### 2. Configure Environment (Optional)

Edit `.env` if you want to change default settings:
- Database credentials
- JWT secret
- Port numbers

### 3. Start the Platform

```bash
docker compose up --build
```

**First startup takes 3-5 minutes** (downloading images, building, database migration)

### 4. Access the Platform

Once you see both services running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Admin Panel:** http://localhost:3000/admin (after login)

### 5. Login

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Test Accounts:**
- Username: `user1` to `user5`
- Password: `test123`

## 📱 For LAN Access

To access from other devices on your network:

1. Find your machine's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. Access from other devices:
   - Frontend: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

3. Update `.env` for LAN mode:
   ```env
   NEXT_PUBLIC_API_URL=http://YOUR_IP:3001/api
   ```

4. Restart containers:
   ```bash
   docker compose down
   docker compose up --build
   ```

## 🎮 Usage Guide

### For Participants

1. **Register/Login** at http://localhost:3000
2. **Create or Join a Team** - Required to submit flags
3. **View Challenges** - Navigate to Challenges page
4. **Submit Flags** - Enter flags to earn points
5. **Check Scoreboard** - Live rankings updated every 10 seconds

### For Admins

1. **Login as Admin** (credentials above)
2. **Go to Admin Panel** at http://localhost:3000/admin
3. **Manage Rounds:**
   - Activate rounds to make challenges available
   - Complete rounds when finished
   - Lock Round 3 after first team wins (automatic)

4. **Create Challenges:**
   - Select a round
   - Enter title, description, points
   - Set the flag (will be encrypted)
   - Optional: Add hints, max attempts

5. **Monitor Competition:**
   - View real-time statistics
   - Track submissions
   - Monitor team progress

## 🏗️ Architecture

```
hack-the-box/
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # UI components
│   │   └── lib/          # API client, utilities
│   │
│   └── backend/          # NestJS API
│       ├── src/
│       │   ├── auth/     # JWT authentication
│       │   ├── users/    # User management
│       │   ├── teams/    # Team operations
│       │   ├── rounds/   # Round control
│       │   ├── challenges/  # Challenge CRUD
│       │   ├── submissions/ # Flag validation
│       │   ├── scoreboard/  # Live rankings
│       │   └── admin/    # Admin operations
│       │
│       └── prisma/       # Database schema & migrations
│
├── docker-compose.yml    # Container orchestration
└── .env                 # Configuration
```

## 🔐 Security Features

- **Password Hashing:** bcrypt (10 rounds)
- **Flag Storage:** Flags stored as bcrypt hashes
- **JWT Auth:** Secure token-based authentication
- **Rate Limiting:** 10 requests per minute default
- **Role-Based Access:** PARTICIPANT, ADMIN, JUDGE
- **Input Validation:** All endpoints validated
- **SQL Injection Protection:** Prisma ORM

## 🎯 Round Types Explained

### Round 1: Decode the Secret
- Static cryptography challenges
- Base64, Caesar cipher, XOR, etc.
- Fixed scores per challenge
- No attempt limits (unless set)

### Round 2: Find & Crack
- Hash cracking challenges
- MD5, SHA-256, etc.
- Rate-limited submissions (5 per minute)
- Max attempts enforced per challenge

### Round 3: Catch the Flag
- Single final challenge
- First team to submit correct flag wins
- **Round automatically locks** after first correct submission
- Highest point value

## 🛠️ Management Commands

### Stop the Platform
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f
```

### Reset Database (keeps structure)
Use Admin Panel → Danger Zone → Reset Competition

Or manually:
```bash
docker compose down -v
docker compose up --build
```

### Seed Database Again
```bash
docker compose exec backend npm run prisma:seed
```

### Backup Database
```bash
docker compose exec postgres pg_dump -U hackthebox hackthebox > backup.sql
```

## 📊 Seeded Data

The platform comes pre-loaded with:

- 1 Admin user
- 5 Test participants
- 3 Rounds (Round 1 active by default)
- 6 Sample challenges:
  - 3 in Round 1 (100-200 points each)
  - 2 in Round 2 (250-300 points each)
  - 1 in Round 3 (1000 points)

### Sample Challenge Solutions

**Round 1:**
1. Base64 Basics → `HackTheBox2026`
2. Caesar Cipher → `Welcome The Box`
3. Simple XOR → `easy`

**Round 2:**
1. MD5 Hash Cracker → `password`
2. SHA-256 Mystery → `password123`

**Round 3:**
1. The Final Flag → `HTB{y0u_4r3_th3_ch4mp10n}`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and stop conflicting services
docker compose down
# Or change ports in .env
```

### Database Connection Failed
```bash
# Wait for postgres to be ready (check logs)
docker compose logs postgres

# Restart if needed
docker compose restart backend
```

### Frontend Can't Connect to Backend
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Ensure backend is running: `docker compose ps`
- Check backend logs: `docker compose logs backend`

### Build Errors
```bash
# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up
```

## 🔧 Development Mode

To run in development (with hot reload):

**Backend:**
```bash
cd apps/backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

Update `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📈 Scaling for 100+ Users

Current setup handles 100 users easily. For more:

1. **Increase Docker Resources:**
   - Docker Desktop → Settings → Resources
   - Set CPU: 4+ cores, RAM: 8+ GB

2. **Database Tuning:**
   - Add to docker-compose.yml under postgres:
     ```yaml
     command: postgres -c max_connections=200
     ```

3. **Rate Limiting:**
   - Adjust in `apps/backend/src/app.module.ts`

## 🎨 Customization

### Change Theme Colors
Edit `apps/frontend/app/globals.css` - CSS variables

### Add Custom Challenges
Use Admin Panel or directly via API:
```bash
POST /api/admin/challenges
{
  "roundId": "...",
  "title": "My Challenge",
  "description": "...",
  "flag": "solution",
  "points": 300,
  "order": 1
}
```

### Modify Scoring
Edit `apps/backend/src/submissions/submissions.service.ts`

## 📝 API Documentation

### Key Endpoints

**Authentication:**
- POST `/api/auth/register` - Create account
- POST `/api/auth/login` - Login

**Teams:**
- POST `/api/teams` - Create team
- POST `/api/teams/join` - Join team
- GET `/api/teams` - List all teams

**Challenges:**
- GET `/api/rounds/current` - Active round
- GET `/api/challenges` - All challenges

**Submissions:**
- POST `/api/submissions` - Submit flag

**Scoreboard:**
- GET `/api/scoreboard` - Live rankings

All endpoints require JWT token in `Authorization: Bearer <token>` header (except auth routes).

## 📄 License

This is an educational project for CTF competitions. Use responsibly.

## 🤝 Support

For issues or questions:
1. Check logs: `docker compose logs`
2. Verify all services running: `docker compose ps`
3. Review troubleshooting section above

## 🎉 Credits

Built with:
- Next.js 15
- NestJS 10
- PostgreSQL 16
- Redis 7
- shadcn/ui components
- Tailwind CSS

---

**Ready to hack? Start the platform and let the competition begin! 🚀**

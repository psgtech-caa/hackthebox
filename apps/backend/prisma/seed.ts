import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==========================================
  // CLEAR EXISTING DATA (optional, for development)
  // ==========================================
  console.log('Cleaning existing data...');
  await prisma.submission.deleteMany();
  await prisma.scoreAdjustment.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.round.deleteMany();
  await prisma.team.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.eventConfig.deleteMany();

  // ==========================================
  // CREATE EVENT CONFIG
  // ==========================================
  console.log('Creating event config...');
  await prisma.eventConfig.create({
    data: {
      eventName: 'HACK-THE-BOX',
      tagline: 'Decode. Discover. Defend.',
      duration: 180,
      isActive: false,
    },
  });

  // ==========================================
  // CREATE ADMIN USERS
  // ==========================================
  console.log('Creating admin users...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hackthebox.local',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const judge = await prisma.user.create({
    data: {
      email: 'judge@hackthebox.local',
      username: 'judge',
      passwordHash: await bcrypt.hash('judge123', 12),
      role: 'JUDGE',
    },
  });

  console.log('✅ Admin users created');
  console.log('   - admin@hackthebox.local / admin123');
  console.log('   - judge@hackthebox.local / judge123');

  // ==========================================
  // CREATE TEST PARTICIPANTS
  // ==========================================
  console.log('Creating test participants...');
  const participantPassword = await bcrypt.hash('test123', 12);
  
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        email: `participant${i}@test.local`,
        username: `participant${i}`,
        passwordHash: participantPassword,
        role: 'PARTICIPANT',
      },
    });

    await prisma.team.create({
      data: {
        name: `Team Alpha ${i}`,
        userId: user.id,
      },
    });
  }

  console.log('✅ Created 5 test participants (test123)');

  // ==========================================
  // CREATE ROUNDS
  // ==========================================
  console.log('Creating rounds...');

  const round1 = await prisma.round.create({
    data: {
      number: 1,
      name: 'Decode the Secret',
      description: 'Cryptography challenges - decode encrypted messages and find hidden secrets',
      state: 'LOCKED',
      order: 1,
    },
  });

  const round2 = await prisma.round.create({
    data: {
      number: 2,
      name: 'Find & Crack',
      description: 'Hash cracking and token decoding challenges',
      state: 'LOCKED',
      order: 2,
    },
  });

  const round3 = await prisma.round.create({
    data: {
      number: 3,
      name: 'Catch the Flag',
      description: 'Final CTF challenges - capture the ultimate flag!',
      state: 'LOCKED',
      order: 3,
    },
  });

  console.log('✅ Rounds created');

  // ==========================================
  // CREATE CHALLENGES - ROUND 1 (Decode the Secret)
  // ==========================================
  console.log('Creating Round 1 challenges...');

  // Challenge flags will be hashed for security
  const createHashedFlag = async (flag: string) => {
    return bcrypt.hash(flag.toLowerCase(), 10);
  };

  await prisma.challenge.create({
    data: {
      roundId: round1.id,
      title: 'Base64 Basics',
      description: 'Decode this Base64 string: SGFja1RoZUJveA==\n\nSubmit the decoded message.',
      type: 'CRYPTO',
      points: 100,
      flagHash: await createHashedFlag('HackTheBox'),
      maxAttempts: 0,
      order: 1,
      hints: 'This is a simple Base64 encoding. Use any online decoder or command-line tools.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round1.id,
      title: 'Caesar Shift',
      description: 'Decrypt this Caesar cipher (ROT13): FHPPRFF\n\nSubmit the decrypted word.',
      type: 'CRYPTO',
      points: 150,
      flagHash: await createHashedFlag('SUCCESS'),
      maxAttempts: 0,
      order: 2,
      hints: 'ROT13 is a simple letter substitution cipher.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round1.id,
      title: 'Hex Mystery',
      description: 'Convert this hexadecimal to text: 4379626572536563757269747921\n\nSubmit the decoded text.',
      type: 'CRYPTO',
      points: 200,
      flagHash: await createHashedFlag('CyberSecurity!'),
      maxAttempts: 0,
      order: 3,
      hints: 'Hexadecimal encoding - each pair of characters represents a byte.',
    },
  });

  console.log('✅ Round 1 challenges created');

  // ==========================================
  // CREATE CHALLENGES - ROUND 2 (Find & Crack)
  // ==========================================
  console.log('Creating Round 2 challenges...');

  await prisma.challenge.create({
    data: {
      roundId: round2.id,
      title: 'MD5 Hash Crack',
      description: 'Crack this MD5 hash: 5f4dcc3b5aa765d61d8327deb882cf99\n\nSubmit the original password.',
      type: 'HASH_CRACK',
      points: 200,
      flagHash: await createHashedFlag('password'),
      maxAttempts: 5,
      order: 1,
      hints: 'Try common passwords or use an online MD5 cracker.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round2.id,
      title: 'JWT Token Decode',
      description: 'Decode this JWT token and find the hidden flag in the payload:\n\neyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbGFnIjoiSldUX01BU1RFUiIsInVzZXIiOiJoYWNrZXIifQ.xyz\n\nSubmit the flag value.',
      type: 'GENERAL',
      points: 250,
      flagHash: await createHashedFlag('JWT_MASTER'),
      maxAttempts: 3,
      order: 2,
      hints: 'JWT tokens have three parts separated by dots. The payload is Base64 encoded.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round2.id,
      title: 'Binary Secret',
      description: 'Convert this binary to text: 01000110 01001100 01000001 01000111\n\nSubmit the decoded word.',
      type: 'GENERAL',
      points: 300,
      flagHash: await createHashedFlag('FLAG'),
      maxAttempts: 0,
      order: 3,
      hints: 'Binary to ASCII conversion.',
    },
  });

  console.log('✅ Round 2 challenges created');

  // ==========================================
  // CREATE CHALLENGES - ROUND 3 (Catch the Flag)
  // ==========================================
  console.log('Creating Round 3 challenges...');

  await prisma.challenge.create({
    data: {
      roundId: round3.id,
      title: 'Network Analysis',
      description: 'A packet capture reveals a hidden message. The flag format is: HTB{...}\n\nFlag: HTB{NETWORK_NINJA}',
      type: 'CTF',
      points: 300,
      flagHash: await createHashedFlag('HTB{NETWORK_NINJA}'),
      maxAttempts: 3,
      order: 1,
      hints: 'Look for HTTP traffic or DNS queries in the capture.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round3.id,
      title: 'Web Exploitation',
      description: 'Find the flag hidden in the web application vulnerability.\n\nFlag format: HTB{...}\n\nFlag: HTB{SQL_INJECTION_PRO}',
      type: 'CTF',
      points: 400,
      flagHash: await createHashedFlag('HTB{SQL_INJECTION_PRO}'),
      maxAttempts: 3,
      order: 2,
      hints: 'Check for SQL injection vulnerabilities.',
    },
  });

  await prisma.challenge.create({
    data: {
      roundId: round3.id,
      title: 'THE FINAL FLAG',
      description: '🏆 This is the ultimate challenge! Solve it to win the competition.\n\nThe final flag is: HTB{CHAMPION_2026}\n\nFirst team to submit wins!',
      type: 'CTF',
      points: 500,
      flagHash: await createHashedFlag('HTB{CHAMPION_2026}'),
      maxAttempts: 3,
      isFinalFlag: true,
      order: 3,
      hints: 'This is the final flag. Good luck!',
    },
  });

  console.log('✅ Round 3 challenges created');

  console.log('\n✅ Database seeding completed successfully!\n');
  console.log('📝 ADMIN CREDENTIALS:');
  console.log('   Email: admin@hackthebox.local');
  console.log('   Password: admin123\n');
  console.log('📝 TEST PARTICIPANTS:');
  console.log('   Email: participant1@test.local');
  console.log('   Password: test123');
  console.log('   (and participant2-5)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

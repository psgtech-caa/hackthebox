import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hackthebox.local' },
    update: {},
    create: {
      email: 'admin@hackthebox.local',
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Create Judge User
  const judgePassword = await bcrypt.hash('judge123', 10);
  const judge = await prisma.user.upsert({
    where: { email: 'judge@hackthebox.local' },
    update: {},
    create: {
      email: 'judge@hackthebox.local',
      username: 'judge',
      passwordHash: judgePassword,
      role: 'JUDGE',
    },
  });
  console.log('✅ Judge user created:', judge.username);

  // Create Test Users
  const testUsers = [];
  for (let i = 1; i <= 5; i++) {
    const password = await bcrypt.hash('test123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i}@test.local` },
      update: {},
      create: {
        email: `user${i}@test.local`,
        username: `user${i}`,
        passwordHash: password,
        role: 'PARTICIPANT',
      },
    });
    testUsers.push(user);
  }
  console.log(`✅ Created ${testUsers.length} test users`);

  // Create Sample Teams
  const team1 = await prisma.team.upsert({
    where: { name: 'Alpha Team' },
    update: {},
    create: {
      name: 'Alpha Team',
      qualified: false,
    },
  });

  const team2 = await prisma.team.upsert({
    where: { name: 'Beta Squad' },
    update: {},
    create: {
      name: 'Beta Squad',
      qualified: false,
    },
  });

  // Assign users to teams
  if (testUsers.length >= 2) {
    await prisma.user.update({
      where: { id: testUsers[0].id },
      data: { teamId: team1.id },
    });

    await prisma.user.update({
      where: { id: testUsers[1].id },
      data: { teamId: team2.id },
    });
  }

  // Initialize scores for teams
  await prisma.score.upsert({
    where: { teamId: team1.id },
    update: {},
    create: {
      teamId: team1.id,
      totalPoints: 0,
    },
  });

  await prisma.score.upsert({
    where: { teamId: team2.id },
    update: {},
    create: {
      teamId: team2.id,
      totalPoints: 0,
    },
  });

  console.log('✅ Created 2 sample teams with members');

  // Create Rounds
  const round1 = await prisma.round.upsert({
    where: { order: 1 },
    update: {},
    create: {
      name: 'Round 1: Decode the Secret',
      type: 'DECODE_THE_SECRET',
      order: 1,
      status: 'ACTIVE',
      description: 'Decode encrypted messages and crack cryptographic challenges',
    },
  });
  console.log('✅ Round 1 created');

  const round2 = await prisma.round.upsert({
    where: { order: 2 },
    update: {},
    create: {
      name: 'Round 2: Find & Crack',
      type: 'FIND_AND_CRACK',
      order: 2,
      status: 'PENDING',
      description: 'Hunt for hidden flags and crack hashes',
    },
  });
  console.log('✅ Round 2 created');

  const round3 = await prisma.round.upsert({
    where: { order: 3 },
    update: {},
    create: {
      name: 'Round 3: Catch the Flag',
      type: 'CATCH_THE_FLAG',
      order: 3,
      status: 'PENDING',
      description: 'Final challenge - first team to capture the flag wins',
    },
  });
  console.log('✅ Round 3 created');

  // Create Challenges for Round 1
  const challenges1 = [
    {
      title: 'Base64 Basics',
      description: 'Decode this Base64 string: SGFja1RoZUJveDIwMjY=',
      flag: 'HackTheBox2026',
      points: 100,
      order: 1,
      hints: 'Try using a Base64 decoder',
    },
    {
      title: 'Caesar Cipher',
      description: 'Decrypt this Caesar cipher (shift 13): Pelcgur Gur Obk',
      flag: 'Welcome The Box',
      points: 150,
      order: 2,
      hints: 'ROT13 is your friend',
    },
    {
      title: 'Simple XOR',
      description: 'XOR decrypt: 1a0e1f0a with key: 0x7f',
      flag: 'easy',
      points: 200,
      order: 3,
      hints: 'XOR each byte with 0x7f',
    },
  ];

  for (const challenge of challenges1) {
    const flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    await prisma.challenge.create({
      data: {
        roundId: round1.id,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        hints: challenge.hints,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges1.length} challenges for Round 1`);

  // Create Challenges for Round 2
  const challenges2 = [
    {
      title: 'MD5 Hash Cracker',
      description: 'Crack this MD5 hash: 5f4dcc3b5aa765d61d8327deb882cf99',
      flag: 'password',
      points: 250,
      order: 1,
      maxAttempts: 5,
      hints: 'Common password hash',
    },
    {
      title: 'SHA-256 Mystery',
      description: 'Find the word that produces SHA-256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
      flag: 'password123',
      points: 300,
      order: 2,
      maxAttempts: 5,
      hints: 'Try a password list',
    },
  ];

  for (const challenge of challenges2) {
    const flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    await prisma.challenge.create({
      data: {
        roundId: round2.id,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        maxAttempts: challenge.maxAttempts,
        hints: challenge.hints,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges2.length} challenges for Round 2`);

  // Create Challenges for Round 3
  const challenges3 = [
    {
      title: 'The Final Flag',
      description: 'Find the ultimate flag hidden in the depths of the system. First team wins!',
      flag: 'HTB{y0u_4r3_th3_ch4mp10n}',
      points: 1000,
      order: 1,
      hints: 'The flag format is HTB{...}',
    },
  ];

  for (const challenge of challenges3) {
    const flagHash = await bcrypt.hash(challenge.flag.toLowerCase(), 10);
    await prisma.challenge.create({
      data: {
        roundId: round3.id,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        flagHash: flagHash,
        order: challenge.order,
        hints: challenge.hints,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${challenges3.length} challenge for Round 3`);

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('   Admin: username=admin, password=admin123');
  console.log('   Judge: username=judge, password=judge123');
  console.log('   Users: username=user1-5, password=test123');
  console.log('   Teams: Alpha Team, Beta Squad');
  console.log('\n🚀 Ready to start the competition!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

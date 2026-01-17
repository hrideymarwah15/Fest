import { PrismaClient, SportType, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Initializing Prisma Client for PostgreSQL (Prisma 7)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create colleges
  const colleges = await Promise.all([
    prisma.college.upsert({
      where: { code: "RISHIHOOD" },
      update: {},
      create: {
        name: "Rishihood University",
        code: "RISHIHOOD",
        address: "Sonipat, Haryana",
      },
    }),
    prisma.college.upsert({
      where: { code: "DU" },
      update: {},
      create: {
        name: "Delhi University",
        code: "DU",
        address: "Delhi",
      },
    }),
    prisma.college.upsert({
      where: { code: "AMITY" },
      update: {},
      create: {
        name: "Amity University",
        code: "AMITY",
        address: "Noida, UP",
      },
    }),
    prisma.college.upsert({
      where: { code: "BITS" },
      update: {},
      create: {
        name: "BITS Pilani",
        code: "BITS",
        address: "Pilani, Rajasthan",
      },
    }),
    prisma.college.upsert({
      where: { code: "SRM" },
      update: {},
      create: {
        name: "SRM University",
        code: "SRM",
        address: "Chennai, Tamil Nadu",
      },
    }),
  ]);

  console.log(`✅ Created ${colleges.length} colleges`);

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sportsfest.com" },
    update: {},
    create: {
      email: "admin@sportsfest.com",
      name: "Admin User",
      password: adminPassword,
      role: Role.ADMIN,
      collegeId: colleges[0].id,
    },
  });

  console.log(`✅ Created admin user: ${admin.email}`);

  // Create test participant
  const participantPassword = await hash("test123", 12);
  const participant = await prisma.user.upsert({
    where: { email: "participant@test.com" },
    update: {},
    create: {
      email: "participant@test.com",
      name: "Test Participant",
      password: participantPassword,
      phone: "9876543210",
      role: Role.PARTICIPANT,
      collegeId: colleges[1].id,
    },
  });

  console.log(`✅ Created test participant: ${participant.email}`);

  // Create sports
  const sports = await Promise.all([
    prisma.sport.upsert({
      where: { slug: "cricket" },
      update: {},
      create: {
        name: "Cricket",
        slug: "cricket",
        description:
          "Experience the thrill of T20 cricket! Form your dream team and compete against the best college teams. Fast-paced action, strategic gameplay, and unforgettable moments await.",
        type: SportType.TEAM,
        teamSize: 11,
        minTeamSize: 11,
        maxTeamSize: 15,
        rules: [
          "Each team must have exactly 11 players",
          "T20 format - 20 overs per innings",
          "Match timings will be strictly followed",
          "Standard ICC rules apply",
          "Umpire's decision is final",
          "No metal spikes allowed",
          "Team captain must attend the toss",
          "Each team gets 2 DRS reviews per innings",
        ],
        prizes: {
          first: "₹50,000 + Trophy",
          second: "₹25,000 + Medal",
          third: "₹10,000 + Medal",
          mvp: "₹5,000 + Special Recognition",
        },
        fee: 2500,
        maxSlots: 16,
        filledSlots: 8,
        imageUrl: "/images/cricket.jpg",
        venue: "Main Cricket Ground",
        schedule: "March 15-17, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "football" },
      update: {},
      create: {
        name: "Football",
        slug: "football",
        description:
          "The beautiful game comes to campus! Showcase your skills in 7-a-side football tournaments. Fast, tactical, and exciting - every match counts!",
        type: SportType.TEAM,
        teamSize: 7,
        minTeamSize: 7,
        maxTeamSize: 11,
        rules: [
          "7-a-side format with rolling substitutions",
          "Two 25-minute halves",
          "No offside rule",
          "Standard FIFA rules apply for fouls",
          "Yellow and red card system in effect",
          "Goalkeeper cannot handle back passes",
          "Extra time and penalties for knockout rounds",
        ],
        prizes: {
          first: "₹40,000 + Trophy",
          second: "₹20,000 + Medal",
          third: "₹8,000 + Medal",
          goldenBoot: "₹3,000 + Award",
        },
        fee: 2000,
        maxSlots: 24,
        filledSlots: 18,
        imageUrl: "/images/football.jpg",
        venue: "University Football Field",
        schedule: "March 18-20, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "basketball" },
      update: {},
      create: {
        name: "Basketball",
        slug: "basketball",
        description:
          "Slam dunk your way to victory! 5-on-5 basketball action with intense competition. Show off your shooting, dribbling, and teamwork skills.",
        type: SportType.TEAM,
        teamSize: 5,
        minTeamSize: 5,
        maxTeamSize: 12,
        rules: [
          "5 players per team on court",
          "Four 10-minute quarters",
          "FIBA rules apply",
          "Shot clock of 24 seconds",
          "5 fouls and you're out",
          "Overtime periods of 5 minutes each",
          "Maximum 12 players in squad",
        ],
        prizes: {
          first: "₹35,000 + Trophy",
          second: "₹17,500 + Medal",
          third: "₹7,500 + Medal",
        },
        fee: 1800,
        maxSlots: 16,
        filledSlots: 12,
        imageUrl: "/images/basketball.jpg",
        venue: "Indoor Sports Complex",
        schedule: "March 21-22, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "badminton" },
      update: {},
      create: {
        name: "Badminton",
        slug: "badminton",
        description:
          "Test your reflexes and agility in singles and doubles badminton. Quick rallies, precise shots, and strategic play define this fast-paced sport.",
        type: SportType.INDIVIDUAL,
        teamSize: 1,
        minTeamSize: 1,
        rules: [
          "BWF rules apply",
          "Best of 3 games (21 points each)",
          "Singles and doubles categories",
          "Players must bring their own rackets",
          "Shuttlecocks provided by organizers",
          "No coaching during matches",
          "2-minute break between games",
        ],
        prizes: {
          first: "₹15,000 + Trophy",
          second: "₹7,500 + Medal",
          third: "₹3,000 + Medal",
        },
        fee: 500,
        maxSlots: 64,
        filledSlots: 45,
        imageUrl: "/images/badminton.jpg",
        venue: "Indoor Badminton Court",
        schedule: "March 23, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "table-tennis" },
      update: {},
      create: {
        name: "Table Tennis",
        slug: "table-tennis",
        description:
          "Speed, spin, and precision! Compete in singles table tennis and showcase your paddle skills. Lightning-fast rallies await.",
        type: SportType.INDIVIDUAL,
        teamSize: 1,
        minTeamSize: 1,
        maxTeamSize: 1,
        rules: [
          "ITTF rules apply",
          "Best of 5 games (11 points each)",
          "Serve changes every 2 points",
          "Players must bring their own paddles",
          "Balls provided by organizers",
          "Edge balls are valid",
          "Net balls on serve get replay",
        ],
        prizes: {
          first: "₹12,000 + Trophy",
          second: "₹6,000 + Medal",
          third: "₹2,500 + Medal",
        },
        fee: 400,
        maxSlots: 48,
        filledSlots: 32,
        imageUrl: "/images/tabletennis.jpg",
        venue: "Indoor Sports Hall",
        schedule: "March 24, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "chess" },
      update: {},
      create: {
        name: "Chess",
        slug: "chess",
        description:
          "The ultimate battle of minds! Strategize, calculate, and outthink your opponents in this classic game of intelligence.",
        type: SportType.INDIVIDUAL,
        teamSize: 1,
        minTeamSize: 1,
        maxTeamSize: 1,
        rules: [
          "FIDE rapid rules apply",
          "15 minutes + 10 seconds increment",
          "Swiss system tournament",
          "Touch-move rule strictly enforced",
          "Clock must be pressed with same hand",
          "No electronic devices allowed",
          "Arbiter's decision is final",
        ],
        prizes: {
          first: "₹10,000 + Trophy",
          second: "₹5,000 + Medal",
          third: "₹2,000 + Medal",
        },
        fee: 300,
        maxSlots: 64,
        filledSlots: 28,
        imageUrl: "/images/chess.jpg",
        venue: "Conference Hall A",
        schedule: "March 25, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "volleyball" },
      update: {},
      create: {
        name: "Volleyball",
        slug: "volleyball",
        description:
          "Spike, set, and serve your way to glory! Team volleyball action with intense rallies and spectacular plays.",
        type: SportType.TEAM,
        teamSize: 6,
        minTeamSize: 6,
        maxTeamSize: 10,
        rules: [
          "6 players per team on court",
          "Best of 5 sets (25 points, final set 15)",
          "Rally point scoring system",
          "3 touches maximum per side",
          "Rotation must be maintained",
          "Net touch is a fault",
          "Libero can only play back row",
        ],
        prizes: {
          first: "₹30,000 + Trophy",
          second: "₹15,000 + Medal",
          third: "₹6,000 + Medal",
        },
        fee: 1500,
        maxSlots: 16,
        filledSlots: 10,
        imageUrl: "/images/volleyball.jpg",
        venue: "Outdoor Volleyball Court",
        schedule: "March 26, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
    prisma.sport.upsert({
      where: { slug: "athletics" },
      update: {},
      create: {
        name: "Athletics",
        slug: "athletics",
        description:
          "Test your speed, strength, and endurance! Track and field events including 100m, 200m, 4x100m relay, and more.",
        type: SportType.INDIVIDUAL,
        teamSize: 1,
        minTeamSize: 1,
        maxTeamSize: 1,
        rules: [
          "World Athletics rules apply",
          "Events: 100m, 200m, 400m, 800m, 1500m",
          "Relay: 4x100m, 4x400m",
          "False start leads to disqualification",
          "Proper athletic wear mandatory",
          "Spikes allowed (max 6mm)",
          "ID verification required",
        ],
        prizes: {
          first: "₹8,000 per event + Gold",
          second: "₹4,000 per event + Silver",
          third: "₹2,000 per event + Bronze",
        },
        fee: 200,
        maxSlots: 100,
        filledSlots: 65,
        imageUrl: "/images/athletics.jpg",
        venue: "Athletics Track",
        schedule: "March 27-28, 2025",
        isActive: true,
        registrationOpen: true,
      },
    }),
  ]);

  console.log(`✅ Created ${sports.length} sports`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Colleges: ${colleges.length}`);
  console.log(`   - Sports: ${sports.length}`);
  console.log(`   - Admin: admin@sportsfest.com / admin123`);
  console.log(`   - Test User: participant@test.com / test123`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
